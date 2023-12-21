import React from 'react';
import { formatBytes } from 'src/utils/fileUtil'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSdCard } from '@fortawesome/free-solid-svg-icons';

const MemoryUsage = ({ metadata, summary }) => {
    const totalProductionMemoryUsage = summary.memory_usage.total;
    const totalMemoryUsage = metadata.size;

    return(
        <div className="stat w-fit h-fit">
            <div className="stat-figure text-secondary rounded-md">
            <FontAwesomeIcon icon={faSdCard} size="2x" className="ml-2 text-secondary" />
            </div>
            <div className="stat-title flex flex-row justify-start gap-1 items-center">
               Memory usage (bytes)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="stat-value">{formatBytes(totalMemoryUsage)}</div>
            <div className="stat-desc">{formatBytes(totalProductionMemoryUsage)} used in production</div>
        </div>
    );

};

export default MemoryUsage;
