import pandas as pd
from .consistency_checks import format_consistency_check
from .type_validation import validate_data_types
from .key_field_analysis import key_field_analysis
#from .privacy_assessment import analyze_privacy_assessment
from .redundancy_analysis import data_redundancy_analysis
from .completeness_over_time import calculate_completeness_over_time

def is_column_hashable(column):
    """
    Check if all values in the column are hashable.
    """
    try:
        _ = {value: 1 for value in column}
        return True
    except TypeError:
        return False

def data_quality_checks(dataframe):
    """Perform data quality checks and return issues found along with an overall quality score."""
    num_rows = len(dataframe)
    num_columns = len(dataframe.columns)

    # Convert columns with unhashable values (like dict) to strings
    for column in dataframe.columns:
        if not is_column_hashable(dataframe[column]):
            dataframe[column] = dataframe[column].astype(str)

    # Detect various issues
    missing_values = dataframe.isnull().sum().to_dict()
    missing_values_percentage = {col: (missing_values[col] / num_rows) * 100 for col in missing_values}
    duplicate_rows = dataframe.duplicated().sum()
    constant_columns = [col for col in dataframe.columns if dataframe[col].nunique() == 1]

    # Detect outliers
    potential_outliers = {}
    numeric_columns = dataframe.select_dtypes(include=['number']).columns

    # Initialize scores to default values
    missing_values_score = 1
    duplicate_rows_score = 1
    constant_columns_score = 1
    outlier_columns_score = 1

    # Calculate scores for each issue
    missing_values_score = 1 - sum(missing_values.values()) / (num_rows * num_columns)
    duplicate_rows_score = 1 - duplicate_rows / num_rows
    constant_columns_score = 1 - len(constant_columns) / num_columns

    if len(numeric_columns) > 0:
        for column in numeric_columns:
            col_data = dataframe[column]
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            # Identify outliers
            outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]

            # Limit the outliers list to a maximum of 100 elements
            limited_outliers = outliers.head(100).tolist()

            # Store the total number of outliers and the limited list
            potential_outliers[column] = {
                'lower_bound': lower_bound,
                'upper_bound': upper_bound,
                'outliers': limited_outliers,
                'total_outlier_count': len(outliers)
            }

        outlier_columns_score = 1 - len(potential_outliers) / len(numeric_columns)

    else:
        # Handle the case when there are no numeric columns
        # For example, you could set outlier_columns_score to a default value or skip it
        outlier_columns_score = 0

    # Weights (can be adjusted based on importance)
    weights = {
        'missing_values': 0.4,
        'duplicate_rows': 0.2,
        'constant_columns': 0.2,
        'potential_outliers': 0.2
    }

    # Overall quality score (weighted average)
    overall_quality_score = (
        weights['missing_values'] * missing_values_score +
        weights['duplicate_rows'] * duplicate_rows_score +
        weights['constant_columns'] * constant_columns_score +
        weights['potential_outliers'] * outlier_columns_score
    )

    quality_report = {
        'missing_values': missing_values,
        'missing_values_percentage': missing_values_percentage,
        'duplicate_rows': duplicate_rows,
        'constant_columns': constant_columns,
        'potential_outliers': potential_outliers,
        'overall_quality_score': overall_quality_score * 100,  # Percentage
        'consistency_checks' : format_consistency_check(dataframe),
        'type_validation' : validate_data_types(dataframe),
        'key_field_analysis' : key_field_analysis(dataframe),
        #'privacy_assessment' : analyze_privacy_assessment(dataframe),
        'redundancy_analysis' : data_redundancy_analysis(dataframe),
        'completeness_over_time' : calculate_completeness_over_time(dataframe)
    }
    
    return quality_report
