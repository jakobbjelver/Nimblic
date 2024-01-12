import React, { createContext, useState, useEffect } from 'react';
import { getCurrentTime } from 'src/utils/textFormat';

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

    } catch {
      setUploadError({
        type: "warning",
        short: "Problem when storing data",
        long: "Your data is too large to save to your local storage. The app might not work as expected. If you leave the page your analysis will get lost. Please try uploading a smaller file or remove other analyses.",
        time: getCurrentTime()
      })
    }
  }, [uploadData]);


  return (
    <FileUploadContext.Provider value={{ uploadData, setUploadData, isUploading, setIsUploading, uploadError, setUploadError }}>
      {children}
    </FileUploadContext.Provider>
  );
};

export default FileUploadProvider;
