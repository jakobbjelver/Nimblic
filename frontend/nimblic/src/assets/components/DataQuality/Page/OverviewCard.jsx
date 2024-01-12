import React from 'react';
import { formatBytes } from 'src/utils/fileUtil';
import CardMenu from '../../general/CardMenu'

const OverviewCard = ({ summary, selectedColumn }) => {

    return (
        <div className="card bg-base-300 shadow-sm m-4 p-6 max-h-52 w-fit fadeInUp">
            <div className="flex flex-row justify-between items-center">
                <h2 className="card-title">Column overview</h2>
                <CardMenu cardId={'dqp_co'}/>
            </div>
            <div className="badge badge-ghost mx-2">{selectedColumn}</div>
            <div className="card-body px-0 py-0">
                <table className="table table-lg w-fit text-center">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Missing Values</th>
                            <th>Memory Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.column_types[selectedColumn] ? (
                            <tr>
                                <td>{summary.column_types[selectedColumn]}</td>
                                <td>{summary.basic_info.missing_values[selectedColumn]}</td>
                                <td>{formatBytes(summary.memory_usage[selectedColumn])}</td>
                            </tr>
                        ) : <tr><td colSpan="3">No data</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OverviewCard;
