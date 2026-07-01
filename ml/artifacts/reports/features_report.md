# HEWS Feature Engineering & Label Report

This report outlines the characteristics of the engineered features and class distributions generated under **Labeling Option A**.

## 1. Feature Matrices Summary
- **Model A (Meteorological only) Column Count:** 78 (including 5 metadata + 4 label columns)
- **Model B (Meteorological + Aerosol) Column Count:** 93 (including 5 metadata + 4 label columns)
- **Chronological Train/Test Split Date:** 2025-01-01

## 2. Dataset Split Sizes and Class Balance
| Metric | Train Split (2023-2024) | Test Split (2025) |
| --- | --- | --- |
| **Date Range** | 2023-01-01 to 2024-12-31 | 2025-01-01 to 2025-06-30 |
| **Total Rows** | 7290 | 1810 |
| **Normal Days (Class 0)** | 7090 | 1810 |
| **Heatwave Days (Class 1)** | 180 | 0 |
| **Severe Heatwave Days (Class 2)** | 20 | 0 |
| **Total Heatwaves (Binary 1)** | 200 (2.74%) | 0 (0.00%) |

## 3. Training Set Class Balance by District
| District ID | Name | Total Days | Heatwave Days | Heatwave Ratio |
| --- | --- | --- | --- | --- |
| 1 | Bangalore | 729 | 20 | 2.74% |
| 2 | Mysore | 729 | 20 | 2.74% |
| 3 | Belagavi | 729 | 20 | 2.74% |
| 4 | Kalaburagi | 729 | 20 | 2.74% |
| 5 | Mangalore | 729 | 20 | 2.74% |
| 6 | Chikkamagaluru | 729 | 20 | 2.74% |
| 7 | Bidar | 729 | 20 | 2.74% |
| 8 | Davanagere | 729 | 20 | 2.74% |
| 9 | Udupi | 729 | 20 | 2.74% |
| 10 | Tumkur | 729 | 20 | 2.74% |

> [!WARNING]
> **Note on Class Imbalance**
> The training set exhibits a heavy class imbalance: **2.74%** positive heatwave labels.
> Class weight adjustments, SMOTE, or focal loss will be required during Model Training (Phase 5) to address this.