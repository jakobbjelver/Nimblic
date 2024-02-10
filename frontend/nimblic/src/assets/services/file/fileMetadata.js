// fileMetadata.js

import { auth } from "../../../firebase-config";
/**
 * Extracts metadata from the provided file.
 * @param {File} file - The file from which to extract metadata.
 * @returns {Object} - An object containing extracted metadata.
 */
export function extractMetadata(file) {
    if (!file) {
        return {};
    }

    const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString(),
        status: {isSampled: file.isSampled, isAvailable: true},
        author: { uid: auth.currentUser.uid, name: auth.currentUser.displayName || auth.currentUser.email},
        sharedWith: [],
        //processingTime //Appended in handleFileUpload service
    };

    return metadata;
}
