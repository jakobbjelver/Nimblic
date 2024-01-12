// SummaryDataProfile.jsx
import React, { useEffect, useState } from 'react';
import { truncateLabel, fromCamelToText } from 'src/utils/textFormat';


const TextSummary = ({ patternsAnalysisData }) => {
  const [isLoading, setLoading] = useState(true);
  const [isNull, setNull] = useState(false);
  

  let sum = 0

  useEffect(() => {
    if(!patternsAnalysisData) {

      setLoading(true)
      setNull(true)
    } else if (!patternsAnalysisData.common_patterns) {

      setLoading(false)
      setNull(true)
    } else {

      setLoading(false)
      setNull(false)
    }
}, [patternsAnalysisData]);

  if (isLoading) {
    return (
      <div className="card w-max h-fit shadow-sm p-4 bg-base-300">
        <div className="flex flex-row gap-2 items-center w-full  mb-4">
          <h2 className="card-title">Patterns</h2>
          <div className="loading loading-spinner text-xs loading-xs"></div>
        </div>
        <div className="skeleton h-72 w-40 flex flex-row items-center justify-center px-4 font-bold text-[12px] bg-base-200"></div>
      </div>
    )
  } else if (isNull) {
    return null
  } else {
    if(!patternsAnalysisData.common_patterns) return null
    Object.entries(patternsAnalysisData.common_patterns)?.map(([key, value], index) => (
      sum = +value
    ))
  }

  console.log("patternsAnalysisData", patternsAnalysisData)

  return (
    <div className="card w-full h-fit shadow-sm p-4 bg-base-300">
      <h2 className="card-title mb-4">Patterns</h2>
      <div className="overflow-y-auto h-72 w-full">
        <table className="table table-md ">
          <tbody>
            {Object.keys(patternsAnalysisData.common_patterns).length <= 0 || sum == 0 ?
              <p className="text-lg font-light ml-2">None</p>
              :
              Object.entries(patternsAnalysisData.common_patterns)?.map(([key, value], index) => (
                value !== 0 && renderValue(value) ?
                  <tr key={index} className="border-b border-neutral">
                    <td><strong>{fromCamelToText(key)}</strong></td>
                    <td>{renderValue(value)}</td>
                  </tr>
                  : ''
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TextSummary;

const renderValue = (value) => {
  if (typeof value === 'number' && value) {
    return truncateLabel(value.toFixed(2).toString(), 10)
  } else if (typeof value === 'object' && value !== null) {
    // Join the object's values into a comma-separated list
    return Object.values(value).join(', ');
  } else {
    return value ? truncateLabel(value.toString(), 30) : '0';
  }
};

