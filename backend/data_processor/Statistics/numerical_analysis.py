from scipy import stats
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import statsmodels.formula.api as smf

def numerical_analysis(df):
    """
    Perform all statistical analyses and compile results into a dictionary.
    """
    print("Performing numerical analysis...")
    analysis_results = {
        'normality_test': normality_test(df),
        'outliers_detection': outliers_detection(df),
        'skewness_kurtosis': skewness_kurtosis(df),
        'principal_component_analysis' : principal_component_analysis(df),
        'regression_analysis' : regression_analysis(df)

    }
    print("Numerical analysis done!")

    return analysis_results
def normality_test(df):
    """
    Perform a normality test for each numerical column in the dataset.
    Returns p-value for each column, testing the null hypothesis that it comes from a normal distribution.
    """
    normality_results = {}
    for column in df.select_dtypes(include=[np.number]).columns:
        stat, p_value = stats.shapiro(df[column].dropna())
        normality_results[column] = {'statistic': stat, 'p_value': p_value}
    return normality_results

def outliers_detection(df):
    """
    Detect outliers in numerical columns using the IQR method.
    """
    outliers_dict = {}
    for column in df.select_dtypes(include=[np.number]).columns:
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        filter = (df[column] >= Q1 - 1.5 * IQR) & (df[column] <= Q3 + 1.5 * IQR)
        outliers_dict[column] = df[~filter].index.tolist()
    return outliers_dict

def skewness_kurtosis(df):
    """
    Calculate skewness and kurtosis for each numerical column to understand the shape of data distribution.
    """
    skew_kurt_results = {}
    for column in df.select_dtypes(include=[np.number]).columns:
        skewness = df[column].skew()
        kurtosis = df[column].kurt()
        skew_kurt_results[column] = {'skewness': skewness, 'kurtosis': kurtosis}
    return skew_kurt_results

def principal_component_analysis(df, n_components=2, num_bins=300):
    """
    Perform Principal Component Analysis (PCA) on the dataset.
    """
    df_numeric = df.select_dtypes(include=[np.number])

    # Check if df_numeric is not empty
    if df_numeric.empty:
        return None

    df_scaled = StandardScaler().fit_transform(df_numeric.fillna(0))  # Handling NaN values

    pca = PCA(n_components=n_components)
    principal_components = pca.fit_transform(df_scaled)
    explained_variance = pca.explained_variance_ratio_

    binned_pca = [bin_data(pd.Series(pc), num_bins=num_bins) for pc in zip(*principal_components)]

    pca_results = {
        'principal_components': binned_pca,
        'explained_variance': explained_variance.tolist(),
        'feature_names': df_numeric.columns.tolist()
    }
    
    return pca_results


def intelligent_variable_selection(df):
    """
    Intelligently select a dependent variable and independent variables
    based on correlation, considering only numeric columns.
    """
    df = clean_column_names(df)

    # Filter out non-numeric columns
    numeric_df = df.select_dtypes(include=[np.number])

    # Check if numeric_df is not empty
    if numeric_df.empty:
         return None

    corr_matrix = numeric_df.corr().abs()
    average_corr = corr_matrix.mean()
    sorted_corr = average_corr.sort_values(ascending=False)

    # The variable with the highest average correlation to others is chosen as the dependent variable
    dependent_var = sorted_corr.index[0]

    # Other variables are considered as independent variables
    independent_vars = sorted_corr.index[1:].tolist()

    return dependent_var, independent_vars


def regression_analysis(df, num_bins=300):
    """
    Perform regression analysis with intelligently selected variables.
    """
    df_numerical = df.select_dtypes(include=['number'])

    # Check if df_numerical is not empty
    if df_numerical.empty:
        return None

    selection_result = intelligent_variable_selection(df_numerical)
    
    # Check if selection_result is not None
    if selection_result is None:
        return None

    dependent_var, independent_vars = selection_result
    formula = f'{dependent_var} ~ ' + ' + '.join(independent_vars)
    model = smf.ols(formula, data=df_numerical).fit()

    # Get actual values for the dependent variable
    actual_values = df_numerical[dependent_var]

    # Bin actual and predicted values
    binned_actual_values = bin_data(actual_values, num_bins=num_bins)
    binned_predicted_values = bin_data(pd.Series(model.predict()), num_bins=num_bins)

    regression_results = {
        'dependent_var': dependent_var,
        'independent_vars': independent_vars,
        'coefficients': model.params.tolist(),
        'p_values': model.pvalues.tolist(),
        'r_squared': model.rsquared,
        'actual_values': binned_actual_values,
        'predicted_values': binned_predicted_values
    }

    return regression_results



def bin_data(data, num_bins=300):
    """
    Bin data into a specified number of bins and return the mean or median of each bin.
    """
    bins = pd.qcut(data, q=num_bins, duplicates='drop')
    binned_data = data.groupby(bins).mean()  # or median, if more appropriate
    return binned_data.tolist()

import re

def clean_column_names(df):
    """
    Cleans column names by removing special characters and replacing spaces with underscores.
    """
    clean_names = []
    for col in df.columns:
        # Remove special characters and replace spaces with underscores
        clean_name = re.sub(r'\W+', '', col).replace(' ', '_')
        clean_names.append(clean_name)
    
    # Update column names in the DataFrame
    df.columns = clean_names
    return df

# Adjust the `numerical_analysis` function accordingly

