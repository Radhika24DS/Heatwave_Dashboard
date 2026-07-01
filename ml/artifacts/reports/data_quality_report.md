# HEWS Data Preprocessing Quality Report

This report summarizes the outcome of the validation and cleaning pipeline executed on the raw historical Karnataka weather and aerosol datasets.

## Executive Summary
- **Initial Merged Rows (Overlap):** 912
- **Cleaned Rows per District:** 912
- **Total Seeded Districts:** 10
- **Total Rows in Output (District Scope):** 9120
- **Duplicates Dropped:** 0
- **Aerosol AOD -9999 Sentinels Replaced with NaN:** 80

## 1. Range Validation Violations Capped
Values outside of standard physical boundaries were marked as `NaN` and subsequently imputed. Actual range violations caught (excluding -9999 sentinels):
- **No range validation violations detected in the datasets.**

## 2. Missing Values Imputed
Strategies applied: linear interpolation (max 3 days limit) or zero-filling for precipitation.
| Column | Strategy | Imputed Count | Remaining NaNs |
| --- | --- | --- | --- |
| pm2p5 | interpolate | 52 | 0 |
| pm10 | interpolate | 52 | 0 |
| AOD | interpolate | 80 | 0 |

## 3. Outlier Winsorization
Outliers beyond `Q1 - 3*IQR` and `Q3 + 3*IQR` were capped (Winsorized) to preserve chronological consistency without dropping records.
| Column | Capped Count | Capped Low | Capped High | Winsorization Bounds |
| --- | --- | --- | --- | --- |
| windspeed | 4 | 0 | 4 | [-4.50, 42.57] |
| AOD | 3 | 0 | 3 | [-0.53, 1.42] |
