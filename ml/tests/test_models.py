# ml/tests/test_models.py
"""
Unit tests for Model Training and Evaluation components.
"""

import unittest
import pandas as pd
import numpy as np
from ml.models.training import (
    stratified_group_by_date_split,
    manual_oversample_multiclass,
    evaluate_model
)
from sklearn.ensemble import RandomForestClassifier

class TestModels(unittest.TestCase):
    def test_stratified_group_by_date_split(self):
        # Create a mock dataframe: 4 dates, 2 districts per date = 8 rows
        # Dates 1 & 2 are Normal, Dates 3 & 4 have Heatwaves
        df = pd.DataFrame({
            "district_id": [1, 2, 1, 2, 1, 2, 1, 2],
            "date": pd.to_datetime([
                "2023-05-01", "2023-05-01",
                "2023-05-02", "2023-05-02",
                "2023-05-03", "2023-05-03",
                "2023-05-04", "2023-05-04"
            ]),
            "heatwave_label": [0, 0, 0, 0, 1, 1, 1, 1],
            "tempmax": [30.0, 30.0, 30.0, 30.0, 35.0, 35.0, 36.0, 36.0]
        })
        
        # Test split with ratio 0.5 (half goes to train, half to test)
        df_train, df_test = stratified_group_by_date_split(df, test_ratio=0.5)
        
        # Check date leakage prevention (no date in both train and test)
        train_dates = set(df_train["date"])
        test_dates = set(df_test["date"])
        self.assertEqual(len(train_dates.intersection(test_dates)), 0)
        
        # Check size (should split 4 dates into 2 train dates and 2 test dates)
        self.assertEqual(len(train_dates), 2)
        self.assertEqual(len(test_dates), 2)
        
        # Check stratification (should split 2 heatwave dates into 1 train and 1 test)
        df_train_status = df_train.groupby("date")["heatwave_label"].max()
        df_test_status = df_test.groupby("date")["heatwave_label"].max()
        self.assertEqual(df_train_status.sum(), 1)
        self.assertEqual(df_test_status.sum(), 1)

    def test_manual_oversample_multiclass(self):
        # 10 samples of class 0, 2 samples of class 1, 1 sample of class 2
        X = np.random.randn(13, 5)
        y = np.array([0]*10 + [1]*2 + [2]*1)
        
        X_res, y_res = manual_oversample_multiclass(X, y)
        
        # Total should be 30 (10 for each class)
        self.assertEqual(len(y_res), 30)
        unique_res, counts_res = np.unique(y_res, return_counts=True)
        self.assertEqual(list(counts_res), [10, 10, 10])
        
        # Check shapes match
        self.assertEqual(X_res.shape, (30, 5))

    def test_evaluate_model(self):
        # Create a mock classifier that always predicts class 0 or class 1
        clf = RandomForestClassifier(random_state=42)
        X_train = np.random.randn(20, 3)
        y_train = np.array([0]*10 + [1]*5 + [2]*5)
        clf.fit(X_train, y_train)
        
        X_test = np.random.randn(5, 3)
        y_test = np.array([0, 1, 2, 0, 1])
        
        metrics = evaluate_model(clf, X_test, y_test)
        
        self.assertIn("accuracy", metrics)
        self.assertIn("f1_macro", metrics)
        self.assertIn("confusion_matrix", metrics)
        self.assertIn("risk_mae", metrics)
        self.assertIn("risk_rmse", metrics)
        
        # Confusion matrix shape check (should be 3x3)
        cm = np.array(metrics["confusion_matrix"])
        self.assertEqual(cm.shape, (3, 3))

if __name__ == '__main__':
    unittest.main()
