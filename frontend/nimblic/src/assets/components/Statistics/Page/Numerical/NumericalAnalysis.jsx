import React, { useState, useEffect, Suspense } from 'react';
import Dropdown from '../../../general/Dropdown';
import { truncateLabel } from 'src/utils/textFormat';
import NumericalVisualizationSkeleton from '../../../general/Skeletons/NumericalVisualizationSkeleton';
import NumericalAnalysisSkeleton from '../../../general/Skeletons/NumericalAnalysisSkeleton';
import CardMenu from '../../../general/CardMenu';

const NumericalAnalysis = ({ numericalData, profileData, isLoading }) => {
    const [columns, setColumns] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const NumericalVisualization = React.lazy(() => import('./NumericalVisualization'));

    useEffect(() => {

        if (numericalData && profileData && !isLoading) {
            const analyses = Object.values(numericalData)

            const keys = Object.values(analyses)[0]

            setColumns(Object.keys(keys))

            console.log("Object.keys(keys)", Object.keys(keys).length)
            setSelectedColumn(Object.keys(keys)[0])
        }
    }, [numericalData, profileData, isLoading]); // Depend on currentData

    const renderNormalityTest = () => {
        const normalityTestData = numericalData.normality_test[selectedColumn];
        if (!numericalData.normality_test[selectedColumn]) return (
            <div className="flex items-center justify-center w-full h-[150px]">
                <span className="loading loading-spinner loading-lg text-secondary"></span>
            </div>
        )
        return (
            <div>
                <p><strong>p-value:</strong> {normalityTestData?.p_value.toFixed(4)}</p>
                <p><strong>Statistic:</strong> {normalityTestData?.statistic.toFixed(4)}</p>
            </div>
        );
    };

    const renderOutliersDetection = () => {
        if (!numericalData.outliers_detection[selectedColumn]) return (
            <div className="flex items-center justify-center w-full h-[300px]">
                <span className="loading loading-spinner loading-lg text-secondary"></span>
            </div>
        )
        const outliersData = numericalData.outliers_detection[selectedColumn];
        return (
            <>
                <div className="flex flex-row justify-between items-center mb-4">
                    <div className="flex flex-row gap-1 text-center">
                        <h2 className="card-title">Outliers</h2>
                        <h3 className="font-light">({outliersData.length})</h3>
                    </div>
                    <CardMenu cardId="sp_nu_o" />
                </div>
                <div className="overflow-y-auto h-60">
                    <p>{outliersData?.join(", ") ? outliersData?.join(", ") : 'None'}</p>
                </div>
            </>
        );
    };

    const renderSkewnessKurtosis = () => {
        if (!numericalData.skewness_kurtosis[selectedColumn]) return (
            <div className="flex items-center justify-center w-full h-[150px]">
                <span className="loading loading-spinner loading-lg text-secondary"></span>
            </div>
        )
        const skewKurtData = numericalData.skewness_kurtosis[selectedColumn];
        return (
            <div>
                <p><strong>Skewness:</strong> {skewKurtData?.skewness.toFixed(2)}</p>
                <p><strong>Kurtosis:</strong> {skewKurtData?.kurtosis.toFixed(2)}</p>
            </div>
        );
    };

    const renderProfileCard = () => {
        if (!profileData[selectedColumn])
            return (
                <div className="flex items-center justify-center w-40 h-[300px]">
                    <span className="loading loading-spinner loading-lg text-secondary"></span>
                </div>
            )
        return (
            <div className="overflow-y-auto h-60">
                <table className="table table-md ">
                    <tbody>
                        {Object.entries(profileData[selectedColumn])?.map(([key, value], index) => (
                            value !== 'None' && renderValue(value) ?
                                <tr key={index} className="border-b border-neutral">
                                    <td><strong>{key}</strong></td>
                                    <td>{renderValue(value)}</td>
                                </tr>
                                : ''
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (!isLoading && numericalData && columns.length > 0) {
        return (
            <div className="flex flex-col items-center w-full rounded-xl shadow-md px-12 py-12 bg-base-200">
                <div className="flex flex-row items-center justify-start w-full gap-3 px-10">
                    <h1 className="font-bold text-2xl mb-5">Numerical Analysis</h1>
                    <div className="flex items-center h-fit w-fit ml-60">
                        <Dropdown
                            label={"column"}
                            items={columns}
                            selectedItem={selectedColumn}
                            onChange={setSelectedColumn}
                        />

                    </div>
                </div>
                <div className="flex flex-wrap w-full justify-center items-top">
                    <div className="flex flex-col w-1/2 items-start justify-center py-4 px-2">
                        <div className="card w-full h-full overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Profile</h2>
                                <CardMenu cardId={"sp_nu_pr"} />
                            </div>
                            {renderProfileCard()}
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 py-4 px-2 gap-3">
                        <div className="card shadow-sm p-6 bg-base-300 w-full h-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Normality Test</h2>
                                <CardMenu cardId={"sp_nu_nt"} />
                            </div>
                            {renderNormalityTest()}
                        </div>
                        <div className="card shadow-sm p-6 bg-base-300 w-full h-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title text-md">Skewness & Kurtosis</h2>
                                <CardMenu cardId={"sp_nu_sk"} />
                            </div>
                            {renderSkewnessKurtosis()}
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 py-4 px-2">
                        <div className="card shadow-sm p-6 bg-base-300 w-full h-full px-6">
                            {renderOutliersDetection()}
                        </div>
                    </div>
                    <Suspense fallback={
                        <NumericalVisualizationSkeleton />
                    }>
                        <NumericalVisualization numericalData={numericalData} isLoading={isLoading} />
                    </Suspense>

                </div>
            </div>
        );
    } else {
        if (columns.length <= 0) {
            return (
                <div className="flex flex-col items-center justify-center h-fit w-full gap-12 my-40">
                    <img src="/svg/not_found.svg" alt="Data not found" width="100" />
                    <p className="text-lg">Looks like we couldn't process any data for this analysis</p>
                </div>
            )
        }
        return <NumericalAnalysisSkeleton />
    }
};

export default NumericalAnalysis;

const renderValue = (value) => {
    if (typeof value === 'number' && value) {
        return truncateLabel(value.toFixed(2).toString(), 10)
    } else if (typeof value === 'object' && value !== null) {
        // Join the object's values into a comma-separated list
        return Object.values(value).join(', ');
    } else {
        return value ? truncateLabel(value.toString(), 30) : '0';
    }
};