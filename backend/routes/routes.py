from flask import request, jsonify, abort, json
from data_processor.loader import load_data
from data_processor.summary import compile_summary  # Adjusted import
from data_processor.DataQuality.quality import data_quality_checks  # Adjusted import
from data_processor.Statistics.stats import perform_statistical_analysis  # Adjusted import
from data_processor.graph_recommendation import recommend_graphs
from data_processor.association_rules_mining import perform_association_rules
from data_processor.correlation_network import create_correlation_network
from data_processor.change_point_detection import detect_change_points
from utils.data_utils import make_serializable, convert_data_types
import traceback
import pandas as pd
import time

def is_timestamp(obj):
    return isinstance(obj, pd.Timestamp)

def deep_inspect(data, prefix=''):
    if isinstance(data, dict):
        for k, v in data.items():
            if is_timestamp(k) or is_timestamp(v):
                print(f"{prefix}Key: {k}, Value: {v}, Type of Key: {type(k).__name__}, Type of Value: {type(v).__name__}")
            deep_inspect(v, prefix + '\t')
    elif isinstance(data, (list, tuple, set)):
        for item in data:
            if is_timestamp(item):
                print(f"{prefix}Item: {item}, Type of Item: {type(item).__name__}")
            deep_inspect(item, prefix + '\t')

def configure_routes(app, celery):
    @app.route('/test_redis', methods=['GET'])
    def test_redis():
        try:
           print("Testing")
        except Exception as e:
            app.logger.error(f"Redis error: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/check_task/<task_id>', methods=['GET'])
    def check_task(task_id):
        print("Recieved request for task status check.")
        task = celery.AsyncResult(task_id)  # Use celery instance to get task result
        if task.state == 'PENDING':
            print("Pending...")
            return jsonify({'state': task.state}), 202
        elif task.state != 'FAILURE':
            result = task.get(timeout=1.0)
            print("Success!")
            return jsonify({'state': task.state, 'result': result})
        else:
            # Something went wrong in the background job
            print("Error.")
            return jsonify({'state': task.state, 'error': str(task.info)}), 500
    
    @app.route('/upload', methods=['POST'])
    def upload_file():
        start_time = time.time()  # Start timing

        timing_info = {}  # Dictionary to store timing information

        try:
            # Endpoint to upload files and process them
            print("Retrieving file...")
            load_time = time.time()
            file = request.files['file']
            print("Loading file...")
            dataframe = load_data(file)
            print("load_time execution time: {:.2f} seconds".format(time.time() - load_time))
            timing_info['Load Time'] = time.time() - load_time

            print(dataframe.head())
            # Convert data types before performing any analysis
            convert_time = time.time()
            dataframe = convert_data_types(dataframe)
            print("convert_time execution time: {:.2f} seconds".format(time.time() - convert_time))
            timing_info['Convert Time'] = time.time() - convert_time

            where_time = time.time()
            dataframe = dataframe.where(pd.notnull(dataframe), None)
            print("where_time execution time: {:.2f} seconds".format(time.time() - where_time))
            timing_info['Where Time'] = time.time() - where_time
            # Get the compiled summary
            summary_time = time.time()
            summary_report = compile_summary(dataframe)

            print("summary_time execution time: {:.2f} seconds".format(time.time() - summary_time))
            timing_info['Summary Time'] = time.time() - summary_time
            # Perform data quality checks
            quality_time = time.time()
            data_quality_report = data_quality_checks(dataframe)
            print("quality_time execution time: {:.2f} seconds".format(time.time() - quality_time))
            timing_info['Quality Time'] = time.time() - quality_time
            # Perform statistical analysis
            statistical_time = time.time()
            statistical_report = perform_statistical_analysis(dataframe)
            print("statistical_time execution time: {:.2f} seconds".format(time.time() - statistical_time))
            timing_info['Statistical Time'] = time.time() - statistical_time
            # Get graph recommendations
            graph_time = time.time()
            graph_recommendations = recommend_graphs(dataframe)
            print("graph_time execution time: {:.2f} seconds".format(time.time() - graph_time))
            timing_info['Graph Time'] = time.time() - graph_time

            #rules_time = time.time()
            #rules = perform_association_rules(dataframe)
            #print("rules_time execution time: {:.2f} seconds".format(time.time() - rules_time))

            network_time = time.time()
            network = create_correlation_network(dataframe)
            print("network_time execution time: {:.2f} seconds".format(time.time() - network_time))
            timing_info['Network Time'] = time.time() - network_time

            changePointsTask = celery.send_task('async_detect_change_points', args=[dataframe.to_json(orient='records')])
            objectAnalysisTask = celery.send_task('async_object_analysis', args=[dataframe.to_json(orient='records')])
            privacyAssessmentTask = celery.send_task('async_privacy_assessment', args=[dataframe.to_json(orient='records')])
            dtypes = dataframe.dtypes.apply(lambda x: x.name).to_dict()
            distributionByNumericalTask = celery.send_task('async_distribution_by_numerical', args=[dataframe.to_json(orient='records'), dtypes])

            tasks = {
                'changePointsTask_id' : changePointsTask.id,
                'objectAnalysisTask_id' : objectAnalysisTask.id,
                'privacyAssessmentTask_id' : privacyAssessmentTask.id,
                'distributionByNumericalTask_id' : distributionByNumericalTask.id
            }

            combine_response_time = time.time()
            # Combine everything into a response object

                        # At the end, print or save the timing report
            total_time = time.time() - start_time
            timing_info['Total Time'] = total_time
            print("Timing Report:")
            for key, value in timing_info.items():
                print(f"{key}: {value:.2f} seconds")
            
            response = {
                'summary': summary_report,
                'data_quality': data_quality_report,
                'statistical_summary': statistical_report,
                'graph_recommendations': graph_recommendations,
                #'association_rules': rules,
                'correlation_network': network,
                #'change_point': change_points,
                'tasks' : tasks,
                #'timing_info' : timing_info
            }


            print("combine_response_time execution time: {:.2f} seconds".format(time.time() - combine_response_time))

            serializable_time = time.time()
            response_serializable = {make_serializable(k): make_serializable(v) for k, v in response.items()}
            print("serializable_time execution time: {:.2f} seconds".format(time.time() - serializable_time))

            #print(json.dumps(response_serializable, indent=4))  # Nicely formatted JSON string
            print("upload_file execution time: {:.2f} seconds".format(time.time() - start_time))

            #deep_inspect(response)

            return jsonify(response_serializable)
        
        except Exception as e:
            # Log the error for debugging
            traceback.print_exc()

            print(f"Error processing file: {e}")

            # Return a JSON error response
            user_friendly_error = {
            "error": "Something went wrong."
            }
            return jsonify(user_friendly_error), 500


