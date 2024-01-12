import React, { useState, useRef, useEffect, useContext, Suspense } from 'react';
import Dropdown from '../../../general/Dropdown';
import { truncateLabel } from 'src/utils/textFormat';
import { fromCamelToText } from 'src/utils/textFormat';
import TextAnalysisSkeleton from '../../../general/Skeletons/TextAnalysisSkeleton';
import TextVisualizationSkeleton from '../../../general/Skeletons/TextVisualizationSkeleton';
import CardMenu from '../../../general/CardMenu';


const TextAnalysis = ({ textData, profileData, isLoading }) => {
    const [columns, setColumns] = useState(null);

    const dropdownRef = useRef(null);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const TextVisualization = React.lazy(() => import('./TextVisualization'));

    useEffect(() => {
        if (textData && profileData && !isLoading) {
            setColumns(Object.keys(textData))
            setSelectedColumn(Object.keys(textData)[0])
        } 
    }, [textData, profileData, isLoading]); // Depend on currentData

    const handleColumnChange = (column) => {
        setSelectedColumn(column);
        if (dropdownRef.current) {
            dropdownRef.current.open = false;
        }
    };

    const renderSentimentAnalysis = () => {
        if (!textData[selectedColumn]) return (
            <div className="skeleton bg-300 w-[80px] h-[100px]">
            </div>
        )
        const sentimentAnalysisData = textData[selectedColumn].sentiment_analysis;

        if (!sentimentAnalysisData) return

        return (
            <div>
                <p><strong>Polarity</strong> {sentimentAnalysisData?.average_polarity.toFixed(4)}</p>
                <p><strong>Subjectivity</strong> {sentimentAnalysisData?.average_subjectivity.toFixed(4)}</p>
            </div>
        );
    };

    const renderTextComplexity = () => {
        if (!textData[selectedColumn]) return (
            <div className="skeleton bg-base-300 w-[500px] h-[40px]">
            </div>
        )
        const textComplexityData = textData[selectedColumn].text_complexity;

        if (!textComplexityData) return

        let value = Object.values(textComplexityData)[0]
        value = Math.max(0, value)
        value = Math.min(100, value)
        value = value.toFixed(0)
        return (
            <div>
                <div className="flex flex-row justify-between items-center mb-4">
                    <h2 className="card-title text-md mb-3">Text Complexity: {value}%</h2>
                    <CardMenu cardId={"sp_te_tc"}/>
                </div>
                <progress max="100" value={value} className="progress progress-primary w-full" disabled></progress>
            </div>
        );
    };

    const renderTextLength = () => {


        if (!textData[selectedColumn]) return (
            <div className="skeleton bg-base-300 w-[500px] h-[40px]">
            </div>
        )
        const textLengthData = textData[selectedColumn].text_length_analysis;

        if (!textLengthData) return

        const longest = textLengthData.longest_word
        const shortest = textLengthData.shortest_word
        const avg = textLengthData.average_word_length.toFixed(0)
        return (
            <div>
                <div className="flex flex-row items-center justify-between gap-4 mb-2">
                    <h2 className="card-title text-md">Text Length</h2>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <strong className="text-sm">AVERAGE</strong>
                        <p className="text-md">{avg} characters</p>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-evenly w-full h-8 gap-3">
                    <strong className="text-xs mr-2">LONGEST</strong><p className="text-xs"> {truncateLabel(longest)}</p>
                    <strong className="text-xs mr-2">SHORTEST</strong><p className="text-xs"> {truncateLabel(shortest)}</p>
                </div>
            </div>
        );
    };

    const renderPatterns = () => {
        if (!textData[selectedColumn]) return (
            <div className="skeleton bg-base-300 w-[180px] h-[250px]">
            </div>
        )
        const patternsAnalysisData = textData[selectedColumn].common_patterns;
        return (
            <>
                <div className="overflow-y-auto h-60">
                    <table className="table table-md ">
                        <tbody>
                            {patternsAnalysisData ?
                                Object.keys(patternsAnalysisData).length <= 0 ?
                                    <p>None</p>
                                    :
                                    Object.entries(patternsAnalysisData)?.map(([key, value], index) => (
                                        value !== 0 && renderValue(value) ?
                                            <tr key={index} className="border-b border-neutral">
                                                <td><strong>{fromCamelToText(key)}</strong></td>
                                                <td>{renderValue(value)}</td>
                                            </tr>
                                            : ''
                                    ))
                                : <p>None</p>
                            }
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const renderKeywords = () => {
        if (!textData[selectedColumn]) return (
            <div className="skeleton bg-base-300 w-[100px] h-[100px]">
            </div>
        )
        const keywordAnalysisData = textData[selectedColumn].keyword_extraction;

        return (
            <>
                <div className="overflow-y-auto h-16">
                    <table className="table table-md ">
                        <tbody>
                            {keywordAnalysisData ?
                                Object.keys(keywordAnalysisData).length <= 0 ?
                                    <p>None</p>
                                    :
                                    Object.entries(keywordAnalysisData)?.map(([key, value], index) => (
                                        value !== 0 && renderValue(value) ?
                                            <tr key={index} className="border-b border-neutral">
                                                <td><strong>'{key}'</strong></td>
                                                <td>{renderValue(value)}</td>
                                            </tr>
                                            : ''
                                    ))

                                :
                                <p>None</p>
                            }

                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const renderProfileCard = () => {
        if (!profileData[selectedColumn])
            return (
                <div className="skeleton bg-base-300 w-[200px] h-[250px]">
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

    if (!isLoading && textData) {
        if (textData === "No data" || Object.keys(textData).length == 0) {
            return <>
                <div className="w-full h-[400px] flex items-center justify-center text-xl">No text data</div>
            </>
        }

        return (
            <div className="flex flex-col items-center w-full rounded-xl shadow-md px-8 py-12 bg-base-200">
                <div className="flex flex-row items-center justify-start w-full gap-3 px-10">
                    <h1 className="font-bold text-2xl mb-5">Text Analysis</h1>
                    <div className="flex items-center h-fit w-fit ml-80">
                        <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
                        <Dropdown
                            ref={dropdownRef}
                            items={columns}
                            selectedItem={selectedColumn}
                            onChange={handleColumnChange}
                        />

                    </div>
                </div>
                <div className="flex flex-wrap w-full justify-center items-top">
                    <div className="flex flex-col w-fit max-w-60 items-start justify-center py-4 px-2">
                        <div className="card w-fit overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Profile</h2>
                                <CardMenu  cardId={"sp_te_pr"}/>
                            </div>
                            {renderProfileCard()}
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 py-4 px-2 gap-3">
                        <div className="card shadow-sm p-6 bg-base-300 w-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Sentiment Analysis</h2>
                                <CardMenu cardId={"sp_te_sa"}/>
                            </div>
                            {renderSentimentAnalysis()}
                        </div>
                        <div className="card shadow-sm p-6 bg-base-300 w-max min-w-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Keywords</h2>
                                <CardMenu  cardId={"sp_te_kw"}/>
                            </div>
                            {renderKeywords()}
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 py-4 px-2">
                        <div className="card shadow-sm p-6 bg-base-300 w-max min-w-full px-6">
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="card-title">Patterns</h2>
                                <CardMenu cardId={"sp_te_pa"}/>
                            </div>
                            {renderPatterns()}
                        </div>
                    </div>

                </div>
                <div className="w-full flex flex-row items-center justify-center mb-4">
                    <div className="card shadow-sm p-6 bg-base-300 w-full px-9">
                        {renderTextComplexity()}
                    </div>
                    <div className="card shadow-sm p-6 bg-base-300 w-full px-6 ml-4">
                        {renderTextLength()}
                    </div>
                </div>
                <Suspense fallback={
                    <TextVisualizationSkeleton />
                }>
                    <TextVisualization textData={textData} selectedColumn={selectedColumn} isLoading={isLoading} />
                </Suspense>
            </div>
        );
    } else {
        if (!textData) return
        return <TextAnalysisSkeleton />
    }
};

export default TextAnalysis;

const renderValue = (value) => {
    if (typeof value === 'number' && value) {
        return truncateLabel(value.toFixed(0).toString(), 10)
    } else if (typeof value === 'object' && value !== null) {
        // Join the object's values into a comma-separated list
        return Object.values(value).join(', ');
    } else {
        return value ? truncateLabel(value.toString(), 20) : '0';
    }
};