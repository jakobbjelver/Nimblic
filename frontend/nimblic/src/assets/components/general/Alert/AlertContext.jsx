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
});

const AlertProvider = ({ children }) => {
    const [infoMessage, setInfoMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [warningMessage, setWarningMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [notifications, setNotifications] = useState([]);
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
        console.log("Alert error: ", errorMessage);
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

    // Error message handling
    useEffect(() => {
        if (isUploading && uploadData.length == 0) {
            setInfoMessage("Your data is being analysed")
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
        console.log("Alert success: ", successMessage);
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
        console.log("Alert warning: ", warningMessage);
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
        <AlertContext.Provider value={{ infoMessage, setInfoMessage, warningMessage, setWarningMessage, errorMessage, setErrorMessage, successMessage, setSuccessMessage, notifications, setNotifications }}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertProvider;
