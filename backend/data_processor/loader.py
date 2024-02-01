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
    try:
        with open(file, 'r', encoding='utf-8') as f:  # Specify UTF-8 encoding
            data = json.load(f)
        return handle_nested_json(data)
    except UnicodeDecodeError:
        try:
            with open(file, 'r', encoding='latin-1') as f:  # Try with Latin-1 encoding
                data = json.load(f)
            return handle_nested_json(data)
        except Exception as e:
            raise ValueError(f"Error processing file: {e}")


def handle_nested_json(data, parent_key=''):
    if isinstance(data, list):
        # Process each item in the list
        return pd.concat([handle_nested_json(item, parent_key) for item in data], ignore_index=True)
    elif isinstance(data, dict):
        items = []
        for key, value in data.items():
            new_key = f"{parent_key}.{key}" if parent_key else key
            if isinstance(value, (dict, list)):
                items.append(handle_nested_json(value, new_key))
            else:
                items.append(pd.DataFrame({new_key: [value]}))
        return pd.concat(items, axis=1)
    else:
        return pd.DataFrame({parent_key: [data]})   

