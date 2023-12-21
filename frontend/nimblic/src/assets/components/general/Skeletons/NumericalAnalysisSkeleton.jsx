import CardMenu from "../CardMenu";
import NumericalVisualizationSkeleton from "./NumericalVisualizationSkeleton";
const NumericalSkeleton = () => {
    return (
        <div className="flex flex-col items-center w-full rounded-xl shadow-md px-12 py-14 bg-base-200 fadeInUp">
            <div className="flex flex-row items-center justify-start w-full gap-3 px-10">
                <h1 className="font-bold text-2xl mb-5">Numerical Analysis</h1>
                <div className="flex items-center h-fit w-fit ml-60">
                    <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
                    <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
                </div>
            </div>
            <div className="flex flex-wrap w-full justify-center items-top mt-[10px]">
                <div className="flex flex-col w-2/4 items-start justify-center py-4 px-2 h-[350px]">
                    <div className="card w-full h-full overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <h2 className="card-title">Profile</h2>
                        </div>
                        <div className="skeleton w-full h-full bg-base-200"></div>
                    </div>
                </div>
                <div className="flex flex-col w-1/4 py-4 px-2 gap-3">
                    <div className="card shadow-sm p-6 bg-base-300 w-full h-full px-6">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <h2 className="card-title">Normality Test</h2>
                        </div>
                        <div className="skeleton w-full h-full bg-base-200"></div>
                    </div>
                    <div className="card shadow-sm p-6 bg-base-300 w-full px-6">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <h2 className="card-title text-md">Skewness & Kurtosis</h2>
                        </div>
                        <div className="skeleton w-full h-full bg-base-200"></div>
                    </div>
                </div>
                <div className="flex flex-col w-1/4 py-4 px-2">
                    <div className="card shadow-sm p-6 bg-base-300 w-full h-full px-6">
                        <div className="skeleton w-full h-full bg-base-200"></div>
                    </div>
                </div>
                <NumericalVisualizationSkeleton/>
            </div>
        </div>
    );

};

export default NumericalSkeleton;