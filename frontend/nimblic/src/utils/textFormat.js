export function truncateLabel(label, maxLength = 24) {
    if(!label) return 
    
    if (label.length <= maxLength || !label) {
        return label;
    }
    if(label !== typeof String) {
        return label.toString().substring(0, maxLength) + '...';
        
    }
    return label.substring(0, maxLength) + '...';
}

export function fromCamelToText(input) {
    if (!input) return "";

    // Split the string at all points where a lowercase letter is followed by an uppercase letter
    const words = input.split(/(?=[A-Z])/);

    // Capitalize the first letter of the first word and keep the rest of the letters in each word as is
    // Join the words with a space
    return words.map((word, index) => {
        return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
    }).join(" ");
}

export function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Pad single digit minutes with a leading zero
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}

export function lineBreakText(text, maxNum = 20) {
    let result = '';
    for (let i = 0; i < text.length; i += maxNum) {
      result += text.substring(i, Math.min(i + maxNum, text.length));
      if (i + maxNum < text.length) result += '\n'; // Add line break
    }

    result = result.split('@')[0]
    return result;
}