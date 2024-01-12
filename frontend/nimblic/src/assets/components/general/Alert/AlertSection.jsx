import React, { useContext, useEffect, useState } from 'react';
import { AlertContext } from './AlertContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import NotificationsComponent from '../Header/NotificationsComponent'
import { useModal } from '../Modal/ModalContext';

const AlertSection = () => {
    const { successMessage, warningMessage, infoMessage, errorMessage, setNotifications } = useContext(AlertContext);
    const location = useLocation();

    const [thisInfoMessage, setThisInfoMessage] = useState(null);
    const [thisErrorMessage, setThisErrorMessage] = useState(null);
    const [thisWarningMessage, setThisWarningMessage] = useState(null);
    const [thisSuccessMessage, setThisSuccessMessage] = useState(null);

    // Info message handling
    useEffect(() => {
        if (infoMessage) {
            setThisInfoMessage(infoMessage)
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
        <div className="md:flex flex-col top-0 hidden">
            <div className={`alert alert-info w-fit min-w-[20%] shadow-lg absolute right-0 ${location.pathname === '/' ? 'left-0' : 'left-60'} mr-auto ml-auto top-5 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${infoMessage ? 'opacity-100 z-[999999]' : 'opacity-0 z-[9998]'}`}>
                <FontAwesomeIcon icon={faUpload} size="lg" className="mr-2" />
                <div>
                    <h3 className="font-bold">Processing data</h3>
                    <div className="text-xs">{thisInfoMessage}</div>
                </div>
                <span className="loading loading-dots loading-md"></span>
            </div>
            <div className={`alert alert-error w-fit min-w-[20%] shadow-lg absolute ${location.pathname === '/' ? 'left-0' : 'left-60'} right-0 mr-auto ml-auto top-5 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${errorMessage ? 'opacity-100 z-[999999]' : 'opacity-0 z-[9998]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h3 className="font-bold">Error</h3>
                    <div className="text-xs">{thisErrorMessage}</div>
                </div>
                <button className="btn btn-sm btn-ghost cursor-pointer bg-gray-100/10" onClick={handleOpenNotifications}>See</button>
            </div>
            <div className={`alert alert-success w-fit min-w-[20%] shadow-lg absolute ${location.pathname === '/' ? 'left-0' : 'left-60'} right-0 mr-auto ml-auto top-5 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${successMessage ? 'opacity-100 z-[999999]' : 'opacity-0 z-[9998]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h3 className="font-bold">Success!</h3>
                    <div className="text-xs">{thisSuccessMessage}</div>
                </div>
            </div>
            <div className={`alert alert-warning w-fit min-w-[20%] shadow-lg absolute ${location.pathname === '/' ? 'left-0' : 'left-60'} right-0 mr-auto ml-auto top-5 transition ease-in-out duration-200 transition-property: opacity transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) ${warningMessage ? 'opacity-100 z-[999999]' : 'opacity-0 z-[9998]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                    <h3 className="font-bold">Warning</h3>
                    <div className="text-xs">{thisWarningMessage}</div>
                </div>
                <button className="btn btn-sm btn-ghost cursor-pointer bg-gray-100/10" onClick={handleOpenNotifications}>See</button>
            </div>
        </div>
    );
};

export default AlertSection;

