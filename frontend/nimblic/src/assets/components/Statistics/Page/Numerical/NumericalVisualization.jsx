import React, { useState, useRef, useEffect, useContext, Suspense } from 'react';
import ThemeContext from '../../../general/Theme/ThemeContext';
import CardMenu from '../../../general/CardMenu';
import Dropdown from '../../../general/Dropdown';
import { truncateLabel } from 'src/utils/textFormat';

const NumericalVisualization = ({ numericalData }) => {
    // Extract PCA and regression data from props
    const pcaData = numericalData.principal_component_analysis;
    const regressionData = numericalData.regression_analysis;
    const { theme } = useContext(ThemeContext); // Use the context

    if(pcaData == 'None') return
    if(regressionData == 'None') return

    const ApexCharts = React.lazy(() => import('react-apexcharts'))
    // Transform PCA data
    const transformedPCAData = pcaData.principal_components[0].map((val, index) => ({
        x: val,
        y: pcaData.principal_components[1][index]
    })).filter(point => point.y !== null);

    const pcaSeries = [{
        name: 'Observations',
        data: transformedPCAData
    }];

    // Transform Regression data
    const actualValuesSeries = regressionData.actual_values
        .map((y, i) => ({ x: i, y }))
        .filter(point => point.y !== null);

    const predictedValuesSeries = regressionData.predicted_values
        .map((y, i) => ({ x: i, y }))
        .filter(point => point.y !== null);

    const regressionSeries = [
        {
            name: 'Actual Values',
            type: 'scatter',
            data: actualValuesSeries
        },
        {
            name: 'Predicted Values',
            type: 'line',
            data: predictedValuesSeries
        }
    ];


    // Chart options for PCA
    const pcaOptions = {
        chart: {
            type: 'scatter',
            background: "#00000000",
            animations: {
                enabled: false
            },
            zoom: {
                enabled: true,
                type: 'xy'
            },
            toolbar: {
                show: false
            },
        },
        markers: {
            size: [4, 0],
            strokeColors: "#7952f7",
            strokeOpacity: 0.65,
            fillOpacity: 0.8,
            strokeWidth: 0.5, // Width of the border
        },
        dataLabels: {
            enabled: false
        },
        colors: ["#7952f7"], // Set your custom color
        theme: {
            mode: theme
        },
        fontFamily: 'Open Sans',
        xaxis: {
            title: {
                text: 'Principal Component 1',
                style: {
                    fontFamily: "Open Sans",
                    color: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            },
            tickAmount: 10,
            labels: {
                formatter: function (val) {
                    return parseFloat(val).toFixed(1)
                },
                style: {
                    colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            }
        },
        yaxis: {
            title: {
                text: 'Principal Component 2',
                style: {
                    fontFamily: "Open Sans",
                    color: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            },
            tickAmount: 10,
            labels: {
                formatter: function (val) {
                    return parseFloat(val).toFixed(1)
                },
                style: {
                    colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            }
        },
        grid: {
            show: true,
            borderColor: theme !== 'dark' ? "#d1d1d1" : "#4a4a4a"
        },
    };

    // Regression Chart Options
    const regressionOptions = {
        chart: {
            height: 350,
            type: 'mixed',
            toolbar: {
                show: false // Disable the toolbar if not needed
            },
            background: "#00000000",
            animations: {
                enabled: false
            },
        },
        dataLabels: {
            enabled: false
        },
        colors: ["#F99417", "#7952f7"], // Set your custom color
        theme: {
            mode: theme
        },
        fontFamily: 'Open Sans',
        xaxis: {
            title: { text: '' },
            type: 'numeric',
            tickAmount: 10,
            labels: {
                formatter: function (val) {
                    return parseFloat(val).toFixed(0)
                },
                style: {
                    colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            }
        },
        yaxis: {
            tickAmount: 10,
            labels: {
                formatter: function (val) {
                    return parseFloat(val).toFixed(0)
                },
                style: {
                    colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                }
            }
        },
        stroke: {
            width: [0, 2]
        },
        markers: {
            size: [5, 0],
            strokeColors: theme === 'dark' ? "#171717" : "#ebebeb", // Border color
            strokeOpacity: 0.65,
            fillOpacity: 0.8,
            strokeWidth: 0.5, // Width of the border
        },
        tooltip: {
            show:true,
            shared: true,
            intersect: false
        },
        legend: {
            show: false
        },
        grid: {
            show: true,
            borderColor: theme !== 'dark' ? "#d1d1d1" : "#4a4a4a"
        },
    };

    return (
        <div className="flex flex-row justify-center items-center gap-6 px-12">
            <div className="card shadow-sm p-6 bg-base-300 w-full ml-6 h-[570px]">
                <div className="flex flex-row justify-between items-center mb-4 px-6">
                    <h2 className="card-title">Principal Component Analysis</h2>
                    <CardMenu  cardId={"pca"}/>
                </div>
                <Suspense fallback={
                    <div className="skeleton w-[400px] h-[450px]"></div>
                }>
                    <ApexCharts
                        options={pcaOptions}
                        series={pcaSeries}
                        type="scatter"
                        width="450"
                        height="450"
                    />
                </Suspense>

            </div>
            <div className="card shadow-sm p-6 bg-base-300 w-full mr-6 h-[570px]">
                <div className="flex flex-row justify-between items-center mb-4 px-6">
                    <h2 className="card-title">Linear Regression</h2>
                    <CardMenu  cardId={"lr"}/>
                </div>
                <div className="flex items-center h-fit w-fit ml-6 justify-center">
                    <h3 className="text-xs mr-1 mb-3 font-bold">DEPENDENT</h3>
                    <div className="px-6 overflow-y-hidden overflow-x-auto h-10">
                        <div className="rounded-2xl border-accent/60 border-2 bg-accent/50 ml-1 px-3">
                            <h3 className="text-md text-gray-100">{truncateLabel(regressionData.dependent_var, 25)}</h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center h-12 w-fit ml-6 pb-5">
                    <h3 className="text-xs mr-1 mb-1 font-bold">INDEPENDENTS</h3>
                    <div className="flex flex-row gap-1 px-2 overflow-x-auto w-72 h-fit py-2">
                        {regressionData.independent_vars.map((variable, index) => (
                            <div key={index} className="rounded-2xl border-primary/60 border-2 bg-primary/50 px-2">
                                <h3 key={index} className="text-sm text-gray-100">{truncateLabel(variable, 40)}</h3>
                            </div>
                        ))}
                    </div>
                </div>
                <Suspense fallback={
                    <div className="skeleton w-[400px] h-[350px]"></div>
                }>
                    <ApexCharts
                        options={regressionOptions}
                        series={regressionSeries}
                        type="line"
                        width="450"
                        height="350"
                    />
                </Suspense>
            </div>
        </div>
    );
};

export default NumericalVisualization;
