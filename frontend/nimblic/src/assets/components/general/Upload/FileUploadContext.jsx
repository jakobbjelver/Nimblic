import React, { createContext, useState, useEffect } from 'react';
import { getCurrentTime } from 'src/utils/textFormat';
import { generateFileId, sanitizeForFirestore } from 'src/utils/fileUtil';

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
      setUploadData(JSON.parse(savedData));
    }
  }, []);


  // Save uploadData to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('uploadData', JSON.stringify(uploadData));

      console.log("Analysis data: ", uploadData)

    } catch {
      setUploadError({
        type: "warning",
        short: "Problem when storing data",
        long: "Your data is too large to save to your local storage. The app might not work as expected. If you leave the page your analysis will get lost. Please try uploading a smaller file or remove other analyses.",
        time: getCurrentTime()
      })
    }
    //Store analysis whenever the uploadDaat changes
    const storeAnalysisData = async () => {
      
      auth.authStateReady()

      if (!auth.currentUser || !uploadData[0]) {
        console.log("FAILED TO STORE DATA");
        return;
      }

      try {
        const analysisId = generateFileId(uploadData[0].metadata);
        const analysisData = uploadData[0];

        //Stringify to avoid getting an error because of nested arrays
        const sanitizedData = sanitizeForFirestore(analysisData)
        // Call the Cloud Function
        const functions = getFunctions();
        const storeDataFunction = httpsCallable(functions, 'storeAnalysisData');
        const result = await storeDataFunction({
          analysisId, 
          uploadData: sanitizedData // Wrap the string in an object
        });

        console.log(result.data.message);
        console.log("DATA STORED SUCCESSFULLY")
      } catch (error) {
        console.error("Failed to call storeAnalysisData function.", error);
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
