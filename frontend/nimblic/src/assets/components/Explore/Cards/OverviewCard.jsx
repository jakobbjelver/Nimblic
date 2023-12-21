import React from 'react';

const OverviewCard = ({ summary }) => {
  const { basic_info, column_types, memory_usage } = summary;

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Dataset Overview</h2>
        <p>Total Number of Rows: {basic_info.number_of_rows}</p>
        <p>Total Number of Columns: {basic_info.number_of_columns}</p>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Missing Values</th>
                <th>Memory Usage (Bytes)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(column_types).map((column, index) => (
                <tr key={index}>
                  <td>{column}</td>
                  <td>{column_types[column]}</td>
                  <td>{basic_info.missing_values[column]}</td>
                  <td>{memory_usage[column]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p>Total Memory Usage: {memory_usage.total} Bytes</p>
      </div>
    </div>
  );
};

export default OverviewCard;
