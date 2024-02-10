
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

    const name = metadata.name?.replace(/\s/g, '_'); // Replace spaces with underscores
    const time = metadata.lastModified?.replace(/[^0-9]/g, ''); // Remove non-numeric characters
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

export function parseToStorage(obj) {
  if (Array.isArray(obj)) {
    console.log("Converting array:", obj); // Log the entire array being converted
    // Convert array elements
    return obj.map(item => parseToStorage(item));
  } else if (obj !== null && typeof obj === 'object') {
    // Convert object properties
    const sanitizedObj = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value !== 'undefined') { // Skip undefined values
        if (Array.isArray(value)) {
          console.log(`Converting array at key "${key}":`, value); // Log the specific array being converted
          // Convert arrays to objects with integer keys to avoid nested arrays
          sanitizedObj[key] = value.reduce((acc, item, index) => {
            acc[index] = parseToStorage(item);
            return acc;
          }, {});
        } else {
          sanitizedObj[key] = parseToStorage(value);
        }
      }
    });
    return sanitizedObj;
  }
  // Return the value if it's not an object or array
  return obj;
}

function isSequentialIntegerKeys(obj) {
  const keys = Object.keys(obj).map(Number).sort((a, b) => a - b);
  return keys.every((key, index) => key === index);
}


export function parseFromStorage(data) {
  if (data !== null && typeof data === 'object') {
    if (!Array.isArray(data) && isSequentialIntegerKeys(data)) {
      // Object with sequential integer keys, likely was an array
      return Object.keys(data).map(key => parseFromStorage(data[key]));
    } else {
      // Regular object or array
      const result = Array.isArray(data) ? [] : {};
      for (const key in data) {
        result[key] = parseFromStorage(data[key]);
      }
      return result;
    }
  }
  // Return the value if it's not an object
  return data;
}


  export function limitFloatPrecision(value) {
    if (typeof value === 'number') {
      // Check if the number is a floating point
      if (!Number.isInteger(value)) {
        return parseFloat(value.toFixed(2));
      }
      return value;
    } else if (Array.isArray(value)) {
      return value.map(limitFloatPrecision);
    } else if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        value[key] = limitFloatPrecision(value[key]);
      });
      return value;
    }
    return value;
  }

  export function formatProcessingTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000); // 60,000 milliseconds in a minute
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0); // Remaining seconds
    return minutes > 0 
           ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== '1' ? 's' : ''}` 
           : `${seconds} second${seconds !== '1' ? 's' : ''}`;
}

  
