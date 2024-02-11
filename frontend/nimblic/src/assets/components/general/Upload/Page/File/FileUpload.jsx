import React, { useCallback, useState, useRef, useEffect, useContext, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faArrowPointer } from '@fortawesome/free-solid-svg-icons';
import { handleFileUpload } from '../../../../../services/file/handleFileUpload';
import { FileUploadContext } from '../../FileUploadContext';
import { AlertContext } from '../../../Alert/AlertContext';
import { useModal } from '../../../Modal/ModalContext';
import Login from '../../../../Auth/Login'
import { useLocation } from 'react-router-dom';
import UserManager from '../../../../../services/user/userManager';
import { formatBytes } from 'src/utils/fileUtil';
import { getCurrentTime } from 'src/utils/textFormat';

import ProcessLine from '../../../../Home/ProcessLine'

import { faScrewdriverWrench, faEye } from '@fortawesome/free-solid-svg-icons';

import SampleFile from './SampleFile';

const FileUpload = forwardRef(({ extraClassName }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { uploadData, setUploadData, isUploading, setIsUploading, triggerFileInputClick, fileInputRef } = useContext(FileUploadContext);
  const { setErrorMessage, setInfoMessage, setWarningMessage, setSuccessMessage, setNotifications, setInitUploadMetadata } = useContext(AlertContext);

  const [isLoading, setLoading] = useState(false);

  const { openModal, closeModal, setModalActions } = useModal(); // Assuming this is your modal context

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


  const handleFileTooLarge = (file, fileSize, fileSizeLimit) => {
    setModalActions(["Cancel", ["Sample file"]])
    openModal(
      <>
        <div className="flex flex-col items-start px-4">
          <h3 className="font-bold text-2xl">File is Too Large</h3>
          <p className="py-4 flex items-center text-lg">You uploaded a file with size {formatBytes(fileSize)} while your account type accepts a maxiumum of {formatBytes(fileSizeLimit)}. Would you like to sample the dataset?</p>
          <div role="alert" className="alert bg-warning/50 my-12 mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <h3 className="font-bold">Warning: Resource intensive operation</h3>
              <div className="text-xs">This operation is run by your computer and might <strong>crash your browser</strong> if the file size is too large. Continue with caution.</div>
            </div>
          </div>
        </div>
      </>,
      () => handleSampling(file, fileSizeLimit)
    );
  };

  const proceedWithFileUpload = (file) => {
    setLoading(true);

    console.log("Authentication successful, proceeding with file upload");

    const onSample = (file, fileSize, fileSizeLimit) => {
      setModalActions(["Cancel", 'Sample File'])
      handleFileTooLarge(file, fileSize, fileSizeLimit)
    }

    handleFileUpload(file, onUploadStart, onUploadEnd, setUploadData, setIsUploading, setNotifications, onSample, setInitUploadMetadata)
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
            details: error,
            time: getCurrentTime(),
          });
        console.error('Upload failed!', error);
        // Navigate with error state if necessary
        if (Object.keys(uploadData).length <= 0) {
          console.log("Sending to home page")
          navigate('/');
        }
        setLoading(false);
      });
  };

  const handleSampling = async (file, fileSizeLimit) => {

    setModalActions(["Cancel", null]);

    openModal(
        <SampleFile
          file={file}
          fileSizeLimit={fileSizeLimit}
          onSampled={(sampledFile) => proceedWithFileUpload(sampledFile)} // Use sampledFile
          />,
        () => closeModal()
      );
  }

  const onDrop = useCallback(acceptedFiles => {
    if (isUploading) {
      setErrorMessage({
        type: "error",
        short: "Only one upload at a time",
        long: "Please wait until the current analysis is finished or reload the page to try again.",
        time: getCurrentTime(),
      });
      return;
    }

    setLoading(true);

    const file = acceptedFiles[0];
    const user = UserManager.getUserAuth();

    if (user) {
      if(!user.emailVerified) {
        setErrorMessage({
          type: "error",
          short: "Unverified email",
          long: "Please verify you email address to continue.",
          time: getCurrentTime(),
        });
        setLoading(false);
        return;
      }
      proceedWithFileUpload(file);
    } else {
      setModalActions(["Cancel", null])
      setLoading(false);
      openModal(
        <Login onLoginSuccess={() => {
          proceedWithFileUpload(file);
          closeModal();
        }} />
      );
    }
  }, [isUploading, navigate, location.pathname, setErrorMessage, openModal, closeModal, setIsUploading]);

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
          <div className="grid grid-cols-3 py-0 mt-8 w-4/6 gap-5 h-fit px-2">
            <div className="flex flex-col items-center w-full">
              <img src="/svg/upload.svg" alt="First Step" width="60" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/svg/process.svg" alt="Second Step" width="60" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/svg/discover.svg" alt="Third Step" width="60" />
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
          ${location.pathname !== '/' ? 'w-full h-60 mt-0 mb-10' : 'mt-28 w-96 h-48 my-8 items-center justify-center'}`}>
        <input {...getInputProps()} ref={fileInputRef}/>
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
          ${location.pathname !== '/' ? 'w-full h-48 text-neutral-content/70' : 'w-96 h-48 text-zinc-200'} 
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
