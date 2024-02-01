import React, { useState, useContext, useEffect, Suspense } from 'react';
import Dropdown from '../../general/Dropdown';
import ThemeContext from '../../general/Theme/ThemeContext';
import CardMenu from '../../general/CardMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons';
import { truncateLabel } from 'src/utils/textFormat';

const CorrelationAnalysis = ({ correlationData }) => {
    const [selectedCorrelationType, setSelectedCorrelationType] = useState('Pearson');
    const [selectedColumn, setSelectedColumn] = useState(Object.keys(correlationData?.Pearson)[0]);
    const { theme } = useContext(ThemeContext); // Use the context
    const [isLoading, setLoading] = useState(true);

    const ReactApexChart = React.lazy(() => import('react-apexcharts'));

    // Initial heatmap size calculation
    const calculateHeatmapSize = (zoom = 1) => ({
        width: ((Object.keys(correlationData[selectedCorrelationType]).length * 50) + 100) * zoom,
        height: ((Object.keys(correlationData[selectedCorrelationType]).length * 30) + 100) * zoom
    });

    const [heatmapSize, setHeatmapSize] = useState(calculateHeatmapSize());
    const [zoomLevel, setZoomLevel] = useState(1); // Initial zoom level set to 1

    const zoomStep = 0.1; // Define how much each click changes the zoom level

    const handleZoomIn = () => {
        const newZoomLevel = zoomLevel * (1 + zoomStep);
        setZoomLevel(newZoomLevel);
        const newHeatmapSize = calculateHeatmapSize(newZoomLevel);
        setHeatmapSize(newHeatmapSize);
    };

    const handleZoomOut = () => {
        const newZoomLevel = zoomLevel * (1 - zoomStep);
        setZoomLevel(newZoomLevel);
        const newHeatmapSize = calculateHeatmapSize(newZoomLevel);
        setHeatmapSize(newHeatmapSize);
    };



    const handleWheel = (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            const zoomChange = event.deltaY * -0.1;
            const newZoomLevel = zoomLevel * (1 + zoomChange);
            setZoomLevel(newZoomLevel);
            const newHeatmapSize = calculateHeatmapSize(newZoomLevel);
            setHeatmapSize(newHeatmapSize);
        }
    };

    const handleKeyDown = (event) => {
        if (event.ctrlKey && (event.key === '+' || event.key === '-')) {
            event.preventDefault();
            const zoomChange = event.key === '+' ? 0.1 : -0.1;
            const newZoomLevel = zoomLevel * (1 + zoomChange);
            setZoomLevel(newZoomLevel);
            const newHeatmapSize = calculateHeatmapSize(newZoomLevel);
            setHeatmapSize(newHeatmapSize);
        }
    };

    useEffect(() => {
        const handleEvent = (event) => handleKeyDown(event);
        window.addEventListener('keydown', handleEvent);

        return () => {
            window.removeEventListener('keydown', handleEvent);
        };
    }, [handleKeyDown, zoomLevel]); // Add zoomLevel to the dependency array


    useEffect(() => {
        if (correlationData) {
            setLoading(false);
            setSelectedColumn(Object.keys(correlationData?.Pearson)[0])

            const heatmapSize = {
                width: (Object.keys(correlationData[selectedCorrelationType]).length * 50) + 100, // Assuming each column is 50px wide
                height: (Object.keys(correlationData[selectedCorrelationType]).length * 30) + 100 // Assuming each row is 50px high
            };
            setHeatmapSize(heatmapSize)
        } else {
            setLoading(true);
        }
    }, [correlationData, selectedCorrelationType]); // Depend on currentData



    const handleCorrelationTypeChange = (type) => {
        setSelectedCorrelationType(type);
        // Resetting the selected column based on the new correlation type
        setSelectedColumn(Object.keys(correlationData[type])[0]);
        if (dropdownTypeRef.current) {
            dropdownTypeRef.current.open = false;
        }
    };

    const handleColumnChange = (column) => {
        setSelectedColumn(column);
        if (dropdownColumnRef.current) {
            dropdownColumnRef.current.open = false;
        }
    };

    const renderCorrelationTable = () => {
        const correlationValues = correlationData[selectedCorrelationType][selectedColumn];
        if (!correlationValues) return

        return (
            <table className="table-lg w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral">
                    <tr>
                        <th className="px-4 py-2">Column</th>
                        <th className="px-4 py-2">Coefficient</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(correlationValues).map(([key, value], index) => (
                        <tr key={index} className="bg-base-300 border-b border-neutral">
                            <td className="px-4 py-2 font-medium">{key}</td>
                            <td className="px-4 py-2">{value ? value.toFixed(2) : ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const transformDataForHeatmap = (type) => {
        if (!correlationData[type]) return;

        const maxLabelLength = 30; // Adjust this value as needed

        return Object.entries(correlationData[type]).map(([name, values]) => {
            return {
                name: truncateLabel(name, maxLabelLength),
                data: Object.entries(values).map(([key, value]) => {
                    return {
                        x: truncateLabel(key, maxLabelLength),
                        y: value ? value.toFixed(2) : value
                    };
                })
            };
        });
    };


    const series = transformDataForHeatmap(selectedCorrelationType);

    const getChartOptions = (theme) => {
        return {
            chart: {
                type: 'heatmap',
                background: '#00000000',
                animations: {
                    enabled: false
                },
            },
            dataLabels: {
                enabled: false
            },
            colors: [theme !== 'dark' ? "#6865f7" : "#6865f7"], // Set your custom color
            title: {
                text: ''
            },
            theme: {
                mode: theme
            },
            fontFamily: 'Open Sans',
            stroke: {
                width: 2,
                colors: [theme === 'dark' ? "#161921" : "#f5f5f5"]
            },
            xaxis: {
                labels: {
                    style: {
                        colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                    }
                },
                axisBorder: {
                    show: false,
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: theme !== 'dark' ? "#4a4a4a" : "#c4c4c4"
                    }
                },
                axisBorder: {
                    show: false,
                }
            },
        };
    }

    const options = getChartOptions(theme);

    if (!isLoading) {
        return (
            <div className="flex flex-col items-center w-full rounded-xl shadow-md pr-12 pl-0 py-12 bg-base-200 fadeInUp">
                <div className="flex flex-row items-center justify-between w-full gap-3 px-10">
                    <h1 className="font-bold text-2xl mb-5">Correlation Analysis</h1>
                    <div className="flex items-center h-fit w-fit ml-7">
                        <Dropdown
                            label={"correlation"}
                            items={['Pearson', 'Spearman']}
                            selectedItem={selectedCorrelationType}
                            onChange={setSelectedCorrelationType}
                        />
                    </div>
                    <div className="flex items-center h-fit w-fit ml-1">
                        <Dropdown
                            label={"column"}
                            items={Object.keys(correlationData[selectedCorrelationType])}
                            selectedItem={selectedColumn}
                            onChange={setSelectedColumn}
                        />
                    </div>
                    <div className="flex items-left justify-center mb-4">
                        <CardMenu cardId={'sp_co_ca'} />
                    </div>
                </div>
                <div className="flex flex-row w-full items-center justify-center gap-6 pl-10 py-6">
                    {Object.keys(correlationData[selectedCorrelationType]).length <= 0 ?
                        <div className="flex flex-col items-center justify-center h-fit w-full gap-12 my-40">
                            <img src="/svg/not_found.svg" alt="Data not found" width="100" />
                            <p className="text-lg">Looks like we couldn't process any data for this analysis</p>
                        </div>
                        :
                        <>
                            <div className="flex w-1/3">
                                <div className="flex w-full h-72 overflow-auto ml-6">
                                    {renderCorrelationTable()}
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 items-center justify-center w-[800px] h-[400px] group" id="chart">
                                <div className="flex flex-row gap-6 items-center justify-center">
                                    <div
                                        className={`w-[550px] h-[400px] overflow-auto flex flex-row gap-6`}
                                        onWheel={handleWheel}
                                    >
                                        <Suspense fallback={
                                            <div className="skeleton h-[400px] w-[560px] bg-base-300 flex items-center justify-center">
                                                <div className="loading loading-dots text-xl text-secondary"></div>
                                            </div>}>
                                            <ReactApexChart options={options} series={series} type="heatmap" width={heatmapSize.width} height={heatmapSize.height} />
                                        </Suspense>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button className="btn btn-neutral w-12 h-8 text-3xl" onClick={handleZoomIn}>
                                            <FontAwesomeIcon icon={faMagnifyingGlassPlus} size="1x" className="text-secondary/80" />
                                        </button>
                                        <button className="btn btn-neutral w-12 h-8 text-3xl" onClick={handleZoomOut}>
                                            <FontAwesomeIcon icon={faMagnifyingGlassMinus} size="1x" className="text-secondary/80" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-all mr-20">
                                    <p className="font-bold text-xs">ZOOM IN</p><kbd className="kbd">Ctrl</kbd><kbd className="kbd mr-20">+</kbd>
                                    <p className="font-bold text-xs">ZOOM OUT</p><kbd className="kbd">Ctrl</kbd><kbd className="kbd">-</kbd>
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        );
    } else {
        return null
    }
};

export default CorrelationAnalysis;
