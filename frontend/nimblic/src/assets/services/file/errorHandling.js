// errorHandling.js
import { getCurrentTime } from 'src/utils/textFormat';

/**
 * Handles errors that occur during the file upload process.
 * @param {Error} error - The error object to handle.
 * @param {Function} setIsUploading - Function to update the uploading status.
 * @param {Function} onUploadEnd - Callback to be called when upload ends.
 * @param {Function} reject - The reject function of the Promise.
 */
export function handleUploadError(error, setIsUploading, onUploadEnd, reject) {
    setIsUploading(false);
    onUploadEnd();
    console.error("Upload Error: ", error.message);

    reject({
        type: "error",
        short: "Upload Failed",
        long: "There was an error during the upload process: " + error.message,
        time: getCurrentTime()
    });
}

/**
 * Handles server response errors during the upload process.
 * @param {Response} response - The fetch response object.
 * @param {Function} setIsUploading - Function to update the uploading status.
 * @param {Function} onUploadEnd - Callback to be called when upload ends.
 * @param {Function} reject - The reject function of the Promise.
 */
export async function handleServerError(response, setIsUploading, onUploadEnd, reject) {
    setIsUploading(false);
    onUploadEnd();
    const errorData = await response.json();
    console.error("Server Error: ", errorData);

    reject({
        type: "error",
        short: "Server Error",
        long: "There was a server-side error: " + errorData.message,
        time: getCurrentTime(),
        details: errorData,
    });
}
