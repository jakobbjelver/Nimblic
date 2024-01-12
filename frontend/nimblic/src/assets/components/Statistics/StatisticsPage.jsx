import React, { useEffect, useState, useContext, Suspense, useRef } from 'react';
import Tabs from '../general/Tabs/Tabs';
import { TabsContext } from '../general/Tabs/TabsContext';
import { useNavigate } from 'react-router-dom';
import { FileUploadContext } from '../general/Upload/FileUploadContext';
import NumericalAnalysisSkeleton from '../general/Skeletons/NumericalAnalysisSkeleton';
import CategoricalAnalysisSkeleton from '../general/Skeletons/CategoricalAnalysisSkeleton';
import TextAnalysisSkeleton from '../general/Skeletons/TextAnalysisSkeleton';
//import CategoricalAnalysis from './Page/CategoricalAnalysis';
//import NumericalAnalysis from './Page/Numerical/NumericalAnalysis';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faQuoteLeft, faHashtag, faList, faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons';

const StatisticsPage = () => {
  const { uploadData, isUploading } = useContext(FileUploadContext);
  const { activeIndex } = useContext(TabsContext);
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  const NumericalAnalysis = React.lazy(() => import('./Page/Numerical/NumericalAnalysis'));
  const CategoricalAnalysis = React.lazy(() => import('./Page/Categorical/CategoricalAnalysis'));
  const TextAnalysis = React.lazy(() => import('./Page/Text/TextAnalysis'));
  const CorrelationAnalysis = React.lazy(() => import('./Page/CorrelationAnalysis'));

  const currentData = uploadData[activeIndex];

  const tabItems = [
    { name: 'TEXT', icon: faQuoteLeft, isLoading: !currentData?.statistical_summary?.object_analysis && !isLoading ? true : false },
    { name: 'NUMERICAL', icon: faHashtag, isLoading: !currentData?.statistical_summary?.numerical_analysis && !isLoading ? true : false },
    { name: 'CATEGORICAL', icon: faList, isLoading: !currentData?.statistical_summary?.categorical_analysis && !isLoading ? true : false },
    { name: 'CORRELATION', icon: faArrowsLeftRight, isLoading: !currentData?.statistical_summary?.pearson_correlation && !isLoading ? true : false },
  ];

  const [activeTab, setActiveTab] = useState(tabItems[1]);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabsRef = useRef({});

  const handleTabClick = (tab) => {
    if (isLoading || tab.isLoading) return
    setActiveTab(tab);
    const tabElement = tabsRef.current[tab.name];
    if (!tabElement) return
    setUnderlineStyle({
      left: tabElement.offsetLeft + 'px',
      width: tabElement.offsetWidth + 'px',
    });
  };

  useEffect(() => {
    handleTabClick(activeTab);
  }, [activeTab, isLoading]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
        navigate('/')
    }
}, []);

  useEffect(() => {
    if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      navigate('/')
    }
  }, []);

  useEffect(() => {
    // Check if currentData is available and not empty
    if (activeIndex === -1) return
    else {
      if (currentData?.statistical_summary) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, [currentData, activeIndex]); // Depend on currentData


  return (
    <>
      <div className="w-full mt-20 overflow-x-hidden max-w-screen-2xl bg-base-100 px-12 py-4 flex flex-col items-center justify-center">
        <div className="flex w-full items-center justify-center">
            <Tabs />
        </div>
        <div className="mt-10 grid grid-cols-4 justify-center mx-12 px-2 pt-2 relative rounded-xl shadow-sm bg-base-200">
          {tabItems.map((tab, index) => (
            <>
              <div key={index}
                ref={el => tabsRef.current[tab.name] = el}
                disabled={isLoading || tab.isLoading}
                className="tab font-nunito font-bold text-md cursor-pointer mb-1.5 hover:text-neutral-content/70 transition-all"
                onClick={() => handleTabClick(tab)} >
                {!tab.isLoading ?
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  :
                  <div className="loading loading-spinner loading-sm text-secondary mr-2"></div>
                }
                {tab.name}
              </div>
            </>
          ))}
          <span className="absolute bottom-0 h-1 bg-secondary transition-all duration-200 rounded-lg" style={underlineStyle} />
        </div>
        {activeTab.name === 'TEXT' && (
          <div className="w-full overflow-x-hidden py-6 gap-10">

            {!isLoading ?
              <Suspense fallback={<TextAnalysisSkeleton />}>
                <TextAnalysis
                  textData={currentData?.statistical_summary?.object_analysis}
                  profileData={currentData?.statistical_summary?.profile}
                  isLoading={isLoading}
                />
              </Suspense>
              :
              <TextAnalysisSkeleton />
            }
          </div>

        )}

        {activeTab.name === 'NUMERICAL' && (
          <div className="overflow-x-hidden py-6 gap-10 w-full">

            {!isLoading ?
              <Suspense fallback={<NumericalAnalysisSkeleton />}>
                <NumericalAnalysis
                  numericalData={currentData?.statistical_summary?.numerical_analysis}
                  profileData={currentData?.statistical_summary?.profile}
                  isLoading={isLoading}
                />
              </Suspense>
              :
              <NumericalAnalysisSkeleton />
            }
          </div>

        )}

        {activeTab.name === 'CATEGORICAL' && (
          <div className="overflow-x-hidden py-6 gap-10">

            {!isLoading ?
              <Suspense fallback={<CategoricalAnalysisSkeleton />}>
                <CategoricalAnalysis
                  categoricalData={currentData?.statistical_summary?.categorical_analysis}
                  profileData={currentData?.statistical_summary?.profile}
                  isLoading={isLoading}
                />
              </Suspense>
              :
              <CategoricalAnalysisSkeleton />
            }
          </div>
        )}

        {activeTab.name === 'CORRELATION' && (
          <div className="w-full overflow-x-hidden py-6 gap-10">

            {!isLoading ?
              <Suspense fallback={<div className="skeleton w-full h-[1000px] base-200 fadeInUp"></div>}>
                {!isLoading && <CorrelationAnalysis correlationData={{
                  "Pearson": currentData?.statistical_summary?.pearson_correlation,
                  "Spearman": currentData?.statistical_summary?.spearman_correlation
                }}
                />
                }
              </Suspense>
              :
              <div className="skeleton w-full h-[1000px] base-200 fadeInUp"></div>
            }
          </div>

        )}
      </div>
    </>
  );
};

export default StatisticsPage;

