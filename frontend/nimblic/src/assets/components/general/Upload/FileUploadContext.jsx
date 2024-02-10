import React, { createContext, useState, useEffect } from 'react';
import { getCurrentTime } from 'src/utils/textFormat';
import { generateFileId, parseToStorage, limitFloatPrecision } from 'src/utils/fileUtil';

import { auth } from '../../../../firebase-config'

import { getFunctions, httpsCallable } from 'firebase/functions';


export const FileUploadContext = createContext({
  uploadData: null,
  setUploadData: () => { },
  isUploading: false,
  setIsUploading: () => { },
  uploadError: null,
  setUploadError: () => { },
});

const FileUploadProvider = ({ children }) => {
  const initialUploadData = localStorage.getItem('uploadData') ? JSON.parse(localStorage.getItem('uploadData')) : [];
  const [uploadData, setUploadData] = useState(initialUploadData);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load uploadData from local storage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('uploadData');
    if (savedData) {
      // Ensure the parsed data is an array
      const data = JSON.parse(savedData);
      setUploadData(Array.isArray(data) ? data : []);
    }
  }, []);


  // Save uploadData to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('uploadData', JSON.stringify(uploadData));
    } catch {
      setUploadError({
        type: "warning",
        short: "Problem when storing data",
        long: "Your data is too large to save to your local storage. The app might not work as expected. If you leave the page your analysis will get lost. Please try uploading a smaller file or remove other analyses.",
        time: getCurrentTime(),
      });
    }
    //Store analysis whenever the uploadDaat changes
    const storeAnalysisData = async () => {
      
      auth.authStateReady()

      const user = auth.currentUser

      if (!user || !uploadData[0]) {
        return;
      }

      try {
        // Do not save shared-with analyses
        if(uploadData[0].metadata?.author?.uid !== user.uid) return

        const analysisId = generateFileId(uploadData[0].metadata);

        // Deep clone the currentData object to avoid mutating the original state
        let currentData = JSON.parse(JSON.stringify(uploadData[0]));
        const metadata = currentData.metadata
        
        // Safe delete of the metadata from the clone without affecting the original state
        delete currentData.metadata
        const analysisData = currentData

        //Should be moved to backend instead
        const optimizedData = limitFloatPrecision(analysisData)

        //Stringify to avoid getting an error because of nested arrays
        const parsedData = parseToStorage(optimizedData)
        // Call the Cloud Function
        const functions = getFunctions();
        const storeDataFunction = httpsCallable(functions, 'storeAnalysisData');
        const result = await storeDataFunction({
          analysisId, 
          analysisData: parsedData, // Wrap the string in an object
          metadata
        });

        console.log(result.data.message);
        console.log("Data stored successfully.")
      } catch (error) {
        console.error("Failed to store full data.", error);
      }
    };

    storeAnalysisData();

  }, [uploadData]);


  return (
    <FileUploadContext.Provider value={{ uploadData, setUploadData, isUploading, setIsUploading, uploadError, setUploadError }}>
      {children}
    </FileUploadContext.Provider>
  );
};

export default FileUploadProvider;
