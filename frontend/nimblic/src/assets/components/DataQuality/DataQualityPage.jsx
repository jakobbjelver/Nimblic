import React, { useEffect, useState, useContext, Suspense } from 'react';
import Tabs from '../general/Tabs/Tabs';
import { TabsContext } from '../general/Tabs/TabsContext';
import Dropdown from '../general/Dropdown';
import CardMenu from '../general/CardMenu';
import StatsCard from './Page/StatsCard'
import TimeCard from './Page/TimeCard';
import ConsistencyCard from './Page/ConsistencyCard';
import OverviewCard from './Page/OverviewCard';
import PotentialOutliersCard from './Page/PotentialOutliersCard';
import { FileUploadContext } from '../general/Upload/FileUploadContext';
import TypeIssuesCard from './Page/TypeIssuesCard';
import IdentifiedKeyFieldCard from './Page/IdentifiedKeyFieldCard';
import { useNavigate } from 'react-router-dom';

const DataQualityPage = () => {
  const { uploadData, isUploading } = useContext(FileUploadContext);
  const { activeIndex } = useContext(TabsContext);
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [columns, setColumns] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const currentData = uploadData[activeIndex];

  const DataQualityVisualization = React.lazy(() => import('./Page/DataQualityVisualization'))


  useEffect(() => {
    if (!isUploading && currentData) {
      // Data is ready to be used
      setColumns(Object.keys(currentData.data_quality.missing_values))
      setSelectedColumn(Object.keys(currentData.data_quality.missing_values)[0])

    }
  }, [uploadData, isUploading]);

  useEffect(() => {
    // Check if currentData is available and not empty
    if (activeIndex === -1) return
    else {
      if (currentData && Object.keys(currentData).length > 0) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, [currentData, activeIndex]); // Depend on currentData

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      navigate('/')
    }
  }, []);

  if (isLoading) {
    return PageSkeleton()
  }

  return (
    <>
      <div className="w-full overflow-x-hidden bg-base-100 px-12 py-4 mt-20">
        <div className="flex w-full items-center justify-center">
          <Tabs />
        </div>
        <div className="w-full flex flex-row gap-8 items-top justify-center my-10 fadeInUp">
          <div className="flex flex-col xl:w-4/5 lg:w-3/5 2xl:w-fit">
            <div className="flex flex-wrap items-top rounded-xl shadow-md py-8 px-8 bg-base-200 max-w-screen-xl h-fit">
              <div className="flex flex-row items-center justify-between w-4/5 gap-3 px-4 h-fit">
                <h1 className="font-bold text-3xl mb-5">Data Quality</h1>
                <div className="flex items-center h-fit w-fit">
                  <Dropdown
                    label={"column"}
                    items={columns}
                    selectedItem={selectedColumn}
                    onChange={setSelectedColumn}
                  />

                </div>
              </div>
              <OverviewCard summary={currentData.summary} selectedColumn={selectedColumn} />
              <ConsistencyCard consistencyData={currentData.data_quality.consistency_checks} selectedColumn={selectedColumn} />
              <IdentifiedKeyFieldCard keyFieldData={currentData.data_quality.key_field_analysis} selectedColumn={selectedColumn} />
              <TypeIssuesCard consistencyData={currentData.data_quality.type_validation} selectedColumn={selectedColumn} />
              <PotentialOutliersCard data={currentData.data_quality.potential_outliers} selectedColumn={selectedColumn} />
              <TimeCard timeData={currentData.data_quality.completeness_over_time} selectedColumn={selectedColumn} />
            </div>
            <div className="w-max flex flex-col gap-8 items-top justify-center my-10 fadeInUp">
              <Suspense fallback={
                VisualizationSkeleton()
              }>
                <DataQualityVisualization qualityData={currentData.data_quality} selectedColumn={selectedColumn} />
              </Suspense>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <StatsCard data={currentData.data_quality} />
            {SideBar(currentData)}
          </div>
        </div>
      </div>
    </>
  );
};

export default DataQualityPage;

const VisualizationSkeleton = () => {
  return (
    <div className="flex flex-row items-top w-[850px] justify-center">
      <div className="card shadow-sm p-6 bg-base-200 w-[430px] h-[500px] mr-4">
        <div className="flex justify-between items-center mb-6 mt-4 px-4">
          <h3 className="card-title">PII Distribution</h3>
          <CardMenu />
        </div>
        <div className="skeleton w-[380px] h-[300px] bg-base-300"></div>
      </div>
      <div className="card shadow-sm p-6 bg-base-200 w-1/2 max-w-lg h-[500px]">
        <div className="w-full flex flex-row items-center justify-between mb-2">
          <h3 className="card-title">Redundancy Rate</h3>
          <CardMenu />
        </div>
        <div className="flex flex-row items-center justify-start mb-6 w-full">
          <div className="badge text-lg px-4 py-4 mb-1 w-32"></div>
        </div>
        <div className="skeleton w-[390px] h-[300px] bg-base-300"></div>
      </div>
    </div>
  )
}

const PageSkeleton = () => {
  return (
    <>
      <div className="w-full overflow-x-hidden bg-base-100 px-12 py-4">
        <div className="flex w-full items-center justify-center">
          <Tabs />
        </div>
        <div className="w-full flex flex-row gap-8 items-top justify-center my-10 fadeInUp">
          <div className="flex flex-wrap items-top xl:w-4/5 lg:w-3/5 rounded-xl shadow-md py-8 px-8 bg-base-200 max-w-screen-xl">
            <div className="flex flex-row items-center justify-evenly w-4/5 gap-3 px-4 h-fit">
              <h1 className="font-bold text-3xl mb-5">Data Quality</h1>
              <div className="flex items-center h-fit w-fit">
                <h3 className="text-xs mr-1 mb-4 font-bold">COLUMN</h3>
                <div className="skeleton mb-4 ml-2 rounded-lg text-transparent h-9 min-w-[150px] max-w-[1000px] font-semibold bg-neutral"></div>
              </div>
            </div>
            <div className="skeleton w-1/2 h-72 bg-base-300 m-8"></div>
            <div className="skeleton w-1/4 h-72 bg-base-300 m-8"></div>
            <div className="skeleton w-1/4 h-72 bg-base-300 m-8"></div>
            <div className="skeleton w-1/2 h-72 bg-base-300 m-8"></div>
          </div>
          <div className="skeleton h-[820px] w-52 bg-base-300"></div>
        </div>
      </div>
    </>
  );
}

const SideBar = (currentData) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="card bg-base-200 w-[220px] h-fit shadow-md">
        <div className="card-body">
          <h3 className="text-md font-semibold">Constant Columns</h3>
          {currentData.data_quality.constant_columns.length > 0 ? (
            <ul>
              {currentData.data_quality.constant_columns.map((column, index) => (
                <li className="badge text-lg px-4 py-4 mb-1" key={index}>{column}</li>
              ))}
            </ul>
          ) : (
            <p>No constant columns found.</p>
          )}

          <div className="divider"></div>

          <h3 className="text-md font-semibold">Duplicate Rows</h3>
          <p>{currentData.data_quality.duplicate_rows} duplicate row(s).</p>
        </div>
      </div>
      <div className="card bg-base-200 w-[220px] h-fit shadow-md">
        <div className="card-body">
          <h3 className="text-md font-semibold">Identified key fields</h3>
          {currentData.data_quality.key_field_analysis.identified_key_fields.length > 0 ? (
            <ul>
              {currentData.data_quality.key_field_analysis.identified_key_fields.map((field, index) => (
                <li className="badge text-sm px-4 py-4 mb-1" key={index}>{field}</li>
              ))}
            </ul>
          ) : (
            <p>No key fields found.</p>
          )}
        </div>
      </div>
    </div>
  )
}