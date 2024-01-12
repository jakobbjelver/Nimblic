import React, { useState, useEffect, useRef, Suspense, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../general/Dropdown';
import CardMenu from '../../general/CardMenu';
import ThemeContext from '../../general/Theme/ThemeContext';


const ChangePointCard = ({ changePoints, isLoading }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const cardRef = useRef();

  const Line = React.lazy(() => import('./LazyLineChart')); //Lazy import to use Suspend
  const { theme } = useContext(ThemeContext); // Use the context
  const themeColor = theme !== 'dark' ? "#4a4a4a" : "#c4c4c4";

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (changePoints && changePoints.length > 0) {

      const filteredChangePoints = changePoints.filter(cp => cp.points && cp.points.length > 0);

      if (filteredChangePoints.length <= 0) {
        setSelectedColumns(['No data']);
        setColumns([])
        setChartData(null)
        return
      }

      setColumns(filteredChangePoints.map(cp => cp.variable))
      // Calculate significance scores for all points
      const calculatedSignificances = changePoints.map(columnData => ({
        ...columnData,
        points: columnData.points.map(point => ({
          ...point,
          significance: Math.abs(point.mean_after - point.mean_before)
        })),
        averageSignificance: columnData.points.reduce((acc, point) => acc + Math.abs(point.mean_after - point.mean_before), 0) / columnData.points.length
      }));

      // Determine the column with the largest average differences in significance
      const mostSignificantColumn = calculatedSignificances.reduce((prev, current) => {
        return (prev.averageSignificance > current.averageSignificance) ? prev : current;
      });

      setSelectedColumns([mostSignificantColumn.variable]);
      setChartData(formatChartData([mostSignificantColumn]));
    } else {
      setSelectedColumns(['No data']);
      setColumns([])
      setChartData(null)
    }
  }, [changePoints, isLoading, window.innerWidth]);

  useEffect(() => {
    if (isLoading || !changePoints) return
    // Update the chart data when a new column is selected
    const columnDataArray = selectedColumns.map(col =>
      changePoints.find(cp => cp.variable === col));
    if (columnDataArray) {
      setChartData(formatChartData(columnDataArray));
    }
  }, [selectedColumns, changePoints, isLoading])


  const handleColumnChange = (column, index) => {
    const newSelectedColumns = [...selectedColumns];
    newSelectedColumns[index] = column;
    setSelectedColumns(newSelectedColumns);

    // Update chart data
    const columnDataArray = newSelectedColumns.map(col =>
      changePoints.find(cp => cp.variable === col));
    setChartData(formatChartData(columnDataArray));
  };

  const handleAddComparison = () => {
    // Assuming each dropdown should have a different value
    const remainingColumns = columns.filter(col => !selectedColumns.includes(col));
    if (remainingColumns.length > 0) {
      setSelectedColumns([...selectedColumns, remainingColumns[0]]);
    }
  };

  const handleRemoveComparison = (indexToRemove) => {
    // Filter out the column at the specified index
    const updatedSelectedColumns = selectedColumns.filter((_, index) => index !== indexToRemove);

    // Update the selected columns state
    setSelectedColumns(updatedSelectedColumns);

    // Update chart data to reflect the removal
    const columnDataArray = updatedSelectedColumns.map(col =>
      changePoints.find(cp => cp.variable === col));

    // If there are no columns selected, reset chart data or handle accordingly
    if (updatedSelectedColumns.length === 0) {
      setChartData({
        labels: [],
        datasets: []
      });
    } else {
      setChartData(formatChartData(columnDataArray));
    }
  };


  // Function to calculate the significance for the frontend
  const calculateSignificance = (point) => {
    // Assuming the significance score is scaled properly
    // You may need to adjust the scaling factor to get a sensible point size
    return point.significance * 7 + 3;
  };

  const colorPalette = [
    "#F99417", "#7952f7", "#6865f7",
  ];

  const textColorPalette = [
    "accent", "primary", "secondary",
  ];


  const formatChartData = (columnDataArray) => {
    if (!columnDataArray[0]) return

    return {
      labels: columnDataArray[0].points.map((point) => `${point.index}`),
      datasets: columnDataArray.map((columnData, index) => {
        // Get a color from the palette, cycling if there are more lines than colors
        const color = colorPalette[index % colorPalette.length];

        return {
          label: columnData.variable,
          data: columnData.points.map((point) => point.mean_after),
          backgroundColor: color,
          borderColor: color,
          pointBackgroundColor: color, // Set the point colors
          pointBorderColor: color,
          pointRadius: columnData.points.map((point) => calculateSignificance(point)),
          pointHoverRadius: 10,
          showLine: true, // Connect the points with lines
          tension: 0.3,
        };
      }),
    };
  };

  const options = {
    plugins: {
      legend: {
        display: false, // This will remove the legend, and therefore, dataset labels from the legend
      },
      tooltip: {
        enabled: true, // Enable or disable tooltip
        mode: 'index', // 'point', 'nearest', 'index', 'dataset', and 'x' are some modes available
        intersect: false, // Tooltip only appears when the mouse is directly over a data point if true
        borderWidth: 1, // Border width of the tooltip
        callbacks: { // Here you can define custom functions to populate the tooltip
          label: function (context) {
            // You can customize what is written in the tooltip text
            return `Mean: ${context.parsed.y.toFixed(2)} \n Observation: ${context.parsed.x}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Observation', // Replace with your desired label
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(0);
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Mean', // Replace with your desired label
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(0);
          }
        }
      },
    },
    animation: false, // Disable all animations
    font: {
      family: 'OpenSans',
    }
  };

  return (
    <div className="card xl:w-1/2 md:w-full lg:w-1/2 h-auto dark:bg-base-200 shadow-sm mx-auto">
      <div className="card-body" ref={cardRef}>
        <div className="flex flex-row justify-between items-center">
          <h2 className="card-title">Change Points</h2>
          <CardMenu cardId={"ep_cpd"} codeFile={"change_point_detection.py"} cardRef={cardRef}/>
        </div>
        <div className="flex flex-row items-start justify-start  h-24">
          {selectedColumns.map((selectedColumn, index) => (
            <>
              <div key={index} className="flex flex-col items-center justify-center group">
                {changePoints || !isLoading ?
                  <Dropdown
                    key={index}
                    ref={dropdownRef}
                    items={columns}
                    selectedItem={selectedColumn}
                    onChange={(column) => handleColumnChange(column, index)}
                    color={selectedColumns?.length > 1 ? textColorPalette[index] : null}
                  />
                  :
                  <div
                    key={index}
                    className="skeleton rounded-lg mt-2 ml-2 text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral">
                  </div>
                }
                {index !== 0 && (
                  <button
                    key={index}
                    className="btn btn-circle btn-sm bg-base-100 relative top-[-24px] invisible group-hover:visible"
                    onClick={() => handleRemoveComparison(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" key={index} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" key={index} />
                    </svg>
                  </button>
                )}
              </div>
            </>
          ))}
          {selectedColumns?.length <= 2 && (
            <button className="btn btn-sm btn-ghost mt-2.5" onClick={handleAddComparison}>
              <FontAwesomeIcon icon={faPlus} />
              Add comparison
            </button>
          )}
        </div>
        <div className="flex items-center justify-center overflow-x-auto h-full w-full">
          <Suspense fallback={
            <div className="skeleton w-[450px] h-[220px] bg-base-300"></div>
          }>
            {changePoints && !isLoading ? (
              chartData ? (
                <Line data={chartData} options={options} />
              ) : (
                <h2>No data</h2>
              )
            ) : (
              <div className="skeleton w-[450px] h-[220px] bg-base-300"></div>
            )}

          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ChangePointCard;
