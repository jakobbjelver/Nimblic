import React, { useState, useEffect } from 'react';
import { createWorker } from '../../../../workers/createWorker';
import { proxy } from 'comlink';
import { useModal } from '../Modal/ModalContext';

const SampleFile = ({ file, fileSizeLimit, onSampled }) => {
  const [progressValue, setProgressValue] = useState(0);
  const [progressText, setProgressText] = useState('Preparing sampling');
  const [isError, setError] = useState();
  const { closeModal } = useModal(); // Assuming this is your modal context

  useEffect(() => {

    setError(null)

    const handleProgressUpdate = proxy((newProgress) => {
      const progress = 10 + 80 * (newProgress / 100);
      setProgressValue(progress)
      setProgressText("Sampling data...")
    });

    // Implement the sampling logic here
    const handleSampling = async () => {

      let fileName = file.name

      setProgressText("Preparing sampling...")

      const reader = new FileReader();

      try {
        const worker = await createWorker();

        // Access the proxied progress state
        worker.subscribeToProgress(handleProgressUpdate);

        reader.onload = async (event) => {
          try {
            const fileData = event.target.result;

            const processedData = await worker.processFile(file.type, fileData, fileSizeLimit);

            setProgressText("Finishing up...")

            if (processedData.success) {
              closeModal();

              processedData.data.isSampled = true

              processedData.data.name = fileName

              onSampled(processedData.data);
            } else {
              handleWorkerError(processedData.error);
            }
          } catch (error) {
            console.error("Worker error:", error);
            handleWorkerError(error);
          }
        };

        if (['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }

      } catch (error) {
        console.error("Error initializing web worker:", error.message);
        handleWorkerError(error.message);
      }
    };

    function handleWorkerError(errorMessage) {
      setError(errorMessage)
    };

    handleSampling();
  }, []);

  return (
    !isError ? 
      <div className="flex flex-col items-start px-4">
      <h3 className="font-bold text-2xl">Performing Data Sampling</h3>
      <p className="py-4 flex items-center text-lg">Your file is being sampled in the background. This operation might take a while.</p>
      <div className="flex flex-col items-center justify-center w-full py-6 mb-8">
        <p className="text-lg py-2">{progressText}</p>
        <div className="w-5/6 h-4 bg-base-100 rounded-full overflow-hidden">
          <div
            className="bg-secondary h-full transition-all duration-500 ease-out"
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      </div>
    </div>
    : 
    <div className="flex flex-col items-start px-4">
    <h3 className="font-bold text-2xl">Data Sampling failed</h3>
    <p className="py-12 flex items-center text-lg">The data sampling operation ran into errors while executing. Please try again with another file.</p>
    <p className="text text-xs ml-4">Details: {isError}</p>
  </div>  
  );
};

export default SampleFile;
