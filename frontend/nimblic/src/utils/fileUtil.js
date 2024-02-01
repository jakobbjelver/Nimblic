
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const generateFileId = (metadata) => {
    if(!metadata) return

    const name = metadata.name.replace(/\s/g, '_'); // Replace spaces with underscores
    const time = metadata.lastModified.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    return `${name}-${time}`;
};

export function getFileIcon(fileExtension) {
    let icon = 'faFile';
    switch(fileExtension) {
        case 'application/json':
            icon = 'faFileCode';
            break;
        case 'text/xml':
        case 'application/xml':
            icon = 'faFile';
            break;
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-excel':
            icon = 'faFileExcel';
            break;
        case 'text/csv':
            icon = 'faFileCsv';
            break;
        default:
            icon = 'faFile';
    }
    return icon;
}

export function sanitizeForFirestore(obj) {
    if (Array.isArray(obj)) {
      // Convert array elements
      return obj.map(item => sanitizeForFirestore(item));
    } else if (obj !== null && typeof obj === 'object') {
      // Convert object properties
      const sanitizedObj = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value !== 'undefined') { // Skip undefined values
          if (Array.isArray(value)) {
            // Convert arrays to objects with integer keys to avoid nested arrays
            sanitizedObj[key] = value.reduce((acc, item, index) => {
              acc[index] = sanitizeForFirestore(item);
              return acc;
            }, {});
          } else {
            sanitizedObj[key] = sanitizeForFirestore(value);
          }
        }
      });
      return sanitizedObj;
    }
    // Return the value if it's not an object or array
    return obj;
  }
  
