import CardMenu from "../CardMenu";
const CategoricalVisualizationSkeleton = () => {
    return (
        <>
            <div className="divider divider-neutral w-[900px]"></div>
            <div className="flex flex-row 2-full my-3">
                <div className="card flex flex-row items-center justify-center shadow-sm pt-4 px-6 bg-base-300 w-[700px] h-fit">
                    <div className="flex items-center h-fit w-fit ml-6">
                        <h3 className="text-xs mr-1 mb-4 font-bold">SORT BY</h3>
                        <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>

                    </div>
                    <div className="skeleton w-[400px] h-[70px]"></div>
                </div>
            </div>
            <div className="flex flex-col w-1/2 items-center justify-center">
                <div className="card shadow-sm p-6 bg-base-300 w-full mr-6 h-[500px]">
                    <div className="flex flex-row justify-between items-center mb-4 px-6">
                        <h2 className="card-title">Distribution</h2>
                        <CardMenu />
                    </div>
                    <div className="flex items-center h-fit w-fit ml-6">
                        <h3 className="text-xs mr-1 mb-4 font-bold">NUMERICAL COLUMN</h3>
                        <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
                    </div>
                    <div className="skeleton h-[350px] w-full bg-base-200"></div>
                </div>
            </div>
            <div className="flex flex-col w-1/2 items-center justify-center">
                <div className="card shadow-sm py-6 px-12 bg-base-300 w-full ml-6 h-[500px]">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <h2 className="card-title">Frequency</h2>
                        <CardMenu />
                    </div>
                    <div className="skeleton w-[350px] h-full bg-base-200"></div>
                </div>
            </div>
        </>
    );

};

export default CategoricalVisualizationSkeleton;