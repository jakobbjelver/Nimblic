import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faUserLock, faTriangleExclamation, faTrashCan, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

const StatsComponent = ({ data }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
            // Check if data is available and has the required properties
            if (!data || typeof data !== 'object' || !data.type_validation || !data.redundancy_analysis || !data.missing_values) {
                throw new Error("Invalid data format");
            }

            // Calculations for stats
            const overallQualityScore = data.overall_quality_score || 0;
            
            let privacyScore = null;
            let privacyTypesCount = null;
            if (data.privacy_assessment) {
                privacyTypesCount = new Set(Object.values(data.privacy_assessment).flatMap(Object.keys)).size;

                privacyScore = Object.values(data.privacy_assessment).reduce((acc, curr) => {
                    return acc + Object.values(curr).reduce((sum, value) => sum + value, 0);
                }, 0) / 100;
            }

            let typeIssuesCount = null
            if (data.type_validation.data_type_issues) {
                typeIssuesCount = Object.values(data.type_validation.data_type_issues).length;
            }

            const totalRedundancyRate = Object.values(data.redundancy_analysis).reduce((acc, curr) => acc + curr.redundancy_rate, 0) / Object.keys(data.redundancy_analysis).length;

            const missingValues = Object.entries(data.missing_values).reduce((acc, [column, value]) => {
                acc.total += value;
                if (value > acc.max.value) {
                    acc.max = { column, value };
                }
                return acc;
            }, { total: 0, max: { column: '', value: 0 } });

            const missingValuesPercentage = missingValues.total / (Object.keys(data.missing_values).length * 100);
            const columnWithMostMissing = missingValues.max.column;

            setStats({
                overallQualityScore,
                privacyScore,
                privacyTypesCount,
                typeIssuesCount,
                totalRedundancyRate,
                missingValuesPercentage,
                columnWithMostMissing
            });
        
    }, [data]);

    if (!stats) {
        return <div>Loading...</div>;
    }

    return (
        <div className="stats stats-vertical shadow-md bg-base-200 h-[550px] overflow-x-hidden">
            <div className="stat">
                <div className="stat-title flex items-center gap-2">
                    Quality Score
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="stat-value flex items-center justify-between">{stats.overallQualityScore.toFixed(2)}<FontAwesomeIcon icon={faMedal} className="ml-2 text-secondary" /></div>
            </div>

            {stats.privacyScore ?
                <div className="stat">
                    <div className="stat-title flex items-center gap-2">
                        Privacy Score
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="stat-value flex items-center justify-between">{stats.privacyScore.toFixed(2)}<FontAwesomeIcon icon={faUserLock} className="ml-2 text-secondary" /></div>
                    <div className="stat-desc">{stats.privacyTypesCount} types of PII</div>
                </div>
                :
                <div className="stat">
                    <div className="stat-title">Privacy Score</div>
                    <div className="flex flex-row items-stretch justify-stretch">
                        <div className="stat-value bg-base-300 skeleton text-transparent h-7 w-24 mt-1"></div>
                        <FontAwesomeIcon icon={faUserLock} className="ml-6 text-secondary stat-value" />
                    </div>
                    <div className="stat-desc skeleton text-transparent h-4 w-24"></div>
                </div>
            }


            <div className="stat">
            <div className="stat-title flex items-center gap-2">
                    Type Issues
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="stat-value flex items-center justify-between">{stats.typeIssuesCount}<FontAwesomeIcon icon={faTriangleExclamation} className="ml-2 text-secondary" /></div>
            </div>

            <div className="stat">
            <div className="stat-title flex items-center gap-2">
                    Redundancy Rate
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="stat-value flex items-center justify-between">{stats.totalRedundancyRate.toFixed(2)}%<FontAwesomeIcon icon={faTrashCan} className="ml-2 text-secondary" /></div>
            </div>

            <div className="stat">
            <div className="stat-title flex items-center gap-2">
                    Missing Values
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="stat-value flex items-center justify-between">{stats.missingValuesPercentage.toFixed(2)}%<FontAwesomeIcon icon={faCircleQuestion} className="ml-2 text-secondary" /></div>
                {stats.columnWithMostMissing && <div className="stat-desc">Most in column {stats.columnWithMostMissing}</div>}
            </div>
        </div>
    );
};

export default StatsComponent;
