
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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
