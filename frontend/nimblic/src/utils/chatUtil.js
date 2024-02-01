function shortenNumbers(value) {
    if (typeof value === 'number') {
        // Adjust the precision of floating-point numbers
        return parseFloat(value.toFixed(2));
    }
    return value;
}

export function trimData(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => trimData(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = trimData(value);
        }
        return result;
    } else {
        return shortenNumbers(obj);
    }
}

export const parseQuestion = (str) => {
    try {
        // Regular expression to match the outermost JSON object
        const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})+}/;
        const match = str.match(jsonRegex);

        if (match) {
            const jsonMatch = match[0];
            const jsonString = jsonMatch.replace(/'/g, '"'); // Ensure proper JSON string format
            const jsonObject = JSON.parse(jsonString);

            // Function to recursively flatten and convert all elements to strings
            const flattenAndConvertToStrings = (obj) => {
                if (Array.isArray(obj)) {
                    // Flatten array and process each element
                    return obj.flatMap(flattenAndConvertToStrings);
                } else if (typeof obj === 'object' && obj !== null) {
                    // Flatten object values and process each value
                    return Object.values(obj).flatMap(flattenAndConvertToStrings);
                } else {
                    // Convert non-array and non-object elements to strings
                    return obj.toString();
                }
            };

            return flattenAndConvertToStrings(jsonObject);
        }
    } catch (error) {
        console.error("Error parsing JSON: ", error);
        
        // Fallback: Process the string if JSON parsing fails
        return str
            .replace(/[\{\}\[\]"':`´,]/g, '') // Remove JSON-like characters
            .split('?') // Split by question marks to find potential questions
            .map(s => s.trim()) // Trim whitespace from each potential question
            .filter(s => s.length > 0) // Filter out empty strings
            .map(s => s + '?'); // Add the question mark back to each question
    }
};


export const topicPathMapping = {
    "General": "metadata",
    "Statistics": "statistical_summary",
    "Data Quality": "data_quality",
    "Change Point Detection": "change_points",
    "Correlation Network": "correlation_network",
    "Graph Recommendations": "graph_recommendations",
};

// Function to reverse the mapping
const reverseMapping = (mapping) => {
    const reversed = {};
    Object.keys(mapping).forEach(key => {
        const value = mapping[key];
        reversed[value] = key;
    });
    return reversed;
};

export const getTopicFromPath = (path) => {
    console.log("PATH", path)
    const reversedMapping = reverseMapping(topicPathMapping);
    console.log("REVERSED: ", reversedMapping)
    console.log("RETURNED TOPIC: ", reversedMapping[path])
    return reversedMapping[path] || 'General'; // Default to 'Unknown' if path not found
};