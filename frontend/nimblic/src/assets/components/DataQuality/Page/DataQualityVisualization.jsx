import React, { useState, useEffect, useContext, Suspense } from 'react';
import ThemeContext from '../../general/Theme/ThemeContext';
import CardMenu from '../../general/CardMenu';

const DataQualityVisualization = ({ qualityData, selectedColumn }) => {
    const { theme } = useContext(ThemeContext);
    const [stackedSeries, setStackedSeries] = useState([null]);
    const [radialSeries, setRadialSeries] = useState(null);
    const ApexCharts = React.lazy(() => import('react-apexcharts'))

    useEffect(() => {
        const stackedData = transformStackedData(qualityData.privacy_assessment);
        setStackedSeries(stackedData);

        const radialData = transformDoughnutData(qualityData.redundancy_analysis, selectedColumn);
        setRadialSeries(radialData);
    }, [qualityData, selectedColumn]);

    const formatKey = (key) => {
        return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toUpperCase())
            .join(' ');
    };
    


    const transformStackedData = (privacyData) => {
        if (!privacyData) return;
    
        let seriesData = [];
        let categories = Object.keys(privacyData); // X-axis categories
    
        // Create a map to hold sum of values for each subcategory across all categories
        let subcategorySums = {};
    
        categories.forEach(category => {
            Object.entries(privacyData[category]).forEach(([subcategory, value]) => {
                if (!subcategorySums[subcategory] || subcategorySums[subcategory] == 0) {
                    subcategorySums[subcategory] = [];
                }
                subcategorySums[subcategory].push(value);
            });
        });
    
        // Convert the sums into series data for ApexCharts
        for (let [subcategory, values] of Object.entries(subcategorySums)) {
            seriesData.push({ name: formatKey(subcategory), data: values });
        }
    
        return { series: seriesData, categories: categories };
    };
    

    const transformDoughnutData = (redundancyData, column) => {
        if(!redundancyData) return
        
        if (!redundancyData[column]) {
            return { series: [], labels: [] };
        }

        const columnData = redundancyData[column];
        return { series: [columnData.redundancy_rate], labels: [column] };
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

    // Chart options for radial bar chart
    const radialOptions = {
        chart: {
            type: 'radialBar',
            background: "#00000000",
            animations: {
                enabled: false
            },
        },
        colors: ['#6865f7'],
        labels: radialSeries?.labels,
        dataLabels: {
            enabled: true,
        },
        theme: {
            mode: theme
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                track: {
                    background: "rgba(102, 100, 247, 0.1)"
                },
                dataLabels: {
                    name: {
                        show: true,
                    },
                    value: {
                        show: true,
                        formatter: function (val) {
                            return val.toFixed(1) + '%';
                        }
                    }
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 300
                }
            }
        }]
    };

    return (
        <div className="card shadow-md bg-base-200 flex flex-row items-top w-[850px] justify-center">
        <div className=" p-6 w-1/2 max-w-4xl h-[500px] mr-4">
                <div className="flex justify-between items-center mb-6 mt-4 px-4">
                    <h3 className="card-title">PII Distribution</h3>
                    <CardMenu cardId={'dqp_piid'}/>
                </div>
                {stackedSeries && stackedSeries.series ?
                    <Suspense fallback={ <div className="skeleton w-[385] h-[400px] bg-base-300"></div>}>
                        <ApexCharts
                            options={stackedOptions}
                            series={stackedSeries.series}
                            type="bar"
                            height="365"
                            width="385"
                        />

                    </Suspense>
                    :
                    <div className="skeleton w-[385px] h-[400px] bg-base-300"></div>
                }
            </div>
            <div className="p-6 w-1/2 max-w-lg h-[500px]">
                <div className="w-full flex flex-row items-center justify-between mb-2">
                    <h3 className="card-title">Redundancy Rate</h3>
                    <CardMenu />
                </div>
                <div className="flex flex-row items-center justify-start mb-6 w-full">
                    <div className="badge badge-outline badge-secondary text-[16px] px-4 py-3">
                    {selectedColumn}                    
                    </div>
                </div>
                <Suspense fallback={ <div className="skeleton w-[385px] h-[300px] bg-base-300"></div>}>
                {radialSeries && radialSeries.series ?
                        <ApexCharts
                            options={radialOptions}
                            series={radialSeries.series}
                            type="radialBar"
                            height="350"
                            width="385"
                            className="left-0 right-0 mx-auto my-auto"
                        />
                        : <div className="skeleton w-[300px] h-[385px] bg-base-300"></div>
                    }
                </Suspense>
            </div>
        </div>
    );
};

export default DataQualityVisualization;
