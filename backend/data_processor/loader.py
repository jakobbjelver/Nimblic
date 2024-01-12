import pandas as pd
import zipfile
import os
from werkzeug.utils import secure_filename
import shutil
from lxml import etree
import io
import json
import tempfile


def load_data(file, app):
    """
    Load data from a file into a pandas DataFrame.
    If the file is a ZIP, extract its contents and load the appropriate file type.
    """

    # Assuming file_size_limit is set in megabytes in your app's config
    file_size_limit_mb = app.config['FILE_SIZE_LIMIT']
    file_size_limit_bytes = file_size_limit_mb * 1024 * 1024  # Convert MB to bytes

    file.seek(0, os.SEEK_END)  # Go to the end of the file
    file_size = file.tell()  # Get the current position, which is the size in bytes
    file.seek(0)  # Reset file position to the beginning

    if file_size > file_size_limit_bytes:
        raise ValueError(f"File size exceeds the maximum limit of {file_size_limit_mb} MB")

    

    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()

    if file_extension == 'zip':
        # Create a unique temporary directory
        temp_dir = tempfile.mkdtemp()

        try:
            with zipfile.ZipFile(file, 'r') as zipped_file:
                zipped_file.extractall(temp_dir)

                for file_name in zipped_file.namelist():
                    ext = file_name.rsplit('.', 1)[1].lower()
                    if ext in ['csv', 'json', 'xls', 'xlsx', 'xml']:
                        file_path = os.path.join(temp_dir, file_name)
                        df = load_file(file_path, ext)
                        return df  # If processing one file, or collect them if multiple

                raise ValueError("No supported file types found in ZIP archive.")
        finally:
            # Clean up - remove the temp directory and its contents
            shutil.rmtree(temp_dir)
    else:
        return load_file(file, file_extension)
    
def preprocess_xml_remove_entities(file_path):
    parser = etree.XMLParser(recover=True)
    tree = etree.parse(file_path, parser)
    return etree.tostring(tree, encoding='unicode')

def load_file(file, ext):
    """
    Load a file with the given extension into a DataFrame.
    """
    try:
        if ext == 'csv':
            return pd.read_csv(file, low_memory=False)
        elif ext == 'json':
             return handle_json_file(file)
        elif ext in ['xls', 'xlsx']:
            return pd.read_excel(file)
        if ext == 'xml':
            xml_content = preprocess_xml_remove_entities(file)
            return pd.read_xml(io.StringIO(xml_content))
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
    except Exception as e:
        raise ValueError(f"Error loading file with extension {ext}: {e}")


def handle_json_file(file):
    """
    Handle loading a JSON file into a DataFrame, accommodating different structures.
    """
    with open(file, 'r') as f:
        data = json.load(f)

    # Try direct loading
    try:
        df = pd.read_json(file)
        if df.shape[1] > 1 or len(df) > 0:
            return df
    except ValueError:
        pass

    # Handle nested JSON
    return handle_nested_json(data)

def handle_nested_json(data):
    """
    Attempt to handle nested JSON structures by looking for lists of records.
    """
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list) and all(isinstance(item, dict) for item in value):
                return pd.json_normalize(value)
        return pd.DataFrame([data])
    elif isinstance(data, list):
        return pd.json_normalize(data)
    else:
        raise ValueError("JSON structure not recognized")

