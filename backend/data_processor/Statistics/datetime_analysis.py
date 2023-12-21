from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA
import pandas as pd

def datetime_analysis(df, event_dates=None):
    """
    Perform all statistical analyses for datetime columns and compile results into a dictionary.
    :param df: DataFrame with datetime columns.
    :param event_dates: List of significant dates for event analysis (optional).
    :return: Dictionary with analysis results.
    """
    print("Performing datetime analysis...")
    datetime_cols = df.select_dtypes(include=['datetime', 'datetime64'])
    analysis = {}
    for col_name in datetime_cols:
        col_data = df[col_name]  # Get the actual column data

        # Trend Analysis
        trend_analysis_results = trend_analysis(col_data)

        # Date/Time Feature Engineering
        datetime_features = datetime_feature_engineering(col_data)

        # Event Analysis
        event_analysis_results = None
        if event_dates:
            event_analysis_results = event_analysis(df, col_name, event_dates)

        # Forecasting
        # Assuming the series is already aggregated appropriately (e.g., daily, monthly)
        forecasting_results = forecast_series(col_data)

        # Anomaly Detection
        anomaly_detection_results = detect_anomalies_time_series(col_data)

        # Compiling Results
        analysis[col_name] = {
            'trend_analysis': trend_analysis_results,
            'datetime_features': datetime_features,
            'event_analysis': event_analysis_results,
            'forecasting': forecasting_results,
            'anomaly_detection': anomaly_detection_results
        }

    print("Datetime analysis done!")
    return analysis

def trend_analysis(series, window=12):
    rolling_mean = series.rolling(window=window).mean()
    rolling_std = series.rolling(window=window).std()
    decomposed = seasonal_decompose(series, model='additive')

    return {
        'rolling_mean': rolling_mean,
        'rolling_std': rolling_std,
        'decomposed': decomposed
    }

def datetime_feature_engineering(series):
    features = {
        'year': series.dt.year,
        'month': series.dt.month,
        'day': series.dt.day,
        'hour': series.dt.hour,
        'dayofweek': series.dt.dayofweek,
        'quarter': series.dt.quarter,
        'is_month_start': series.dt.is_month_start,
        'is_month_end': series.dt.is_month_end,
        'is_quarter_start': series.dt.is_quarter_start,
        'is_quarter_end': series.dt.is_quarter_end,
        'is_leap_year': series.dt.is_leap_year
    }
    return features

def event_analysis(df, date_column, event_dates, window=7):
    event_analysis_results = {}
    for event_date in event_dates:
        period = df[(df[date_column] >= event_date - pd.Timedelta(days=window)) & 
                    (df[date_column] <= event_date + pd.Timedelta(days=window))]
        event_analysis_results[event_date] = period.describe()
    return event_analysis_results


def forecast_series(series, order=(1, 1, 1), steps=12):
    model = ARIMA(series, order=order)
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=steps)
    return forecast

def detect_anomalies_time_series(series, window=12, sigma=3):
    rolling_mean = series.rolling(window=window).mean()
    rolling_std = series.rolling(window=window).std()
    anomaly_points = series[(series < (rolling_mean - sigma * rolling_std)) | 
                            (series > (rolling_mean + sigma * rolling_std))]
    return anomaly_points
