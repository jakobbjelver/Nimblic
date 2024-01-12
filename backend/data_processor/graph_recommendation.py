import pandas as pd
import itertools
import numpy as np

def recommend_graphs(dataframe):
    """Suggests Chart.js-compatible graphs with detailed information for plotting."""

    def group_other_category(count_data):
        """ Group categories into 'Other' if there are more than 5 """

        # Ensure that 'count' column is numeric
        if pd.api.types.is_categorical_dtype(count_data['count']):
            count_data['count'] = count_data['count'].astype('int')

        if len(count_data) > 5:
            top_5 = count_data.head(5)
            others_count = count_data['count'].iloc[5:].sum()
            others = pd.DataFrame({'label': ['Other'], 'count': [others_count]})
            return pd.concat([top_5, others], ignore_index=True)
        
        return count_data
    
    def prepare_bar_data(column):
        count_data = dataframe[column].value_counts().reset_index()
        count_data.columns = ['label', 'count']
        grouped_data = group_other_category(count_data)
        return {
            "labels": grouped_data['label'].tolist(),
            "data": grouped_data['count'].tolist()
        }


    def prepare_line_data(column, datetime_column):
        sorted_df = dataframe.sort_values(by=datetime_column)
        return {
            "labels": sorted_df[datetime_column].tolist(),
            "data": sorted_df[column].tolist()
        }

    def prepare_pie_data(column):
        count_data = dataframe[column].value_counts().reset_index()
        count_data.columns = ['label', 'count']
        grouped_data = group_other_category(count_data)
        return {
            "labels": grouped_data['label'].tolist(),
            "data": grouped_data['count'].tolist()
        }

    def prepare_scatter_data(x_column, y_column):
        return {
            "data": [{"x": x, "y": y} for x, y in zip(dataframe[x_column], dataframe[y_column])]
        }
    
    def prepare_radar_data(columns):
        radar_data = []
        for col in columns:
            radar_data.append(dataframe[col].mean())  # Assuming aggregation by mean
        return {
            "labels": columns,
            "data": radar_data
        }
    
    def prepare_polar_area_data(column):
        count_data = dataframe[column].value_counts().reset_index()
        count_data.columns = ['label', 'count']
        grouped_data = group_other_category(count_data)
        return {
            "labels": grouped_data['label'].tolist(),
            "data": grouped_data['count'].tolist()
        }

    def prepare_bubble_data(x_column, y_column, size_column):
        return {
            "data": [
                {"x": x, "y": y, "r": size}  # 'r' for radius
                for x, y, size in zip(dataframe[x_column], dataframe[y_column], dataframe[size_column])
         ]
        }
    
    def are_variables_comparable(columns, dataframe):
        # Example criterion: check if standard deviations are within a similar range
        # This is a simple heuristic and might not be suitable for all cases.
        std_devs = [dataframe[col].std() for col in columns]
        max_std = max(std_devs)
        min_std = min(std_devs)
        return max_std / min_std < 2  # Arbitrary threshold, adjust as needed
    
    def is_size_variable_meaningful(column, dataframe):
        # Check that the variable is positive and doesn't have an extreme range
        min_val = dataframe[column].min()
        max_val = dataframe[column].max()
        return min_val >= 0 and max_val / min_val < 100  # Arbitrary threshold

    def is_polar_chart_suitable(column, dataframe):
        # Example criterion: suitable if not too many categories and fairly uniform distribution
        num_categories = dataframe[column].nunique()
        value_counts = dataframe[column].value_counts(normalize=True)
        max_proportion = value_counts.max()
        return num_categories <= 20 and max_proportion < 0.5  # Arbitrary thresholds


    recommendations = {}
    datetime_cols = dataframe.select_dtypes(include=['datetime64']).columns
    datetime_col = datetime_cols[0] if len(datetime_cols) > 0 else None

    valid_columns = [col for col in dataframe.columns if not str(col).startswith('_')]

    # Correcting the selection of numerical columns
    numerical_cols = [col for col in dataframe.select_dtypes(include=['int64', 'float64']).columns if not col.startswith('_')]


    for col in valid_columns:
        dtype = dataframe[col].dtype  # Use the original column name here
        unique_values = dataframe[col].nunique()

        # Enhanced decision-making logic
        if dtype in ['int64', 'float64']:
            if datetime_col and col in datetime_cols:
                # Contextual analysis for DateTime columns
                # Decide between line and area charts based on your criteria
                recommendations[col] = {
                    "type": "area",  # or "line"
                    "data": prepare_line_data(col, datetime_col)
                }
            else:
                # Other criteria for choosing between bar, scatter, etc.
                recommendations[col] = {
                    "type": "bar",  # or other types based on your criteria
                    "data": prepare_bar_data(col)
                }
        elif dtype in ['object', 'category']:
            # Analyze the distribution of category frequencies
            category_distribution = dataframe[col].value_counts(normalize=True)
            max_category_frequency = category_distribution.max()

            if unique_values <= 10 and max_category_frequency >= 0.5:
                # Use pie chart when a few categories dominate (e.g., one category > 50%)
                recommendations[col] = {"type": "pie", "data": prepare_pie_data(col)}
            else:
                # Use bar chart in other cases (many categories, more even distribution)
                recommendations[col] = {"type": "bar", "data": prepare_bar_data(col)}


        # Scatter plot for pairs of numerical columns
    if len(numerical_cols) > 1:
        for i in range(len(numerical_cols)):
            for j in range(i+1, len(numerical_cols)):
                x_col, y_col = numerical_cols[i], numerical_cols[j]
                # Check for significant correlation
                if np.abs(dataframe[[x_col, y_col]].corr().iloc[0, 1]) > 0.5:
                    recommendations[f"{x_col} vs {y_col}"] = {
                        "type": "scatter",
                        "data": prepare_scatter_data(x_col, y_col)
                    }

    # Radar Chart
    if len(numerical_cols) >= 3:
        # Check if variables are comparable
        if are_variables_comparable(numerical_cols, dataframe):  # Implement this function based on your criteria
            recommendations["radar"] = {
                "type": "radar",
                "data": prepare_radar_data(numerical_cols.tolist())
            }

    # Bubble Chart
    if len(numerical_cols) > 2:
        for combo in itertools.combinations(numerical_cols, 3):
            x_col, y_col, size_col = combo
            # Ensure meaningful size variable
            if is_size_variable_meaningful(size_col, dataframe):  # Implement this function based on your criteria
                recommendations[f"{x_col} vs {y_col}, size {size_col}"] = {
                    "type": "bubble",
                    "data": prepare_bubble_data(x_col, y_col, size_col)
                }

   # Polar Area Chart
    for col in dataframe.columns:
        col_str = str(col)  # Convert column name to string for the check
        if not col_str.startswith('_') and is_polar_chart_suitable(col, dataframe):  # Use original col name
            recommendations[col_str] = {
                "type": "polarArea",
                "data": prepare_polar_area_data(col)  # Use original col name
            }


    return recommendations
