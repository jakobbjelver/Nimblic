import pandas as pd

def identify_key_fields(dataframe):
    """Identify potential key fields in the dataframe based on common characteristics."""
    key_fields = []
    for column in dataframe.columns:
        # Convert column name to string to handle non-string column names
        column_str = str(column)

        # Heuristics for identifying key fields
        # Common key field names
        if any(keyword in column_str.lower() for keyword in ['id', 'key', 'code', 'number']):
            key_fields.append(column)
        # Numeric or string columns with unique values
        elif dataframe[column].nunique() == len(dataframe):
            key_fields.append(column)
    return key_fields


def check_key_field_uniqueness(dataframe, key_fields):
    """Check for uniqueness in specified key fields and highlight any anomalies."""
    uniqueness_issues = {}

    for field in key_fields:
        total_values = len(dataframe[field])
        unique_values = len(dataframe[field].unique())

        if total_values != unique_values:
            duplicate_count = total_values - unique_values
            uniqueness_issues[field] = f'Found {duplicate_count} duplicate values'

    return uniqueness_issues

def key_field_analysis(dataframe):
    """Perform key field analysis on the dataframe."""
    key_fields = identify_key_fields(dataframe)
    analysis_report = {
        'key_field_uniqueness': check_key_field_uniqueness(dataframe, key_fields),
        'identified_key_fields': key_fields
    }
    return analysis_report
