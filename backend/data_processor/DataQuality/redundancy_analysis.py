def data_redundancy_analysis(dataframe):
    """
    Analyze data redundancy in the DataFrame.

    :param dataframe: Pandas DataFrame
    :return: Dictionary with columns and their redundancy information
    """
    redundancy_info = {}
    for column in dataframe.columns:
        unique_values = dataframe[column].nunique()
        total_values = len(dataframe[column])
        redundancy_info[column] = {
            'unique_values': unique_values,
            'redundancy_rate': (total_values - unique_values) / total_values * 100  # as percentage
        }

    return redundancy_info
