export function encode(userId, analysisId) {
    // Combine your userId and analysisId into a single string with a separator
    const combinedString = `${userId}:${analysisId}`;

    // Convert the combined string to a Base64-encoded string
    const encoded = btoa(combinedString);

    // Replace characters to make it URL-safe (optional)
    const urlSafeEncoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return urlSafeEncoded;
}

export function decode(encodedString) {
    // Convert URL-safe format back to original Base64
    let base64 = encodedString.replace(/-/g, '+').replace(/_/g, '/');

    // Adjust padding. Base64 encoded length should be a multiple of 4.
    while (base64.length % 4) {
        base64 += '=';
    }

    // Decode the Base64 string
    const decoded = atob(base64);

    // Split the decoded string back into userId and analysisId
    const [userId, analysisId] = decoded.split(':');

    return { userId, analysisId };
}

