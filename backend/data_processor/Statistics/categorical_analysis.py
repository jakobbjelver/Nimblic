import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
from scipy.stats import chi2_contingency
import time


def categorical_analysis(df):
    """
    Perform analysis on categorical data: frequency counts and contingency tables.
    """
    print("Performing categorical analysis...")
    categorical_cols = df.select_dtypes(include=['category'])
    analysis = {}
    for col_name in categorical_cols:
        col_data = df[col_name]  # Get the actual column data
        frequency_counts = col_data.value_counts().sort_values(ascending=False)

        analysis[col_name] = {
            'Frequency': frequency_counts.to_dict(),  # Convert to dictionary
            #'Distribution' : distribution_by_numerical(col_name, df),  # Pass the column name
            'Similar Categories': find_similar_categories(col_data),  # Pass the column data, not the name
            #'Contingency Table': pd.crosstab(index=col_data, columns='count')
        }
    print("Categorical analysis done!")
    return analysis

def distribution_by_numerical(categorical_col, df):
    load_time = time.time()
    print("Distributing by numerical...")

    numerical_cols = df.select_dtypes(include='number').columns
    distribution = {}

    for num_col in numerical_cols:
        # Custom aggregation for required statistics using lambda functions
        grouped_data = df.groupby(categorical_col)[num_col].agg(
            min='min', 
            q25=lambda x: x.quantile(0.25), 
            q50=lambda x: x.quantile(0.50), 
            q75=lambda x: x.quantile(0.75), 
            max='max'
        ).reset_index()

        # Rearranging the data into the desired format
        formatted_data = {}
        for _, row in grouped_data.iterrows():
            category = row[categorical_col]
            stats = {
                'min': row['min'],
                'q25': row['q25'],
                'q50': row['q50'],
                'q75': row['q75'],
                'max': row['max']
            }
            formatted_data[category] = stats
        
        distribution[num_col] = formatted_data

    print("distribution_by_numerical execution time: {:.2f} seconds".format(time.time() - load_time))
    return distribution

def find_similar_categories(column, top_n=5, similarity_threshold=0.5):
    """
    Optimized function to find potentially similar categories based on cosine similarity.
    """
    unique_values = column.dropna().unique()
    if len(unique_values) > 100:  # Limiting the number of unique values to compare
        unique_values = np.random.choice(unique_values, 100, replace=False)
    
    vectorizer = CountVectorizer()
    vectors = vectorizer.fit_transform(unique_values)
    vectors = csr_matrix(vectors)  # Using sparse matrix

    csim = cosine_similarity(vectors, dense_output=False)
    csim.setdiag(0)  # Avoid comparing elements with themselves

    similar_pairs = []
    for i in range(csim.shape[0]):
        if csim[i, :].nnz > 0:  # Check if there are non-zero similarities
            row = csim.getrow(i).toarray().flatten()
            similar_indices = np.where(row > similarity_threshold)[0]
            similar_pairs.extend([(unique_values[i], unique_values[j], row[j]) for j in similar_indices])

    return sorted(similar_pairs, key=lambda x: x[2], reverse=True)[:top_n]

def chi_square_test(df):
    """
    Perform a Chi-square test of independence for two categorical columns.
    """
    categorical_cols = [col for col in df.columns if pd.api.types.is_categorical_dtype(df[col]) or df[col].nunique() < 10]

    # Select columns for Chi-Square Test (two categorical)
    chi_square_cols = None
    if len(categorical_cols) >= 2:
        chi_square_cols = (categorical_cols[0], categorical_cols[1])
    
    contingency_table = pd.crosstab(chi_square_cols[0], chi_square_cols[1])
    chi2, p, dof, expected = chi2_contingency(contingency_table)
    return {'chi2_statistic': chi2, 'p_value': p}