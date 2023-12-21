import os
import requests
import json
#import sweetviz as sv
#import pandas as pd
#import dtale

# Get the current directory where the script is located
current_dir = os.path.dirname(os.path.realpath(__file__))

# Build the file path by joining the current directory with the relative path
file_path = os.path.join(current_dir, 'sample_data', 'sleep.csv')
#file_path = os.path.join(current_dir, 'sample_data', 'slack_queries.csv')
url = 'http://localhost:5000/upload'


with open(file_path, 'rb') as f:
    files = {'file': f}
    response = requests.post(url, files=files)
    response_json = response.json()
    # Specify the directory and filename where you want to save the JSON file
    output_file_path = 'C:/Users/jakob/Nimblic/frontend/nimblic/public/dataFile.json'

    # Write the JSON data to a file
    with open(output_file_path, 'w') as json_file:
        json.dump(response_json, json_file, indent=4)


#df = pd.read_csv(file_path)
#dtale.show(df)
#report = sv.analyze(df)
#report.show_html('report.html')