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

const AnalysesSection = () => {
    const [analyses, setAnalyses] = useState([]);
    const [selectedAnalyses, setSelectedAnalyses] = useState([]);
    const [sharedAnalyses, setSharedAnalyses] = useState([]);
    const [selectedSharedAnalyses, setSelectedSharedAnalyses] = useState([]);
    const [userAuth, setUserAuth] = useState(UserManager.getUserAuth());
    const [loadingStates, setLoadingStates] = useState({});
    const { setSuccessMessage, setErrorMessage, setInfoMessage } = useContext(AlertContext);
    const { openModal, closeModal, setModalActions } = useModal();
    const { setUploadData, uploadData } = useContext(FileUploadContext);

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

    const handleSelectSharedAnalysis = (analysisId) => {
        setSelectedSharedAnalyses(prevSelected => {
            if (prevSelected.includes(analysisId)) {
                return prevSelected.filter(id => id !== analysisId);
            } else {
                return [...prevSelected, analysisId];
            }
        });
    };

    const handleDeleteSelected = async () => {
        setModalActions(["Cancel", "Delete"])
        openModal(
            <>
                <h3 className="font-bold text-lg mr-12">{`Delete ${selectedAnalyses.length > 1 ? 'analyses' : 'analysis'} permanently?`}</h3>
                <div className="mx-6">
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
                    short: `Failed to delete analysis ${selectedAnalyses.length > 1 ? 'analyses' : 'analysis'}`,
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
        setModalActions(["Close", null, <CopyButton labelText={"Copy link"} color={'neutral'} icon={<LinkIcon className="w-5 h-5 swap-off" aria-hidden="true" />} />])

        const recommendedIds = analyses.map(analysis => analysis.sharedWith.flat()).flat()
        console.log("recommendedIds", recommendedIds)
        openModal(
            <>
                <ShareAnalysisModal analysis={analysis} userAuth={userAuth} recommendedIds={recommendedIds} />
            </>,
            () => { }
        );
    }

    const handleRemoveSelectedShared = async () => {

    }

    return (
        <div className="overflow-x-auto w-full">
            <h3 className="mr-12 text-2xl font-semibold font-nunito">My analyses</h3>
            <div className="mb-4 w-full flex flex-row justify-end">
                <button className="btn btn-primary btn-sm w-16 text-gray-200">New</button>
                <button className="btn btn-error btn-sm ml-2 w-16 text-gray-200" onClick={handleDeleteSelected} disabled={selectedAnalyses.length === 0}>
                    {!loadingStates["delete"] ? 'Delete' : <span className="loading loading-spinner loading-sm" />}
                </button>
            </div>
            <table className="table w-full">
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
                    : !analyses || analyses.length === 0 ?
                        <tbody className="w-full h-20 flex items-center justify-center text-lg font-semibold">
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
            <div className="py-12">
                <h3 className="mr-12 text-2xl font-semibold font-nunito">Shared with me</h3>
                <div className="mb-4 w-full flex flex-row justify-end">
                    <button className="btn btn-error btn-sm ml-2 w-16 text-gray-200" onClick={handleRemoveSelectedShared} disabled={selectedSharedAnalyses.length === 0}>
                        {!loadingStates["remove"] ? 'Remove' : <span className="loading loading-spinner loading-sm" />}
                    </button>
                </div>
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>
                                <label>
                                    <input type="checkbox" className="checkbox checkbox-secondary border-neutral-content/50 [--chkfg:theme(colors.neutral)]"
                                        onChange={e => setSelectedSharedAnalyses(e.target.checked ? sharedAnalyses.map(a => a.id) : [])}
                                        checked={sharedAnalyses.length > 0 && selectedSharedAnalyses.length === sharedAnalyses.length}
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
        </div>
    );
};



export default AnalysesSection;