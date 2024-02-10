import React, { useEffect, useState, useContext } from 'react';
import ChangePointCard from './Cards/ChangePointCard';
import CorrelationNetworkCard from './Cards/CorrelationNetworkCard';
import DataQualityCard from '../DataQuality/DataQualityCard';
import GraphRecommendationsCard from './Cards/GraphRecommendationsCard';
import StatisticalSummaryCard from '../Statistics/StatisticalSummaryCard';
import OverviewCard from './Cards/OverviewCard';
import FileUpload from '../general/Upload/Page/File/FileUpload';
import DataQualityScore from './Score/DataQualityScore';
import RowCount from './Score/RowCount';
import ColumnCount from './Score/ColumnCount';
import MemoryUsage from './Score/MemoryUsage';
import SkeletonScore from './Score/SkeletonScore';
import FileInfo from './Score/FileInfo';
import { useNavigate } from 'react-router-dom';
import Tabs from '../general/Tabs/Tabs';
import { useParams } from 'react-router-dom';
import { TabsContext } from '../general/Tabs/TabsContext';

import { FileUploadContext } from '../general/Upload/FileUploadContext';

const ExplorePage = () => {
  const { id } = useParams(); // Obtain the optional parameter
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { uploadData, isUploading, errorMessage } = useContext(FileUploadContext);
  const { activeIndex } = useContext(TabsContext);
  const [currentData, setCurrentData] = useState(uploadData[activeIndex]);

  // Process to run when ID is present
  const processWithId = async () => {
    if (id) {
      setLoading(true);
      // Check if user is authenticated
      // Else, redirect to login page, make the onLoginSuccess navigate back here
      // Load analysis from firebase
      // Handle unauthorized access with an error message alert
      // Load analysis (like in AnalysisSection) to uploadData
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Handle errors, navigate back to home page and put on error message
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    processWithId();
  }, [id]); // Only run this effect if `id` changes

  useEffect(() => {
    if (!isUploading && uploadData) {
      const newData = uploadData[activeIndex];
      setCurrentData(newData);

    } else if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      //navigate('/')
    }
  }, [uploadData, isUploading, activeIndex]);

  useEffect(() => {
    if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      //navigate('/')
    }
  }, []);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Check if currentData is available and not empty
    if (activeIndex === -1) return
    else {
      if (currentData) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, [currentData, activeIndex, uploadData]); // Depend on currentData


  return (
    <>
      <div className="w-full overflow-x-hidden bg-base-100 px-12 py-4 max-w-screen-xl mt-20">
        <div className="flex w-full items-center justify-center">
          <Tabs />
        </div>
        <div className="flex flex-row justify-center gap-4 w-full py-6 fadeInUp">
          <div className="stats shadow dark:bg-base-200">
            {!isLoading ? <DataQualityScore dataQuality={currentData?.data_quality} /> : <SkeletonScore title={'Quality Score'} />}
            {!isLoading ? <RowCount summary={currentData?.summary} /> : <SkeletonScore title={'Row Count'} />}
            {!isLoading ? <ColumnCount summary={currentData?.summary} /> : <SkeletonScore title={'Column Count'} />}
            {!isLoading ? <MemoryUsage metadata={currentData?.metadata} summary={currentData?.summary} /> : <SkeletonScore title={'Memory Usage'} />}
          </div>
        </div>
        <div className="flex md:flex-col lg:flex-row xl:flex-row 2xl:flex-row justify-between gap-4 py-2 fadeInUp">
          <ChangePointCard changePoints={currentData?.change_points} isLoading={isLoading} className="w-1/2" />
          <CorrelationNetworkCard correlationNetworkJson={currentData?.correlation_network} isLoading={isLoading} className="w-1/2" />
        </div>

        {/* StatisticalSummaryCard and DataQualityCard */}
        <div className="flex md:flex-col lg:flex-col xl:flex-row 2xl:flex-row justify-between gap-4 py-2 fadeInUp">
          <StatisticalSummaryCard statisticalSummary={uploadData[activeIndex] ? uploadData[activeIndex].statistical_summary : null} isLoading={isLoading} className="flex-2/3" />
          <DataQualityCard dataQuality={currentData?.data_quality} summary={currentData?.summary} isLoading={isLoading} className="flex-none w-1/3" />
        </div>

        {/* GraphRecommendationsCard */}
        <div className="flex justify-between gap-4 py-2 fadeInUp">
          <GraphRecommendationsCard graphRecommendations={currentData?.graph_recommendations} isLoading={isLoading} className="w-full" />
        </div>
      </div>
    </>
  );
};

export default ExplorePage;

