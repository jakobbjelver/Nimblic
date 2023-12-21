// taskPolling.js

/**
 * Polls the task status from the server.
 * @param {string} taskId - The ID of the task to be polled.
 * @param {Function} onSuccess - Callback function to execute on successful task completion.
 * @param {Function} onError - Callback function to execute on task failure.
 */
export function pollTaskStatus(taskId, onSuccess, onError) {
    console.log("Polling task status")

    const poll = () => {
        fetch(`http://127.0.0.1:5000/check_task/${taskId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                if (data.state === 'SUCCESS') {
                    console.log("Task success!")
                    onSuccess(data.result);
                } else if (data.state === 'PENDING') {
                    console.log("Task pending... ID: " + taskId)
                    setTimeout(poll, 2000);
                } else {
                    console.log("Task failed.")
                    onError(data.error);
                }
            })
            .catch(error => {
                onError(error);
            });
    };

    poll();
}
