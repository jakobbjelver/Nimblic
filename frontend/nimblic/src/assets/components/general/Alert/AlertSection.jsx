import React, { useContext, useEffect, useState } from 'react';
import { AlertContext } from './AlertContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import NotificationsComponent from '../Header/NotificationsComponent'
import { useModal } from '../Modal/ModalContext';

const AlertSection = ( { isService }) => {
    const { successMessage, warningMessage, infoMessage, uploadMessage, errorMessage, setNotifications } = useContext(AlertContext);

    const [thisInfoMessage, setThisInfoMessage] = useState(null);
    const [thisUploadMessage, setThisUploadMessage] = useState(null);
    const [thisErrorMessage, setThisErrorMessage] = useState(null);
    const [thisWarningMessage, setThisWarningMessage] = useState(null);
    const [thisSuccessMessage, setThisSuccessMessage] = useState(null);

    // Upload message handling
    useEffect(() => {
        console.log("Alert section upload message: ", uploadMessage)
        if (uploadMessage) {
            setThisUploadMessage(uploadMessage)
        }
        else {
            const timer = setTimeout(() => {
                setThisUploadMessage(null)
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [uploadMessage]);

    // Info message handling
    useEffect(() => {
        if (infoMessage) {
            setThisInfoMessage(infoMessage.short)
        }
        else {
            const timer = setTimeout(() => {
                setThisInfoMessage(null)
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [infoMessage]);

    // Error message handling
    useEffect(() => {
        if (errorMessage) {
            setThisErrorMessage(errorMessage.short)
        }
        else {
            const timer = setTimeout(() => {
                setThisErrorMessage(null)
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Warning message handling
    useEffect(() => {
        if (warningMessage) {
            setThisWarningMessage(warningMessage.short)
        }
        else {
            const timer = setTimeout(() => {
                setThisWarningMessage(null)
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [warningMessage]);

    // Success message handling
    useEffect(() => {
        if (successMessage) {
            setThisSuccessMessage(successMessage.short)
        }
        else {
            const timer = setTimeout(() => {
                setThisSuccessMessage(null)
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const { openModal, closeModal, setModalActions } = useModal();

    const handleRemoveNotifications = () => {
        setNotifications([])
        localStorage.setItem('notifications', []);
        closeModal();
    };

    const handleOpenNotifications = () => {
        setModalActions(["Close", "Clear all"])
        openModal(
            <NotificationsComponent />,
            () => handleRemoveNotifications()
        );
    };

    return (
        <div className="flex flex-col top-0">
            <div className={`alert alert-info w-fit flex flex-row md:min-w-[20%] min-w-[85%] shadow-lg fixed ${!isService ? 'left-0' : 'md:left-60 left-0'} right-0 mr-auto ml-auto top-24 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${uploadMessage ? 'opacity-100 z-[999999]' : 'opacity-0'} ${thisUploadMessage ? 'z-[9998]' : 'z-[-1]'}`}>
                <FontAwesomeIcon icon={faUpload} size="lg" className="mr-2" />
                <div>
                    <h3 className="font-bold">Processing data</h3>
                    <div className="text-xs">{thisUploadMessage}</div>
                </div>
                <span className="loading loading-dots loading-md"></span>
            </div>
            <div className={`alert w-fit flex flex-row md:min-w-[20%] min-w-[85%] fixed shadow-lg ${!isService ? 'left-0' : 'md:left-60 left-0'} right-0 mr-auto ml-auto top-24 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${infoMessage ? 'opacity-100 z-[999999]' : 'opacity-0'} ${thisInfoMessage ? 'z-[9998]' : 'z-[-1]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div className="text-start">
                    <h3 className="font-bold">Info</h3>
                    <div className="text-xs">{thisInfoMessage}</div>
                </div>
            </div>
            <div className={`alert alert-error w-fit flex flex-row md:min-w-[20%] min-w-[85%] shadow-lg fixed ${!isService ? 'left-0' : 'md:left-60 left-0'} right-0 mr-auto ml-auto top-24 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${errorMessage ? 'opacity-100 z-[999999]' : 'opacity-0'} ${thisErrorMessage ? 'z-[9998]' : 'z-[-1]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-start">
                    <h3 className="font-bold">Error</h3>
                    <div className="text-xs">{thisErrorMessage}</div>
                </div>
                <div className="flex-grow" />
                <button className="btn btn-sm btn-ghost cursor-pointer bg-gray-100/10" onClick={handleOpenNotifications}>See</button>
            </div>
            <div className={`alert alert-success w-fit flex flex-row md:min-w-[20%] min-w-[85%] fixed shadow-lg ${!isService ? 'left-0' : 'md:left-60 left-0'} right-0 mr-auto ml-auto top-24 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${successMessage ? 'opacity-100 z-[999999]' : 'opacity-0'} ${thisSuccessMessage ? 'z-[9998]' : 'z-[-1]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-start">
                    <h3 className="font-bold">Success!</h3>
                    <div className="text-xs">{thisSuccessMessage}</div>
                </div>
            </div>
            <div className={`alert alert-warning w-fit flex flex-row md:min-w-[20%] min-w-[85%] fixed shadow-lg ${!isService ? 'left-0' : 'md:left-60 left-0'} right-0 mr-auto ml-auto top-24 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${warningMessage ? 'opacity-100 z-[999999]' : 'opacity-0'} ${thisWarningMessage ? 'z-[9998]' : 'z-[-1]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div className="text-start">
                    <h3 className="font-bold">Warning</h3>
                    <div className="text-xs">{thisWarningMessage}</div>
                </div>
                <div className="flex-grow" />
                <button className="btn btn-sm btn-ghost cursor-pointer bg-gray-100/10" onClick={handleOpenNotifications}>See</button>
            </div>
        </div>
    );
};

export default AlertSection;

