// fileUpload.js
import JSZip from 'jszip';
import { getCurrentTime } from 'src/utils/textFormat';

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
export function compressAndUploadFile(file, metadata, onUploadStart, onUploadEnd, setUploadData, setIsUploading, setNotifications) {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();
        const reader = new FileReader();

        reader.onload = function (event) {
            zip.file(file.name, event.target.result);
            zip.generateAsync({ type: "blob" }).then(function (content) {

                let formData = new FormData();
                formData.append('file', content, file.name + '.zip');
                formData.append('metadata', JSON.stringify(metadata));

                // Notify that upload is starting
                onUploadStart();

                fetch('http://127.0.0.1:5000/upload', {
                    method: 'POST',
                    body: formData,
                })
                .then(async response => {
                    setIsUploading(false);
                    onUploadEnd();

                    if (!response.ok) {
                        throw new Error('Server responded with an error: ' + response.statusText);
                    }

                    return response.json();
                })
                .then(data => {
                    //setUploadData(prevData => [...prevData, data]);
                    resolve(data);
                })
                .catch(error => {
                    reject(error);
                });
            });
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}
