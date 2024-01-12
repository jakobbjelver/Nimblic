from stats import perform_statistical_analysis
import pandas as pd
import traceback

def test_statistical_analysis(file_name):
    """
    Test function to load a file, convert it to a DataFrame, and perform statistical analysis.

    :param file_name: Name of the file to load. File should be in the same directory.
    :return: Dictionary containing results of statistical analyses.
    """

    # Loading the file into a DataFrame
    try:
        df = pd.read_csv(file_name)
    except Exception as e:
        return f"Failed to load the file: {e}"

    # Perform statistical analysis
    try:
        results = perform_statistical_analysis(df)
        return results
    except Exception as e:
        traceback.print_exc()
        return f"Failed to perform statistical analysis: {e}"
    

# Example usage
test_results = test_statistical_analysis('backend/data_processor/ufo_sightings.csv')
print(test_results)