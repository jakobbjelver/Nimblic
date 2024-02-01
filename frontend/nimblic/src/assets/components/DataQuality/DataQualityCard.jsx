import React, { useState, useEffect } from 'react';
import Dropdown from '../general/Dropdown';
import CardMenu from '../general/CardMenu';
import { formatBytes } from 'src/utils/fileUtil'; 

import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const DataQualityCard = ({ dataQuality, summary, isLoading }) => {


  const [selectedColumn, setSelectedColumn] = useState('');

  useEffect(() => {
    if (summary && Object.keys(summary.column_types).length > 0) {
      const columnNames = Object.keys(summary.column_types);
      setSelectedColumn(columnNames[0]);
    }
  }, [summary]);

  if (isLoading || !dataQuality || !summary) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold mb-5">Data Quality & Overview</h1>

          {/* Dropdown for selecting columns */}
          <div className="flex items-center h-fit w-fit">
            <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
            <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral">
            </div>
          </div>

          {/* Data Quality for entire dataset */}
          <div>
            <h3 className="text-lg font-semibold">Constant Columns</h3>
            <div className="skeleton w-2/3 h-6 mt-2"></div>

            <div className="divider"></div>

            <h3 className="text-lg font-semibold">Duplicate Rows</h3>
            <div className="skeleton w-2/3 h-6 mt-2"></div>

            <div className="divider"></div>
          </div>

          {/* Data Overview for selected column */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold">Column Overview</h3>
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Missing Values</th>
                  <th>Memory Usage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="skeleton w-full h-6 mx-2"></td>
                  <td className="skeleton w-full h-6 mx-2"></td>
                  <td className="skeleton w-full h-6 mx-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-sm w-2/5 mx-auto">
      <div className="card-body">
        <div className="flex flex-row justify-between items-center mb-5 w-full">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-2xl font-bold ml-3">Data Quality</h1>
            <Link to={'/data-quality'}>
              <button className="btn btn-primary bg-secondary/80 border-transparent hover:bg-secondary/90 hover:border-transparent btn-sm rounded-xl hover:scale-105 transition-all duration-300" >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </Link>
          </div>
          <CardMenu cardId={"ep_dqs"}/>
        </div>
        <div className="w-fit">
          <Dropdown
            label={"column"}
            items={Object.keys(summary.column_types)}
            selectedItem={selectedColumn}
            onChange={setSelectedColumn}
          />
        </div>
        {/* Data Overview for selected column */}
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold">Column Overview</h3>
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Missing Values</th>
                <th>Memory Usage</th>
              </tr>
            </thead>
            <tbody>
              {dataQuality.potential_outliers[selectedColumn] ? (
                <tr>
                  <td>{summary.column_types[selectedColumn]}</td>
                  <td>{summary.basic_info.missing_values[selectedColumn]}</td>
                  <td>{formatBytes(summary.memory_usage[selectedColumn])}</td>
                </tr>
              ) : <tr><td colSpan="3">No data available</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="divider"></div>

        {/* Data Quality for entire dataset */}
        <div>
          <h3 className="text-lg font-semibold">Constant Columns</h3>
          {dataQuality.constant_columns.length > 0 ? (
            <ul>
              {dataQuality.constant_columns.map((column, index) => (
                <li key={index}>{column}</li>
              ))}
            </ul>
          ) : (
            <p>No constant columns.</p>
          )}

          <div className="divider"></div>

          <h3 className="text-lg font-semibold">Duplicate Rows</h3>
          <p>{dataQuality.duplicate_rows} duplicate row(s).</p>

        </div>
      </div>
    </div>
  );
};

export default DataQualityCard;
