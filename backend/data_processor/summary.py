# summary.py

import pandas as pd

def get_basic_info(df):
    """
    Return basic information about the dataset, like number of rows, columns and missing values.
    """
    info = {
        "number_of_rows": len(df),
        "number_of_columns": len(df.columns),
        "missing_values": df.isnull().sum().to_dict()
    }
    return info

def get_column_types(df):
    """
    Return a summary of column data types.
    """
    types = df.dtypes.apply(lambda x: x.name).to_dict()
    return types

def get_unique_values(df):
    # Convert columns with list values to a hashable format (e.g., tuples)
    for column in df.columns:
        if any(isinstance(x, list) for x in df[column]):
            df[column] = df[column].apply(lambda x: tuple(x) if isinstance(x, list) else x)

    try:
        unique_values = df.nunique().to_dict()
    except TypeError as e:
        # Additional handling if error persists
        unique_values = {'error': str(e)}
    
    return unique_values



def get_memory_usage(df):
    """
    Return the memory usage of the dataset.
    """
    memory_usage = df.memory_usage(deep=True).to_dict()
    memory_usage['total'] = sum(memory_usage.values())
    return memory_usage

def get_sample_data(df, num_rows=5):
    """
    Return the head, tail, and three sets of random samples of the dataset, each with num_rows rows.
    If the DataFrame has fewer rows than num_rows, return the entire DataFrame.
    """
    num_rows = min(num_rows, len(df))  # Adjust num_rows to the size of the DataFrame
    data_samples = {
        "head": df.head(num_rows).to_dict(orient='records'),
        "tail": df.tail(num_rows).to_dict(orient='records'),
        "random_sample_1": df.sample(n=num_rows, replace=True).to_dict(orient='records'),
        "random_sample_2": df.sample(n=num_rows, replace=True).to_dict(orient='records'),
        "random_sample_3": df.sample(n=num_rows, replace=True).to_dict(orient='records')
    }

    return data_samples



def compile_summary(df):
    """
    Compile all summary functions into a single report.
    """
    summary = {
        "basic_info": get_basic_info(df),
        "column_types": get_column_types(df),
        "unique_values": get_unique_values(df),
        "memory_usage": get_memory_usage(df),
        "sample_data": get_sample_data(df) # Uncomment if needed and ensure it returns serializable data
    }
    return summary


# You can add more summary functions if needed to provide additional insights.
