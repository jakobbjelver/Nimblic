#from quality import data_quality_checks
from privacy_assessment import analyze_column
import pandas as pd
import traceback
from flask import json
import numpy as np
from datetime import datetime, date

def make_serializable(obj):
    # Check for built-in types first
    if isinstance(obj, (int, bool)):
        return obj
    if isinstance(obj, float):
        # Handle NaN and Inf values in floats
        if np.isnan(obj) or not np.isfinite(obj):
            return None
        return obj

    # Handle numpy types
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)

    # Handle strings (including those containing only a minus sign)
    if isinstance(obj, str):
        return obj

    # Handle collections
    if isinstance(obj, (np.ndarray, pd.Series)) or (isinstance(obj, (list, tuple, set)) and not isinstance(obj, str)):
        return [make_serializable(x) for x in obj]

    # Handle pandas DataFrame
    if isinstance(obj, pd.DataFrame):
        return obj.applymap(make_serializable).to_dict(orient='records')

    # Handle dictionaries
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}

    # Handle date and time
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()

    # For other types, default to string representation
    return str(obj)

def test_statistical_analysis(file_name):
    """
    Test function to load a file, convert it to a DataFrame, and perform statistical analysis.

    :param file_name: Name of the file to load. File should be in the same directory.
    :return: Dictionary containing results of statistical analyses.
    """

    # Loading the file into a DataFrame
    try:
        df = pd.read_csv(file_name)
    except Exception as e:
        return f"Failed to load the file: {e}"

    # Perform statistical analysis
    try:
        # Analyze each column
        for column in df.columns:
            pii_counts = analyze_column(df[column])
            print(f"PII counts for {column}: {pii_counts}")
    except Exception as e:
        traceback.print_exc()
        return f"Failed to perform statistical analysis: {e}"
    

# Example usage
test_results = test_statistical_analysis('C:/Users/jakob/Nimblic/frontend/nimblic/public/sample_data/netflix_dataset.csv')
response_serializable = {k: make_serializable(v) for k, v in test_results.items()}

print(json.dumps(response_serializable, indent=4))  # Nicely formatted JSON string