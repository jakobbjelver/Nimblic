import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';

const RowCount = ({ summary }) => {
    const numberOfRows = summary.basic_info.number_of_rows;
    const missingValues = Object.values(summary.basic_info.missing_values).reduce((a, b) => a + b, 0);

    return (
        <div className="stat w-fit h-fit">
            <div className="stat-figure text-secondary rounded-md">
                <FontAwesomeIcon icon={faChartBar} size="2x" className="ml-2 text-secondary" />
            </div>
            <div className="stat-title">Row count</div>
            <div className="stat-value">{numberOfRows}</div>
            <div className="stat-desc">{`${missingValues} missing values`}</div>
        </div>
    );
};

export default RowCount;

