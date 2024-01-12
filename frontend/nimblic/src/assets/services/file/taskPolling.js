// taskPolling.js

/**
 * Polls the task status from the server.
 * @param {string} taskId - The ID of the task to be polled.
 * @param {Function} onSuccess - Callback function to execute on successful task completion.
 * @param {Function} onError - Callback function to execute on task failure.
 */
export function pollTaskStatus(taskId, name, onSuccess, onError) {
    console.log("Polling task status")

    //127.0.0.1:8000
    //35.205.94.61

    const poll = () => {
        fetch(`https://nimblicapplication.xyz/check_task/${taskId}`, {
            method: 'GET'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                if (data.state === 'SUCCESS') {
                    console.log(`${name} Task success! ID: ${taskId}`)
                    onSuccess(data.result);
                } else if (data.state === 'PENDING') {
                    console.log(`${name} Task pending... ID: ${taskId}`)
                    setTimeout(poll, 2000);
                } else if (data.state === 'INCOMPLETE') {
                    console.log(`${name} Task incomplete... ID: ${taskId}`)
                    setTimeout(poll, 2000);
                } else if (data.state === 'TIMEOUT') {
                    onError(data.error, 'large data handling which led the engine to time out');
                } else {
                    console.log("Task failed.")
                    onError(data.error, 'the engine running into problems with the data format');
                }
            })
            .catch(error => {
                onError(error);
            });
    };

    poll();
}
