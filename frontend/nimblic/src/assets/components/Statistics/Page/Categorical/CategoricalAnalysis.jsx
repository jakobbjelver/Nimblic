import React, { useState, useEffect, useContext, useLayoutEffect, Suspense } from 'react';
import Dropdown from '../../../general/Dropdown';
import { truncateLabel } from 'src/utils/textFormat';
import CardMenu from '../../../general/CardMenu';
import CategoricalAnalysisSkeleton from '../../../general/Skeletons/CategoricalAnalysisSkeleton';
import CategoricalVisualizationSkeleton from '../../../general/Skeletons/CategoricalVisualizationSkeleton';

const CategoricalAnalysis = ({ categoricalData, profileData, isLoading }) => {
    const [categories, setCategories] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isNull, setNull] = useState(true);
    const CategoricalVisualization = React.lazy(() => import('./CategoricalVisualization'));

    useEffect(() => {
        if (categoricalData && profileData && !isLoading) {
            if (Object.keys(categoricalData).length === 0) {
                setNull(true)
            } else {
                setCategories(Object.keys(categoricalData))
                setSelectedCategory(Object.keys(categoricalData)[0])
                setNull(false);
            }
        } else {
            setNull(true);
        }
    }, [categoricalData, profileData, isLoading]); // Depend on currentData

    const renderSimilarCategoriesTable = () => {
        if (!categoricalData[selectedCategory]) return

        const { 'Similar Categories': similarCategories } = categoricalData[selectedCategory];

        if(!similarCategories) return


        if (Object.keys(similarCategories).length <= 0) return (
            <div className="flex items-center justify-center text-center w-full h-full">
                <p className="text-lg">None</p>
            </div>
        );

        return (
            <table className="table-auto w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral">
                    <tr>
                        <th className="px-4 py-2">Category 1</th>
                        <th className="px-4 py-2">Category 2</th>
                        <th className="px-4 py-2">Similarity</th>
                    </tr>
                </thead>
                <tbody>
                    {similarCategories.map(([val1, val2, similarity], index) => (
                        <tr key={index} className="bg-base-300 border-b border-neutral">
                            <td className="px-4 py-2 font-medium">{val1}</td>
                            <td className="px-4 py-2 font-medium">{val2}</td>
                            <td className="px-4 py-2">{similarity.toFixed(2) * 100}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderProfileCard = () => {
        if (!profileData[selectedCategory]) return

        return (
            <table className="table table-md">
                <tbody>
                    {Object.entries(profileData[selectedCategory])?.map(([key, value], index) => (
                        value !== 'None' && renderValue(value) ?
                            <tr key={index} className="border-b border-neutral">
                                <td><strong>{key}</strong></td>
                                <td>{renderValue(value)}</td>
                            </tr>
                            : ''
                    ))}
                </tbody>
            </table>
        );
    };
    if (!isLoading) {
        if (isNull) {
            return (
                <>
                    <div className="flex flex-col items-center justify-center h-fit w-full gap-12 my-40">
                        <img src="/svg/not_found.svg" alt="Data not found" width="100" />
                        <p className="text-lg">Looks like we couldn't process any data for this analysis</p>
                    </div>
                </>
            )
        }
        return (
            <div className="flex flex-col items-center w-full rounded-xl shadow-md px-12 py-12 bg-base-200">
                <div className="flex flex-row items-center justify-start w-full gap-3 px-10">
                    <h1 className="font-bold text-2xl mb-5">Categorical Analysis</h1>
                    <div className="flex items-center h-fit w-fit ml-60">
                        <Dropdown
                            label={"column"}
                            items={categories}
                            selectedItem={selectedCategory}
                            onChange={setSelectedCategory}
                        />

                    </div>
                </div>
                <div className="flex flex-wrap w-full justify-center items-top">
                    <div className="flex flex-col w-1/3 items-start justify-center py-4">
                        <div className="card w-[350px] h-max overflow-auto shadow-sm p-6 bg-base-300">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Profile</h2>
                                <CardMenu cardId={'sp_ca_pr'} />
                            </div>
                            <div className="overflow-auto max-h-[310px]">
                                {renderProfileCard()}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-2/3 py-4 px-12">
                        <div className="card shadow-sm p-6 bg-base-300 w-full h-full ml-12">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Similar Categories</h2>
                                <CardMenu cardId={'sp_ca_sc'} />
                            </div>
                            <div className="overflow-auto max-h-[300px]">
                                {renderSimilarCategoriesTable()}
                            </div>
                        </div>
                    </div>
                    <Suspense fallback={
                        <CategoricalVisualizationSkeleton />
                    }>
                        <CategoricalVisualization categoricalData={categoricalData} selectedCategory={selectedCategory} isLoading={isLoading} />
                    </Suspense>
                </div>
            </div>
        );
    } else {
        return (
            <CategoricalAnalysisSkeleton />
        );
    }

};

const renderValue = (value) => {
    if (typeof value === 'number' && value) {
        return truncateLabel(value.toFixed(2).toString(), 10)
    } else if (typeof value === 'object' && value !== null) {
        // Join the object's values into a comma-separated list
        return Object.values(value).join(', ');
    } else {
        return value ? truncateLabel(value.toString(), 50) : '0';
    }
};

export default CategoricalAnalysis;
