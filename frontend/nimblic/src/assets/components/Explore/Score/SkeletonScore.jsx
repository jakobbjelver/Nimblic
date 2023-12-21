import React from 'react';

const SkeletonScore = ({ title }) => {

    return(
        <div className="stat w-fit h-fit">
            <div className="stat-figure text-secondary rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="stat-title">{title}</div>
            <div className="stat-value bg-base-300 skeleton text-transparent h-2/3">0101010</div>
            <div className="stat-desc skeleton text-transparent h-2/3">0101</div>
        </div>
    );

};

export default SkeletonScore;