import AlertSection from './Alert/AlertSection';
import Header from './Header/Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect, useContext } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid'
import { FileUploadContext } from './Upload/FileUploadContext';

const Body = ({ children }) => {
    const location = useLocation();
    const { uploadData, isUploading } = useContext(FileUploadContext);

    const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1023); // 768px is a common breakpoint for mobile screens

    const isInService = uploadData.length > 0 || isUploading

    const serviceRoutes = [
        'explore',
        'new-upload',
        'statistics',
        'view-data',
        isInService && !isNarrowScreen ? 'settings' : null,
        'data-quality'
    ]
    const showSidebar = serviceRoutes.includes(location.pathname.split('/')[1])

    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth < 1023);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        isNarrowScreen && showSidebar && location.pathname.split('/')[1] !== 'settings' ?
            <NarrowScreenOverlay />
            :

            <div className="flex h-dvh w-screen overflow-y-visible overflow-x-clip items-stretch justify-between">
                <div className={`flex flex-col ${showSidebar ? 'w-fit' : 'hidden'}`}>
                    {showSidebar && <Sidebar />}
                </div>
                <div className={`flex h-dvh flex-col body justify-right items-end ${showSidebar ? 'lg:w-11/12 md:w-11/12 xl:w-5/6 2xl:w-5/6' : 'w-full'}`}>
                    <Header isHome={!showSidebar} /> {/* Header is always rendered */}
                    <AlertSection />
                    <main className="flex w-full h-dvh items-center justify-center">{children}</main>
                    <UpgradeBrowserToast />
                    <Footer /> {/* Footer is always rendered */}
                </div>
            </div>
    );
};

export default Body

const NarrowScreenOverlay = () => (
    <div className="w-full h-screen fixed bg-base-300 z-[999999] flex flex-col items-center justify-evenly px-8">
        <div className="flex flex-col items-center mt-40 gap-2">
            <FontAwesomeIcon icon={faDesktop} size="3x" className="text-neutral-content" />
            <div className="divider"></div>
            <h1 className="text-xl font-nunito font-extrabold">We're sorry!</h1>
            <p className="text-center">Please use a larger screen or resize your window to access this website.</p>
        </div>
        <div className="logo-sm"></div>
    </div>
);


const UpgradeBrowserToast = () => {
    const [isDismissed, setDismissed] = useState(false)

    return (
        !isDismissed && <div className="toast toast-center z-10 bottom-0 [@supports(color:oklch(0_0_0))]:hidden">
            <div className="alert alert-warning grid-cols-[auto] py-2 text-xs">
                <span className="flex gap-2 items-center">
                    <a className="link" rel="nofollow, noreferrer" target="_blank" href="https://www.wikihow.com/Update-Your-Browser">Please upgrade your browser</a>
                    <div className="flex flex-1 justify-end">
                        <button type="button" onClick={() => setDismissed(true)} className="-m-3 p-3 focus-visible:outline-offset-[-4px]">
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </span>
            </div>
        </div>
    )
}