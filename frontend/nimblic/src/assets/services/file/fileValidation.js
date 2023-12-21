// fileValidation.js

// Define the allowed file types and size limit
export const allowedTypes = [
    'application/json',
    'text/xml', 
    'application/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'application/vnd.ms-excel',
    'text/csv',
    // Add any additional file types here
];

export const sizeLimit = 10000000000; // Size limit in bytes (10 GB)

/**
 * Validates the type of the uploaded file.
 * @param {string} fileType - The MIME type of the file.
 * @returns {boolean} - True if the file type is allowed, false otherwise.
 */
export function validateFileType(fileType) {
    return allowedTypes.includes(fileType);
}

/**
 * Validates the size of the uploaded file.
 * @param {number} fileSize - The size of the file in bytes.
 * @returns {boolean} - True if the file size is within the limit, false otherwise.
 */
export function validateFileSize(fileSize) {
    return fileSize <= sizeLimit;
}
