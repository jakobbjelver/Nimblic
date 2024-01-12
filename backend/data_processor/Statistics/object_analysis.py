from textblob import TextBlob
from collections import Counter
import textstat
from scipy.stats import zscore
import numpy as np
import pandas as pd
from celery import group
import logging
import time

from config.celery_config import celery_app

def object_analysis(df):
    print("Performing object analysis task FINAL...")
    object_analysis_time = time.time()

    string_columns = [col for col in df.columns if all(isinstance(x, str) for x in df[col])]

    task_list = []

    for col in string_columns:
        col_data_list = df[col].dropna().astype(str).tolist()

        # Add tasks to the task list
        task_list.extend([
            sentiment_analysis_task.s(col, col_data_list),
            text_complexity_task.s(col, col_data_list),
            keyword_extraction_task.s(col, col_data_list),
            detect_common_patterns_task.s(col, col_data_list),
            text_length_analysis_task.s(col, col_data_list),
            language_detection_task.s(col, col_data_list)
        ])

    print("Object analysis task setup done! Time: {:.2f} seconds".format(time.time() - object_analysis_time))
    return task_list


@celery_app.task
def aggregate_results(results):
    aggregated_data = {}

    for column_result in results:
        for column_name, analyses in column_result.items():
            if column_name not in aggregated_data:
                aggregated_data[column_name] = {}

            for analysis_type, data in analyses.items():
                if analysis_type in aggregated_data[column_name]:
                    # Merge data for analysis types that are already present
                    if isinstance(data, dict):
                        aggregated_data[column_name][analysis_type].update(data)
                    elif isinstance(data, list):
                        aggregated_data[column_name][analysis_type].extend(data)
                    else:  # for numerical and other types
                        aggregated_data[column_name][analysis_type] += data
                else:
                    aggregated_data[column_name][analysis_type] = data

    return aggregated_data



from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

from collections import Counter

from scipy.sparse import csr_matrix

@celery_app.task
def keyword_extraction_task(column_name, text_data, top_n=5):
    print("Performing keyword_extraction analysis task...")
    keyword_extraction_task_time = time.time()

    # Check if there's sufficient data to proceed
    if not text_data:
        return {"error": "No data available for analysis"}

    # Initialize the TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)  # Adjust max_features as needed

    try:
        # Attempt to fit and transform the data
        tfidf_matrix = vectorizer.fit_transform(text_data)
    except ValueError as e:
        # Catch the specific error and return a meaningful message
        return {"error": "Insufficient unique text data for keyword extraction"}

    # Get feature names
    feature_names = np.array(vectorizer.get_feature_names_out())

    # Sum TF-IDF scores and get top indices
    aggregated_tfidf = csr_matrix.sum(tfidf_matrix, axis=0)
    top_indices = np.argsort(aggregated_tfidf.A1)[::-1][:top_n]
    top_keywords = feature_names[top_indices]

    # Count top keywords
    words_in_texts = [text.split() for text in text_data]
    keyword_counts = Counter(word for words in words_in_texts for word in words if word in top_keywords)

    print("Keyword extraction task done! Time: {:.2f} seconds".format(time.time() - keyword_extraction_task_time))

    result =  dict(keyword_counts)

    return {column_name: {'keyword_extraction': result}}



@celery_app.task
def sentiment_analysis_task(column_name, text_data):
    print("Performing sentiment_analysis analysis task...")
    sentiment_analysis_task_time = time.time()

    total_polarity = 0
    total_subjectivity = 0
    count = 0

    # Calculate polarity and subjectivity for each non-null text and add to totals
    for text in text_data:
        blob = TextBlob(text)
        total_polarity += blob.sentiment.polarity
        total_subjectivity += blob.sentiment.subjectivity
        count += 1

    # Calculate averages if count is not zero; else return default values or NaN
    average_polarity = total_polarity / count if count else float('nan')
    average_subjectivity = total_subjectivity / count if count else float('nan')

    print("Sentiment analysis task done! Time: {:.2f} seconds".format(time.time() - sentiment_analysis_task_time))
    # Return the average scores as a summary
    result =  {
        'average_polarity': average_polarity,
        'average_subjectivity': average_subjectivity
    }

    return {column_name: {'sentiment_analysis': result}}



import textstat
@celery_app.task
def text_complexity_task(column_name, text_data):
    print("Performing text_complexity analysis task...")
    text_complexity_task_time = time.time()

    # Ensure each element is a string and calculate flesch reading ease
    flesch_readings = [textstat.flesch_reading_ease(text) for text in text_data]
    average_flesch_reading_ease = np.mean(flesch_readings)
    print("Text complexity task done! Time: {:.2f} seconds".format(time.time() - text_complexity_task_time))

    result =  {'average_flesch_reading_ease': average_flesch_reading_ease}
    return {column_name: {'text_complexity': result}}


from commonregex import CommonRegex
from collections import Counter

@celery_app.task
def detect_common_patterns_task(column_name, text_data):
    print("Performing common_patterns analysis task...")
    detect_common_patterns_task_time = time.time()
    aggregate_results = {attr: 0 for attr in ['dates', 'times', 'phones', 'links', 'emails', 'ips', 'ipv6s', 'prices', 'hex_colors', 'credit_cards', 'btc_addresses', 'street_addresses']}
    parser = CommonRegex()
    
    for text in text_data:
        for attr in aggregate_results.keys():
            pattern_matches = getattr(parser, attr)(text)
            aggregate_results[attr] += len(pattern_matches)

    # Filter out the keys with zero values
    filtered_results = {k: v for k, v in aggregate_results.items() if v > 0}

    print("Detect Common Patterns task done! Time: {:.2f} seconds".format(time.time() - detect_common_patterns_task_time))

    return {column_name: {'common_patterns': filtered_results}}

@celery_app.task
def text_length_analysis_task(column_name, text_data):
    print("Performing text_length analysis task...")
    text_length_analysis_task_time = time.time()

    # Flatten the words from the list of texts
    words = [word for text in text_data for word in text.split()]

    result = None

    word_lengths = [len(word) for word in words]
    if word_lengths:  # Ensure there are words to analyze
        shortest_word_length = min(word_lengths)
        longest_word_length = max(word_lengths)
        average_word_length = np.mean(word_lengths)
        result =  {
            'shortest_word_length': shortest_word_length,
            'longest_word_length': longest_word_length,
            'average_word_length': average_word_length
        }
    else:
        result =  {
            'shortest_word_length': None,
            'longest_word_length': None,
            'average_word_length': None
        }

    print("Text length analysis task done! Time: {:.2f} seconds".format(time.time() - text_length_analysis_task_time))

    return {column_name: {'text_length_analysis': result}}

from langdetect import detect, DetectorFactory

# Set seed for reproducibility in language detection
DetectorFactory.seed = 0 

import langid

logger = logging.getLogger('langid')
logger.setLevel(logging.DEBUG)

def detect_language_langid(text):
    lang, _ = langid.classify(text[:300])  # Limit text length for faster processing
    return lang

@celery_app.task
def language_detection_task(column_name, text_data, sample_size=100):
    print("Performing language detection task...")
    language_detection_task_time = time.time()

    if sample_size > 0 and len(text_data) > 0:
        column_sample = np.random.choice(text_data, size=sample_size, replace=False)
        detected_languages = [detect_language_langid(text) for text in column_sample]
        language_counts = pd.Series(detected_languages).value_counts().to_dict()

        print("Language detection task done! Time: {:.2f} seconds".format(time.time() - language_detection_task_time))
        return {column_name: {'language_detection': language_counts}}
    else:
        return {column_name: {'language_detection': None}}





