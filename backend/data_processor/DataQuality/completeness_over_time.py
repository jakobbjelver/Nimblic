import pandas as pd

def detect_time_columns(dataframe):
    """
    Detect time-related columns in the DataFrame based on data types and column names.

    :param dataframe: Pandas DataFrame
    :return: List of time-related column names
    """
    time_columns = []

    # Check data types for datetime
    for column in dataframe.select_dtypes(include=[pd.Timestamp, 'datetime']).columns:
        time_columns.append(column)

    # Further check column names for keywords that typically indicate time-related columns
    time_keywords = ['date', 'time', 'year', 'month', 'day']
    for column in dataframe.columns:
        # Convert column name to string to handle non-string column names
        column_str = str(column)

        if any(keyword in column_str.lower() for keyword in time_keywords):
            time_columns.append(column)

    return list(set(time_columns))  # Remove duplicates


def calculate_completeness_over_time(dataframe):
    """
    Calculate the completeness of data over time for detected time-related columns.

    :param dataframe: Pandas DataFrame
    :return: Dictionary with time columns and their completeness over time or a message if no time column is found
    """
    time_columns = detect_time_columns(dataframe)
    
    if not time_columns:
        return "No time-related columns detected in the DataFrame."

    completeness_results = {}

    for time_column in time_columns:
        # Ensure the column is datetime type before grouping
        if pd.api.types.is_datetime64_any_dtype(dataframe[time_column]):
            completeness_over_time = {}
            for period, df in dataframe.groupby(pd.Grouper(key=time_column, freq='M')):
                completeness = 1 - df.isnull().sum().sum() / (len(df) * len(df.columns))
                completeness_over_time[period] = completeness * 100  # as percentage
            completeness_results[time_column] = completeness_over_time
        else:
            completeness_results[time_column] = "Column not in datetime format"

    return completeness_results

