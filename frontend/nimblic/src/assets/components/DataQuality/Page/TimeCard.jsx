import React from 'react';
import ApexCharts from 'react-apexcharts';
import CardMenu from '../../general/CardMenu'

const TimeCard = ({ timeData, selectedColumn }) => {
    // Function to render the bar chart for completeness data

    const renderChart = (completeness) => {
        const chartData = {
            series: [{
                name: 'Completeness',
                data: Object.values(completeness).map(value => parseFloat(value.toFixed(2)))
            }],
            options: {
                chart: {
                    type: 'bar',
                    height: 350
                },
                xaxis: {
                    categories: Object.keys(completeness)
                },
                yaxis: {
                    title: {
                        text: 'Completeness (%)'
                    }
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + "%"
                        }
                    }
                }
            }
        };

        return <ApexCharts options={chartData.options} series={chartData.series} type="bar" />;
    };

    // Function to render the completeness data for the selected time column
    const renderCompletenessData = () => {
        const completeness = timeData[selectedColumn];
        if (typeof completeness === 'string') {
            // Case when the column is not in datetime format
            return <p>{completeness}</p>;
        } else {
            // Render chart for valid data
            return renderChart(completeness);
        }
    };

    if(!timeData[selectedColumn] || typeof timeData[selectedColumn] === 'string') return

    return (
        <div className="card bg-base-300 shadow-sm m-4 p-6 fadeInUp">
                        <div className="flex flex-row justify-between items-center">
                <h2 className="card-title">Completeness over time</h2>
                <CardMenu cardId={'dqp_cot'}/>
            </div>
            <div className="badge badge-ghost mx-2">{selectedColumn}</div>
            <div className="card-body">
                {renderCompletenessData()}
            </div>
        </div>
    );
};

export default TimeCard;
