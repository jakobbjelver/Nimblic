import TextVisualizationSkeleton from "./TextVisualizationSkeleton";
const TextAnalysisSkeleton = () => {

        return (
            <div className="flex flex-col items-center w-full rounded-xl shadow-md px-8 py-12 bg-base-200 fadeInUp">
                <div className="flex flex-row items-center justify-start w-full gap-3 px-10 mt-2 mb-2">
                    <h1 className="font-bold text-2xl mb-5">Text Analysis</h1>
                    <div className="flex items-center h-fit w-fit ml-80">
                        <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
                        <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
                    </div>
                </div>
                <div className="flex flex-wrap w-full justify-center items-center">
                    <div className="flex flex-col w-fit max-w-60 items-center justify-center py-4 px-2">
                        <div className="card w-fit overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Profile</h2>
                            </div>
                            <div className="skeleton w-[300px] h-[280px] bg-base-200"></div>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 py-4 px-2 gap-3">
                        <div className="card shadow-sm p-6 bg-base-300 w-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Sentiment Analysis</h2>
                            </div>
                            <div className="skeleton w-full h-[80px] bg-base-200"></div>
                        </div>
                        <div className="card shadow-sm p-6 bg-base-300 w-max min-w-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title text-md">Keywords</h2>
                            </div>
                            <div className="skeleton w-full h-[90px] bg-base-200"></div>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 py-4 px-2">
                        <div className="card shadow-sm p-6 bg-base-300 w-max min-w-full px-6">
                        <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Patterns</h2>
                            </div>
                        <div className="skeleton w-[200px] h-[280px] bg-base-200"></div>
                        </div>
                    </div>

                </div>
                <div className="w-full flex flex-row items-center justify-center mb-4">
                    <div className="card shadow-sm p-6 bg-base-300 w-full px-9">
                    <div className="skeleton w-full h-[40px] bg-base-200"></div>
                    </div>
                    <div className="card shadow-sm p-6 bg-base-300 w-full px-6 ml-4">
                    <div className="skeleton w-full h-[40px] bg-base-200"></div>
                    </div>
                </div>
                <TextVisualizationSkeleton/>
            </div>
        );
};

export default TextAnalysisSkeleton;