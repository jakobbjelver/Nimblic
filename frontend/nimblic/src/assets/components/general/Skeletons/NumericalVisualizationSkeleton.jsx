import CardMenu from "../CardMenu";
const NumericalVisualizationSkeleton = () => {
    return (
        <div className="flex flex-row justify-center items-center gap-6 px-12">
            <div className="card shadow-sm p-6 bg-base-300 w-full ml-6 h-[570px]">
                <div className="flex flex-row justify-between items-center mb-4 px-6">
                    <h2 className="card-title">Principal Component Analysis</h2>
                    <CardMenu />
                </div>
                <div className="skeleton w-[400px] h-[450px] bg-base-200"></div>
            </div>
            <div className="card shadow-sm p-6 bg-base-300 w-full mr-6 h-[570px]">
                <div className="flex flex-row justify-between items-center mb-4 px-6">
                    <h2 className="card-title">Linear Regression</h2>
                    <CardMenu />
                </div>
                <div className="flex items-center h-fit w-fit ml-6 my-2">
                    <h3 className="text-xs mr-1 mb-4 font-bold">DEPENDENT</h3>
                    <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
                </div>

                <div className="flex items-center h-8 w-fit ml-6 mb-6">

                    <h3 className="text-xs mr-1 mb-4 font-bold">INDEPENDENT</h3>
                    <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
                </div>
                <div className="skeleton w-[400px] h-[330px] bg-base-200"></div>
            </div>
        </div>
    );

};

export default NumericalVisualizationSkeleton;