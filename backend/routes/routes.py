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
from multiprocessing import Process, Manager

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

def async_task_wrapper(task_func, result_dict, key, *args, **kwargs):
    start_time = time.time()
    try:
        result = task_func(*args, **kwargs)
        result_dict[key] = result
    except Exception as e:
        print(f"Error in task: {e}")
        result_dict[key] = None
    finally:
        end_time = time.time()
        print(f"Multiprocess Task {task_func.__name__} execution time: {end_time - start_time:.2f} seconds")

def parallel_operation(func, result_dict, key, *args):
    process = Process(target=async_task_wrapper, args=(func, result_dict, key) + args)
    process.start()
    return process


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
        task = celery.AsyncResult(task_id)

        if task.state == 'SUCCESS':
            try:
                result = task.result
                app.logger.info(f"Task Successful!, ID: {task_id}")

                if result and 'type' in result and result['type'] == 'grouped':
                    app.logger.info(f"Task is group, ID: {task_id}")
                    callback_id = result['callback_id']
                    callback_result = celery.AsyncResult(callback_id)
                    app.logger.info(f"Callback ID: {callback_id}")
                    app.logger.info(f"Task is group, ID: {callback_result}")

                    if callback_result.state == 'SUCCESS':
                        final_result = callback_result.get()
                        app.logger.error(f"Group Task Success! ID: {task_id}")                
                        return jsonify({'state': 'SUCCESS', 'result': final_result})
                    
                    else:
                        app.logger.info(f"Group Task Incomplete... ID: {task_id}")
                        return jsonify({'state': 'INCOMPLETE'}), 202
                else:
                    # Handle regular task
                    app.logger.info(f"Task Success! ID: {task_id}")                
                    return jsonify({'state': 'SUCCESS', 'result': result})
                
            except TimeoutError:
                    app.logger.error(f"Task Time Out Error. ID: {task_id}")                
                    return jsonify({'state': 'TIMEOUT', 'error': str(task.info)}), 202
            
        elif task.state == 'PENDING':
            result = task.result

            if result and 'type' in result and result['type'] == 'grouped':
                callback_id = task.result['callback_id']
                callback_result = celery.AsyncResult(callback_id)
                app.logger.info(f"Group Task Pending... ID: {task_id}")
                return jsonify({'state': 'PENDING', 'type': 'grouped', 'callback_info': str(callback_result.info), 'callback_state': str(callback_result.state)}), 202
            
            else:
                app.logger.info(f"Task Pending... ID: {task_id}")
                return jsonify({'state': 'PENDING'}), 202
            
        else:
            # Handle failure states
            app.logger.error(f"Task Error. ID: {task_id}")
            return jsonify({'state': task.state, 'error': str(task.info)}), 500



    @app.route('/upload', methods=['POST'])
    def upload_file():
        start_time = time.time()  # Start timing

        timing_info = {}  # Dictionary to store timing information

        results = [None] * 5  # Adjust the size based on the number of threaded operations

        try:
            # Endpoint to upload files and process them
            print("Retrieving file...")
            load_time = time.time()
            file = request.files['file']

            print("Loading file...")
            dataframe = load_data(file, app)
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
            
            # Sending tasks
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

            multiprocess_time = time.time()
            with Manager() as manager:
                results = manager.dict()  # Shared dictionary for process results

                processes = []

                # Start parallel operations using processes
                processes.append(parallel_operation(compile_summary, results, 'summary', dataframe))
                processes.append(parallel_operation(data_quality_checks, results, 'data_quality', dataframe))
                processes.append(parallel_operation(perform_statistical_analysis, results, 'statistical_summary', dataframe))
                processes.append(parallel_operation(recommend_graphs, results, 'graph_recommendations', dataframe))
                processes.append(parallel_operation(create_correlation_network, results, 'correlation_network', dataframe))

                # Wait for all processes to complete
                for process in processes:
                    process.join()

                # Extract results after processes complete
                summary_report = results.get('summary', None)
                data_quality_report = results.get('data_quality', None)
                statistical_report = results.get('statistical_summary', None)
                graph_recommendations = results.get('graph_recommendations', None)
                network = results.get('correlation_network', None)

            print("multiprocess_time execution time: {:.2f} seconds".format(time.time() - multiprocess_time))
            timing_info['Multiprocess Time'] = time.time() - multiprocess_time

            combine_response_time = time.time()
            # Combine everything into a response object
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

            return jsonify(response_serializable), 200
        
        except Exception as e:
            # Log the error for debugging
            traceback.print_exc()

            print(f"Error processing file: {e}")

            # Return a JSON error response
            user_friendly_error = {
            "error": "Something went wrong."
            }
            return jsonify(user_friendly_error), 500


