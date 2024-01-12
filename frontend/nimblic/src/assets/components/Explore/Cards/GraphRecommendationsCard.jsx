import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { truncateLabel, fromCamelToText } from 'src/utils/textFormat';
import CardMenu from '../../general/CardMenu';

const GraphRecommendationsCard = ({ graphRecommendations, isLoading }) => {
    const chartRefs = useRef(new Map());
    const chartInstances = useRef(new Map());
    const [currentSlide, setCurrentSlide] = useState(0);
    const [itemWidths, setItemWidths] = useState([]);
    const [totalSlides, setTotalSlides] = useState([]);

    const nextSlide = () => {
        setCurrentSlide((prevIndex) => (prevIndex + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
    };


    useEffect(() => {
        if (isLoading || !graphRecommendations) return;

        const totalSlides = Object.keys(graphRecommendations).length;
        setTotalSlides(totalSlides);

        Object.keys(graphRecommendations).forEach((key, index) => {
            const canvasRef = chartRefs.current.get(key);
            if (canvasRef && canvasRef.getContext) {
                if (chartInstances.current.has(key)) {
                    chartInstances.current.get(key).destroy();
                }

                const ctx = canvasRef.getContext('2d');
                const graphData = graphRecommendations[key];
                const chartType = graphData.type;
                let datasets;
                const truncatedLabels = graphData.data.labels?.map(label => truncateLabel(label, 24));

                if (chartType === 'bubble') {
                    datasets = [{
                        label: key,
                        data: graphData.data.data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }];
                } else {
                    datasets = [{
                        label: key,
                        data: graphData.data.data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }];
                }

                const chartInstance = new Chart(ctx, {
                    type: chartType,
                    data: {
                        labels: truncatedLabels,
                        datasets: datasets
                    },
                    options: getChartOptions(chartType)


                });

                canvasRef.removeAttribute('style');
                chartInstances.current.set(key, chartInstance);
            }
        });

        const updateItemWidths = () => {
            const widths = Object.keys(graphRecommendations).map((key) => {
                const el = chartRefs.current.get(key);
                return el ? el.offsetWidth : 0;
            });
            setItemWidths(widths);
        };

        updateItemWidths();
        window.addEventListener('resize', updateItemWidths);

        return () => {
            chartInstances.current.forEach(chart => chart.destroy());
            window.removeEventListener('resize', updateItemWidths);
        };
    }, [graphRecommendations, isLoading]);

    const totalTranslateX = itemWidths.slice(0, currentSlide).reduce((acc, width) => acc + width, 0);

    function getChartOptions(chartType) {
        switch (chartType) {
            case 'bar':
                return {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    animation: false, // Disable all animations
                };
            case 'line':
            case 'area': // Assuming 'area' is treated similarly to 'line' in your setup
                return {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    elements: {
                        line: {
                            fill: chartType === 'area' // Fill area under the line for 'area' chart
                        }
                    },
                    animation: false, // Disable all animations
                };
            case 'pie':
            case 'polarArea':
                return {
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    animation: false, // Disable all animations
                };
            case 'radar':
                return {
                    elements: {
                        line: {
                            borderWidth: 3
                        }
                    },
                    animation: false, // Disable all animations
                };
            case 'bubble':
                return {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    var label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += `(${context.parsed.x}, ${context.parsed.y}, ${context.parsed.r})`;
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    animation: false, // Disable all animations
                };
            case 'scatter':
                return {
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom'
                        },
                        y: {
                            beginAtZero: true
                        }
                    },
                    animation: false, // Disable all animations
                };
            default:
                return { responsive: true };
        }
    }


    if (isLoading) {
        return (
            <div className="card bg-base-200 shadow-sm w-full h-fit">
                <div className="card-body flex">
                    <h1 className="text-2xl font-bold mb-5">Recommended Graphs</h1>
                    <div className="carousel">
                        <div className="flex items-center justify-start transition-transform duration-300">
                            <div className={`carousel-item flex-shrink-0`}>
                                <div className={`card`}>
                                    <div className="card-body">
                                        <h2 className="card-title skeleton w-1/2 h-1/6"></h2>
                                        <div className="skeleton w-[400px] h-[300px]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className={`carousel-item flex-shrink-0`}>
                                <div className={`card`}>
                                    <div className="card-body">
                                        <h2 className="card-title skeleton w-1/2 h-1/6"></h2>
                                        <div className="skeleton w-[400px] h-[300px]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className={`carousel-item flex-shrink-0`}>
                                <div className={`card`}>
                                    <div className="card-body">
                                        <h2 className="card-title skeleton w-1/2 h-1/6"></h2>
                                        <div className="skeleton w-[400px] h-[300px]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className={`carousel-item flex-shrink-0`}>
                                <div className={`card`}>
                                    <div className="card-body">
                                        <h2 className="card-title skeleton w-1/2 h-1/6"></h2>
                                        <div className="skeleton w-[400px] h-[300px]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 bottom-1/3">
                            <button onClick={() => prevSlide()} className="btn btn-circle bg-base-100 shadow-md">❮</button>
                            <button onClick={() => nextSlide()} className="btn btn-circle bg-base-100 shadow-md">❯</button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-200 shadow-sm w-full h-fit">
            <div className="flex flex-row justify-between items-center p-8">
                <h1 className="card-title text-2xl font-bold ml-10">Recommended graphs</h1>
                <CardMenu cardId={"ep_gr"}/>
            </div>
            <div className="card-body flex">
                {!isLoading && graphRecommendations?.length <= 0 ?
                    <div className="flex items-center justify-center">
                        <h3>No data</h3>
                    </div>
                    :
                    <>
                        <div className="carousel">
                            <div className="flex items-center justify-start transition-transform duration-300" style={{ transform: `translateX(-${totalTranslateX}px)` }}>
                                {Object.keys(graphRecommendations).map((key, index) => {
                                    return (
                                        <div key={index} className={`carousel-item flex-shrink-0`}>
                                            <div className={`card max-h-[400px]`}>
                                                <div className="card-body">
                                                    <h2 className="card-title flex items-center justify-center">{key}
                                                        <span className="badge badge-sm badge-outline badge-secondary text-center mt-1">{fromCamelToText(graphRecommendations[key].type)}</span>
                                                    </h2>
                                                    <canvas className="w-full h-60 max-h-[250px]" ref={el => chartRefs.current.set(key, el)}></canvas>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 bottom-1/3">
                                <button onClick={() => prevSlide()} className="btn btn-circle bg-base-100 shadow-md">❮</button>
                                <button onClick={() => nextSlide()} className="btn btn-circle bg-base-100 shadow-md">❯</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-center text-center">
                            <h3 className="rounded-3xl w-10 h-10 text-zinc-400 outline outline-1 outline-zinc-400 py-2.5 text-sm font-semibold mb-5">{currentSlide + 1}/{totalSlides}</h3>
                        </div>
                    </>}

            </div>
        </div>
    );
};

export default GraphRecommendationsCard;

