// fileValidation.js
import userManager from "../user/userManager";
import { formatBytes } from '../../../utils/fileUtil';

// Define the allowed file types and size limit
export const allowedTypes = [
    'application/json',
    'text/xml', 
    'application/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'application/vnd.ms-excel',
    'text/csv'
];

//export const sizeLimit = user.fileSizeLimit * 1024 * 1024 
export var sizeLimit = 10 * 1024 * 1024

/**
 * Validates the type of the uploaded file.
 * @param {string} fileType - The MIME type of the file.
 * @returns {boolean} - True if the file type is allowed, false otherwise.
 */
export function validateFileType(fileType) {
    console.log("FILE TYPE: ", fileType)
    return allowedTypes.includes(fileType);
}

/**
 * Validates the size of the uploaded file.
 * @param {number} fileSize - The size of the file in bytes.
 * @returns {boolean} - True if the file size is within the limit, false otherwise.
 */
export async function validateFileSize(fileSize) {
    await userManager.waitForUserLoad();

    const userData = userManager.getUserData();

    sizeLimit = userData.fileSizeLimit

    console.log("FILE SIZE: " + formatBytes(fileSize))
    console.log("FILE SIZE LIMIT: "+ formatBytes(sizeLimit * 1024 * 1024))
    console.log("IS TOO LARGE? ", fileSize <= sizeLimit * 1024 * 1024)

    return fileSize <= sizeLimit * 1024 * 1024;
}
