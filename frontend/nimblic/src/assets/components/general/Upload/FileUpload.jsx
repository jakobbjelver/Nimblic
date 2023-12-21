import React, { useCallback, useState, useRef, useEffect, useContext, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faArrowPointer } from '@fortawesome/free-solid-svg-icons';
import { handleFileUpload } from '../../../services/file/handleFileUpload';
import { FileUploadContext } from './FileUploadContext';
import { AlertContext } from '../Alert/AlertContext';

import { useLocation } from 'react-router-dom';

import ProcessLine from '../../Home/ProcessLine'

import { faScrewdriverWrench, faEye } from '@fortawesome/free-solid-svg-icons';

const FileUpload = forwardRef(({ extraClassName }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { uploadData, setUploadData, isUploading, setIsUploading } = useContext(FileUploadContext);
  const { setErrorMessage, setInfoMessage, setWarningMessage, setSuccessMessage, setNotifications } = useContext(AlertContext);

  const [isLoading, setLoading] = useState(false);

  const onUploadStart = () => {
    setLoading(false);
    setIsUploading(true);
    if (location.pathname === '/') {
      navigate('/explore');
    }
  };

  const onUploadEnd = () => {
    console.log('Upload ended');
    setLoading(false);
  };

  const onDrop = useCallback(acceptedFiles => {

    if (isUploading) {
      setErrorMessage({
        type: "error",
        short: "Only one upload at a time",
        long: "You are only permitted to perform one analysis at a time. Please wait until the current analysis is finished or reload the page to try again."
      });
      return
    }
    const file = acceptedFiles[0];
    setLoading(true);
    console.log("onDrop triggered")

    handleFileUpload(file, onUploadStart, onUploadEnd, setUploadData, setIsUploading, setNotifications)
      .then(data => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setErrorMessage(error.short ? error : 
          {
            type: "error",
            short: "Something went wrong when processing your data",
            long: "An unexpected error occured when processing your request. Please try re-uploading, and if the error persists, contact the developer by clicking 'Send error details'",
            details: error
          });
        console.error('Upload failed!', error);
        // Navigate with error state if necessary
        if (Object.keys(uploadData).length <= 0) {
          console.log("Sending to home page")
          navigate('/');
        }
      });
  }, [onUploadStart, onUploadEnd, setUploadData, setIsUploading]);

  useImperativeHandle(ref, () => ({
    triggerDrop: (file) => {
      onDrop([file]);
    }
  }));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      {location.pathname !== '/' ?
        <>
          <div className="grid grid-cols-3 py-0 mt-8 w-4/6 gap-5 h-fit">
            <div className="flex flex-col items-center w-full">
              <img src="/svg/upload.svg" alt="First Step" width="110" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/svg/process.svg" alt="Second Step" width="110" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/svg/discover.svg" alt="Third Step" width="110" />
            </div>
          </div>
          <ProcessLine isLoading={isLoading} />
          <div className="grid grid-cols-3 py-0 w-4/6 gap-5">
            <div className="flex flex-row items-center justify-center">
              <span className="text-lg font-bold">Upload <FontAwesomeIcon icon={faUpload} style={{ color: "#6b42ff" }} /></span>
            </div>
            <div className="flex flex-row items-center justify-center">
              <span className="text-lg font-bold">Process <FontAwesomeIcon icon={faScrewdriverWrench} style={{ color: "#6b42ff" }} /></span>
            </div>
            <div className="flex flex-row items-center justify-center">
              <span className="text-lg font-bold">Discover <FontAwesomeIcon icon={faEye} style={{ color: "#6b42ff" }} /></span>
            </div>
          </div>
        </>
        : ''}
      <div ref={ref} {...getRootProps()}
        className={`flex flex-col space-y-4 p-4  fadeInUp
          ${location.pathname !== '/' ? 'w-full h-96 mt-0' : 'mt-28 w-96 h-48 my-8 items-center justify-center'}`}>
        <input {...getInputProps()} />
        <Transition
          show={true}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div ref={ref}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl text-center cursor-pointer backdrop-blur-sm bg-neutral/5 
          ${location.pathname !== '/' ? 'w-full h-80 text-neutral-content/70' : 'w-96 h-48 text-zinc-200'} 
          ${isDragActive ? 'border-grey-300' : 'border-drop'} ${extraClassName}`}>
            {isLoading ?
              <span className="loading text-accent loading-spinner loading-lg"></span>
              :
              <>
                <p className="font-bold text-xl">
                  <FontAwesomeIcon icon={faUpload} size="lg" className="mr-2" />
                  {isDragActive ? 'Drop the file here!' : 'Drag & drop a file here'}
                </p>
                <p className="text-sm my-4">OR</p>
                <p className="font-bold text-xl">
                  <FontAwesomeIcon icon={faArrowPointer} size="lg" className="mr-2" />
                  Click to choose a file
                </p>
              </>}
          </div>
        </Transition>
      </div>
    </>
  );
});

export default FileUpload;

/*
      <div className="flex flex-row items-center justify-center gap-2 mt-1 px-5 py-3 bg-neutral/10 shadow rounded-lg backdrop-blur-md">
        <strong className="text-sm">TRY THESE EXAMPLES: </strong>
        <a className="link link-accent" onClick={() => handleNavigate('/explore')}>UFO Sightings.csv</a>
        <a className="link link-accent">Winter Athletes.xlsx</a>
        <a className="link link-accent">World Heritage Sites.xml</a>
        <a className="link link-accent">Earthquakes.json</a>
      </div>
*/
