import { expose } from 'comlink';

import Papa from 'papaparse';
import { xml2js } from 'xml-js';
import * as XLSX from 'xlsx';
import { formatBytes } from '../utils/fileUtil';

let currentProgress = 0;
let progressCallback;

const sampleFromArray = (array, maxSizeInBytes) => {
    let sampled = [];
    let copy = array.slice();
    let currentSize = 0;

    // Function to estimate the size of a data item
    const estimateSize = (dataItem) => {
        const stringifiedItem = JSON.stringify(dataItem);
        return new Blob([stringifiedItem]).size; // Estimate size in bytes
    };

    while (copy.length > 0 && currentSize < maxSizeInBytes) {
        const index = Math.floor(Math.random() * copy.length);
        const item = copy[index];
        const itemSize = estimateSize(item);

        if (currentSize + itemSize <= maxSizeInBytes) {
            sampled.push(copy.splice(index, 1)[0]); // Remove item from copy and add to sampled
            currentSize += itemSize;
        } else {
            console.log('Next item exceeds size limit. Stopping sampling.');
            break; // Stop if adding the next item exceeds the size limit
        }

        // Update progress every 10%
        const newProgress = (currentSize / maxSizeInBytes) * 100;
        if (newProgress - currentProgress >= 10) {
            currentProgress = newProgress;
            if (progressCallback) {
              progressCallback(currentProgress);
            }
          }
    }

    console.log(`Sampling completed. Total sampled items: ${sampled.length}`);
    return sampled;
};




// Function to convert processed data to Blob
const dataToBlob = (data, fileType) => {
    let blobData = [data];
    return new Blob(blobData, { type: fileType });
};

const parseFileData = (fileType, fileData) => {

    try {
        switch (fileType) {
            case 'application/json':
                let jsonData = JSON.parse(fileData);
                // If it's an object (but not null or an array), convert its values to an array
                if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
                    jsonData = Object.values(jsonData);
                }

                console.log("jsonData",jsonData)
                return jsonData;

            case 'text/csv':
                return Papa.parse(fileData, { header: true }).data;

            case 'application/xml':
            case 'text/xml':
                const jsonFromXml = xml2js(fileData, { compact: true, spaces: 4 });
                let parsedJson = JSON.parse(JSON.stringify(jsonFromXml));

                if (parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson)) {
                    parsedJson = Object.values(parsedJson);
                }
                return parsedJson;

            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

            default:
                throw new Error('Unsupported file type');
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};


// Function to convert data back to JSON
const convertToJSON = (data) => {
    return JSON.stringify(data, null, 4);
};

// Function to convert data back to CSV
const convertToCSV = (data) => {
    return Papa.unparse(data);
};

// Function to convert data back to XML
const convertToXML = (data) => {
    const options = { compact: true, spaces: 4 };
    return js2xml(data, options);
};

// Function to convert data back to Excel format
const convertToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    return buffer;
};

const processFile = (fileType, fileData, fileSizeLimit) => {
    try {

        
        // First, parse the file data based on the file type
        const data = parseFileData(fileType, fileData);

        // Check if the parsed data is an array, as expected
        if (!Array.isArray(data)) {
            throw new Error('Parsed data is not an array');
        }

        // Perform the sampling operation on the data
        const processedData = sampleFromArray(data, fileSizeLimit * 1024 * 1024); //In MB

        // Based on the original file type, convert the processed data back to its original format
        let convertedData;
        switch (fileType) {
            case 'application/json':
                convertedData = convertToJSON(processedData);
                break;
            case 'text/csv':
                convertedData = convertToCSV(processedData);
                break;
            case 'application/xml':
            case 'text/xml':
                convertedData = convertToXML(processedData);
                break;
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                convertedData = convertToExcel(processedData);
                break;
            default:
                throw new Error('Unsupported file type for conversion');
        }

        // Convert the converted data to a Blob
        const blob = dataToBlob(convertedData, fileType);

        console.log("PROCESSED SIZE: ", formatBytes(blob.size))
            console.log("FILE SIZE LIMIT: ", formatBytes(fileSizeLimit * 1024 * 1024))

        if(blob.size >= fileSizeLimit * 1024 * 1024) {
            throw new Error('Unable to sample file, file is badly formatted');
        } 

        // Return the successfully processed and converted data
        return { success: true, data: blob };
    } catch (error) {
        // In case of any errors during processing or conversion, return an error message
        return { success: false, error: error.message };
    }
};

const subscribeToProgress = (callback) => {
    progressCallback = callback;
  };
  
  const workerFunctions = {
    processFile,
    subscribeToProgress
  };

expose(workerFunctions);
