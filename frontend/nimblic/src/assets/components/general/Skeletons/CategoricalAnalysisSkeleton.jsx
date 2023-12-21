import CardMenu from "../CardMenu";
import CategoricalVisualizationSkeleton from "./CategoricalVisualizationSkeleton";
const CategoricalAnalysisSkeleton = () => {
        return (
            <div className="flex flex-col items-center w-full rounded-xl shadow-md px-12 py-12 bg-base-200 fadeInUp">
                <div className="flex flex-row items-center justify-start w-full gap-3 px-10 mt-2 mb-2">
                    <h1 className="font-bold text-2xl mb-5">Categorical Analysis</h1>
                    <div className="flex items-center h-fit w-fit ml-60">
                        <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
                        <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
                    </div>
                </div>
                <div className="flex flex-wrap w-full justify-center items-top">
                    <div className="flex flex-col w-1/3 items-start justify-center py-4">
                        <div className="card w-[350px] h-max overflow-auto shadow-sm p-6 bg-base-300">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Profile</h2>
                                <CardMenu />
                            </div>
                            <div className="skeleton w-full h-[300px] bg-base-200"></div>
                        </div>
                    </div>
                    <div className="flex flex-col w-2/3 py-4 px-12">
                        <div className="card shadow-sm p-6 bg-base-300 w-full h-full ml-12">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Similar Categories</h2>
                                <CardMenu />
                            </div>
                            <div className="skeleton w-full h-[300px] bg-base-200"></div>
                        </div>
                    </div>
                    <CategoricalVisualizationSkeleton/>
                </div>
            </div>
        );
    
};

export default CategoricalAnalysisSkeleton;