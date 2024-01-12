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
    console.error("Upload Error: ", error);

    reject({
        type: "error",
        short: "Upload failed - service unavailable",
        long: "This service is currently unavailable. This could be due to maintenance or a faulty network connection. Please check your network connection or try again at a later time.",
        time: getCurrentTime(),
        details: error.message,
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

    const customMessage = getErrorMessageByCode(response.status);

    reject({
        type: "error",
        short: "Server Error",
        long: customMessage,
        time: getCurrentTime(),
        details: errorData,
    });
}

// Add a function to map error codes to user-friendly messages
function getErrorMessageByCode(errorCode) {
    const errorMessages = {
        401: "Unauthorized access. Please log in and try again.",
        404: "Requested data not found.",
        429: "Upload limit exceeded. Please try again later.",
        500: "Internal server error. Please try again after some time.",
    };

    // Return a custom message or a default message
    return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
}
