import React, { useContext, useState, useEffect } from 'react';
import { getFileIcon, formatBytes, formatProcessingTime, generateFileId } from 'src/utils/fileUtil';
import { formatDate } from '../../../../../../utils/dateFormat';
import { faFileCsv, faFileExcel, faFileCode, faFile, faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExclamationTriangleIcon, CheckCircleIcon, ExclamationCircleIcon, LockClosedIcon, ShareIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { FileUploadContext } from '../../FileUploadContext'

const AnalysisRow = ({ userAuth, analysis, selectedAnalyses, onSelectAnalysis, onView, onShare, isShared, loadingStates }) => {
    const { uploadData } = useContext(FileUploadContext);
    const [statusIcons, setStatusIcons] = useState(null)

    const iconMapping = {
        faFileCsv: { icon: faFileCsv, color: "text-green-600" },
        faFileExcel: { icon: faFileExcel, color: "text-teal-600" },
        faFileCode: { icon: faFileCode, color: "text-orange-600" },
        faFile: { icon: faFile, color: "text-blue-600" }, // Default case
    };

    const isCurrentAnalysis = (analysis) => {
        const analysisId = generateFileId(analysis)
        const uploadIds = []
        uploadData.forEach(upload =>
            uploadIds.push(generateFileId(upload.metadata))
        )
        return uploadIds.includes(analysisId)
    }

    const renderStatusIcons = () => {

        const availableText = <><strong>Available</strong><p>The analysis is stored correctly and is based on 100% of the data from the original file.</p></>
        const unAvailableText = <><strong>Unavailable</strong><p>The analysis failed to store properly, only general information is available.</p></>
        const sampledText = <><strong>Sampled</strong><p>The analysis is not based on all data from the original file due to its large size.</p></>

        let elements = [
            analysis.status.isAvailable ? { id: 1, icon: <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />, text: availableText } : { id: 2, icon: <ExclamationCircleIcon className="h-6 w-6 text-error" aria-hidden="true" />, text: unAvailableText },
            analysis.status.isSampled && { id: 3, icon: <ExclamationTriangleIcon className="h-6 w-6 text-accent" aria-hidden="true" />, text: sampledText }
        ];

        return (
            <span className="flex flex-row gap-1">
                {elements.map((element) => {
                    return (
                        element && <div className="dropdown dropdown-top md:dropdown-hover" key={element.id}>
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
                                {element.icon}
                            </div>
                            <div tabIndex={0} className="z-[1] card card-compact dropdown-content w-44 bg-base-200 shadow mb-1 left-1/2 -translate-x-1/2">
                                <div className="card-body">
                                    <span className="text-xs">{element.text}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </span>
        )
    }

    let onChange = () => onSelectAnalysis(isShared ? { id: analysis.id, ownerId: analysis.author.uid } : analysis.id);
    let isChecked = isShared ? selectedAnalyses.some(sa => sa.id == analysis.id) : selectedAnalyses.includes(analysis.id);

    useEffect(() => {
        setStatusIcons(renderStatusIcons());
        onChange = () => onSelectAnalysis(isShared ? { id: analysis.id, ownerId: analysis.author.uid } : analysis.id)
        isChecked = isShared ? selectedAnalyses.some(sa => sa.id === analysis.id) : selectedAnalyses.includes(analysis.id)
    }, [analysis, loadingStates, selectedAnalyses, isShared]);

    return (
        <tr key={analysis.id}>
            <td>
                <label>
                    <input type="checkbox" className="checkbox checkbox-primary border-neutral-content/50 [--chkfg:theme(colors.neutral)]" 
                    checked={isChecked} 
                    onChange={onChange} />
                </label>
            </td>
            {analysis.name && <td className="font-semibold  whitespace-nowrap">
                <FontAwesomeIcon icon={iconMapping[getFileIcon(analysis.type)].icon} size="lg" className={`mr-2 ${iconMapping[getFileIcon(analysis.type)].color}`} />
                {analysis.name.split(".")[0]}
            </td>}
            <td>{analysis.processingTime && formatProcessingTime(analysis.processingTime) || '-'}</td>
            <td>{analysis.author ? analysis.author?.uid == userAuth?.uid ? 'You' : analysis.author.name : "You"}</td>
            <td>
                {!analysis.sharedWith || analysis.sharedWith.length <= 0 && !analysis.status.isPublic ? <span className="flex flex-row gap-1 items-center justify-center h-full whitespace-nowrap">Private<LockClosedIcon className="h-4 w-4" aria-hidden="true" /></span>
                    : !analysis.status.isPublic ? <span className="flex flex-row gap-1 items-center justify-center h-full whitespace-nowrap">Shared<ShareIcon className="h-4 w-4" aria-hidden="true" /></span>
                        : analysis.status.isPublic ? <span className="flex flex-row gap-1 items-center justify-center h-full whitespace-nowrap">Public<GlobeAltIcon className="h-4 w-4" aria-hidden="true" /></span>
                            : '-'}
            </td>
            <td>{analysis.lastModified && formatDate(analysis.lastModified) || '-'}</td>
            <td>{analysis.size && formatBytes(analysis.size) || '-'}</td>
            <td>{statusIcons}</td>
            <td className="flex flex-row justify-end">
                {!isShared && <button className="btn btn-sm btn-ghost w-16 mx-1" onClick={() => onShare(analysis)}>
                    <span className="whitespace-nowrap">Share <FontAwesomeIcon icon={faShareFromSquare} /></span>
                </button>}
                {isShared && <div className="w-16 ml-2" />}
                {!isCurrentAnalysis(analysis) ? <button disabled={loadingStates[analysis.id] || !analysis.status.isAvailable} className="btn btn-sm w-16 whitespace-nowrap mx-1 md:block hidden" onClick={() => onView(analysis)}>
                    {!loadingStates[analysis.id] ? 'View' : <span className="loading loading-sm loading-spinner" />}
                </button>
                    : <button disabled className="btn btn-sm w-16 disabled:text-neutral-content/80 mx-1">Current</button>}
            </td>
        </tr>
    );
};



export default AnalysisRow;