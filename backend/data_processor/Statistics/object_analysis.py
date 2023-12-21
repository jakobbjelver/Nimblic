from textblob import TextBlob
from nltk.tokenize import word_tokenize
from collections import Counter
from gensim import corpora, models
import textstat
from scipy.stats import zscore
import numpy as np
import pandas as pd

def object_analysis(df):
    print("Performing object analysis...")

    # Filter DataFrame to only include columns with text data
    # i.e., columns of dtype 'object' and where all elements are strings
    string_columns = [col for col in df.columns if all(isinstance(x, str) for x in df[col])]

    # Define a helper function to apply all analyses to a column
    def analyze_column(col_data):
        return {
            'sentiment_analysis': sentiment_analysis(col_data),
            'text_complexity': text_complexity(col_data),
            'keyword_extraction': keyword_extraction(col_data),
            'common_patterns': detect_common_patterns(col_data),
            'text_length_analysis': text_length_analysis(col_data),
            'language_detection': language_detection(col_data)
        }

    # Apply the helper function to each text column in the DataFrame
    analysis_results = {col: analyze_column(df[col]) for col in string_columns}

    print("Object analysis done!")
    return analysis_results


from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

from collections import Counter

from scipy.sparse import csr_matrix

def keyword_extraction(column, top_n=5):
    print("Performing keyword_extraction analysis...")

    # Ensure column is a Series and drop NaN values
    text_data = column.dropna().astype(str)

    # Check if there's sufficient data to proceed
    if text_data.empty:
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

    return dict(keyword_counts)



def sentiment_analysis(column):
    print("Performing sentiment_analysis analysis...")

    total_polarity = 0
    total_subjectivity = 0
    count = 0

    # Calculate polarity and subjectivity for each non-null text and add to totals
    for text in column.dropna().astype(str):
        blob = TextBlob(text)
        total_polarity += blob.sentiment.polarity
        total_subjectivity += blob.sentiment.subjectivity
        count += 1

    # Calculate averages if count is not zero; else return default values or NaN
    average_polarity = total_polarity / count if count else float('nan')
    average_subjectivity = total_subjectivity / count if count else float('nan')

    # Return the average scores as a summary
    return {
        'average_polarity': average_polarity,
        'average_subjectivity': average_subjectivity
    }


import textstat

def text_complexity(column):
    print("Performing text_complexity analysis...")

    # Ensure each element is a string and drop NaN values
    column = column.apply(lambda x: ' '.join([str(item) for item in x]) if isinstance(x, list) else x).dropna()

    flesch_readings = column.apply(textstat.flesch_reading_ease)
    average_flesch_reading_ease = flesch_readings.mean()  # Pandas mean() method
    return {'average_flesch_reading_ease': average_flesch_reading_ease}


from commonregex import CommonRegex
from collections import Counter

def detect_common_patterns(column):
    print("Performing common_patterns analysis...")
    aggregate_results = {attr: 0 for attr in ['dates', 'times', 'phones', 'links', 'emails', 'ips', 'ipv6s', 'prices', 'hex_colors', 'credit_cards', 'btc_addresses', 'street_addresses']}
    parser = CommonRegex()
    
    for text in column.dropna().astype(str):
        for attr in aggregate_results.keys():
            pattern_matches = getattr(parser, attr)(text)
            aggregate_results[attr] += len(pattern_matches)

    # Filter out the keys with zero values
    filtered_results = {k: v for k, v in aggregate_results.items() if v > 0}

    return filtered_results

def text_length_analysis(column):
    print("Performing text_length analysis...")

    # Split and flatten the words, ensuring all elements are strings
    words = column.dropna().astype(str).str.split().explode()

    # Now that we have only strings, we can safely use string methods
    word_lengths = words.str.len()  # Get lengths of each word

    shortest_word = words[word_lengths.idxmin()]
    longest_word = words[word_lengths.idxmax()]
    average_word_length = word_lengths.mean()

    return {
        'shortest_word': shortest_word,
        'longest_word': longest_word,
        'average_word_length': average_word_length
    }


from langdetect import detect, DetectorFactory
import iso639

# Set seed for reproducibility in language detection
DetectorFactory.seed = 0 

import langid

def detect_language_langid(text):
    lang, _ = langid.classify(text[:300])  # Limit text length for faster processing
    return lang

def language_detection(column, sample_size=100):
    print("Performing optimized language detection with langid...")

    # Drop NaN values and ensure the column is a Series
    column = column.dropna().astype(str)

    # Adjust sample size if it's larger than the number of available items
    sample_size = min(sample_size, len(column))

    # Proceed only if there are items to sample
    if sample_size > 0:
        # Sample the data if sample_size is specified and there are enough items
        column_sample = column.sample(n=sample_size, random_state=1)

        # Apply langid language detection to each text in the sample
        detected_languages = [detect_language_langid(text) for text in column_sample]

        # Count occurrences of each language
        language_counts = pd.Series(detected_languages).value_counts().to_dict()

        # Optionally, add additional information for each detected language
        country_info = {lang: {'language_name': 'Name'} for lang in language_counts}
        
        return language_counts, country_info
    else:
        return {"error": "No data available for language detection"}




