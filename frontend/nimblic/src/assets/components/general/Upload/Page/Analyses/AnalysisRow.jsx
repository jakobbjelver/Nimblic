import React, { useContext } from 'react';
import { getFileIcon, formatBytes, formatProcessingTime, generateFileId } from 'src/utils/fileUtil';
import { formatDate } from '../../../../../../utils/dateFormat';
import { faFileCsv, faFileExcel, faFileCode, faFile, faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExclamationTriangleIcon, CheckCircleIcon, ExclamationCircleIcon, LockClosedIcon, ShareIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { FileUploadContext } from '../../FileUploadContext'

const AnalysisRow = ( {userAuth, analysis, selectedAnalyses, onSelectAnalysis, onView, onShare, isShared, loadingStates}) => {
    const { setUploadData, uploadData } = useContext(FileUploadContext);

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

    return (
        <tr key={analysis.id}>
            <td>
                <label>
                    <input type="checkbox" className="checkbox checkbox-primary border-neutral-content/50 [--chkfg:theme(colors.neutral)]" checked={selectedAnalyses.includes(analysis.id)} onChange={() => onSelectAnalysis(analysis.id)} />
                </label>
            </td>
            {analysis.name && <td className="font-semibold  whitespace-nowrap">
                <FontAwesomeIcon icon={iconMapping[getFileIcon(analysis.type)].icon} size="lg" className={`mr-2 ${iconMapping[getFileIcon(analysis.type)].color}`} />
                {analysis.name.split(".")[0]}
            </td>}
            <td>{analysis.processingTime && formatProcessingTime(analysis.processingTime) || '-'}</td>
            <td>{analysis.author ? analysis.author.uid == userAuth.uid ? 'You' : analysis.author.name : "You"}</td>
            <td>
                {!analysis.sharedWith || analysis.sharedWith.length <= 0 && !analysis.url ? <span className="flex flex-row gap-2 items-center justify-center h-full whitespace-nowrap">Private<LockClosedIcon className="h-4 w-4" aria-hidden="true" /></span>
                    : !analysis.url ? <span className="flex flex-row gap-2 items-center justify-center h-full whitespace-nowrap">Shared<ShareIcon className="h-4 w-4" aria-hidden="true" /></span>
                        : analysis.url ? <span className="flex flex-row gap-2 items-center justify-center h-full whitespace-nowrap">Global<GlobeAltIcon className="h-4 w-4" aria-hidden="true" /></span>
                            : '-'}
            </td>
            <td>{analysis.lastModified && formatDate(analysis.lastModified) || '-'}</td>
            <td>{analysis.size && formatBytes(analysis.size) || '-'}</td>
            <td><span className="flex flex-row gap-1">{analysis.status?.isSampled && <ExclamationTriangleIcon className="h-6 w-6 text-accent" aria-hidden="true" />}
                {analysis.status?.isAvailable ? <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" /> : <ExclamationCircleIcon className="h-6 w-6 text-error" aria-hidden="true" />}
            </span></td>
            <td className="flex flex-row justify-end">
                {!isShared && <button className="btn btn-sm btn-ghost w-16 mx-1" onClick={() => onShare(analysis)}>
                    <span className="whitespace-nowrap">Share <FontAwesomeIcon icon={faShareFromSquare} /></span>
                </button>}
                {isShared && <div className="w-16 ml-2"/>}
                {!isCurrentAnalysis(analysis) ? <button disabled={loadingStates[analysis.id]} className="btn btn-sm w-16 whitespace-nowrap mx-1" onClick={() => onView(analysis)}>
                    {!loadingStates[analysis.id] ? 'View' : <span className="loading loading-sm loading-spinner" />}
                </button>
                    : <button disabled className="btn btn-sm w-16 disabled:text-neutral-content/80 mx-1">Current</button>}
            </td>
        </tr>
    );
};



export default AnalysisRow;