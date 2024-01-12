import React from 'react';
import CardMenu from '../../general/CardMenu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const PotentialOutliersCard = ({ data, selectedColumn }) => {
    return (
        <div className="card bg-base-300 shadow-sm m-4 p-6 h-fit w-fit fadeInUp max-w-3xl">
            <div className="flex flex-row justify-between items-center">
                <h2 className="card-title">Potential outliers</h2>
                <CardMenu cardId={'dqp_po'}/>
            </div>
            <div className="badge badge-ghost mx-2">{selectedColumn}</div>
            {data[selectedColumn] ?
                <>
                    <div className="card-body px-0 flex flex-row pb-0">

                        <table className="table table-lg w-fit text-center max-h-32">
                            <thead>
                                <tr>
                                    <th>Lower bound</th>
                                    <th>Upper bound</th>
                                    <th>Total count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data[selectedColumn] ? (
                                    <tr>
                                        <td>{data[selectedColumn].lower_bound}</td>
                                        <td>{data[selectedColumn].upper_bound}</td>
                                        <td>{data[selectedColumn].total_outlier_count}</td>
                                    </tr>
                                ) : <tr><td colSpan="3" ><p className="text-lg font-light">No data</p></td></tr>}
                            </tbody>
                        </table>
                        <div>
                            <div className="rounded-md shadow-sm bg-base-200/50">
                                <p className="font-bold text-sm p-4">OUTLIERS</p>
                                <div className="px-2 py-1 m-2 overflow-y-auto max-h-32 h-16 min-w-fit w-fit">
                                    {data[selectedColumn].outliers?.join(", ") ?
                                        data[selectedColumn].outliers?.join(", ")
                                        :
                                        <><FontAwesomeIcon icon={faCheck} className="mr-2 text-secondary" />None</>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                :
                <div className="card-body flex flex-row items-center justify-center">
                    <><FontAwesomeIcon icon={faCheck} className="mr-1 text-secondary" />No outliers found</>
                </div>
            }

        </div >
    );
};

export default PotentialOutliersCard;
