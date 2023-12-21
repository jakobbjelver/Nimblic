import JSZip from 'jszip';
import { getCurrentTime } from 'src/utils/textFormat';

import { formatBytes } from 'src/utils/fileUtil';

export const handleFileUpload = (file, onUploadStart, onUploadEnd, setUploadData, setIsUploading, setErrorMessage, setSuccessMessage, setWarningMessage, setNotifications) => {
  console.log("handleFileUpload called")
  const allowedTypes = [
    'application/json',
    'text/xml', 'application/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel',
    'text/csv',
    // Add any additional file types here
  ];
  const sizeLimit = 10000000000; // Size limit in bytes

  // Add a function to poll the task status
  function pollTaskStatus(taskId, onSuccess, onError) {
    fetch(`http://127.0.0.1:5000/check_task/${taskId}`)
      .then(response => response.json())
      .then(data => {
        if (data.state === 'SUCCESS') {
          console.log("Success!")
          onSuccess(data.result);
        } else if (data.state === 'PENDING') {
          console.log("Pending...")
          setTimeout(() => pollTaskStatus(taskId, onSuccess, onError), 2000);
        } else {
          console.log("Error.")
          onError(data.error);
        }
      })
      .catch(error => onError(error));
  }

  return new Promise((resolve, reject) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      console.log("filetype: ", file.type)
      setIsUploading(false);
      onUploadEnd();
      reject({
        type: "error",
        short: "File type not allowed",
        long: "You cannot upload files of this type. Currently the app does not support this format. Please try re-uploading a valid file type, and if you want this file type to be allowed in the future, click 'Send feedback' to let the developer know.",
        feedback: "File type "+file.type+" not allowed",
      });
      return;
    }

    // Check file size
    if (file.size > sizeLimit) {
      setIsUploading(false);
      onUploadEnd();
      reject({
        type: "error",
        short: "File is too large ("+formatBytes(file.size)+")",
        long: "The file you uploaded is too large and cannot be handled by the server'. Currently the app does not support this. Please try re-uploading a smaller file size",
      });
      return;
    }

    console.log("FILE DATA:", file)

    // Extract metadata
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString(),
      // Add more metadata extraction here if needed
    };

    // Compress and upload the file
    const zip = new JSZip();
    const reader = new FileReader();
    reader.onload = function (event) {
      zip.file(file.name, event.target.result);
      zip.generateAsync({ type: "blob" }).then(function (content) {

        let formData = new FormData();
        formData.append('file', content, file.name + '.zip');
        formData.append('metadata', JSON.stringify(metadata));
        // Notify that upload is starting
        onUploadStart();

        fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        })
          .then(async response => {
            if (!response.ok) {
              // Handle HTTP errors
              setIsUploading(false);
              onUploadEnd();
              console.error("HTTP Error: ", response.statusText);
              const errorData = await response.json();
              // Process server-sent error data here
              console.error("Server Response Error: ", errorData);
              reject({
                type: "error",
                short: "The server failed with processing your data",
                long: "There was an internal server error when processing your data. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send feedback'",
                details: errorData,
                time: getCurrentTime()
              });
            } else {
              return response.json();
            }
          })
          .then(data => {
            console.log("Then...")

            if (data) {
              console.log("File handler data: ", data);
              const responseData = {
                ...data,
                metadata
              };
              console.log("Data: ", data)

              setUploadData(prevData => [...prevData, responseData]); // Append new data to existing array
              setIsUploading(false); // Update the uploading status
              onUploadEnd();
              console.log("Ending upload")

              if (data.changePointsTask_id) {
                pollTaskStatus(data.changePointsTask_id, (changePointsResult) => {
                  console.log("changePointsResult", changePointsResult)
                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.change_points = changePointsResult;
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    setNotifications(
                      prev => [
                      ...prev, {
                      type: "success",
                      short: "Change Point analysis finished in the background",
                      time: getCurrentTime()
                    }]);
                    return newData;
                  });
                                                                  
                }, (error) => {
                  console.error("Error in background Change Point task: ", error);
                  setNotifications(
                    prev => [
                    ...prev, {
                    type: "error",
                    short: "Error during Change Point analysis",
                    long: "There was an error processing the Change Point analysis in the background. This is not needed for the app to work. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send feedback'",
                    details: error,
                    time: getCurrentTime()
                  }]);
                });
              }

              if (data.objectAnalysisTask_id) {
                pollTaskStatus(data.objectAnalysisTask_id, (objectAnalysisResult) => {
                  console.log("objectAnalysisResult", objectAnalysisResult)
                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.statistical_summary.object_analysis = objectAnalysisResult;
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    setNotifications(
                      prev => [
                      ...prev, {
                      type: "success",
                      short: "Text analysis finished in the background",
                      time: getCurrentTime()
                    }]);                    
                    return newData;
                  });
                                                                  
                }, (error) => {
                  setNotifications(
                    prev => [
                    ...prev, {
                    type: "error",
                    short: "Error during Text analysis",
                    long: "There was an error processing the Text analysis in the background. This is not needed for the app to work. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send error details'",
                    details: error,
                    time: getCurrentTime()
                  }]);
                  console.error("Error in background Text Analysis task: ", error);

                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.statistical_summary.object_analysis = "No data";
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    return newData;
                  });
                });
              }

              if (data.privacyAssessmentTask_id) {
                pollTaskStatus(data.privacyAssessmentTask_id, (privacyAssessmentResult) => {
                  console.log("privacyAssessmentResult", privacyAssessmentResult)
                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.data_quality.privacy_assessment = privacyAssessmentResult;
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    setNotifications(
                      prev => [
                      ...prev, {
                      type: "success",
                      short: "Privacy assessment finished in the background",
                      time: getCurrentTime()
                    }]);                    
                    return newData;
                  });
                                                                  
                }, (error) => {
                  setNotifications(
                    prev => [
                    ...prev, {
                    type: "error",
                    short: "Error during Privacy assessment",
                    long: "There was an error processing the Privacy assessment in the background. This is not needed for the app to work. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send error details'",
                    details: error,
                    time: getCurrentTime()
                  }]);
                  console.error("Error in background during Privacy assessment task: ", error);

                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.data_quality.privacy_assessment = "No data";
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    return newData;
                  });
                });
              }

              if (data.distributionByNumericalTask_id) {
                pollTaskStatus(data.distributionByNumericalTask_id, (distributionByNumericalResult) => {
                  console.log("distributionByNumericalResult", distributionByNumericalResult)
                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.statistical_summary.categorical_analysis.Distribution = distributionByNumericalResult;
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    setNotifications(
                      prev => [
                      ...prev, {
                      type: "success",
                      short: "Categorical distribution analysis finished in the background",
                      time: getCurrentTime()
                    }]);                    
                    return newData;
                  });
                                                                  
                }, (error) => {
                  setNotifications(
                    prev => [
                    ...prev, {
                    type: "error",
                    short: "Error during Categorical distribution analysis",
                    long: "There was an error processing the Categorical distribution analysis in the background. This is not needed for the app to work. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send error details'",
                    details: error,
                    time: getCurrentTime()
                  }]);
                  console.error("Error in background Categorical distribution analysis task: ", error);

                  setUploadData(prevData => {
                    // Clone the array to avoid direct mutation
                    let newData = [...prevData];
                  
                    // Check if the array is not empty
                    if (newData.length > 0) {
                      // Access the last element
                      let lastElement = {...newData[newData.length - 1]};
                  
                      // Append changePointsResult to the last element
                      lastElement.statistical_summary.categorical_analysis.Distribution = "No data";
                  
                      // Update the last element with the modified object
                      newData[newData.length - 1] = lastElement;
                    }
                  
                    // Return the new array for the state update
                    return newData;
                  });
                });
              }
            }
            console.log("Empty data")
          })
          .catch(error => {
            // Handle network errors or errors thrown from response handling
            setIsUploading(false);
            onUploadEnd();
            console.error("File handler Network/Error: ", error.message);
            if (reject && typeof reject === 'function') {
              reject({
                type: "error",
                short: "Failed to establish an connection with the server",
                long: "There was an error sending your data to the server. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send error details'",
                details: error.message,
                time: getCurrentTime()
              }); 
            }
          });
      });
    };
    reader.readAsArrayBuffer(file);
  });
};
