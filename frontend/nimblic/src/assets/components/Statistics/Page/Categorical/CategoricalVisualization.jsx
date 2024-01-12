import React, { useState, useRef, useEffect, useContext, Suspense } from 'react';
import Dropdown from '../../../general/Dropdown';
import { truncateLabel } from 'src/utils/textFormat';
import ThemeContext from '../../../general/Theme/ThemeContext';
import CardMenu from '../../../general/CardMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

const CategoricalVisualization = ({ categoricalData, selectedCategory, isLoading }) => {
    const [numericalCategories, setNumericalCategories] = useState(null);
    const [selectedNumericalColumn, setSelectedNumericalColumn] = useState(null);
    const dropdownNumericalRef = useRef(null);
    const dropdownSortRef = useRef(null);
    const boxPlotContainerRef = useRef(null);
    const barChartContainerRef = useRef(null);
    const [boxPlotWidth, setBoxPlotWidth] = useState(500);
    const [isNull, setNull] = useState(true);
    const [isDistributionLoading, setDistributionLoading] = useState(true);

    const { theme } = useContext(ThemeContext); // Use the context

    const [distributionValues, setDistributionValues] = useState(null);
    const [frequencyValues, setFrequencyValues] = useState(null);

    const [sortOrder, setSortOrder] = useState('Alphabetical'); // new state for sorting
    const [pagination, setPagination] = useState(0); // new state for sorting
    const [numItems, setNumItems] = useState(100); // new state for sorting
    const [maxNumItems, setMaxNumItems] = useState(100); // new state for sorting

    const [startIndex, setStartIndex] = useState(0); // new state for sorting
    const [endIndex, setEndIndex] = useState(0); // new state for sorting

    const ReactApexChart = React.lazy(() => import('react-apexcharts'));

    const scrollAmount = 200;
    

    // Handling initial data setup and null checks
    useEffect(() => {
        if (Object.keys(categoricalData).length > 0 && selectedCategory && !isLoading) {
            setPagination(0) //When new category, pageination is set to 0
            const categoryData = categoricalData[selectedCategory]?.hasOwnProperty('Distribution')
                ? categoricalData[selectedCategory]['Distribution']
                : categoricalData[Object.keys(categoricalData)[0]]['Distribution'];

            if (!categoryData) {

                setDistributionLoading(true)
            } else {
                setDistributionLoading(false)

                setNumericalCategories(Object.keys(categoryData));

                const numKeys = Object.values(categoryData)[0]
                const numItems = Object.keys(numKeys).length
                setMaxNumItems(numItems)
            }

            setNull(false);

        } else {

            setNull(true);
        }
    }, [categoricalData, selectedCategory, isLoading]);

    // Handling selectedNumericalColumn updates
    useEffect(() => {

        if(isDistributionLoading) return

        if (categoricalData[selectedCategory]) {
            const numericalColumn = selectedNumericalColumn ?? Object.keys(categoricalData[selectedCategory]['Distribution'])[0];
            setSelectedNumericalColumn(numericalColumn);
        }
    }, [categoricalData, selectedCategory, selectedNumericalColumn, isDistributionLoading]);

    // Sorting logic
    useEffect(() => {

        if(isDistributionLoading) {
            setNull(false)
            return
        }

        if (!isNull && categoricalData[selectedCategory]) {

            const distributionVals = categoricalData[selectedCategory]['Distribution'][selectedNumericalColumn];
            const frequencyVals = categoricalData[selectedCategory]['Frequency'];
            let mapping, sortedResult;
            if (sortOrder.includes('Frequency')) {
                mapping = createKeyMapping(frequencyVals, distributionVals);
                sortedResult = sortValues(frequencyVals, sortOrder, pagination, mapping);

                if (!sortedResult) {
                    //setNull(true)
                    return
                } else {
                    setNull(false)

                    setFrequencyValues(sortedResult.sortedDataset);
                    setDistributionValues(sortedResult.mappedDataset);
    
                    calculateWidth(sortedResult.sortedDataset);
                }

            } else {
                mapping = createKeyMapping(distributionVals, frequencyVals);
                sortedResult = sortValues(distributionVals, sortOrder, pagination, mapping);

                if (!sortedResult || isDistributionLoading) {
                    return
                } else {
                    setNull(false)

                    setFrequencyValues(sortedResult?.mappedDataset);
                    setDistributionValues(sortedResult?.sortedDataset);
    
                    calculateWidth(sortedResult.sortedDataset);
                }
            }



        }
    }, [isNull, categoricalData, selectedCategory, sortOrder, pagination, selectedNumericalColumn, isDistributionLoading]);


    function sortValues(dataset, sortOrder, paginationAmount, mapping) {
        if (!dataset) return dataset
        let entries = Object.entries(dataset); //Same keys for both distributionValues and frequencyValues, but different values

        switch (sortOrder) {
            case 'Median: Low to High': //I.e Only works with distributionValues
                // Using q50 as the median
                entries.sort((a, b) => a[1].q50 - b[1].q50);
                break;
            case 'Median: High to Low':
                // Using q50 as the median
                entries.sort((a, b) => b[1].q50 - a[1].q50);
                break;
            case 'IQR: Narrow to Wide':
                // Calculating IQR as q3 - q1
                entries.sort((a, b) => (a[1].q3 - a[1].q1) - (b[1].q3 - b[1].q1));
                break;
            case 'IQR: Wide to Narrow':
                // Calculating IQR as q3 - q1
                entries.sort((a, b) => (b[1].q3 - b[1].q1) - (a[1].q3 - a[1].q1));
                break;
            case 'Range: Small to Large':
                entries.sort((a, b) => (a[1].max - a[1].min) - (b[1].max - b[1].min));
                break;
            case 'Range: Large to Small':
                entries.sort((a, b) => (b[1].max - b[1].min) - (a[1].max - b[1].min));
                break;
            case 'Frequency: Fewest to Most':
                entries.sort((a, b) => a[1] - b[1]);
                break;
            case 'Frequency: Most to Fewest':
                entries.sort((a, b) => b[1] - a[1]);
                break;
            case 'Alphabetical':
                entries.sort((a, b) => a[0].localeCompare(b[0]));
                break;
        }
        const startIndex = Math.max(paginationAmount * 100, 0);
        const endIndex = Math.min(startIndex + 100, entries.length);

        setStartIndex(startIndex)
        setEndIndex(endIndex)

        entries = entries.slice(startIndex, endIndex);

        let sortedDataset = {};
        let sortedKeys = [];
        entries.forEach(([key, value]) => {
            sortedDataset[key] = value;
            sortedKeys.push(key);
        });

        let mappedDataset = {};
        if (mapping) {
            sortedKeys.forEach(key => {
                mappedDataset[key] = mapping[key];
            });
        }

        return { sortedDataset, sortedKeys, mappedDataset };
    }

    function createKeyMapping(firstDataset, secondDataset) {
        let mapping = {};
        if (firstDataset) {
            Object.keys(firstDataset).forEach(key => {
                mapping[key] = secondDataset[key];
            });
        }
        return mapping;
    }



    const calculateWidth = (distributionValues) => {
        // Calculate the width based on items
        if (!distributionValues) {
            return
        }
        const numKeys = Object.values(distributionValues)
        const numItems = Object.keys(numKeys).length

        setNumItems(numItems)

        const widthPerItem = 70; // Adjust this value as needed
        const calculatedWidth = numItems * widthPerItem;
        setBoxPlotWidth(calculatedWidth);
    }

    const updatePagination = (newPage) => {
        const maxPage = Math.ceil(maxNumItems / 100);
        if (newPage >= 0 && newPage < maxPage) {
            setPagination(newPage);
        }
    }

    const handleNumericalColumnChange = (numColumn) => {
        setSelectedNumericalColumn(numColumn);
        if (dropdownNumericalRef.current) {
            dropdownNumericalRef.current.open = false;
        }
    };

    const handleSortOrderChange = (order) => {
        setSortOrder(order);
        if (dropdownSortRef.current) {
            dropdownSortRef.current.open = false;
        }
    };

    const prevBoxSlide = () => {
        if (boxPlotContainerRef.current) {
            boxPlotContainerRef.current.scrollLeft -= scrollAmount;
        }
    };

    const nextBoxSlide = () => {
        if (boxPlotContainerRef.current) {
            boxPlotContainerRef.current.scrollLeft += scrollAmount;
        }
    };

    const prevBarSlide = () => {
        if (barChartContainerRef.current) {
            barChartContainerRef.current.scrollTop -= scrollAmount;
        }
    };

    const nextBarSlide = () => {
        if (barChartContainerRef.current) {
            barChartContainerRef.current.scrollTop += scrollAmount;
        }
    };

    const roundValue = (value) => {
        if (value === 0 || value == null) return 0
        return Math.round(value * 100) / 100;
    };
    const prepareBoxPlotData = (selectedNumericalColumn) => {
        if (!distributionValues) {
            return null
        };
        let allZero;

        // Use Object.entries to get both keys (category names) and values
        let formattedData = Object.entries(distributionValues).map(([categoryName, categoryData]) => {
            const valuesArray = [
                roundValue(categoryData.min),
                roundValue(categoryData.q25),
                roundValue(categoryData.q50),
                roundValue(categoryData.q75),
                roundValue(categoryData.max)
            ];

            // Check if all values are 0 or null
            allZero = valuesArray.every(value => value === null || value === 0);

            return {
                x: categoryName, // Use the key as the category name
                y: valuesArray
            };
        });

        if (allZero) {
            return null;
        } else {
            return [{
                name: selectedNumericalColumn,
                type: 'boxPlot',
                data: formattedData
            }];
        }
    };



    const getBoxPlotOptions = () => {

        if (!distributionValues) {
            return null
        }

        return {
            chart: {
                type: 'boxPlot',
                background: "#00000000",
                animations: {
                    enabled: false
                },
                toolbar: {
                    show: false // Disable the toolbar if not needed
                },
            },
            dataLabels: {
                enabled: false
            },
            colors: [theme !== 'dark' ? "#2b18b5" : "#9c8fff"], // Set your custom color
            title: {
                text: ''
            },
            plotOptions: {
                boxPlot: {
                    colors: {
                        upper: '#6865f7',
                        lower: '#F99417'
                    }
                }
            },
            theme: {
                mode: theme
            },
            fontFamily: 'Open Sans',
            stroke: {
                width: 1,
                colors: [theme !== 'dark' ? "#625f70" : "#93909e"]
            },
            xaxis: {
                type: 'category',
                categories: distributionValues,
                labels: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                }
            },
            grid: {
                show: true,
                borderColor: theme !== 'dark' ? "#a8a8a8" : "#4a4a4a"
            },
        };
    }

    const renderBoxPlot = () => {
        // Generate box plot data and options on the fly
        const boxPlotData = prepareBoxPlotData(selectedNumericalColumn);
        const boxPlotOptions = getBoxPlotOptions();

        if (!boxPlotData && !boxPlotOptions || isDistributionLoading) {
            return(
                <>
                <p>Processing in the background</p>
                <div className="skeleton w-full h-full"></div>
                </>
            )
        }

        if (!boxPlotOptions) {
            return null
        }
        return (
            <>
                {!boxPlotData ?
                    <div className="flex items-center justify-center w-full h-[250px]">
                        <p className="text-xl">No data</p>
                    </div>
                    :
                    <div className="tooltip tooltip-bottom" data-tip="Hover over a box plot to see the category value">
                        <div id="chart">
                            <div ref={boxPlotContainerRef} className="w-[450px] overflow-x-auto overflow-y-hidden scroll-smooth">
                                <Suspense fallback={
                                    <div className="skeleton w-full h-[300px] bg-base-200"></div>

                                }>
                                    <ReactApexChart
                                        options={boxPlotOptions}
                                        series={boxPlotData}
                                        type="boxPlot"
                                        width={boxPlotWidth}
                                        height={'300px'}
                                    />
                                </Suspense>
                                <div className="absolute flex justify-between transform -translate-y-1/2 left-[-40px] right-[-40px] bottom-1/3">
                                    <button onClick={() => prevBoxSlide()} className="btn btn-circle bg-base-100 shadow-md"><FontAwesomeIcon icon={faArrowLeft} /></button>
                                    <button onClick={() => nextBoxSlide()} className="btn btn-circle bg-base-100 shadow-md"><FontAwesomeIcon icon={faArrowRight} /></button>
                                </div>
                            </div>
                        </div>
                    </div>}
            </>
        );
    };

    const renderBarChart = () => {
        console.log("frequencyValues", frequencyValues)
        if (!frequencyValues) {
            return
        }

        // Chart options
        const options = {
            chart: {
                type: 'bar',
                background: "#00000000",
                animations: {
                    enabled: false
                },
                toolbar: {
                    show: false // Disable the toolbar if not needed
                },
            },
            colors: ["#6865f7"],
            xaxis: {
                categories: Object.keys(frequencyValues), // The category names are used for the x-axis
                axisBorder: {
                    show: false,
                },
                position: "top"
            },

            yaxis: {
                labels: {
                    show: false // Hide y-axis labels
                }
            },
            stroke: {
                width: 1,
                colors: "#00000000"
            },
            grid: {
                show: true,
                borderColor: theme !== 'dark' ? "#a8a8a8" : "#4a4a4a"
            },
            plotOptions: { bar: { horizontal: true } },
            dataLabels: {
                enabled: false,
                textAnchor: 'end', // Align data labels to the right

                style: {
                    colors: theme === 'dark' ? ['#b5b5b5'] : ['#3b3b3b']
                }

            },
            tooltip: {
                enabled: true,
                followCursor: true,
            },
            theme: {
                mode: theme === 'dark' ? 'dark' : 'light'
            },
            title: { text: '' },
            fill: {
                type: "gradient",
                gradient: {
                    shade: theme !== 'dark' ? "light" : "dark",
                    "shadeIntensity": 0.35,
                }
            },
        };

        // Series data
        const series = [{
            name: 'Frequency',
            data: Object.values(frequencyValues) // Frequency counts as data for the bars
        }];

        return (
            <div className="tooltip tooltip-bottom h-full" data-tip="Hover over a bar to see the category value">
                <div id="chart">
                    <div ref={barChartContainerRef} className="overflow-y-auto overflow-x-hidden h-[350px] scroll-smooth">
                        <Suspense fallback={
                            <div className="skeleton w-full h-[350px] bg-base-200"></div>
                        }>
                            <ReactApexChart
                                options={options}
                                series={series}
                                type="bar"
                                height={boxPlotWidth / 2}
                                width={'350px'} />
                        </Suspense>

                        <div className="absolute flex flex-col justify-between transform -translate-x-1/2 bottom-[10px] top-[-35px] left-1/2">
                            <button onClick={() => prevBarSlide()} className="btn btn-circle bg-base-100 shadow-md"><FontAwesomeIcon icon={faArrowUp} /></button>
                            <button onClick={() => nextBarSlide()} className="btn btn-circle bg-base-100 shadow-md"><FontAwesomeIcon icon={faArrowDown} /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    if (!isLoading) {
        if (isDistributionLoading) {
            return (
                <>
                <div className="divider divider-neutral w-[900px]"></div>
                <div className="skeleton w-full h-[400px] flex items-center gap-3 justify-center text-xl">
                    Frequency and Distribution analysis processing in the background
                    <div className="loading loading-spinner text-secondary"></div>
                    </div>
                </>
            )
        }
        if (isNull) {
            return (
                <>
                <div className="divider divider-neutral w-[900px]"></div>
                <div className="w-full h-[400px] flex items-center justify-center text-xl">No data for Frequency or Distribution analysis</div>
                </>
            )
        }
        return (
            <>
                <div className="divider divider-neutral w-[900px]"></div>
                <div className="flex flex-row w-full my-3">
                    <div className="card flex flex-row items-center justify-center shadow-sm pt-4 px-6 bg-base-300 w-fit h-fit">
                        <div className="flex items-center h-fit w-fit ml-6">
                            <h3 className="text-xs mr-1 mb-4 font-bold">SORT BY</h3>
                            <Dropdown
                                ref={dropdownSortRef}
                                items={[
                                    'Median: Low to High',
                                    'Median: High to Low',
                                    'IQR: Narrow to Wide',
                                    'IQR: Wide to Narrow',
                                    'Range: Small to Large',
                                    'Range: Large to Small',
                                    'Frequency: Fewest to Most',
                                    'Frequency: Most to Fewest',
                                    'Alphabetical'
                                ]}
                                selectedItem={sortOrder}
                                onChange={handleSortOrderChange}
                                height={600}
                                textLength={30}
                            />

                        </div>
                        <div className="flex items-center justify-center h-full w-fit ml-6 gap-2">
                            <h3 className="text-xs mr-1 mb-4 font-semibold">SHOWING VALUES</h3>
                            <button onClick={() => updatePagination(pagination - 1)} className="btn btn-circle btn-sm bg-base-100 shadow-none mb-4"><FontAwesomeIcon icon={faArrowLeft} /></button>
                            <h3 className="text-lg mr-1 mb-4 font-bold">{startIndex} – {endIndex}</h3>
                            <button onClick={() => updatePagination(pagination + 1)} className="btn btn-circle btn-sm bg-base-100 shadow-none mb-4"><FontAwesomeIcon icon={faArrowRight} /></button>
                            <h3 className="text-xs mr-1 mb-4 font-semibold flex items-center">OF {maxNumItems}</h3>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-1/2 items-center justify-center">
                    <div className="card shadow-sm p-6 bg-base-300 w-full mr-6 h-[500px]">
                        {isDistributionLoading ?
                            <>
                            <div className="flex flex-row justify-between items-center mb-4 px-6">
                                    <h2 className="card-title">Distribution</h2>
                                    <p>Loading in background</p>
                                    <div className="skeleton w-full h-full"></div> 
                            </div>
                            </>
                            :
                            <>
                                <div className="flex flex-row justify-between items-center mb-4 px-6">
                                    <h2 className="card-title">Distribution</h2>

                                    <div className="flex items-center justify-center h-full w-fit ml-6 gap-2">
                                        <button onClick={() => updatePagination(pagination - 1)} className="btn btn-circle btn-sm bg-base-100 shadow-none"><FontAwesomeIcon icon={faArrowLeft} /></button>
                                        <h3 className="text-lg mr-1 font-bold">{startIndex} – {endIndex}</h3>
                                        <button onClick={() => updatePagination(pagination + 1)} className="btn btn-circle btn-sm bg-base-100 shadow-none"><FontAwesomeIcon icon={faArrowRight} /></button>
                                        <h3 className="text-xs mr-1 font-semibold flex items-center">OF {maxNumItems}</h3>
                                    </div>
                                    <CardMenu cardId={'sp_ca_d'}/>
                                </div>
                                <div className="flex items-center h-fit w-fit ml-6">
                                    <h3 className="text-xs mr-1 mb-4 font-bold">NUMERICAL COLUMN</h3>
                                    <Dropdown
                                        ref={dropdownNumericalRef}
                                        items={numericalCategories}
                                        selectedItem={selectedNumericalColumn}
                                        onChange={handleNumericalColumnChange}
                                    />
                                </div>

                                {renderBoxPlot()}
                            </>
                        }


                    </div>
                </div>
                <div className="flex flex-col w-1/2 items-center justify-center">
                    <div className="card shadow-sm py-6 px-12 bg-base-300 w-full ml-6 h-[500px]">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <h2 className="card-title">Frequency</h2>
                            <CardMenu cardId={'sp_ca_f'}/>
                        </div>

                        {renderBarChart()}

                    </div>
                </div>
            </>
        );
    } else {
        return (
            <div className="w-full h-[500px]"></div>
        );
    }

};

export default CategoricalVisualization;
