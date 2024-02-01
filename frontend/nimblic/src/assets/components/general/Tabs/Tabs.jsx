import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getFileIcon } from 'src/utils/fileUtil';
import { faPlus, faFileCsv, faFileExcel, faFileCode, faFile } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../Modal/ModalContext';
import { FileUploadContext } from '../Upload/FileUploadContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { truncateLabel } from 'src/utils/textFormat';

import { TabsContext } from './TabsContext';

const Tabs = () => {
    const { activeIndex, setActiveIndex } = useContext(TabsContext);

    const navigate = useNavigate();
    const location = useLocation();
    const [lastActiveIndex, setLastActiveIndex] = useState(activeIndex !== -1 ? activeIndex : 0)
    const { uploadData, isUploading, setUploadData } = useContext(FileUploadContext);
    const { openModal, closeModal, setModalActions } = useModal();

    const iconMapping = {
        faFileCsv,
        faFileExcel,
        faFileCode,
        faFile
    };

    const handleRemoveData = (index) => {
        closeModal();
        const updatedData = [...uploadData];
        updatedData.splice(index, 1);
        if (updatedData || Object.keys(updatedData).length > 0) {
            setUploadData(updatedData);
            if (updatedData[lastActiveIndex]) {
                setActiveIndex(lastActiveIndex);
            } else if (updatedData[0]) {
                setActiveIndex(0)
            } else {
                navigate('/')
            }
        } else {
            navigate('/')
        }
    };

    const handleNewUpload = () => {
        navigate('/new-upload');
        setActiveIndex(-1);
    }

    useEffect(() => {

        if (location.pathname === '/new-upload') {
            setActiveIndex(-1)
        } else if (activeIndex == -1) {
            setActiveIndex(lastActiveIndex)
        }
    }, []);

    // Function to handle tab click
    const handleTabClick = (index) => {
        setActiveIndex(index);
        setModalActions(["Cancel", "Delete"])
        if (activeIndex !== -1) {
            setLastActiveIndex(activeIndex)
        }
        if (location.pathname === '/new-upload') {
            navigate(-1)
        }
    }

    const handleRemoveClick = (index) => {
        setModalActions(["Cancel", "Delete"])
        openModal(
            <>
                <h3 className="font-bold text-lg mr-12">Delete analysis for {uploadData[index]?.metadata?.name}?</h3>
                <p className="py-4">You are about to delete an analysis, this operation cannot be undone.</p>
            </>,
            () => handleRemoveData(index)
        );
    };

    const tabs = Array.isArray(uploadData) ? uploadData.map((data, index) => (
        <div key={index} className="relative inline-flex group">
            <div
                className={`btn btn-sm w-fit h-fit p-0 mx-1 ${index === activeIndex ? 'btn-secondary' : 'btn-ghost'}  rounded-3xl`}
                onClick={() => handleTabClick(index)}
            >
                <a
                    role="tab"
                    className={`text-lg flex flex-row py-1 px-5 items-center rounded-3xl ${index === activeIndex ? 'bg-secondary text-base-100' : 'bg-base-200'}`}
                >
                    {truncateLabel(data?.metadata?.name, 24)}
                    <div className="flex items-center justify-center ml-1 mr-[-7px] w-6 h-6">
                        <FontAwesomeIcon icon={iconMapping[getFileIcon(data?.metadata?.type)]} size="sm" className="group-hover:hidden" />
                        <button
                            className="btn btn-circle btn-xs bg-base-300 z-[9999] hidden group-hover:flex hover:bg-base-100"
                            onClick={() => handleRemoveClick(index)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </a>
            </div>
        </div>
    )) : [];

    if (uploadData.length === 0) {
        <>
            <div className="skeleton w-40 ml-1 rounded-full bg-base-200 h-10"></div>
        </>
    }
    // Add a loading tab when a new file is being uploaded
    else if (isUploading) {
        tabs.push(
            <div key="loading" className="relative inline-flex group">
                <button className="btn btn-sm w-fit h-fit p-0 mx-1 btn-ghost" disabled="disabled">
                    <a role="tab" className="tab text-md font-semibold bg-base-300">
                        <span className="loading loading-xs loading-spinner mr-1"></span>
                        ANALYSING
                    </a>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 items-center">
            {uploadData[activeIndex] ? uploadData[activeIndex].metadata.isSampled ?
                <div role="alert" className="alert bg-warning/50 h-8 py-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="my-0 text-sm"><strong>Warning:</strong> Data is sampled, the results may vary</span>
                </div>
                : '' : ''}
            <div role="tablist" className="tabs tabs-md rounded-s-3xl ps-0 tabs-boxed bg-base-300 w-fit flex items-center justify-center">
                <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center justify-center">
                    {tabs.length > 0 ? tabs : <div className="skeleton w-40 ml-1 rounded-full bg-base-200 h-10"></div>}
                </div>
                <button className="btn btn-sm btn-ghost ml-2 w-fit h-fit p-0" onClick={handleNewUpload}>
                    <a role="tab" className={`tab text-xs font-semibold ${activeIndex === -1 ? 'tab-active [--tab-bg:secondary]' : ''}`}><FontAwesomeIcon icon={faPlus} className="mr-1" />ADD ANALYSIS</a>
                </button>
            </div>
        </div>
    );
};

export default Tabs;
