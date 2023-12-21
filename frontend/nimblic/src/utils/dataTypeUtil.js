export function mapDataTypesToIcons(dataTypes) {
    const iconMapping = {
        "object": 'faCube',
        "int8": 'faHashtag',
        "int16": 'faHashtag',
        "float32": 'faList',
        "category": 'faList',
        "datetime64[ns, UTC]": 'faCalendarDays'
        // Add more mappings as needed
    };

    return dataTypes.map(type => iconMapping[type] || 'faQuestion'); // Default icon
}
