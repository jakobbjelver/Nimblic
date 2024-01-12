import pandas as pd
import re

def format_consistency_check(dataframe):
    """Check for format consistency within each column of the dataframe."""
    format_issues = {}

    # Example check for date format consistency
    for column in dataframe.select_dtypes(include=['datetime']).columns:
        inconsistent_dates = dataframe[column].apply(lambda x: pd.to_datetime(x, errors='coerce').strftime('%Y-%m-%d') != str(x.date()) if pd.notna(x) else False)
        if inconsistent_dates.any():
            format_issues[column] = 'Inconsistent date format'

    # Check for numeric data format consistency
    for column in dataframe.select_dtypes(include=['number']).columns:
        if dataframe[column].apply(lambda x: not pd.isna(x) and not isinstance(x, (int, float))).any():
            format_issues[column] = 'Non-numeric values in numeric column'

    # Check for text data format consistency (e.g., consistent casing)
    for column in dataframe.select_dtypes(include=['object', 'string']).columns:
        # Ensure all elements are strings before applying string methods
        string_column = dataframe[column].apply(lambda x: str(x) if not pd.isna(x) else x)
        if string_column.str.islower().any() and string_column.str.isupper().any():
            format_issues[column] = 'Inconsistent text casing'

    # Check for boolean data format consistency
    for column in dataframe.select_dtypes(include=['bool']).columns:
        if not all(dataframe[column].apply(lambda x: isinstance(x, bool))):
            format_issues[column] = 'Non-boolean values in boolean column'

   # Custom check for email format
    email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    for column in dataframe.columns:
        # Check if the column contains string values
        if dataframe[column].dtype == 'object':
            # Convert non-null elements to string to ensure compatibility with str methods
            string_column = dataframe[column].apply(lambda x: str(x) if not pd.isna(x) else x)
            if string_column.str.contains(email_regex).any():
                if string_column.apply(lambda x: not re.fullmatch(email_regex, x) if isinstance(x, str) else False).any():
                    format_issues[column] = 'Inconsistent email format'

    # Custom check for URL format
    url_regex = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    for column in dataframe.columns:
        # Check if the column contains string values
        if dataframe[column].dtype == 'object':
            # Convert non-null elements to string to ensure compatibility with str methods
            string_column = dataframe[column].apply(lambda x: str(x) if not pd.isna(x) else x)
            if string_column.str.contains(url_regex, na=False).any():
                if string_column.apply(lambda x: not re.fullmatch(url_regex, x) if isinstance(x, str) else False).any():
                    format_issues[column] = 'Inconsistent URL format'


    # Custom check for phone number format
    phone_regex = r'\+?1?\d{9,15}$'  # Basic international format
    for column in dataframe.columns:
        if dataframe[column].dtype == 'object' and dataframe[column].str.contains(phone_regex, na=False).any():
            if dataframe[column].apply(lambda x: not re.fullmatch(phone_regex, x) if isinstance(x, str) else False).any():
                format_issues[column] = 'Inconsistent phone number format'

    # Custom check for ZIP/postal code format
    # This is a basic US ZIP code pattern. Adjust the regex for other countries or formats
    zip_regex = r'\d{5}(?:[-\s]\d{4})?'
    for column in dataframe.columns:
        if dataframe[column].dtype == 'object' and dataframe[column].str.contains(zip_regex, na=False).any():
            if dataframe[column].apply(lambda x: not re.fullmatch(zip_regex, x) if isinstance(x, str) else False).any():
                format_issues[column] = 'Inconsistent ZIP code format'

    # Add more custom checks as needed

    return format_issues
