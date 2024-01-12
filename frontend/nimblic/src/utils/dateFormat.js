export function formatDate(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const date = new Date(dateString);

    const dayOfWeek = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Function to get the ordinal suffix of a number
    function getOrdinalSuffix(num) {
        const j = num % 10,
              k = num % 100;
        if (j === 1 && k !== 11) {
            return num + "st";
        }
        if (j === 2 && k !== 12) {
            return num + "nd";
        }
        if (j === 3 && k !== 13) {
            return num + "rd";
        }
        return num + "th";
    }

    return `${dayOfWeek}, ${getOrdinalSuffix(dayOfMonth)} ${month} ${year}`;
}

export function countRecentTimestamps(timestamps) {
    const now = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000; // milliseconds in 24 hours
  
    // Function to convert a timestamp to a JavaScript Date object
    const convertToDate = (timestamp) => {
      return new Date((timestamp.seconds * 1000) + (timestamp.nanoseconds / 1000000));
    };
  
    // Filter and count timestamps within the last 24 hours
    return timestamps.filter(timestamp => {
      const timestampDate = convertToDate(timestamp);
      return (now - timestampDate) < oneDayInMillis;
    }).length;
  }
