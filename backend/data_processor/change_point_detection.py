import ruptures as rpt
import pandas as pd
import numpy as np

def calculate_significance(mean_before, mean_after, std_dev):
    difference = abs(mean_after - mean_before)
    if std_dev == 0:
        return 0
    return difference / std_dev

def process_column(signal, column_name, penalty, std_dev):
    try:
        algo = rpt.Binseg(model="l1", min_size=2000, jump=1000).fit(signal)
        change_points = algo.predict(pen=penalty)
    except Exception as e:
        print(f"Error processing column {column_name}: {e}")
        return None

    enriched_change_points = []
    for cp in change_points[:-1]:
        mean_before = np.mean(signal[:cp])
        mean_after = np.mean(signal[cp:])
        significance = calculate_significance(mean_before, mean_after, std_dev)
        enriched_change_points.append({
            "index": cp,
            "mean_before": mean_before,
            "mean_after": mean_after,
            "significance": significance
        })

    return {
        "variable": column_name,
        "points": enriched_change_points
    }

def detect_change_points(df, penalty=3):
    
    if isinstance(df, pd.Series):
        df = df.to_frame()
    
    numeric_df = df.select_dtypes(include=[np.number])

    if numeric_df.empty:
        return []

    change_points_results = []
    std_devs = numeric_df.std()

    for column in numeric_df.columns:
        signal = numeric_df[column].values.reshape(-1, 1)
        std_dev = std_devs[column]
        result = process_column(signal, column, penalty, std_dev)
        if result:
            change_points_results.append(result)

    return change_points_results

