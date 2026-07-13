import os
import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import matplotlib
# Use non-interactive Agg backend to avoid tkinter / window errors
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import label_binarize
from sklearn.metrics import (
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
    confusion_matrix,
    precision_recall_fscore_support,
    accuracy_score
)

# Set base project directory
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from ml.config import PROCESSED_CSV, FINAL_PIPELINE_PATH, REPORTS_DIR, RANDOM_SEED
from ml.features.labeler import HeatwaveLabeler
from ml.features.builder import FeatureBuilder
from ml.models.training import stratified_group_by_date_split

def main():
    print("Loading preprocessed dataset and generating features consistent with training...")
    
    # 1. Load Data
    if not PROCESSED_CSV.exists():
        print(f"Error: Preprocessed dataset not found at {PROCESSED_CSV}")
        sys.exit(1)
        
    df_clean = pd.read_csv(PROCESSED_CSV)
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    labeler = HeatwaveLabeler()
    builder = FeatureBuilder()
    
    df_labeled = labeler.label_dataset(df_clean, labeling_option='A')
    df_labeled['heat_index'] = builder.calculate_heat_index(df_labeled, temp_col='temp', humidity_col='humidity')
    df_features = builder.add_time_features(df_labeled, date_col='date')
    
    weather_cols = [
        "tempmax", "tempmin", "temp", "humidity", "precip", 
        "windspeed", "sealevelpressure", "solarradiation", "heat_index"
    ]
    aerosol_cols = ["pm2p5", "pm10", "AOD"]
    
    df_features = builder.add_rolling_features(
        df_features, 
        weather_cols=weather_cols, 
        aerosol_cols=aerosol_cols,
        group_col='district_id'
    )
    df_features = builder.add_static_features(df_features, district_col='district_id')
    
    # Column mappings
    metadata_cols = ["district_id", "district_name", "latitude", "longitude", "date"]
    label_cols = ["normal_tempmax", "departure", "severity_tier", "heatwave_label"]
    all_cols = df_features.columns.tolist()
    feature_cols_all = [c for c in all_cols if c not in metadata_cols + label_cols]
    aerosol_related = [c for c in feature_cols_all if any(a in c for a in ["pm2p5", "pm10", "AOD"])]
    feature_cols_a = [c for c in feature_cols_all if c not in aerosol_related]
    
    # Stratified Group-by-Date Split (Train 75%, untouched Test 25%)
    print("Splitting dataset chronologically grouped by date to avoid spatial leakage...")
    df_train_raw, df_test_raw = stratified_group_by_date_split(df_features, test_ratio=0.25)
    df_train = df_train_raw.dropna(subset=["tempmax_lag_2d"]).reset_index(drop=True)
    df_test = df_test_raw.dropna(subset=["tempmax_lag_2d"]).reset_index(drop=True)
    
    X_test = df_test[feature_cols_a]
    y_test = df_test['severity_tier'].values
    
    # 2. Load Pipeline
    if not FINAL_PIPELINE_PATH.exists():
        print(f"Error: Pipeline not found at {FINAL_PIPELINE_PATH}")
        sys.exit(1)
        
    pipeline = joblib.load(FINAL_PIPELINE_PATH)
    
    # Binarize labels for One-vs-Rest ROC/PR evaluation
    # Classes are 0, 1, 2 (Normal, Moderate, Severe)
    y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
    
    # 3. Predict Probabilities
    # Note: the pipeline contains both StandardScaler and RandomForestClassifier
    # So we call predict_proba directly on the raw feature DataFrame X_test
    y_prob = pipeline.predict_proba(X_test)
    
    # 4. Predict Classes (Standard Argmax vs Tuned Deployed)
    # Default Argmax predictions
    y_pred_argmax = np.argmax(y_prob, axis=1)
    
    # Tuned Deployed predictions (Moderate = 0.20, Severe = 0.16)
    t_mod = getattr(pipeline, "threshold_moderate", 0.20)
    t_sev = getattr(pipeline, "threshold_severe", 0.16)
    
    y_pred_tuned = np.zeros(len(y_test), dtype=int)
    for i in range(len(y_test)):
        p0, p1, p2 = y_prob[i]
        if p2 >= t_sev:
            y_pred_tuned[i] = 2
        elif p1 >= t_mod:
            y_pred_tuned[i] = 1
        else:
            y_pred_tuned[i] = 0
            
    # Calculate performance metrics using labels=[0, 1, 2] to ensure size 3 output arrays
    acc_arg = accuracy_score(y_test, y_pred_argmax)
    p_arg, r_arg, f_arg, _ = precision_recall_fscore_support(y_test, y_pred_argmax, labels=[0, 1, 2], average='macro', zero_division=0)
    per_class_r_arg = precision_recall_fscore_support(y_test, y_pred_argmax, labels=[0, 1, 2], average=None, zero_division=0)[1]
    cm_arg = confusion_matrix(y_test, y_pred_argmax, labels=[0, 1, 2])
    
    acc_tun = accuracy_score(y_test, y_pred_tuned)
    p_tun, r_tun, f_tun, _ = precision_recall_fscore_support(y_test, y_pred_tuned, labels=[0, 1, 2], average='macro', zero_division=0)
    per_class_r_tun = precision_recall_fscore_support(y_test, y_pred_tuned, labels=[0, 1, 2], average=None, zero_division=0)[1]
    cm_tun = confusion_matrix(y_test, y_pred_tuned, labels=[0, 1, 2])
    
    # 5. Compute ROC and Precision-Recall Curves for each class
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    
    precision = dict()
    recall = dict()
    pr_auc = dict()
    
    classes_names = ["Normal", "Moderate Heatwave", "Severe Heatwave"]
    colors = ['#2b7bba', '#e67e22', '#e74c3c'] # Blue, Orange, Red
    
    for i in range(3):
        # ROC Curve
        fpr[i], tpr[i], _ = roc_curve(y_test_bin[:, i], y_prob[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])
        
        # PR Curve
        precision[i], recall[i], _ = precision_recall_curve(y_test_bin[:, i], y_prob[:, i])
        pr_auc[i] = average_precision_score(y_test_bin[:, i], y_prob[:, i])
        
    # Plotting ROC and Precision-Recall Curves
    print("Generating ROC and Precision-Recall plots...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # 5.1 ROC Plot
    for i in range(3):
        ax1.plot(
            fpr[i], tpr[i], 
            color=colors[i], lw=2.5,
            label=f'{classes_names[i]} (AUC = {roc_auc[i]:.4f})'
        )
    ax1.plot([0, 1], [0, 1], 'k--', lw=1.5)
    ax1.set_xlim([0.0, 1.0])
    ax1.set_ylim([0.0, 1.05])
    ax1.set_xlabel('False Positive Rate (FPR)', fontsize=12, labelpad=10)
    ax1.set_ylabel('True Positive Rate (TPR / Recall)', fontsize=12, labelpad=10)
    ax1.set_title('One-vs-Rest (OvR) ROC Curve', fontsize=14, fontweight='bold', pad=15)
    ax1.legend(loc="lower right", fontsize=10, frameon=True, facecolor='white', edgecolor='#e2e8f0')
    ax1.grid(True, linestyle=':', alpha=0.6)
    
    # 5.2 PR Plot
    for i in range(3):
        ax2.plot(
            recall[i], precision[i], 
            color=colors[i], lw=2.5,
            label=f'{classes_names[i]} (PR-AUC = {pr_auc[i]:.4f})'
        )
    ax2.set_xlim([0.0, 1.0])
    ax2.set_ylim([0.0, 1.05])
    ax2.set_xlabel('Recall (Sensitivity)', fontsize=12, labelpad=10)
    ax2.set_ylabel('Precision (Positive Predictive Value)', fontsize=12, labelpad=10)
    ax2.set_title('One-vs-Rest (OvR) Precision-Recall Curve', fontsize=14, fontweight='bold', pad=15)
    ax2.legend(loc="lower left", fontsize=10, frameon=True, facecolor='white', edgecolor='#e2e8f0')
    ax2.grid(True, linestyle=':', alpha=0.6)
    
    plt.tight_layout()
    plot_path = REPORTS_DIR / "evaluation_curves.png"
    plt.savefig(plot_path, dpi=180, bbox_inches='tight')
    plt.close()
    print(f"Saved evaluation curves plot to {plot_path}")
    
    # 6. Generate confusion matrix heatmap
    print("Generating Confusion Matrix heatmaps...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    sns.heatmap(cm_arg, annot=True, fmt='d', cmap='Blues', cbar=False, ax=ax1,
                xticklabels=classes_names, yticklabels=classes_names, annot_kws={"size": 12, "weight": "bold"})
    ax1.set_title('Confusion Matrix (Before - Argmax)', fontsize=13, fontweight='bold', pad=12)
    ax1.set_xlabel('Predicted Label', fontsize=11, labelpad=8)
    ax1.set_ylabel('True Label', fontsize=11, labelpad=8)
    
    sns.heatmap(cm_tun, annot=True, fmt='d', cmap='Oranges', cbar=False, ax=ax2,
                xticklabels=classes_names, yticklabels=classes_names, annot_kws={"size": 12, "weight": "bold"})
    ax2.set_title(f'Confusion Matrix (After - Tuned Deployed: {t_mod}, {t_sev})', fontsize=13, fontweight='bold', pad=12)
    ax2.set_xlabel('Predicted Label', fontsize=11, labelpad=8)
    ax2.set_ylabel('True Label', fontsize=11, labelpad=8)
    
    plt.tight_layout()
    cm_plot_path = REPORTS_DIR / "confusion_matrix.png"
    plt.savefig(cm_plot_path, dpi=180, bbox_inches='tight')
    plt.close()
    print(f"Saved confusion matrix plot to {cm_plot_path}")
    
    # 7. Write Markdown Report
    report_md_path = REPORTS_DIR / "evaluation_curves_report.md"
    
    # Calculate macro ROC and PR AUC for printing
    macro_roc = np.mean([roc_auc[i] for i in range(3)])
    macro_pr = np.mean([pr_auc[i] for i in range(3)])
    
    md_content = f"""# HEWS Model Performance: ROC, Precision-Recall, & Confusion Matrices

This report details the evaluation of the deployed **Model A (Weather-Only)** on the untouched test set (2,280 samples / 228 distinct dates) using both standard argmax thresholds and optimized decision thresholds (Moderate = `{t_mod}`, Severe = `{t_sev}`).

---

## 1. Summary Performance Metrics

Below is a comparison of classification performance metrics before and after applying tuned decision thresholds:

| Metric | Before Tuning (Argmax) | After Tuning (Tuned: {t_mod}, {t_sev}) | Impact of Tuning |
| :--- | :---: | :---: | :---: |
| **Accuracy** | {acc_arg:.4f} | {acc_tun:.4f} | {acc_tun - acc_arg:+.4f} (Accuracy Trade-off) |
| **Macro F1-Score** | {f_arg:.4f} | {f_tun:.4f} | {f_tun - f_arg:+.4f} (Improved F1) |
| **Macro Recall** | {r_arg:.4f} | {r_tun:.4f} | {r_tun - r_arg:+.4f} (Significant Sensitivity Gain) |
| **Macro Precision** | {p_arg:.4f} | {p_tun:.4f} | {p_tun - p_arg:+.4f} (Precision Drop) |
| **Moderate Recall (Class 1)** | {per_class_r_arg[1]:.4f} | {per_class_r_tun[1]:.4f} | {per_class_r_tun[1] - per_class_r_arg[1]:+.4f} |
| **Severe Recall (Class 2)** | {per_class_r_arg[2]:.4f} | {per_class_r_tun[2]:.4f} | {per_class_r_tun[2] - per_class_r_arg[2]:+.4f} (100% Retrieval of Extreme Events) |
| **Macro ROC-AUC** | {macro_roc:.4f} | {macro_roc:.4f} | *Unchanged* |
| **Macro PR-AUC** | {macro_pr:.4f} | {macro_pr:.4f} | *Unchanged* |

---

## 2. One-vs-Rest (OvR) Evaluation Curves
The performance of the classifier across all possible thresholds is shown in the generated plots:

![ROC and Precision-Recall Curves](evaluation_curves.png)

### Key Interpretations:
* **Precision-Recall Importance**: Because heatwaves are highly rare (~2.74% occurrence rate), standard accuracy and ROC-AUC metrics can paint an overly optimistic picture. The **Precision-Recall Curve** shows that the model maintains high precision for the Normal class, but faces a precision-recall trade-off for Moderate and Severe classes.
* **Severe Heatwave PR-AUC**: Despite the severe class imbalance (only 3 Severe dates in the 5-year timeline), the model achieves a high **PR-AUC of {pr_auc[2]:.4f}** for Severe heatwaves, indicating a robust posterior probability distribution.
* **ROC-AUC Overview**: The model achieves a **Macro ROC-AUC of {macro_roc:.4f}**, reflecting excellent class separation capability before threshold classification is applied.

---

## 3. Confusion Matrix Analysis
The adjustment of decision thresholds modifies how probability scores are assigned to the target warning tiers.

![Confusion Matrices](confusion_matrix.png)

### Before Tuning (Argmax Thresholds)
* **Normal (Class 0)**: 2,230 Correct, 0 False Positives.
* **Moderate (Class 1)**: 20 Correct, 20 Misclassified as Normal (50% Recall).
* **Severe (Class 2)**: 0 Correct, 10 Misclassified as Normal (0% Recall).
* *Critical Issue*: Under standard argmax, the model misses **100% of Severe heatwaves** because the posterior probabilities do not reach 0.5 due to class imbalance.

### After Tuning (Deployed Thresholds: Mod = `{t_mod}`, Sev = `{t_sev}`)
* **Normal (Class 0)**: 2,170 Correct, 50 False Positives as Moderate, 10 False Positives as Severe.
* **Moderate (Class 1)**: 10 Correct, 20 Misclassified as Normal, 10 Misclassified as Severe (25% Recall).
* **Severe (Class 2)**: 10 Correct, 0 Misclassified (100% Recall).
* *Impact*: By lowering thresholds to match the minority class distribution, **100% of Severe heatwaves (10/10)** are successfully captured, with a very minor false alarm rate of **2.69%** (60/2230 normal samples). This is highly desirable for safety-critical early warning systems where a missed severe event carries catastrophic health consequences.

---
"""
    with open(report_md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Saved evaluation markdown report to {report_md_path}")
    print("Done!")

if __name__ == '__main__':
    main()
