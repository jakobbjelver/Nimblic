const TextVisualizationSkeleton = () => {

    return (
        <div className="flex flex-row items-center justify-between h-[500px] w-full">
            <div className="card shadow-sm p-6 bg-base-300 w-1/2 h-full mr-4">
                <div className="flex justify-between items-center mb-6 mt-4 px-4">
                <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 w-[200px] font-semibold bg-neutral"></div>
                </div>
                <div className="skeleton w-full h-[350px] bg-base-200"></div>
            </div>
            <div className="card shadow-sm p-6 bg-base-300 w-[500px] h-full">
                <div className="w-full flex flex-row items-center justify-between mb-2">
                    <h3 className="card-title">Language Distribution</h3>
                </div>
                <div className="flex flex-row items-center justify-start mb-6 w-full">
                    <h3 className="text-xs font-bold mr-4 ml-4">COLUMN</h3>
                    <div className="skeleton rounded-2xl border-primary/60 border-2 bg-primary/50 px-2">
                        <h3 className="text-md text-white mb-1 h-5 w-20"></h3>
                    </div>
                </div>
                <div className="skeleton w-full h-[350px] bg-base-200"></div>
            </div>
        </div>
    );
};

export default TextVisualizationSkeleton;
