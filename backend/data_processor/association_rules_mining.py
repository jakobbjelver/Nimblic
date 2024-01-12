import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

def perform_association_rules(df, min_support=0.5, use_colnames=True):
    """
    Perform association rules mining on a given dataframe.
    
    Parameters:
    - df: input dataframe with each row as a transaction and each cell with a category item.
    - min_support: minimum support for the apriori algorithm.
    - use_colnames: whether to use column names in the frequent itemset output.
    
    Returns:
    - rules: dataframe with association rules including metrics.
    """
    # Convert all items to strings (if they are not already strings)
    df = df.astype(str)

    # Assuming the DataFrame 'df' has transactions where each transaction is a list of items
    transactions = df.apply(lambda x: x.dropna().tolist(), axis=1).tolist()

    # Instantiate encoder and identify unique items
    encoder = TransactionEncoder()
    encoder_array = encoder.fit(transactions).transform(transactions)

    # Convert the array back into a pandas DataFrame
    df_processed = pd.DataFrame(encoder_array, columns=encoder.columns_)

    # Generating frequent itemsets
    frequent_itemsets = apriori(df_processed, min_support=min_support, use_colnames=use_colnames)

    # Generating rules
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)

    return rules

