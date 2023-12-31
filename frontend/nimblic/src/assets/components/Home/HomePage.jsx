import React, { useState, useRef, useContext, useEffect } from 'react';
import FileUpload from '../general/Upload/FileUpload';
import GradientText from './GradientText';
import ProcessLine from './ProcessLine';
import { FileUploadContext } from '../general/Upload/FileUploadContext';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faFileExcel, faFileCode, faFile, faEye, faArrowRight, faScrewdriverWrench, faUpload } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const fileUploadRef = useRef(null);
  const [animateUpload, setAnimateUpload] = useState(false);
  const { setUploadData, setIsUploading } = useContext(FileUploadContext);

  useEffect(() => {
    setUploadData([])
    localStorage.setItem('uploadData', []);
    localStorage.setItem('notifications', []);
    setIsUploading(false)
  }, []);

  const handleExampleFile = (fileName, fileExtension) => {
    // Determine MIME type based on file extension
    const mimeTypes = {
      'csv': 'text/csv',
      'json': 'application/json',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xml': 'application/xml',
    };
    const mimeType = mimeTypes[fileExtension] || 'text/plain';

    fetch(`/sample_data/${fileName}.${fileExtension}`)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], `${fileName}.${fileExtension}`, { type: mimeType });
        fileUploadRef.current.triggerDrop(file);
      })
      .catch(error => console.error('Error loading file:', error));
  };

  const indicateUploadArea = () => {
    setAnimateUpload(true);
    setTimeout(() => {
      setAnimateUpload(false);
    }, 500); // Duration of the animation
  };

  return (
    <div className="flex flex-col w-screen lg:px-32 md:px-16 px-8 overflow-y-visible h-screen">
      <main className="flex-grow flex lg:flex-row xl:flex-row 2xl:flex-row">
        <div className="flex flex-col w-full lg:w-2/3 md:w-2/3 text-left py-16 fadeInUp"> 
          <h3 className="text-xs font-extrabold text-primary mb-6 md:text-sm lg:text-sm xl-text-sm 2xl:text-sm">EXPLORE SWIFTLY WITH NIMBLIC</h3>
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-nunito font-extrabold text-neutral-content/90" >The easiest</h1>
          <div className="relative">
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary text-4xl md:text-4xl lg:text-6xl font-nunito font-extrabold">
              Exploratory Data Analysis
            </h1>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-nunito text-neutral-content/90 font-extrabold" >for your data</h1>
          <br></br>
          <p className="lg:text-lg md:text-lg sm:text-sm text-neutral-content/80 w-5/6">
            Nimblic is your best solution to perform an early-on EDA, to
            discover crucial insights about your data before you use it.
          </p>
          <br></br>
          <p className="text-md font-bold text-neutral-content/95">
            Free usage • Data safe • Open Source
          </p>
          <div className="w-2/3 hidden lg:flex md:flex sm:flex xl:flex 2xl:flex flex-row gap-5 my-10">
            <div className="dropdown dropdown-hover dropdown-top relative">
              <label tabIndex={0} className="btn btn-lg btn-accent btn-outline w-max">Try examples</label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu menu-lg p-2 shadow bg-base-100 rounded-box w-max absolute left-1/2 transform -translate-x-1/2 mt-1">
                <li><a onClick={() => handleExampleFile('countries', 'xlsx')}>
                  <FontAwesomeIcon icon={faFileExcel} size="1x" className="text-teal-600" title="Excel File" />
                  Countries.xlsx
                </a></li>
                <li><a onClick={() => handleExampleFile('earthquakes', 'json')}>
                  <FontAwesomeIcon icon={faFileCode} size="1x" className="text-orange-600" title="JSON File" />
                  Earthquakes.json
                </a></li>
                <li><a onClick={() => handleExampleFile('air_quality', 'xml')}>
                  <FontAwesomeIcon icon={faFile} size="1x" className="text-blue-600" title="XML File" />
                  Air quality.xml
                </a></li>
                <li><a onClick={() => handleExampleFile('ufo_sightings', 'csv')}>
                  <FontAwesomeIcon icon={faFileCsv} size="1x" className="text-green-600" title="CSV File" />
                  UFO sightings.csv
                </a></li>
              </ul>
            </div>
            <button className="btn btn-lg border-none bg-gradient-to-r from-primary via-info to-secondary 
            transition-all duration-300 ease-out hover:ease-linear
                  bg-size-200 bg-pos-0 hover:bg-pos-100
                    text-base-100 font-bold group"
              onClick={indicateUploadArea}>
              Start Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="hidden h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path></svg>
            </button>
          </div>
        </div>
        <div className="hidden sm:flex xl:flex 2xl:flex lg:flex md:flex flex-col mt-24 bg-home-drop-shape  w-4/6 h-full items-center justify-top fadeInUp">
          <FileUpload ref={fileUploadRef} extraClassName={animateUpload ? 'animate-bounce' : ''} />
          <div className="flex flex-row justify-around items-center mt-5 px-5 py-3 gap-7 bg-neutral/10 shadow rounded-lg backdrop-blur-md">
            <div className="tooltip" data-tip="CSV File">
              <FontAwesomeIcon icon={faFileCsv} size="2x" className="text-green-600" />
            </div>
            <div className="tooltip" data-tip="Excel File">
              <FontAwesomeIcon icon={faFileExcel} size="2x" className="text-teal-600" />
            </div>
            <div className="tooltip" data-tip="JSON File">
              <FontAwesomeIcon icon={faFileCode} size="2x" className="text-orange-600" />
            </div>
            <div className="tooltip" data-tip="XML File">
              <FontAwesomeIcon icon={faFile} size="2x" className="text-blue-600" />
            </div>
          </div>
        </div>
      </main>
      <div className="w-full absolute left-1/2 top-0 z-[-1] -translate-x-1/2 blur-3xl overflow-hidden" aria-hidden="true">
        <div
          className="md:aspect-[1155/678] 2xl:aspect-[1455/678] aspect-[678/678] w-full bg-gradient-to-tr from-secondary to-primary opacity-40"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 50% 15%, 4% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;

