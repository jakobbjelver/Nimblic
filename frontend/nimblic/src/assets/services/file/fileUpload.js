// fileUpload.js
import JSZip from 'jszip';
import { getCurrentTime } from 'src/utils/textFormat';
import { auth } from '../../../firebase-config';

/**
 * Compresses the given file using JSZip and uploads it to the server.
 * @param {File} file - The file to be compressed and uploaded.
 * @param {Object} metadata - Metadata of the file.
 * @param {Function} onUploadStart - Callback to be called when upload starts.
 * @param {Function} onUploadEnd - Callback to be called when upload ends.
 * @param {Function} setUploadData - Function to update the upload data state.
 * @param {Function} setIsUploading - Function to update the uploading status.
 * @param {Function} setNotifications - Function to set notifications.
 * @returns {Promise} - A promise that resolves or rejects based on the upload result.
 */

const getToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        return currentUser.getIdToken(true);
    } else {
        throw new Error('No user logged in');
    }
}

export function compressAndUploadFile(file, metadata, onUploadStart, onUploadEnd, setIsUploading) {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();
        const reader = new FileReader();

        reader.onload = async function (event) { // Made this function async
            zip.file(file.name, event.target.result);
            zip.generateAsync({ type: "blob" }).then(async (content) => { // Added async here

                try {
                    const token = await getToken(); // Await the token

                    let formData = new FormData();
                    formData.append('file', content, file.name + '.zip');
                    formData.append('metadata', JSON.stringify(metadata));

                    onUploadStart();
                    
                    //127.0.0.1:8000
                    //35.205.94.61
                    const response = await fetch('https://nimblicapplication.xyz/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': token // Correctly set the token in the Authorization header
                        },
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    setIsUploading(false);
                    onUploadEnd();
                    resolve(data);
                } catch (error) {
                    setIsUploading(false);
                    onUploadEnd();
                    reject(error);
                }
            });
        };
        
        reader.readAsArrayBuffer(file);
    });
}
