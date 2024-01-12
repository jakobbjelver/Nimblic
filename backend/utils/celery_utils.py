# celery_utils.py

# Remove 'from app import celery' from the top
import time
import pandas as pd
from flask import request, jsonify, abort, json, current_app, url_for
from celery import chord
from utils.data_utils import find_time_series_columns, detect_change_points_parallel, make_serializable
from celery.utils.log import get_task_logger
from data_processor.Statistics.object_analysis import object_analysis, aggregate_results
from data_processor.Statistics.categorical_analysis import distribution_by_numerical
from data_processor.DataQuality.privacy_assessment import analyze_privacy_assessment

logger = get_task_logger(__name__)

import io

def log_dataframe_info(dataframe, logger):
    buffer = io.StringIO()
    dataframe.info(buf=buffer)
    s = buffer.getvalue()
    logger.info(s)


def create_celery_tasks(celery):
    @celery.task(bind=True, name='test_celery')
    def test_celery(self):
        print("Test task is running")
        return "Hello from Celery!"

    @celery.task(bind=True, name='async_detect_change_points')
    def async_detect_change_points(self, dataframe_json):
        logger.info('Task started: async_detect_change_points MY_VERSION 4')

        try:
            print("Detecting change points asynchronously...")

            dataframe = pd.read_json(dataframe_json, orient='records')

            time_series_time = time.time()
            time_series_columns = find_time_series_columns(dataframe)
            print("time_series_time execution time: {:.2f} seconds".format(time.time() - time_series_time))

            change_points_time = time.time()
            print("Starting change points")
            change_points = []
            if time_series_columns:
                for column in time_series_columns:
                    change_points += detect_change_points_parallel(dataframe[column])

            print("change_points_time execution time: {:.2f} seconds".format(time.time() - change_points_time))

            logger.info('Task completed successfully')

            return change_points
        except Exception as e:
            logger.error(f'Task failed: {e}')
            raise


    @celery.task(bind=True, name='async_object_analysis')
    def async_object_analysis(self, dataframe_json):
        logger.info('Task started: async_object_analysis')

        try:
            dataframe = pd.read_json(dataframe_json, orient='records')
            subtasks = object_analysis(dataframe)

            callback = aggregate_results.s()  # Define your callback task here
            chord_result = chord(subtasks)(callback)

            logger.info('Chord set up for async analysis tasks')

            # Include task type in the return value
            return {
                'type': 'grouped',
                'group_id': chord_result.parent.id,
                'callback_id': chord_result.id
            }
        except Exception as e:
            logger.error(f'Task failed: {e}')
            raise


    @celery.task(bind=True, name='async_distribution_by_numerical')
    def async_distribution_by_numerical(self, dataframe_json, dtypes):
        logger.info('Task started: async_distribution_by_numerical')

        try:
            print("Analyzing distribution asynchronously...")
            dataframe = pd.read_json(dataframe_json, orient='records')
            
            dataframe = dataframe.astype(dtypes)

            log_dataframe_info(dataframe, logger)

            categorical_cols = dataframe.select_dtypes(include=['category']).columns

            analysis_data = {}
            for col_name in categorical_cols:
                analysis_data[col_name] = {
                    'Distribution': distribution_by_numerical(col_name, dataframe),
                }

            logger.info('Distribution by numerical task completed successfully')
            response_serializable = {k: make_serializable(v) for k, v in analysis_data.items()}
            #logger.info('Distribution by numerical: ' + json.dumps(response_serializable, indent=4))

            return response_serializable

        except Exception as e:
            logger.error(f'Task failed: {e}')
            # You can also re-raise the exception if you want the task to be marked as failed
            raise

    @celery.task(bind=True, name='async_privacy_assessment')
    def async_privacy_assessment(self, dataframe_json):
        logger.info('Task started: async_privacy_assessment')

        try:
            print("Analyzing privacy assessment asynchronously...")

            dataframe = pd.read_json(dataframe_json, orient='records')

            analysis_data = analyze_privacy_assessment(dataframe)

            logger.info('Task completed successfully')

            response_serializable = {k: make_serializable(v) for k, v in analysis_data.items()}

            return response_serializable
        except Exception as e:
            logger.error(f'Task failed: {e}')
            raise

    return test_celery, async_detect_change_points, async_object_analysis, async_distribution_by_numerical, async_privacy_assessment
