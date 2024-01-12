from presidio_analyzer import AnalyzerEngine
import numpy as np
import time
import logging

# Initialize Presidio Analyzer outside of the if block
analyzer = AnalyzerEngine()

logger = logging.getLogger('presidio_analyzer')
logger.setLevel(logging.ERROR)

def analyze_text_batch(texts):
    """
    Analyze a batch of texts using Presidio to identify PII.
    :param texts: List of texts to analyze.
    :return: Aggregated PII types and counts for the batch.
    """
    analysis_results = [analyzer.analyze(text=text, language='en') for text in texts]
    pii_types = [entity_type for result in analysis_results for entity_type in [entity.entity_type for entity in result]]
    return np.unique(pii_types, return_counts=True)

def analyze_column(column_name, data, sample_size=100, batch_size=100):
    """
    Analyze a sample of a DataFrame column using Presidio in batches, including the column name.
    :param column_name: Name of the column.
    :param data: A Pandas Series representing a DataFrame column.
    :param sample_size: Number of samples to take from the column.
    :param batch_size: Size of each batch for analysis.
    :return: Aggregated PII types and counts for the column.
    """
    # Take a sample and include the column name in the analysis
    sample_data = data.sample(min(sample_size, len(data)), random_state=1).astype(str)
    sample_data_with_column_name = sample_data.apply(lambda x: f"{column_name}: {x}")

    # Batch processing
    aggregated_results = {}
    for start in range(0, len(sample_data_with_column_name), batch_size):
        batch = sample_data_with_column_name[start:start + batch_size].tolist()
        pii_types, counts = analyze_text_batch(batch)
        for pii_type, count in zip(pii_types, counts):
            aggregated_results[pii_type] = aggregated_results.get(pii_type, 0) + count

    return aggregated_results

def analyze_privacy_assessment(dataframe, sample_size=100, batch_size=100):
    """
    Analyze each column of a DataFrame using Presidio.
    :param dataframe: Pandas DataFrame to analyze.
    :param sample_size: Number of samples to take from each column.
    :param batch_size: Size of each batch for analysis.
    :return: Dictionary with PII types and counts for each column.
    """

    start_time = time.time()  
    
    results = {}
    for column_name in dataframe.columns:
        column_data = dataframe[column_name]
        column_results = analyze_column(column_name, column_data, sample_size, batch_size)
        results[column_name] = column_results

    print("PRIVACY ASSESSMENT execution time: {:.2f} seconds".format(time.time() - start_time))
    return results


