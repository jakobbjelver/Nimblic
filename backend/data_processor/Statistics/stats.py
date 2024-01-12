# stats.py

import pandas as pd
import numpy as np
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import statsmodels.api as sm
from .categorical_analysis import categorical_analysis
from .numerical_analysis import numerical_analysis
#from .object_analysis import object_analysis
from .datetime_analysis import datetime_analysis
from statsmodels.formula.api import ols

def describe_data(df):
    """
    Provide a comprehensive data profile for each column in the DataFrame.
    Handles numerical, categorical, datetime, boolean, and object columns with unique indexing.
    """
    profile = pd.DataFrame()

    # Creating subsets for different data types
    numerical_data = df.select_dtypes(include='number')
    datetime_data = df.select_dtypes(include='datetime')
    categorical_data = df.select_dtypes(include='category')
    boolean_data = df.select_dtypes(include='bool')
    object_data = df.select_dtypes(include='object')

    for column in df.columns:
        col_data = df[column]
        dtype = col_data.dtype
        missing = col_data.isnull().sum()
        unique = col_data.nunique()

        # Initialize stats dictionary
        stats = {
            'Data Type': dtype.name,
            'Missing Values': missing,
            'Unique Values': unique
        }

        if column in numerical_data:
            stats.update({
                'Mean': col_data.mean(),
                'Median': col_data.median(),
                'Std Dev': col_data.std(),
                'Min': col_data.min(),
                'Max': col_data.max()
            })
        elif column in datetime_data:
            stats.update({
                'Earliest': col_data.min(),
                'Latest': col_data.max()
            })
        elif column in categorical_data:
            top_freq = col_data.value_counts().nlargest(1)
            stats.update({
                'Most Frequent': top_freq.index[0] if not top_freq.empty else None,
                'Top Categories': col_data.value_counts().head(5).to_dict()
            })
        elif column in boolean_data:
            stats.update({
                'True Count': col_data.sum(),
                'False Count': len(col_data) - col_data.sum() - missing
            })
        elif column in object_data:
            # Check for mixed data types within 'object' dtype columns
            mixed_types = len(col_data.apply(type).unique()) > 1
            if mixed_types:
                stats['Warning'] = 'Contains mixed data types'
            else:
                top_freq = col_data.value_counts().nlargest(1)
                stats.update({
                    'Most Frequent': top_freq.index[0] if not top_freq.empty else None,
                    'Top Categories': col_data.value_counts().head(5).to_dict()
                })
        else:
            stats['Note'] = 'Data type not specifically handled'

        # Add the stats to the profile
        profile[column] = pd.Series(stats)

    return profile.to_dict()



def calculate_correlation(df, method='pearson'):
    """
    Calculate correlation matrix for numeric columns.
    Supports 'pearson' and 'spearman' methods.
    Non-numeric columns are encoded if method is 'spearman'.
    """
    if method == 'spearman':
        df_encoded = df.copy()
        label_encoder = LabelEncoder()

        for column in df_encoded.columns:
            if df_encoded[column].dtype == 'object' or pd.api.types.is_categorical_dtype(df_encoded[column]):
                # Convert unhashable types to string
                if any(isinstance(x, (list, dict, set, np.ndarray)) for x in df_encoded[column]):
                    df_encoded[column] = df_encoded[column].apply(lambda x: str(x) if isinstance(x, (list, dict, set, np.ndarray)) else x)

                # Handle categorical columns specifically
                if pd.api.types.is_categorical_dtype(df_encoded[column]):
                    # Add 'NaN' as a category
                    df_encoded[column] = df_encoded[column].cat.add_categories('NaN')
                    df_encoded[column].fillna('NaN', inplace=True)

                # Apply label encoding
                df_encoded[column] = label_encoder.fit_transform(df_encoded[column].astype(str))

        correlation = df_encoded.corr(method=method)
    else:
        correlation = df.select_dtypes(include=[np.number]).corr(method=method)

    return correlation.to_dict()




def anova_test(df, numeric_column, group_column):
    """
    Perform ANOVA test to see if there are significant differences between the means of groups.
    """
    categorical_cols = [col for col in df.columns if pd.api.types.is_categorical_dtype(df[col]) or df[col].nunique() < 10]
    numerical_cols = [col for col in df.columns if pd.api.types.is_numeric_dtype(df[col])]  

    # Perform the ANOVA test
    try:
        model = ols(f'{numerical_cols[0]} ~ C({categorical_cols[0]})', data=df).fit()
        anova_table = sm.stats.anova_lm(model, typ=2)
        return anova_table
    except Exception as e:
        return f"ANOVA test failed: {e}"

def perform_statistical_analysis(df):
    """
    Perform all statistical analyses and compile results into a dictionary.
    """

    analysis_results = {
        'profile': describe_data(df),
        'pearson_correlation': calculate_correlation(df, 'pearson'),
        'spearman_correlation': calculate_correlation(df, 'spearman'),
        'categorical_analysis': categorical_analysis(df),
        'numerical_analysis' : numerical_analysis(df),
        #'object_analysis' : object_analysis(df),
        'datetime_analysis' : datetime_analysis(df)
    }

    return analysis_results







