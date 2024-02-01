// handleFileUpload.js
import { validateFileType, validateFileSize, sizeLimit } from './fileValidation';
import { extractMetadata } from './fileMetadata';
import { compressAndUploadFile } from './fileUpload';
import { pollTaskStatus } from './taskPolling';
import { handleUploadError, handleServerError } from './errorHandling';
import { getCurrentTime } from 'src/utils/textFormat';
import { formatBytes } from '../../../utils/fileUtil';
/**
 * Handles the file upload process.
 * @param {File} file - The file to be uploaded.
 * @param {Function} onUploadStart - Callback to be called when upload starts.
 * @param {Function} onUploadEnd - Callback to be called when upload ends.
 * @param {Function} setUploadData - Function to update the upload data state.
 * @param {Function} setIsUploading - Function to update the uploading status.
 * @param {Function} setNotifications - Function to set notifications.
 * @returns {Promise} - A promise that resolves or rejects based on the upload result.
 */
export function handleFileUpload(file, onUploadStart, onUploadEnd, setUploadData, setIsUploading, setNotifications, onSample, setInitUploadMetadata) {
    return new Promise((resolve, reject) => {
        // Validate file type
        if (!validateFileType(file.type)) {
            setIsUploading(false);
            onUploadEnd();
            reject({
                type: "error",
                short: "File type not allowed",
                long: `You cannot upload files of ${file.type ? `type ${file.type}` : 'this file type'}. Please try re-uploading a valid file type.`,
                time: getCurrentTime(),
            });
            return;
        }

        // Validate file size
        validateFileSize(file.size).then(isValidSize => {
            if (!isValidSize) {
                console.log("FILE TOO LARGE!")
                setIsUploading(false);
                onUploadEnd();
                onSample(file, file.size, sizeLimit); // Trigger sampling option
                return;
            }

            console.log("CONTINUING!")

            // Extract file metadata
            const metadata = extractMetadata(file);

            setInitUploadMetadata(metadata)

            if (file.isSampled)
                delete file.isSampled;

            // Compress and upload the file
            compressAndUploadFile(file, metadata, onUploadStart, onUploadEnd, setUploadData, setIsUploading, setNotifications)
                .then(data => {
                    // Append initial upload data
                    setUploadData(prevData => [...prevData, { ...data, metadata }]);

                    // Handle specific tasks like changePointsTask, objectAnalysisTask, etc.
                    handleSpecificTasks(data, setUploadData, setNotifications);

                    resolve(data);
                })
                .catch(error => {
                    if (error instanceof Response) {
                        handleServerError(error, setIsUploading, onUploadEnd, reject);
                    } else {
                        handleUploadError(error, setIsUploading, onUploadEnd, reject);
                    }
                });
        });
    });
}

function handleSpecificTasks(data, setUploadData, setNotifications) {
    // Example: Handle changePointsTask
    console.log("TASKS: ", data.tasks)
    console.log("Handling change point task")
    if (data.tasks.changePointsTask_id) {
        const name = "Change Point analysis"
        pollTaskStatus(data.tasks.changePointsTask_id, name, (result) => {
            setUploadData(prevData => {
                // Clone the array to avoid direct mutation
                let newData = [...prevData];

                // Check if the array is not empty
                if (newData.length > 0) {
                    // Access the last element
                    let lastElement = { ...newData[newData.length - 1] };

                    // Append changePointsResult to the last element
                    lastElement.change_points = result;

                    // Update the last element with the modified object
                    newData[newData.length - 1] = lastElement;
                }
                return newData;
            });
            handleTaskNotification(setNotifications, name);
        }, (error, reason) => {
            handleTaskError(error, reason, setNotifications, name);
        });
    }

    // Handle objectAnalysisTask
    if (data.tasks.objectAnalysisTask_id) {
        const name = "Text Analysis"
        pollTaskStatus(data.tasks.objectAnalysisTask_id, name, (result) => {
            setUploadData(prevData => {
                // Clone the array to avoid direct mutation
                let newData = [...prevData];

                // Check if the array is not empty
                if (newData.length > 0) {
                    // Access the last element
                    let lastElement = { ...newData[newData.length - 1] };

                    if(result !== 'None') {
                        // Append changePointsResult to the last element
                        lastElement.statistical_summary.object_analysis = result;
                    } else {
                        lastElement.statistical_summary.object_analysis = {};
                    }

                    // Update the last element with the modified object
                    newData[newData.length - 1] = lastElement;
                }
                return newData;
            });
            handleTaskNotification(setNotifications, name);
        }, (error, reason) => {
            handleTaskError(error, reason, setNotifications, name);
        });
    }

    // Handle privacyAssessmentTask
    if (data.tasks.privacyAssessmentTask_id) {
        const name = "Privacy Assessment"
        pollTaskStatus(data.tasks.privacyAssessmentTask_id, name, (result) => {
            setUploadData(prevData => {
                // Clone the array to avoid direct mutation
                let newData = [...prevData];

                // Check if the array is not empty
                if (newData.length > 0) {
                    // Access the last element
                    let lastElement = { ...newData[newData.length - 1] };

                    // Append changePointsResult to the last element
                    lastElement.data_quality.privacy_assessment = result;

                    // Update the last element with the modified object
                    newData[newData.length - 1] = lastElement;
                }
                return newData;
            });
            handleTaskNotification(setNotifications, name);
        }, (error, reason) => {
            handleTaskError(error, reason, setNotifications, name);
        });
    }

    // Handle distributionByNumericalTask
    if (data.tasks.distributionByNumericalTask_id) {
        const name = "Categorical Distribution"
        pollTaskStatus(data.tasks.distributionByNumericalTask_id, name, (result) => {
            setUploadData(prevData => {
                // Clone the array to avoid direct mutation
                let newData = [...prevData];

                // Check if the array is not empty
                if (newData.length > 0) {
                    // Access the last element
                    let lastElement = { ...newData[newData.length - 1] };

                    // Merge the distributionByNumericalTask result with categorical_analysis
                    const categoricalAnalysis = lastElement.statistical_summary?.categorical_analysis;
                    if (categoricalAnalysis) {
                        Object.keys(result).forEach(columnKey => {
                            if (categoricalAnalysis[columnKey]) {
                                // Merge the distributionResult for this column into the existing categorical analysis
                                categoricalAnalysis[columnKey] = {
                                    ...categoricalAnalysis[columnKey],
                                    ...result[columnKey]
                                };
                            } else {
                                // If the key doesn't exist in categorical analysis, just add it
                                categoricalAnalysis[columnKey] = result[columnKey];
                            }
                        });
                    }

                    // Update the last element with the modified object
                    newData[newData.length - 1] = lastElement;
                }
                return newData;
            });
            handleTaskNotification(setNotifications, name);
        }, (error, reason) => {
            handleTaskError(error, reason, setNotifications, name);
        });
    }

}


function handleTaskError(error, reason, setNotifications, taskName) {
    setNotifications(prev => [...(prev || []), {
        type: "error",
        short: `Error during ${taskName}`,
        long: `There was an error processing the ${taskName} in the background due to ${reason}. Please try re-uploading, and if the error persists, contact the developer by sending the feedback.`,
        time: getCurrentTime(),
        details: error,
    }]);
}

function handleTaskNotification(setNotifications, taskName) {
    setNotifications(prev => [...(prev || []), {
        type: "success",
        short: `${taskName} finished successfully in the background`,
        time: getCurrentTime()
    }]);
}
