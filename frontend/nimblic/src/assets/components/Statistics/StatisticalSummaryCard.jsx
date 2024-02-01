import React, { useState, useEffect } from 'react';
import Dropdown from '../general/Dropdown';
import CardMenu from '../general/CardMenu';
import Profile from './Components/Profile';
import Correlation from './Components/Correlation';
import Categorical from './Components/Categorical';
import TextSummary from './Components/TextSummary';

import { Link } from 'react-router-dom';

import { faArrowRight, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const StatisticalSummaryCard = ({ statisticalSummary, isLoading }) => {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [columns, setColumns] = useState([]);
  const [columnDataTypes, setColumnDataTypes] = useState([]);

  const [profileData, setProfileData] = useState(null);
  const [textData, setTextData] = useState(statisticalSummary?.object_analysis ? statisticalSummary.object_analysis[selectedColumn] : null);
  const [categoricalData, setCategoricalData] = useState(null);


  // useEffect to monitor statisticalSummary changes
  useEffect(() => {

    if (statisticalSummary && statisticalSummary !== 'None' && Object.keys(statisticalSummary).length > 0) {
      // Automatically select the first column as default
      const firstColumnKey = Object.keys(statisticalSummary.spearman_correlation)[0];
      const columns = Object.keys(statisticalSummary.profile);
      setColumns(columns);
      setSelectedColumn(firstColumnKey);

      if (Object.values(statisticalSummary.profile).length > 0) {
        const columnDataTypes = Object.values(statisticalSummary.profile).map(item => item["Data Type"]);
        setColumnDataTypes(columnDataTypes);
      }
    }
  }, [statisticalSummary]); // Dependency array with statisticalSummary

  useEffect(() => {

    let datatype = 'numerical'

    if (statisticalSummary && Object.keys(statisticalSummary).length > 0) {
      if (statisticalSummary.profile) {
        setProfileData(statisticalSummary.profile[selectedColumn])
        if (statisticalSummary.profile[selectedColumn]) {
          datatype = statisticalSummary.profile[selectedColumn]['Data Type']
        }
      }
      if (statisticalSummary.categorical_analysis) {
        setCategoricalData(statisticalSummary.categorical_analysis[selectedColumn])
      }
      if (statisticalSummary.object_analysis) {
        if (datatype == 'object' || datatype == 'category') {
          setTextData({ ...statisticalSummary.object_analysis[selectedColumn] });

        } else {
          setTextData([])
        }
      } else {
        if (datatype == 'object' || datatype == 'category') {
          setTextData(null)
        } else {
          setTextData([])
        }
      }
    }
  }, [selectedColumn, statisticalSummary]); // Dependency array with statisticalSummary


  const renderNormalityTestCard = () => {

    if (isLoading || !statisticalSummary.numerical_analysis.normality_test) return

    const normalityTestData = statisticalSummary.numerical_analysis.normality_test[selectedColumn];

    if (!normalityTestData) return

    return (
      <div className="card w-full h-1/3 shadow-sm p-4 bg-base-300">
        <h2 className="card-title mb-4">Normality Test</h2>
        <p><strong>p-value:</strong> {normalityTestData?.p_value.toFixed(4)}</p>
      </div>
    );
  };

  const renderOutliersCard = () => {

    if (isLoading || !statisticalSummary.numerical_analysis.outliers_detection) return

    const outliersData = statisticalSummary.numerical_analysis.outliers_detection[selectedColumn];

    if (!outliersData) return

    return (
      <div className="card w-full h-1/3 shadow-sm p-4 bg-base-300">
        <div className="flex flex-row gap-1 text-center">
          <h2 className="card-title mb-4">Outliers</h2>
          <h3 className="font-light">({outliersData.length})</h3>
        </div>
        <div className="overflow-y-auto max-h-20">
          <p>{outliersData?.join(", ") ? outliersData?.join(", ") : 'None'}</p>
        </div>
      </div>
    );
  };

  const renderSkewnessKurtosisCard = () => {

    if (isLoading || !statisticalSummary.numerical_analysis.skewness_kurtosis) return

    const skewnessKurtosisData = statisticalSummary.numerical_analysis.skewness_kurtosis[selectedColumn];

    if (!skewnessKurtosisData) return

    return (
      <div className="card w-full h-fit shadow-sm p-4 bg-base-300">
        <h2 className="card-title mb-4">Skewness & Kurtosis</h2>
        <p><strong>Skewness:</strong> {skewnessKurtosisData?.skewness.toFixed(2)}</p>
        <p><strong>Kurtosis:</strong> {skewnessKurtosisData?.kurtosis.toFixed(2)}</p>
      </div>
    );
  };

  if (isLoading || !statisticalSummary) {
    return (
      <div className="container flex flex-col h-[500px] w-[640] items-center justify-center mx-auto p-4 shadow-sm rounded-xl dark:bg-base-200">
        <h1 className="text-2xl font-bold mb-5">Statistical Summary</h1>
        <div className="flex items-center justify-center h-fit w-fit">
          <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
          <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="card w-full shadow-sm p-4 pr-8 h-fit bg-base-300">
            <h2 className="card-title mb-4">Correlation</h2>

            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>

          </div>
          <div className="card w-full shadow-sm p-4 pr-8 h-fit bg-base-300">
            <h2 className="card-title mb-4">Profile</h2>

            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>
            <div className="skeleton w-full h-6 mt-2 mx-2 bg-base-200"></div>

          </div>
          <div className="flex flex-col gap-5">
            <div className="card w-full shadow-sm p-4 h-fit bg-base-300">
              <h2 className="card-title mb-4">Normality Test</h2>
              <div className="skeleton w-1/2 h-6 mx-2 bg-base-200"></div>
            </div>
            <div className="card w-full shadow-sm p-4 h-fit bg-base-300">
              <h2 className="card-title mb-4">Outliers</h2>
              <div className="skeleton w-1/2 h-6 mx-2 bg-base-200"></div>
            </div>
            <div className="card w-full shadow-sm p-4 h-fit bg-base-300">
              <h2 className="card-title mb-4">Skewness & Kurtosis</h2>
              <div className="skeleton w-1/2 h-6 mx-2 bg-base-200"></div>
            </div>
          </div>
        </div>

      </div>
    );
  } else if (statisticalSummary == 'None') {
    return (
      <div className="container flex flex-col h-[500px] w-[640] items-center justify-center mx-auto p-4 shadow-sm rounded-xl dark:bg-base-200">
        <h1 className="text-2xl font-bold mb-5 absolute top-10 left-10 ">Statistical Summary</h1>
        <div className="flex flex-col items-center justify-center h-fit w-full gap-12">
            <img src="/svg/not_found.svg" alt="Data not found" width="100" />
          <p className="text-lg">Looks like we couldn't process any data for this analysis</p>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container flex flex-col h-2/5 items-center justify-center mx-auto p-4 shadow-sm rounded-xl dark:bg-base-200">
        <div className="flex flex-row justify-between items-center my-4 w-full">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-2xl font-bold ml-10">Statistical Summary</h1>
            <Link to={'/statistics'}>
              <button className="btn btn-primary bg-secondary/80 border-transparent hover:bg-secondary/90 hover:border-transparent btn-sm rounded-xl hover:scale-105 transition-all duration-300" >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </Link>
          </div>
          <div className="flex flex-row items-center gap-2 mr-6">
            <CardMenu cardId={"ep_ss"} />
          </div>
        </div>
          <Dropdown
            label={"column"}
            items={columns}
            dataTypes={columnDataTypes}
            selectedItem={selectedColumn}
            onChange={setSelectedColumn}
          />
        <div className="flex flex-row justify-between w-full items-stretch gap-3 pb-4">
          <div className="flex flex-row gap-3 w-full items-stretch justify-between">
            <Correlation spearmanData={statisticalSummary.spearman_correlation[selectedColumn]} pearsonData={statisticalSummary.pearson_correlation[selectedColumn]} />
            <div className="flex flex-col w-full gap-3">
              <Profile profileData={profileData} />
            </div>
          </div>
          <div className="flex flex-col w-1/2 h-full gap-3 items-center">
            {renderNormalityTestCard()}
            {renderOutliersCard()}
            {renderSkewnessKurtosisCard()}
            <TextSummary patternsAnalysisData={textData} />
          </div>

        </div>
        <Categorical categoricalData={categoricalData} />
      </div>
    );
  }
};

export default StatisticalSummaryCard;