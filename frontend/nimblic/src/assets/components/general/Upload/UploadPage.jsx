import React, { useState, useEffect, useContext } from 'react';
import FileUpload from './Page/File/FileUpload';
import Tabs from '../Tabs/Tabs';
import { TabsContext } from '../Tabs/TabsContext';
import { FileUploadContext } from './FileUploadContext';
import { useNavigate } from 'react-router-dom';
import AnalysesSection from './Page/Analyses/AnalysesSection';


const UploadPage = () => {
  const { uploadData, isUploading } = useContext(FileUploadContext);
  const { activeIndex } = useContext(TabsContext);
  const currentData = uploadData[activeIndex];

  useEffect(() => {
    if (!isUploading && currentData) {
      // Data is ready to be used
      //setLoading(false);
    }
  }, [uploadData, isUploading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      //navigate('/')
    }
  }, []);

  useEffect(() => {
    // Check if currentData is available and not empty
    if (activeIndex === -1) return
    else {
      if (currentData && Object.keys(currentData).length > 0) {
       // setLoading(false);
      } else {
       // setLoading(true);
      }
    }
  }, [currentData, activeIndex]); // Depend on currentData


  return (
    <div className="flex mt-20 flex-col pb-10 h-max w-full items-center justify-top py-4 px-16 max-w-screen-2xl">
      {(Object.keys(uploadData).length > 0 || isUploading) && <Tabs />}
      <FileUpload/>
      <AnalysesSection/>
    </div>
  );
};

export default UploadPage;

