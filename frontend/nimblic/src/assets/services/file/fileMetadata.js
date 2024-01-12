// fileMetadata.js

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
        isSampled: file.isSampled ? false : file.isSampled,
    };

    return metadata;
}
