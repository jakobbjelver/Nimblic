import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
import { faCube, faList, faCalendarDays, faHashtag, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';


const ColumnCount = ({ summary }) => {
    const columnTypes = summary.column_types;
    const categoricalCount = Object.values(columnTypes).filter(type => type === 'category').length;
    const objectCount = Object.values(columnTypes).filter(type => type === 'object').length;
    const datetimeCount = Object.values(columnTypes).filter(type => type.includes('datetime')).length;
    const numericalCount = Object.keys(columnTypes).length - categoricalCount;

    const marqueeContent = (
        <>
            <FontAwesomeIcon icon={faCube} size="sm" className="text-neutral-content/80 mr-1" />
            <p className="mr-3">{objectCount} objects</p>
            <FontAwesomeIcon icon={faList} size="sm" className="text-neutral-content/80 mr-1" />
            <p className="mr-3">{categoricalCount} categories</p>
            <FontAwesomeIcon icon={faCalendarDays} size="sm" className="text-neutral-content/80 mr-1" />
            <p className="mr-3">{datetimeCount} dates</p>
            <FontAwesomeIcon icon={faHashtag} size="sm" className="text-neutral-content/80 mr-1" />
            <p className="mr-3">{numericalCount} numbers</p>
        </>
    );

    return (
        <div className="stat w-48 h-fit overflow-hidden">
            <div className="flex flex-row">
            <div className="flex flex-col">
            <div className="stat-title">
                Column count
            </div>
            <div className="stat-value">{Object.keys(columnTypes).length}</div>
            </div>
            <div className="flex text-secondary rounded-md w-full items-center mt-4 ml-2">
                <FontAwesomeIcon icon={faChartColumn} size="2x" className="ml-2 text-secondary" />
            </div>
            </div>
            <div className="stat-desc flex items-center marquee">
                {marqueeContent}
                {marqueeContent} 
            </div>
        </div>
    );
};

export default ColumnCount;
