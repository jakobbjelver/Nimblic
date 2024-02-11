import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import AnalysisManager from '../../../../../services/analyses/analysisManager';
import UserManager from '../../../../../services/user/userManager';
import { parseFromStorage } from 'src/utils/fileUtil';
import { LinkIcon } from '@heroicons/react/24/outline'
import { useModal } from '../../../Modal/ModalContext'
import { AlertContext } from '../../../Alert/AlertContext';
import { getCurrentTime } from 'src/utils/textFormat'
import { getFirebaseErrorMessage } from 'src/utils/errorUtil'
import { FileUploadContext } from '../../FileUploadContext'
import CopyButton from '../../../CopyButton';
import ShareAnalysisModal from './Share/ShareAnalysisModal';
import AnalysisRow from './AnalysisRow';
import { encode } from 'src/utils/shareUtil';
import { Tab } from '@headlessui/react'

const AnalysesSection = () => {
    const [analyses, setAnalyses] = useState([]);
    const [selectedAnalyses, setSelectedAnalyses] = useState([]);
    const [sharedAnalyses, setSharedAnalyses] = useState([]);
    const [selectedSharedAnalyses, setSelectedSharedAnalyses] = useState([]);
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [loadingStates, setLoadingStates] = useState({});
    const { setSuccessMessage, setErrorMessage, setInfoMessage } = useContext(AlertContext);
    const { openModal, closeModal, setModalActions } = useModal();
    const { setUploadData, triggerFileInputClick } = useContext(FileUploadContext);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const analysisManager = useRef(null);

    useEffect(() => {
        async function checkUserStatus() {
            await UserManager.waitForUserLoad();
            setUserAuth(UserManager.getUserAuth());
        }
        checkUserStatus();

        const handleUserAuthChange = (newUser) => {
            setUserAuth(newUser);
        };

        UserManager.subscribeToUserAuth(handleUserAuthChange);

        return () => {
            UserManager.unsubscribeFromUserAuth(handleUserAuthChange);
        };
    }, []);

    useEffect(() => {
        setLoadingStates(prevStates => ({ ...prevStates, ["own"]: true }));
        if (!userAuth || !userAuth.uid) return

        try {
            analysisManager.current = new AnalysisManager(userAuth.uid);

            analysisManager.current.subscribe((updatedAnalyses) => {
                setAnalyses(updatedAnalyses);
                setLoadingStates(prevStates => ({ ...prevStates, ["own"]: false }));
            });

        } catch (error) {
            setLoadingStates(prevStates => ({ ...prevStates, ["own"]: false }));
            setErrorMessage({
                type: "error",
                short: `Failed to load analyses`,
                long: getFirebaseErrorMessage(error),
                details: error,
                time: getCurrentTime()
            });
        }


        return () => analysisManager.current.unsubscribeFromAnalyses();
    }, [userAuth]);



    useEffect(() => {
        setLoadingStates(prevStates => ({ ...prevStates, ["shared"]: true }));
        if (!userAuth || !userAuth.uid) return

        try {
            analysisManager.current.subscribeToShared((updatedAnalyses) => {
                setSharedAnalyses(updatedAnalyses);
                setLoadingStates(prevStates => ({ ...prevStates, ["shared"]: false }));
            });
        } catch (error) {
            setLoadingStates(prevStates => ({ ...prevStates, ["shared"]: false }));
            setErrorMessage({
                type: "error",
                short: `Failed to load shared analyses`,
                long: getFirebaseErrorMessage(error),
                details: error,
                time: getCurrentTime()
            });
        }

        return () => analysisManager.current.unsubscribeFromAnalyses();
    }, [userAuth]);

    const handleSelectAnalysis = (analysisId) => {
        setSelectedAnalyses(prevSelected => {
            if (prevSelected.includes(analysisId)) {
                return prevSelected.filter(id => id !== analysisId);
            } else {
                return [...prevSelected, analysisId];
            }
        });
    };

    const handleSelectSharedAnalysis = (analysis) => {
        setSelectedSharedAnalyses(prevSelected => {
            const index = prevSelected.findIndex(sa => sa.id === analysis.id);
            if (index > -1) {
                // If found, remove the analysis from the selection
                return prevSelected.filter((_, i) => i !== index);
            } else {
                // Otherwise, add the analysis object to the selection
                return [...prevSelected, analysis];
            }
        });
    };


    const handleDeleteSelected = async () => {
        setModalActions(["Cancel", "Delete"])
        openModal(
            <>
                <h3 className="font-bold text-xl mr-12">{`Delete ${selectedAnalyses.length > 1 ? 'analyses' : 'analysis'} permanently?`}</h3>
                <div className="mx-6 mt-6 mb-8">
                    <p className="pt-4 pb-2">This operation cannot be undone, and the data will not be able to be recovered at any time.</p>
                    <p className="pb-4 text-sm"><strong>The following will be deleted forever:</strong> {selectedAnalyses.join(", ")}</p>
                </div>
            </>,
            () => confirmDeletion()
        );

        const confirmDeletion = async () => {
            closeModal()
            setLoadingStates(prevStates => ({ ...prevStates, ["delete"]: true }));
            try {
                await analysisManager.current.deleteAnalyses(selectedAnalyses);
                setSelectedAnalyses([]); // Clear selection after deletion
                setSuccessMessage({
                    type: "success",
                    short: `Successfully deleted ${selectedAnalyses.length > 1 ? 'analyses' : 'analysis'}`,
                    long: `${selectedAnalyses.length > 1 ? 'Analyses with IDs' : 'Analysis with ID'} ${selectedAnalyses.join(", ")} deleted.`,
                    time: getCurrentTime()
                });
                setLoadingStates(prevStates => ({ ...prevStates, ["delete"]: false }));
            } catch (error) {
                setErrorMessage({
                    type: "error",
                    short: `Failed to delete ${selectedAnalyses.length > 1 ? 'analyses' : 'analysis'}`,
                    long: getFirebaseErrorMessage(error),
                    details: error,
                    time: getCurrentTime()
                });
                setLoadingStates(prevStates => ({ ...prevStates, ["delete"]: false }));
            }
        }
    };

    const handleView = async (analysis) => {
        setLoadingStates(prevStates => ({ ...prevStates, [analysis.id]: true }));
        try {
            const rawData = await analysisManager.current.fetchAnalysisData(analysis.id, analysis.author.uid)
            let analysisData = parseFromStorage(rawData)
            analysisData.id = analysis.id
            const metadata = { ...analysis }
            setUploadData(prevData => [...prevData, { ...analysisData.analysisData, metadata }])
            setInfoMessage({
                type: "info",
                short: `Analysis '${analysis.name}' added to your tabs`,
                time: getCurrentTime()
            });
            setLoadingStates(prevStates => ({ ...prevStates, [analysis.id]: false }));
        } catch (error) {
            setErrorMessage({
                type: "error",
                short: `Failed to view analysis '${analysis.name}'`,
                long: getFirebaseErrorMessage(error),
                details: error,
                time: getCurrentTime()
            });
            setLoadingStates(prevStates => ({ ...prevStates, [analysis.id]: false }));
        }
    }

    const handleShare = (analysis) => {

        const encodedAnalysisId = encode(userAuth.uid, analysis.id)

        const shareableUrl = `localhost:5173/explore/${encodedAnalysisId}`;
        setModalActions(["Close", null, <CopyButton copyText={shareableUrl} labelText={"Copy link"} color={'neutral'} icon={<LinkIcon className="w-5 h-5 swap-off" aria-hidden="true" />} />])

        const recommendedIds = analyses.map(analysis => analysis.sharedWith?.flat() || []).flat()
        openModal(
            <>
                <ShareAnalysisModal analysis={analysis} userAuth={userAuth} recommendedIds={recommendedIds} />
            </>,
            () => { }
        );
    }

    // Use `triggerFileInputClick` where you need to trigger the file input click
    const handleNewButtonClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        triggerFileInputClick();
    };

    const handleRemoveSelectedShared = async () => {
        setModalActions(["Cancel", "Remove"])
        openModal(
            <>
                <h3 className="font-bold text-xl mr-12">{`Remove ${selectedSharedAnalyses.length > 1 ? 'analyses' : 'analysis'}?`}</h3>
                <div className="mx-6 mb-6 mt-4">
                    <p className="pt-4 pb-2">This will unshare the analyses and you will lose access to them until or if they are shared to you again.</p>
                    <p className="pb-4 text-sm"><strong>The following will be removed:</strong> {selectedSharedAnalyses.map(sa => sa.id).join(", ")}</p>
                </div>
            </>,
            () => confirmRemoval()
        );

        const confirmRemoval = async () => {
            closeModal()
            setLoadingStates(prevStates => ({ ...prevStates, ["remove"]: true }));
            try {
                await analysisManager.current.unshareSelectedAnalyses(selectedSharedAnalyses);
                setSelectedSharedAnalyses([]); // Clear selection after deletion
                setSuccessMessage({
                    type: "success",
                    short: `Successfully removed ${selectedSharedAnalyses.length > 1 ? 'analyses' : 'analysis'}`,
                    long: `${selectedAnalyses.length > 1 ? 'Analyses with IDs' : 'Analysis with ID'} ${selectedSharedAnalyses.join(", ")} removed.`,
                    time: getCurrentTime()
                });
                setLoadingStates(prevStates => ({ ...prevStates, ["remove"]: false }));
            } catch (error) {
                setErrorMessage({
                    type: "error",
                    short: `Failed to remove ${selectedSharedAnalyses.length > 1 ? 'analyses' : 'analysis'}`,
                    long: getFirebaseErrorMessage(error),
                    details: error,
                    time: getCurrentTime()
                });
                setLoadingStates(prevStates => ({ ...prevStates, ["remove"]: false }));
            }
        }
    }


    const renderMyAnalysesContent = () => {

        return (
            <div className="overflow-x-auto w-full h-full pt-5">
                <div className="w-full flex flex-row justify-end">
                    <button className="btn btn-primary btn-sm w-16 text-gray-200" onClick={handleNewButtonClick}>New</button>
                    <button className="btn btn-error btn-sm ml-2 w-16 text-gray-200" onClick={handleDeleteSelected} disabled={selectedAnalyses.length === 0 || loadingStates["delete"]}>
                        {!loadingStates["delete"] ? 'Delete' : <span className="loading loading-spinner loading-sm" />}
                    </button>
                </div>
                <table className="table w-full fadeInUp">
                    <thead>
                        <tr>
                            <th>
                                <label>
                                    <input type="checkbox" className="checkbox checkbox-primary border-neutral-content/50 [--chkfg:theme(colors.neutral)]"
                                        onChange={e => setSelectedAnalyses(e.target.checked ? analyses.map(a => a.id) : [])}
                                        checked={analyses.length > 0 && selectedAnalyses.length === analyses.length}
                                    />
                                </label>
                            </th>
                            <th>Name</th>
                            <th>Processing Time</th>
                            <th>Author</th>
                            <th>Access</th>
                            <th>Last Modified</th>
                            <th>Size</th>
                            <th>Availability</th>
                            <th></th>
                        </tr>
                    </thead>
                    {loadingStates["own"] ?
                        <tbody className="w-full h-20 flex items-center justify-center">
                            <tr className="absolute left-1/2 -translate-x-1/2 loading loading-spinner loading-md text-neutral-content/60" />
                        </tbody>
                        : analyses.length === 0 ?
                            <tbody className="w-full flex h-20 items-center justify-center text-lg font-semibold ">
                                <tr>
                                    <td className="absolute left-1/2 -translate-x-1/2 w-full flex items-center justify-center">No analyses to show</td>
                                </tr>
                            </tbody>
                            : <tbody>
                                {analyses.map((analysis) => (
                                    <AnalysisRow
                                        key={analysis.id}
                                        userAuth={userAuth}
                                        analysis={analysis}
                                        selectedAnalyses={selectedAnalyses}
                                        onSelectAnalysis={handleSelectAnalysis}
                                        onShare={handleShare}
                                        onView={() => handleView(analysis)}
                                        isShared={false}
                                        loadingStates={loadingStates}
                                    />
                                ))}
                            </tbody>}
                </table>
            </div>
        )

    }

    const renderSharedAnalysesContent = () => {
        return (
            <div className="overflow-x-auto w-full h-full pt-5">
                <div className="w-full flex flex-row justify-end">
                    <button className="btn btn-error btn-sm ml-2 w-16 text-gray-200" onClick={handleRemoveSelectedShared} disabled={selectedSharedAnalyses.length === 0 || loadingStates["remove"]}>
                        {!loadingStates["remove"] ? 'Remove' : <span className="loading loading-spinner loading-sm" />}
                    </button>
                </div>
                <table className="table w-full fadeInUp">
                    <thead>
                        <tr>
                            <th>
                                <label>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-secondary border-neutral-content/50 [--chkfg:theme(colors.neutral)]"
                                        onChange={e => setSelectedSharedAnalyses(e.target.checked ? sharedAnalyses.map(a => ({ id: a.id, ownerId: a.author.uid })) : [])}
                                        checked={sharedAnalyses.length > 0 && selectedSharedAnalyses.length === sharedAnalyses.length && sharedAnalyses.every(a => selectedSharedAnalyses.some(sa => sa.id === a.id))}
                                    />


                                </label>
                            </th>
                            <th>Name</th>
                            <th>Processing Time</th>
                            <th>Author</th>
                            <th>Access</th>
                            <th>Last Modified</th>
                            <th>Size</th>
                            <th>Availability</th>
                            <th></th>
                        </tr>
                    </thead>
                    {loadingStates["shared"] ?
                        <tbody className="w-full h-20 flex items-center justify-center">
                            <tr className="absolute left-1/2 -translate-x-1/2 loading loading-spinner loading-md text-neutral-content/60" />
                        </tbody>
                        : !sharedAnalyses || sharedAnalyses.length === 0 ?
                            <tbody className="w-full h-20 flex items-center justify-center text-lg font-semibold">
                                <tr>
                                    <td className="absolute left-1/2 -translate-x-1/2 w-full flex items-center justify-center">Nothing shared yet</td>
                                </tr>
                            </tbody>
                            : <tbody>
                                {sharedAnalyses.map((analysis) => (
                                    <AnalysisRow
                                        key={analysis.id}
                                        userAuth={userAuth}
                                        analysis={analysis}
                                        selectedAnalyses={selectedSharedAnalyses}
                                        onSelectAnalysis={handleSelectSharedAnalysis}
                                        onShare={null} // Should not share a shared-with analysis
                                        onView={() => handleView(analysis)}
                                        isShared={true}
                                        loadingStates={loadingStates}
                                    />
                                ))}
                            </tbody>}
                </table>
            </div>
        )
    }

    const [sections, setSections] = useState({});

    useEffect(() => {
        setSections({
            "My analyses": [{ id: 1, content: <>{renderMyAnalysesContent()}</> }],
            "Shared with me": [{ id: 2, content: <>{renderSharedAnalysesContent()}</> }]
        });

    }, [analyses, sharedAnalyses, selectedAnalyses, selectedSharedAnalyses]);

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <div className="w-full overflow-x-hidden bg-base-100 py-4 fadeInUp flex flex-col items-start justify-start">
            <Tab.Group selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
                <Tab.List className="w-2/5 md:w-1/2 flex space-x-1 rounded-xl bg-base-200 p-1 ">
                    {Object.keys(sections).map((section) => (
                        <Tab
                            key={section}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-3 text-xl font-semibold font-nunito leading-5',
                                    'ring-neutral/60 text-neutral-content/80 ring-offset-2 ring-offset-primary/50 focus:outline-none focus:ring-2',
                                    selected
                                        ? 'bg-base-300/95 text-primary/90 shadow'
                                        : ' hover:bg-base-100/50 hover:text-neutral-content'
                                )
                            }
                        >
                            {section}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="w-full ">
                    {Object.values(sections).map((components, idx) => (
                        <Tab.Panel
                            key={idx}
                        >
                            <ul>
                                {components.map((component) => (
                                    <li
                                        key={component.id}
                                        className="flex flex-col items-center h-screen"
                                    >
                                        {component.content}
                                    </li>
                                ))}
                            </ul>
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};



export default AnalysesSection;