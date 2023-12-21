import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import CardMenu from '../../general/CardMenu'
const ConsistencyCard = ({ consistencyData, selectedColumn }) => {

    return (
        <div className="card bg-base-300 shadow-sm m-4 p-6 max-h-52 fadeInUp w-fit max-w-max">
            <div className="flex flex-row justify-between items-center">
                <h2 className="card-title">Consistency checks</h2>
                <CardMenu cardId={'dqp_cc'}/>
            </div>
            <div className="badge badge-ghost mx-2">{selectedColumn}</div>
            <div className="card-body flex flex-row items-center justify-center">
                {consistencyData[selectedColumn] ?
                    <><FontAwesomeIcon icon={faTriangleExclamation} className="mr-1 text-accent" />{consistencyData[selectedColumn]}</>
                    :
                    <><FontAwesomeIcon icon={faCheck} className="mr-1 text-secondary" />No inconsistencies found</>
                }
            </div>
        </div>
    );
};

export default ConsistencyCard;
