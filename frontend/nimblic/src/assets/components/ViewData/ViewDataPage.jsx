import React, { useEffect, useState, useContext, useRef } from 'react';
import Tabs from '../general/Tabs/Tabs';
import { TabsContext } from '../general/Tabs/TabsContext';
import CardMenu from '../general/CardMenu';
import { FileUploadContext } from '../general/Upload/FileUploadContext';
import { truncateLabel } from 'src/utils/textFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faUpLong, faDownLong, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ViewDataPage = () => {
  const { uploadData, isUploading } = useContext(FileUploadContext);
  const { activeIndex } = useContext(TabsContext);
  const [isLoading, setLoading] = useState(true);
  const [sampleIndex, setSampleIndex] = useState(1);
  const navigate = useNavigate();

  const currentData = uploadData[activeIndex]?.summary?.sample_data;
  const currentHead = uploadData[activeIndex]?.summary?.sample_data.head;
  const currentTail = uploadData[activeIndex]?.summary?.sample_data.tail;
  const currentRandomSample = uploadData[activeIndex]?.summary?.sample_data[`random_sample_${sampleIndex + 1}`];


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!isUploading && currentData) {
      // Data is ready to be used
    } else if (!uploadData || Object.keys(uploadData).length <= 0 && !isUploading) {
      navigate('/')
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

  return (
    <>
      <div className="w-full overflow-x-hidden bg-base-100 px-12 py-4 mt-20">
        <div className="flex w-full items-center justify-center">
            <Tabs />
        </div>
        <div className="flex flex-wrap w-full justify-center items-center fadeInUp">
          <div className="flex flex-col w-full h-fit items-center justify-center py-4 gap-10">
            <div className="card w-11/12 overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden pr-0">
              <div className="flex flex-row justify-between items-center mb-4 mr-8">
                <h2 className="card-title font-nunito font-bold ml-8 text-2xl">Head<FontAwesomeIcon icon={faUpLong} size="sm"/></h2>
                <CardMenu />
              </div>
              <div className="divider divider-neutral w-full mt-[-10px]"></div>
              <GradientTable data={currentHead} isLoading={isLoading}/>
            </div>
            <div className="card w-11/12 overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden pr-0">
              <div className="flex flex-row justify-between items-center mb-4 mr-8">
                <h2 className="card-title font-nunito font-bold ml-8 text-2xl">Tail<FontAwesomeIcon icon={faDownLong} size="sm"/></h2>
                <CardMenu />
              </div>
              <div className="divider divider-neutral w-full mt-[-10px]"></div>
              <GradientTable data={currentTail} isLoading={isLoading}/>
            </div>
            <div className="card w-11/12 overflow-auto shadow-sm p-6 bg-base-300 px-6 overflow-x-hidden pr-0">
              <div className="flex flex-row justify-between items-center mb-4 mr-8">
                <div className="flex flex-row gap-10">
                  <h2 className="card-title font-nunito font-bold ml-8 text-2xl">Random sample<FontAwesomeIcon icon={faShuffle} size="sm"/></h2>
                  <div className="flex items-center justify-center h-full w-fit gap-4">
                    <button onClick={() => setSampleIndex(Math.max(0, sampleIndex - 1))} className="btn btn-circle btn-sm bg-base-100 shadow-none"><FontAwesomeIcon icon={faArrowLeft} size="1x" /></button>
                    <h3 className="text-2xl mr-1 font-bold flex flex-row items-center gap-1">{sampleIndex + 1}<p className="text-sm font-semibold">/ 3</p></h3>
                    <button onClick={() => setSampleIndex(Math.min(2, sampleIndex + 1))} className="btn btn-circle btn-sm bg-base-100 shadow-none"><FontAwesomeIcon icon={faArrowRight} size="1x" /></button>
                  </div>
                </div>
                <CardMenu />
              </div>
              <div className="divider divider-neutral w-full mt-[-10px]"></div>
              <GradientTable data={currentRandomSample} isLoading={isLoading}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDataPage;

const GradientTable = ({ data, isLoading }) => {
  const tableContainerRef = useRef(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);
  const scrollAmount = 200;

  useEffect(() => {
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft <= scrollWidth - clientWidth - 1);
    };

    const tableContainer = tableContainerRef.current;

    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
      return () => tableContainer.removeEventListener('scroll', handleScroll);
    }
  }, []); // Empty dependency array to run only on mount

  const prevTableSlide = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft -= scrollAmount;
    }
  };

  const nextTableSlide = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += scrollAmount;
    }
  };

  return (
    <>
      <div className="relative w-full">
        <div className={`${showLeftGradient ? 'opacity-50' : 'opacity-0'} transition-all duration-700 absolute top-0 left-0 h-full bg-gradient-to-r from-base-300 to-transparent w-40 z-[10]`}></div>
        <div ref={tableContainerRef} className="overflow-auto scroll-smooth">
        {(!data || data.length === 0 || isLoading) ? (
            <div className="skeleton bg-base-300 w-full h-[250px]"></div>
          ) : (
          <table className="table table-xs table-zebra table-pin-rows">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key, index) => (
                  <th key={index} className="text-md bg-base-100 text-base-content">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-neutral">
                  {Object.values(row).map((value, valueIndex) => (
                    <td key={valueIndex}>{renderValue(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        <div className={`${showRightGradient ? 'opacity-50' : 'opacity-0'} transition-all duration-700 absolute top-0 right-0 h-full bg-gradient-to-l from-base-300 to-transparent w-40 z-[10]`}></div>
      </div>
      <div className="absolute flex justify-between transform -translate-y-1/2 left-1 right-1 bottom-1/3 z-[20]">
            <button onClick={() => prevTableSlide()} className={`btn btn-circle ${!showLeftGradient ? 'opacity-50' : 'opacity-100'} bg-base-100 shadow-md z-[20]`}><FontAwesomeIcon icon={faArrowLeft} /></button>
            <button onClick={() => nextTableSlide()} className={`btn btn-circle ${!showRightGradient ? 'opacity-50' : 'opacity-100'} bg-base-100 shadow-md z-[20]`}><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
    </>
  );
};


const renderValue = (value) => {
  if (typeof value === 'number' && value) {
    return truncateLabel(value.toFixed(0).toString(), 10)
  } else if (typeof value === 'object' && value !== null) {
    // Join the object's values into a comma-separated list
    return Object.values(value).join(', ');
  } else {
    return value ? truncateLabel(value.toString(), 50) : '0';
  }
};