import pandas as pd

def data_type_validation(dataframe):
    """Validate the data types of each column in the dataframe."""
    type_issues = {}

    for column in dataframe.columns:
        column_type = dataframe[column].dtype
        if column_type == 'object':
            # Check for non-string values in object columns
            if dataframe[column].apply(lambda x: not isinstance(x, str) and pd.notna(x)).any():
                type_issues[column] = 'Non-string values in text column'

        elif pd.api.types.is_numeric_dtype(column_type):
            # Check for non-numeric values in numeric columns
            if dataframe[column].apply(lambda x: not isinstance(x, (int, float)) and pd.notna(x)).any():
                type_issues[column] = 'Non-numeric values in numeric column'

        elif column_type == 'bool':
            # Check for non-boolean values in boolean columns
            if dataframe[column].apply(lambda x: not isinstance(x, bool) and pd.notna(x)).any():
                type_issues[column] = 'Non-boolean values in boolean column'

        elif pd.api.types.is_datetime64_any_dtype(column_type):
            # Check for non-datetime values in datetime columns
            if dataframe[column].apply(lambda x: not pd.isna(x) and not pd.api.types.is_datetime64_any_dtype(x)).any():
                type_issues[column] = 'Non-datetime values in datetime column'

        elif column_type.name == 'category':
            # Check for values not in category list in categorical columns
            if not all(item in dataframe[column].cat.categories or pd.isna(item) for item in dataframe[column]):
                type_issues[column] = 'Values not in category list in categorical column'

    return type_issues


def validate_data_types(dataframe):
    """Wrapper function to perform data type validation checks."""
    validation_report = {
        'data_type_issues': data_type_validation(dataframe)
    }
    return validation_report
