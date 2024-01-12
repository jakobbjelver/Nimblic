import AlertSection from './Alert/AlertSection';
import Header from './Header/Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

const Body = ({ children }) => {
    const location = useLocation();

    const serviceRoutes = [
        '/explore',
        '/new-upload',
        '/statistics',
        '/view-data',
        '/settings',
        '/data-quality'
    ]
    const showSidebar = serviceRoutes.includes(location.pathname) ? true : false

    const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 1023); // 768px is a common breakpoint for mobile screens

    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth < 1023);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        isNarrowScreen && showSidebar ?
            <NarrowScreenOverlay />
            :

            <div className="flex h-screen w-full overflow-y-visible overflow-x-clip items-stretch justify-between">
                <div className={`flex flex-col ${showSidebar ? 'w-fit' : 'hidden'}`}>
                    {showSidebar && <Sidebar />}
                </div>
                <div className={`flex flex-col body justify-right items-end ${showSidebar ? 'lg:w-11/12 md:w-11/12 xl:w-5/6 2xl:w-5/6' : 'w-full'}`}>
                    <Header isHome={!showSidebar} /> {/* Header is always rendered */}
                    <AlertSection />
                    <main className="flex w-full items-center justify-center">{children}</main>
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