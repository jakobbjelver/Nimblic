import networkx as nx
import numpy as np
import pandas as pd
import json
from scipy.stats import spearmanr, kendalltau
import warnings

def calculate_correlation(x, y):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=DeprecationWarning)

        if (pd.api.types.is_numeric_dtype(x) or pd.api.types.is_categorical_dtype(x)) and \
        (pd.api.types.is_numeric_dtype(y) or pd.api.types.is_categorical_dtype(y)):
            # Convert categorical data to codes if necessary
            if pd.api.types.is_categorical_dtype(x):
                x = x.cat.codes
            if pd.api.types.is_categorical_dtype(y):
                y = y.cat.codes

            # Use Spearman's rank correlation for ordinal data
            return spearmanr(x, y)[0]
        else:
            # Return None or some default value if correlation can't be calculated
            return None

def create_correlation_network(df):
    graph = nx.Graph()

    # Add nodes
    for col in df.columns:
        graph.add_node(col, degree=0, influence=0)

    # Calculate correlations and add edges
    for i in range(len(df.columns)):
        for j in range(i+1, len(df.columns)):
            corr_value = calculate_correlation(df[df.columns[i]], df[df.columns[j]])
            if corr_value is not None:
                graph.add_edge(df.columns[i], df.columns[j], weight=corr_value)
                graph.nodes[df.columns[i]]['degree'] += 1
                graph.nodes[df.columns[j]]['degree'] += 1

    # Set a fixed threshold for correlation
    fixed_threshold = 0.5  # Adjust this value as needed

    # Remove edges below the fixed threshold
    for u, v, d in list(graph.edges(data=True)):
        if abs(d['weight']) < fixed_threshold:
            graph.remove_edge(u, v)

    # Remove isolated nodes (nodes without any edges)
    isolated_nodes = [node for node, degree in dict(graph.degree()).items() if degree == 0]
    graph.remove_nodes_from(isolated_nodes)

    # Recalculate degree for each node after removing edges
    for node in graph.nodes:
        graph.nodes[node]['degree'] = graph.degree(node)

    # Recalculate influence for the remaining nodes
    for node in graph.nodes:
        edges = graph.edges(node, data=True)
        graph.nodes[node]['influence'] = sum(abs(d['weight']) for _, _, d in edges)

    # Normalize influence
    max_influence = max((node[1]['influence'] for node in graph.nodes(data=True)), default=0)
    for node in graph.nodes:
        graph.nodes[node]['influence'] = graph.nodes[node]['influence'] / max_influence if max_influence > 0 else 0

    # Convert the graph to a JSON serializable format
    data = nx.node_link_data(graph)
    data = replace_nan_with_none(data)

    return json.dumps(data, ensure_ascii=False)




def replace_nan_with_none(obj):
    if isinstance(obj, float) and np.isnan(obj):
        return None
    elif isinstance(obj, dict):
        return {k: replace_nan_with_none(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_nan_with_none(v) for v in obj]
    return obj

