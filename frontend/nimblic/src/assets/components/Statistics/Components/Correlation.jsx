import React, { useState } from 'react';
import Dropdown from '../../general/Dropdown';
import { truncateLabel } from 'src/utils/textFormat'; 

const Correlation = ({ spearmanData, pearsonData }) => {

    const [selectedCorrelation, setSelectedCorrelation] = useState('Spearman');
    const correlationItems = [];
    if (spearmanData) correlationItems.push('Spearman');
    if (pearsonData) correlationItems.push('Pearson');

    const getCorrelationData = () => {
        return selectedCorrelation === 'Spearman' ? spearmanData : pearsonData;
    };

    const correlationData = getCorrelationData();

    if (!spearmanData && !pearsonData) return null;

    return (
        <div className="card w-full shadow-sm p-4 bg-base-300 mx-1">
            <h2 className="card-title mb-4">Correlation</h2>
            <Dropdown
                items={correlationItems}
                selectedItem={selectedCorrelation}
                onChange={setSelectedCorrelation}
            />
            <div className="overflow-y-auto overflow-x-hidden h-52">
                <table className="table table-sm table-pin-rows">
                    <tbody>
                        {Object.entries(correlationData).map(([key, value], index) => (
                            <tr key={index} className="border-b border-base-300">
                                <td><strong>{truncateLabel(key, 10)}</strong></td>
                                <td>{typeof value === 'number' && value ? value.toFixed(2) : value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Correlation;
