import React, { createContext, useState, useEffect, useContext } from 'react';
import { FileUploadContext } from '../Upload/FileUploadContext';

export const AlertContext = createContext({
    infoMessage: null,
    setInfoMessage: () => { },
    errorMessage: false,
    setErrorMessage: () => { },
    successMessage: null,
    setWarningMessage: () => { },
    warningMessage: null,
    setSuccessMessage: () => { },
    notifications: null,
    setNotifications: () => { },
    initUploadMetaData: null,
    setInitUploadMetadata: () => { }
});

const AlertProvider = ({ children }) => {
    const [infoMessage, setInfoMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [warningMessage, setWarningMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [initUploadMetaData, setInitUploadMetadata] = useState([]);
    const { isUploading, uploadData, uploadError } = useContext(FileUploadContext);

    // Load notifications from local storage when the component mounts
    useEffect(() => {
        const savedData = localStorage.getItem('notifications');
        if (savedData) {
            setNotifications(JSON.parse(savedData));
        }
    }, []);

    // Save notifications to local storage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('notifications', JSON.stringify(notifications));
        } catch {
            console.error("Unable to load past notifications.")
        }
    }, [notifications]);

    // Error message handling
    useEffect(() => {
        if (errorMessage) {
            setNotifications(
                prev => [
                    ...prev, errorMessage]
            );
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 7000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Info/Processing message handling
    useEffect(() => {
        if (isUploading && uploadData.length == 0) {

            const size = initUploadMetaData.size / 1024 / 1024
            let timeStr = 'unknown'

            if (size < 1) {
                timeStr = '5 seconds'
            } else if(size >= 1 && size <= 3) {
                timeStr = '5 seconds'
            } else if(size > 3 && size <= 5) {
                timeStr = '10 seconds'
            } else if(size > 5 && size <= 7) {
                timeStr = '20 seconds'
            } else if(size > 7 && size <= 10) {
                timeStr = '30 seconds'
            } else if(size > 10 && size <= 15) {
                timeStr = '45 seconds'
            } else if(size > 15 && size <= 30) {
                timeStr = '1 to 2 minutes'
            } else if(size > 30 && size <= 60) {
                timeStr = '2 to 5 minutes'
            } else if(size > 60 && size <= 100) {
                timeStr = '5 to 10 minutes'
            } else if(size > 100 && size <= 150) {
                timeStr = '10 to 15 minutes. Warning! Analysis may time out'
            } else {
                timeStr = 'unknown'
            }
            setInfoMessage(`Your data is being analysed. Estimated time is ${timeStr}.`)
        }
        else {
            setInfoMessage(null)
        }
    }, [isUploading]);

    // Upload error message handling
    useEffect(() => {
        if (uploadError) {
            setWarningMessage(uploadError)
            setNotifications(
                prev => [
                    ...prev, uploadError]);
        }
        else {
            setWarningMessage(null)
        }
    }, [uploadError]);

    // Success message handling
    useEffect(() => {
        if (successMessage) {
            setNotifications(
                prev => [
                    ...prev, successMessage]
            );
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Warning message handling
    useEffect(() => {
        if (warningMessage) {
            setNotifications(
                prev => [
                    ...prev, warningMessage]
            );
            const timer = setTimeout(() => {
                setWarningMessage(null);
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [warningMessage]);

    return (
        <AlertContext.Provider value={{ infoMessage, setInfoMessage, warningMessage, setWarningMessage, errorMessage, setErrorMessage, successMessage, setSuccessMessage, notifications, setNotifications, initUploadMetaData, setInitUploadMetadata }}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertProvider;
