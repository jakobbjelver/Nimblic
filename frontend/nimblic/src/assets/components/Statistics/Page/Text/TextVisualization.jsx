import React, { useState, useEffect, useContext, Suspense } from 'react';
import ThemeContext from '../../../general/Theme/ThemeContext';
import CardMenu from '../../../general/CardMenu';
import ISO6391 from 'iso-639-1';

const TextVisualization = ({ textData, selectedColumn }) => {
    const { theme } = useContext(ThemeContext); // Use the context
    const [chartView, setChartView] = useState('patterns'); // 'patterns' or 'keywords'
    const [stackedSeries, setStackedSeries] = useState(null); // 'patterns' or 'keywords'
    const [doughnutSeries, setDoughnutSeries] = useState(null); // 'patterns' or 'keywords'
    const [wordCloudData, setWordCloudData] = useState([]);
    const ApexCharts = React.lazy(() => import('react-apexcharts'))
    const ReactWordcloud = React.lazy(() => import('react-wordcloud'))

    useEffect(() => {
        if (chartView === 'keywords') {
            const transformedData = transformKeywordsData();
            setWordCloudData(transformedData);
        } else {
            const stackedData = transformStackedData(chartView);
            setStackedSeries(stackedData);
            stackedOptions.xaxis.categories = stackedData.categories;
        }

        const doughnutData = transformDoughnutData();
        setDoughnutSeries(doughnutData);
        doughnutOptions.labels = doughnutData.labels;
    }, [chartView, textData, selectedColumn]);


    const formatKey = (key) => {
        return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const transformKeywordsData = () => {
        let words = [];
        Object.entries(textData).forEach(([columnName, columnData]) => {
            Object.entries(columnData.keyword_extraction).forEach(([keyword, count]) => {
                words.push({ text: keyword, value: count });
            });
        });
        return words;
    };


    const transformStackedData = (viewType) => {
        let seriesData = [];
        let categories = [];

        Object.entries(textData).forEach(([columnName, columnData]) => {
            let dataPoints = [];

            categories = Object.keys(columnData.common_patterns).map(formatKey);
            dataPoints = Object.values(columnData.common_patterns);

            seriesData.push({ name: columnName, data: dataPoints });
        });

        return { series: seriesData, categories: categories };
    };

    const transformDoughnutData = () => {
        if (!textData[selectedColumn] || !textData[selectedColumn].language_detection) {
            return { series: [], labels: [] };
        }

        const languageData = textData[selectedColumn].language_detection;
        let series = [];
        let labels = [];

        if(!languageData) {
            return { series: [], labels: [] };
        }

        Object.entries(languageData).forEach(([languageCode, value]) => {
            const languageName = ISO6391.getName(languageCode);
            labels.push(languageName);
            series.push(value);
        });

        return { series: series, labels: labels };
    };

    // Chart options and series for stacked bar chart
    const stackedOptions = {
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: {
                show: false
            },
            background: "#00000000",
            animations: {
                enabled: false
            },
        },
        fontFamily: 'Open Sans',
        plotOptions: {
            bar: {
                horizontal: false,
            },
        },
        xaxis: {
            categories: stackedSeries?.categories,
            title: {
                text: '',
                style: {
                    colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            },
            labels: {
                show: true,
            },
        },
        yaxis: {
            title: {
                text: '',
                style: {
                    colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        },
        dataLabels: {
            enabled: false
        },
        theme: {
            mode: theme
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 300,
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        grid: {
            show: true,
            borderColor: theme !== 'dark' ? "#d1d1d1" : "#4a4a4a"
        },
    };

    // Chart options and series for doughnut chart
    const doughnutOptions = {
        chart: {
            type: 'donut',
            background: "#00000000",
            animations: {
                enabled: false
            },
        },
        labels: doughnutSeries?.labels,
        dataLabels: {
            enabled: false
        },
        theme: {
            mode: theme
        },
        fontFamily: 'Open Sans',
        legend: {
            position: 'bottom'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                        },
                        value: {
                            show: true,
                        }
                    }
                }
            }
        }
    };

    const wordCloudOptions = {
        rotations: 3,
        rotationAngles: [0, 90],
        enableTooltip: true,
        fontSizes: [25, 60],
        fontFamily: "Open Sans, sans-serif", // Include a bold font if available
        scale: "sqrt",
        spiral: "archimedean",
        deterministic: false,
        padding: 1,
        tooltipOptions: {
            theme: theme === 'dark' ? 'dark' : 'light',
        },
        colors: [
            '#6a0dad', // Purple colors
            '#9b59d0',
            '#b19cd9',
            '#3f00ff', // Blue colors
            '#5e60ce',
            '#5390d9'
        ]
    };

    // Additional CSS for tooltips (you might need to adjust based on your actual tooltip implementation)
    const tooltipStyles = {
        borderColor: theme !== 'dark' ? "#d1d1d1" : "#4a4a4a",
        backgroundColor: theme !== 'dark' ? "#ffffff" : "#333333",
        color: theme !== 'dark' ? "#333333" : "#ffffff"
    };

    useEffect(() => {
        const tooltips = document.querySelectorAll('.wordcloud-tooltip');
        tooltips.forEach(tooltip => {
            if (theme === 'dark') {
                tooltip.classList.add('dark-theme');
            } else {
                tooltip.classList.remove('dark-theme');
            }
        });
    }, [theme]); 
    

    // Handlers for radio buttons
    const handleViewChange = (viewType) => {
        setChartView(viewType);
    };

    return (
        <div className="flex flex-row items-center justify-evenly h-[500px] w-full">
            <div className="card shadow-sm p-6 bg-base-300 w-1/2 max-w-lg h-full mr-4">
                <div className="flex justify-between items-center mb-6 mt-4 px-4">
                    <div className="join mr-10">
                        <input
                            className="join-item btn btn-sm bg-base-200 w-36 z-[2]"
                            type="radio"
                            name="viewType"
                            aria-label="Patterns"
                            checked={chartView === 'patterns'}
                            onChange={() => handleViewChange('patterns')}
                        />
                        <input
                            className="join-item btn btn-sm bg-base-200 w-36 z-[2]"
                            type="radio"
                            name="viewType"
                            aria-label="Keywords"
                            checked={chartView === 'keywords'}
                            onChange={() => handleViewChange('keywords')}
                        />
                    </div>
                    <CardMenu cardId={chartView === 'keywords' ? 'sp_te_kwc' : 'sp_te_wc'}/>
                </div>
                <Suspense fallback={<div className="skeleton w-full h-[450px] bg-base-200"></div>}>
                    {chartView === 'patterns' && stackedSeries ?
                        <ApexCharts
                            options={stackedOptions}
                            series={stackedSeries.series}
                            type="bar"
                            height="365"
                            width="450"
                        />
                        :
                        chartView === 'keywords' && stackedSeries ?
                            <ReactWordcloud words={wordCloudData} options={wordCloudOptions} />
                            :
                            <div className="skeleton w-full h-[450px]  bg-base-200"></div>
                    }

                </Suspense>

            </div>
            <div className="card shadow-sm p-6 bg-base-300 w-[500px] h-full">
                <div className="w-full flex flex-row items-center justify-between mb-2">
                    <h3 className="card-title">Language Distribution</h3>
                    <CardMenu cardId={'sp_te_ld'}/>
                </div>
                <div className="flex flex-row items-center justify-start mb-6 w-full">
                    <h3 className="text-xs font-bold mr-4 ml-4">COLUMN</h3>
                    <div className="rounded-2xl border-primary/60 border-2 bg-primary/50 px-2">
                        <h3 className="text-md text-white mb-1">{selectedColumn}</h3>
                    </div>
                </div>
                <Suspense fallback={<div className="skeleton w-full h-[350px]  bg-base-200"></div>}>
                    {doughnutSeries ?
                        <ApexCharts
                            options={doughnutOptions}
                            series={doughnutSeries.series}
                            type="donut"
                            height="350"
                            width="450"
                            className="left-0 right-0 mx-auto my-auto"
                        />
                        : <div className="skeleton w-full h-[350px] bg-base-200"></div>
                    }
                </Suspense>
            </div>
        </div>
    );
};

export default TextVisualization;
