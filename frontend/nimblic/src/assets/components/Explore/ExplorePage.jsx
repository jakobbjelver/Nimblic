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
import userManager from '../../services/user/userManager';
import AnalysisManager from '../../services/analyses/analysisManager'
import { decode } from 'src/utils/shareUtil';
import { FileUploadContext } from '../general/Upload/FileUploadContext';
import { AlertContext } from '../general/Alert/AlertContext';
import { parseFromStorage } from 'src/utils/fileUtil';
import { getFirebaseErrorMessage } from 'src/utils/errorUtil';
import { getCurrentTime } from '../../../utils/textFormat';

const ExplorePage = () => {
  const { id } = useParams(); // Obtain the optional parameter
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { uploadData, isUploading, setUploadData } = useContext(FileUploadContext);
  const { setErrorMessage, setInfoMessage } = useContext(AlertContext);
  const { activeIndex } = useContext(TabsContext);
  const [currentData, setCurrentData] = useState(uploadData[activeIndex]);

  // Process to run when ID is present
  const processWithId = async () => {
    if (id) {
      setLoading(true);
      await userManager.waitForUserLoad()

      if(!userManager.getUserAuth()) return 

      const manager = new AnalysisManager(null)

      console.log("PARAM: ", id)

      const { userId, analysisId } = decode(id)

      console.log("USER ID: ", userId)
      console.log("ANALYSIS ID: ", analysisId)

      try {
        navigate('/explore');
        const rawData = await manager.fetchAnalysis(analysisId, userId)

        if (!rawData) {
          setErrorMessage({
            type: "error",
            short: `Failed to view analysis '${analysisId}'`,
            long: "Something went wrong when downloading the analysis. It seems like you have access, but the analysis data might be deleted or moved.",
            details: error,
            time: getCurrentTime()
          });
          return;
        }

        let analysisData = parseFromStorage(rawData)
        console.log("DOWNLOADED ANALYSIS: ", analysisData)
        setUploadData(prevData => [...prevData, analysisData])
        console.log("NEW UPLOAD DATA: ", uploadData)
        navigate('/explore');
        setInfoMessage({
          type: "info",
          short: `Analysis '${analysisData.metadata.name}' downloaded`,
          time: getCurrentTime()
        });

      } catch (error) {
        let errorMessage;
        if(error.code == "permission-denied") {
          errorMessage = `Missing permission to access analysis`
        }
        setErrorMessage({
          type: "error",
          short: errorMessage || `Failed to download analysis '${analysisId}'`,
          long: `${getFirebaseErrorMessage(error)} Analysis: ${analysisId}`,
          details: error,
          time: getCurrentTime()
        });

      }
    }
  };

  // Check if user is authenticated
  // Else, redirect to login page, make the onLoginSuccess navigate back here
  // Load analysis from firebase
  // Handle unauthorized access with an error message alert
  // Load analysis (like in AnalysisSection) to uploadData
  useEffect(() => {
    processWithId();
  }, []);

  useEffect(() => {
    if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      navigate('/')
    } else {
      const newData = uploadData[activeIndex];
      setCurrentData(newData);
    }
  }, [uploadData, isUploading, activeIndex]);

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

