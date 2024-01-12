import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import CardMenu from '../../general/CardMenu'
const IdentifiedKeyField = ({ keyFieldData, selectedColumn }) => {

    if(!keyFieldData.identified_key_fields.includes(selectedColumn)) return

    return (
        <div className="card bg-base-300 shadow-sm m-4 p-6 max-h-52 fadeInUp w-fit max-w-max">
            <div className="flex flex-row justify-between items-center">
                <h2 className="card-title">Key Field Analysis</h2>
                <CardMenu cardId={'dqp_kfa'}/>
            </div>
            <div className="badge badge-ghost mx-2">{selectedColumn}</div>
            <div className="card-body flex flex-row items-center justify-center">
                {keyFieldData.key_field_uniqueness[selectedColumn] ?
                    <><FontAwesomeIcon icon={faTriangleExclamation} className="mr-1 text-accent" />{keyFieldData.key_field_uniqueness[selectedColumn]}</>
                    :
                    <><FontAwesomeIcon icon={faCheck} className="mr-1 text-secondary" />No duplicate values</>
                }
            </div>
        </div>
    );
};

export default IdentifiedKeyField;
