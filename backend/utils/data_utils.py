import numpy as np
import pandas as pd
import datetime
from datetime import datetime, date
from concurrent.futures import ThreadPoolExecutor
from data_processor.change_point_detection import detect_change_points
from flask import json

def convert_data_types(df):

    df.columns = df.columns.astype(str)

    for column in df.columns:
        # Handling missing data
        df[column].fillna(value=pd.NA, inplace=True)

        # Handling dictionary data types
        if any(df[column].apply(lambda x: isinstance(x, dict))):
            df[column] = df[column].apply(lambda d: json.dumps(d) if isinstance(d, dict) else d)

        # Convert Timestamp to datetime
        if pd.api.types.is_datetime64_any_dtype(df[column]):
            df[column] = df[column].apply(lambda x: x.to_pydatetime() if isinstance(x, pd.Timestamp) else x)

        # Downcast numeric columns
        if pd.api.types.is_numeric_dtype(df[column]):
            df[column] = pd.to_numeric(df[column], downcast='integer')
            if not pd.api.types.is_integer_dtype(df[column]):
                df[column] = pd.to_numeric(df[column], downcast='float')
        elif pd.api.types.is_string_dtype(df[column]):
            # Convert to categorical if there are significantly fewer unique values than total values
            if df[column].nunique() / len(df[column]) < 0.5:
                df[column] = df[column].astype('category')
            else:
                # Attempt datetime conversion with timezone awareness
                df_with_dates = pd.to_datetime(df[column], errors='coerce', utc=True)
                if not df_with_dates.isna().all():
                    df[column] = df_with_dates

    return df

def find_time_series_columns(df):
    time_series_columns = []
    
    for column in df.columns:
        # Check if the column is already a datetime type
        if pd.api.types.is_datetime64_any_dtype(df[column]):
            time_series_columns.append(column)
        else:
            # Attempt to convert to datetime if it's a string that looks like a date
            try:
                pd.to_datetime(df[column], errors='raise')
                time_series_columns.append(column)
            except (ValueError, TypeError):
                # Column cannot be converted to datetime
                pass
    
    return time_series_columns

def detect_change_points_parallel(df, penalty=3):
    # Function to process a single column
    def process_column(column_data):
        # Convert Series to DataFrame if necessary
        if isinstance(column_data, pd.Series):
            column_data = column_data.to_frame()

        return detect_change_points(column_data)

    # If df is a Series, directly process it instead of iterating over columns
    if isinstance(df, pd.Series):
        return process_column(df)

    # Sequentially process each column in DataFrame
    results = [process_column(df[column]) for column in df.columns]

    # Flatten the list of results
    change_points_results = [item for sublist in results for item in sublist]
    return change_points_results

def make_serializable(obj):
    # Check for built-in types first
    if isinstance(obj, (int, bool)):
        return obj
    if isinstance(obj, float):
        # Handle NaN and Inf values in floats
        if np.isnan(obj) or not np.isfinite(obj):
            return None
        return obj

    # Convert Timestamp to ISO format string
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()

    # Handle numpy types
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)

    # Handle strings
    if isinstance(obj, str):
        return obj

    # Handle collections (lists, tuples, sets)
    if isinstance(obj, (np.ndarray, pd.Series)) or isinstance(obj, (list, tuple, set)):
        return [make_serializable(x) for x in obj]

    # Handle pandas DataFrame
    if isinstance(obj, pd.DataFrame):
        return obj.applymap(make_serializable).to_dict(orient='records')

    # Handle dictionaries
    if isinstance(obj, dict):
        # Ensure that keys are strings, as non-string keys can cause issues in serialization
        return {str(make_serializable(k)): make_serializable(v) for k, v in obj.items()}

    # Handle date and time
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()

    # For other types, default to string representation
    return str(obj)

