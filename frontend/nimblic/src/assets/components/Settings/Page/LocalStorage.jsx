import React, { useState, useEffect, useContext } from 'react';
import ApexCharts from 'react-apexcharts';
import ThemeContext from '../../general/Theme/ThemeContext';
import CardMenu from '../../general/CardMenu'

const LocalStorage = () => {
    const [storageUsage, setStorageUsage] = useState(getLocalStorageSize());
    const maxStorage = 5120; // Approximate max local storage in KB (5MB)
    const { theme } = useContext(ThemeContext); // Use the context

    useEffect(() => {
        const usage = getLocalStorageSize();
        setStorageUsage(usage);
    }, [localStorage]);

    // Function to calculate local storage size
    function getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += key.length + localStorage[key].length;
            }
        }
        return (total * 2) / 1024; // 2 bytes per character (UTF-16)
    }

    // Format series values to one decimal place
    const formattedStorageUsage = parseFloat(storageUsage.toFixed(1));
    const formattedFreeStorage = parseFloat((maxStorage - storageUsage).toFixed(1));

    // Chart options
    const chartOptions = {
        series: [formattedStorageUsage, formattedFreeStorage],
        options: {
            labels: ['Used Storage', 'Free Storage'],
            colors: ['#6865f7', 'rgba(102, 100, 247, 0.32)'],
            chart: {
                type: 'donut',
                background: "#00000000",
            },
            legend: {
                show: false, // Hides the legend
            },
            dataLabels: {
                enabled: false,
            },
            theme: {
                mode: theme
            },
            stroke: {
                show: false,
            },
            fontFamily: 'Open Sans',
            tooltip: {
                enabled: true,
                y: {
                    formatter: (val) => `${val.toFixed(1)} KB`
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Used Storage',
                                formatter: function () {
                                    // Display the percentage of used storage
                                    return ((storageUsage / maxStorage) * 100).toFixed(1) + '%';
                                }
                            }
                        },
                    }
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    }
                }
            }]
        },
    };

    return (
        <div className="card bg-base-200 w-fit">
            <div className="card-body">
            <div className="flex flex-row justify-between items-center gap-2">
                <h2 className="card-title text-md text-neutral-content/90 font-bold font-nunito">LOCAL STORAGE USAGE</h2>
                <CardMenu />
            </div>
            <p className="text-sm font-light">Used Storage: {storageUsage.toFixed(2)} KB</p>
            <ApexCharts 
                options={chartOptions.options} 
                series={chartOptions.series} 
                type="donut" 
                width={270} 
            />
            </div>
        </div>
    );
};

export default LocalStorage;
