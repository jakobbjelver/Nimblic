import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import CardMenu from '../../general/CardMenu'

const TypeIssuesCard = ({ data, selectedColumn }) => {
    const [typeIssuesData, setTypeIssuesData] = useState(null);

    useEffect(() => {
        if (data) {
            if(data.data_type_issues) {
                setTypeIssuesData(data.data_type_issues[selectedColumn])
            } 
        }
      }, [data]);

    return (
        <div className="card bg-base-300 shadow-sm m-4 p-6 max-h-52 fadeInUp w-fit max-w-max">
                        <div className="flex flex-row justify-between items-center">
                <h2 className="card-title">Type Issues</h2>
                <CardMenu cardId={'dqp_ti'}/>
            </div>
            <div className="badge badge-ghost mx-2">{selectedColumn}</div>
            <div className="card-body flex flex-row items-center justify-center">
                {typeIssuesData ? 
            <><FontAwesomeIcon icon={faTriangleExclamation} className="mr-1 text-accent"/>{typeIssuesData}</>
                :
                <><FontAwesomeIcon icon={faCheck} className="mr-1 text-secondary"/>No issues found</>
                }
            </div>
        </div>
    );
};

export default TypeIssuesCard;
