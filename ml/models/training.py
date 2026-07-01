# ml/models/training.py
"""
Model training and evaluation module.
Implements the split, class imbalance handling, training, metrics, and SHAP explainability.
"""

import logging
from pathlib import Path
from typing import Dict, Tuple, List
import pandas as pd
import numpy as np
import joblib
import matplotlib
# Force matplotlib to use non-interactive agg backend to avoid GUI window popup issues
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    roc_auc_score,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error
)
import shap

from ml.config import RANDOM_SEED

logger = logging.getLogger(__name__)

def stratified_group_by_date_split(df: pd.DataFrame, test_ratio: float = 0.25) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Splits the dataset chronologically grouped by date to eliminate spatial leakage.
    Ensures that train and test splits have representative proportions of heatwave days.
    """
    logger.info("Executing Stratified Group-by-Date Split...")
    
    # 1. Get unique dates and their heatwave status
    # Since weather is identical across districts, any district having a heatwave means it's a heatwave date.
    date_groups = df.groupby('date')
    date_status = date_groups['heatwave_label'].max().reset_index()
    
    heatwave_dates = date_status[date_status['heatwave_label'] == 1]['date'].tolist()
    normal_dates = date_status[date_status['heatwave_label'] == 0]['date'].tolist()
    
    logger.info(f"Unique dates in dataset: {len(date_status)}. Heatwave dates: {len(heatwave_dates)}, Normal dates: {len(normal_dates)}")
    
    # 2. Split dates using fixed random seed
    rng = np.random.RandomState(RANDOM_SEED)
    
    # Shuffle lists
    rng.shuffle(heatwave_dates)
    rng.shuffle(normal_dates)
    
    # Calculate cutoff counts
    hw_test_count = max(1, int(len(heatwave_dates) * test_ratio))
    normal_test_count = max(1, int(len(normal_dates) * test_ratio))
    
    test_dates = set(heatwave_dates[:hw_test_count] + normal_dates[:normal_test_count])
    train_dates = set(heatwave_dates[hw_test_count:] + normal_dates[normal_test_count:])
    
    # 3. Filter DataFrame
    df_train = df[df['date'].isin(train_dates)].copy()
    df_test = df[df['date'].isin(test_dates)].copy()
    
    # Re-sort to maintain contiguous time-series per district
    df_train = df_train.sort_values(by=['district_id', 'date']).reset_index(drop=True)
    df_test = df_test.sort_values(by=['district_id', 'date']).reset_index(drop=True)
    
    logger.info(f"Train split: {len(df_train)} rows ({len(train_dates)} dates, {len(heatwave_dates) - hw_test_count} HW dates)")
    logger.info(f"Test split:  {len(df_test)} rows ({len(test_dates)} dates, {hw_test_count} HW dates)")
    
    return df_train, df_test

def manual_oversample_multiclass(X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Applies Random Oversampling (ROS) to minority classes to match the majority class.
    Used for multiclass targets.
    """
    unique_classes, counts = np.unique(y, return_counts=True)
    majority_class = unique_classes[np.argmax(counts)]
    majority_count = counts[np.argmax(counts)]
    
    X_resampled = [X]
    y_resampled = [y]
    
    # Fixed seed for reproducibility
    rng = np.random.RandomState(RANDOM_SEED)
    
    for c, count in zip(unique_classes, counts):
        if c == majority_class:
            continue
        num_to_add = majority_count - count
        if num_to_add > 0:
            class_indices = np.where(y == c)[0]
            selected_indices = rng.choice(class_indices, size=num_to_add, replace=True)
            X_resampled.append(X[selected_indices])
            y_resampled.append(y[selected_indices])
            
    X_out = np.concatenate(X_resampled, axis=0)
    y_out = np.concatenate(y_resampled, axis=0)
    
    # Shuffle the resampled data so the model doesn't get contiguous blocks of the same class
    shuffle_indices = rng.permutation(len(X_out))
    
    return X_out[shuffle_indices], y_out[shuffle_indices]

def evaluate_model(model: RandomForestClassifier, X_test: np.ndarray, y_test: np.ndarray, thresholds: Tuple[float, float] = None) -> Dict:
    """
    Computes classification and risk-probability validation metrics on the test set.
    If thresholds is provided as (threshold_moderate, threshold_severe), it uses them
    instead of default argmax.
    """
    y_prob = model.predict_proba(X_test)
    
    # Pad y_prob to 3 classes (normal, moderate, severe) if model was trained on a subset of classes
    if y_prob.shape[1] < 3:
        full_prob = np.zeros((len(y_prob), 3))
        for idx, c in enumerate(model.classes_):
            full_prob[:, int(c)] = y_prob[:, idx]
        y_prob_eval = full_prob
    else:
        y_prob_eval = y_prob
        
    # Calculate predictions based on thresholds or default argmax
    if thresholds is not None:
        t_mod, t_sev = thresholds
        y_pred = np.zeros(len(y_prob_eval), dtype=int)
        for i in range(len(y_prob_eval)):
            p0, p1, p2 = y_prob_eval[i]
            if p2 >= t_sev:
                y_pred[i] = 2
            elif p1 >= t_mod:
                y_pred[i] = 1
            else:
                y_pred[i] = 0
    else:
        y_pred = model.predict(X_test)
    
    # 1. Classification metrics
    accuracy = accuracy_score(y_test, y_pred)
    
    # Macro metrics
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro', zero_division=0)
    
    # Per-class metrics
    p_class, r_class, f_class, _ = precision_recall_fscore_support(y_test, y_pred, average=None, zero_division=0)
    
    # ROC-AUC (One-vs-Rest)
    # ROC-AUC is only computed if more than 1 class is present in y_test
    unique_classes_test = np.unique(y_test)
    if len(unique_classes_test) > 1:
        try:
            roc_auc = roc_auc_score(y_test, y_prob_eval, multi_class='ovr', average='macro')
        except Exception as e:
            logger.warning(f"Failed to calculate ROC-AUC: {e}")
            roc_auc = 0.0
    else:
        roc_auc = 0.0
        
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2])
    
    # 2. Risk Probability Validation Metrics
    # The dashboard risk % corresponds to the probability of having a heatwave: class 1 + class 2
    prob_hw = y_prob_eval[:, 1] + y_prob_eval[:, 2]
            
    # Binary actual label (1 if heatwave/severe, 0 if normal)
    y_test_binary = (y_test >= 1).astype(int)
    
    mae = mean_absolute_error(y_test_binary, prob_hw)
    rmse = np.sqrt(mean_squared_error(y_test_binary, prob_hw))
    
    metrics = {
        "accuracy": float(accuracy),
        "precision_macro": float(precision),
        "recall_macro": float(recall),
        "f1_macro": float(f1),
        "roc_auc_macro": float(roc_auc),
        "per_class_f1": [float(f) for f in f_class],
        "per_class_precision": [float(p) for p in p_class],
        "per_class_recall": [float(r) for r in r_class],
        "risk_mae": float(mae),
        "risk_rmse": float(rmse),
        "confusion_matrix": cm.tolist()
    }
    
    return metrics

def save_shap_summary_plot(model: RandomForestClassifier, X_sample: pd.DataFrame, save_path: Path) -> None:
    """
    Computes SHAP values using TreeExplainer and saves a multiclass summary plot.
    """
    logger.info(f"Computing SHAP values and saving plot to {save_path}...")
    try:
        # Limit to 500 rows for faster TreeExplainer computation if dataset is large
        sample_size = min(500, len(X_sample))
        X_shap = X_sample.sample(sample_size, random_state=RANDOM_SEED)
        
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_shap)
        
        plt.figure(figsize=(10, 8))
        
        # In newer SHAP versions, shap_values is a list for multiclass, or an array of shape (n_samples, n_features, n_classes)
        # Pass feature names explicitly
        shap.summary_plot(
            shap_values, 
            X_shap, 
            class_names=["Normal", "Moderate", "Severe"],
            show=False
        )
        
        # Save figure
        save_path.parent.mkdir(parents=True, exist_ok=True)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150)
        plt.close()
        logger.info(f"SHAP summary plot successfully saved.")
    except Exception as e:
        logger.error(f"Failed to generate SHAP summary plot: {e}", exc_info=True)
        plt.close()

def save_pipeline(scaler: StandardScaler, model: RandomForestClassifier, feature_names: List[str], save_path: Path, thresholds: Tuple[float, float] = None) -> None:
    """
    Wraps the scaler and model into a scikit-learn Pipeline and serializes it.
    """
    logger.info(f"Saving final pipeline to {save_path}...")
    pipeline = Pipeline([
        ('scaler', scaler),
        ('classifier', model)
    ])
    # Store feature names and thresholds as attributes of the pipeline for reference
    pipeline.feature_names = feature_names
    pipeline.thresholds = thresholds
    if thresholds is not None:
        pipeline.threshold_moderate = thresholds[0]
        pipeline.threshold_severe = thresholds[1]
    
    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, save_path)
    logger.info("Pipeline successfully saved.")
