import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';

const DataQualityScore = ({ dataQuality }) => {

    return(
        <div className="stat w-fit h-fit">
            <div className="stat-figure text-secondary rounded-md">
            <FontAwesomeIcon icon={faMedal} size="2x" className="ml-2 text-secondary" />
            </div>
            <div className="stat-title flex flex-row justify-start gap-1 items-center">
                Quality score
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="stat-value">{dataQuality.overall_quality_score.toFixed(1)}%</div>
            <div className="stat-desc">Based on calculations</div>
        </div>
    );

};

export default DataQualityScore;
