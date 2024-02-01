import React, { useState, useEffect, useContext } from 'react';
import { FileUploadContext } from '../general/Upload/FileUploadContext';

const ProcessLine = ({ isLoading }) => {
    const { uploadData, isUploading } = useContext(FileUploadContext);

    const initialState = [{ state: 1 }, { state: 1 }, { state: 1 }]; // 1 = resting, 2 = loading, 3 = finished
    const [state, setState] = useState(initialState);
    const [inProgress, setInProgress] = useState(false);

    useEffect(() => {
        if (isLoading && !isUploading) {
            setInProgress(true);
            setState(prev => [
                { ...prev[0], state: 2 },
                { ...prev[1], state: 1 },
                { ...prev[2], state: 1 },
            ]);
        }

        if (!isLoading && isUploading) {
            setInProgress(true);
            setState(prev => [
                { ...prev[0], state: 3 },
                { ...prev[1], state: 2 },
                { ...prev[2], state: 1 },
            ]);
        }

        if (!isLoading && !isUploading && inProgress) {
            setState(prev => [
                { ...prev[0], state: 3 },
                { ...prev[1], state: 3 },
                { ...prev[2], state: 3 },
            ]);
            
            const timer = setTimeout(() => {
                setState(prev => [
                    { ...prev[0], state: 1 },
                    { ...prev[1], state: 1 },
                    { ...prev[2], state: 1 },                  
                ]);
                setInProgress(false);
            }, 3000);

            return () => {
                setInProgress(false);
                clearTimeout(timer) 
            };
        }
    }, [uploadData, isLoading, isUploading, inProgress]);

    return (
        <ul className="steps flex flex-row my-4 w-4/6 transition-all">
            {state.map((value, index) => (
                <li key={index} className={`step w-full text-sm relative transition-all
                ${value.state === 1 ? 'step-neutral-focus' : 
                value.state === 2 ? 'step-primary' : 
                value.state === 3 ? 'step-primary' : ''}`}
                data-content={`${value.state === 1 ? index + 1 : ''}`}>
                {value.state === 2 && <div className={`loading loading-ring text-neutral absolute z-10`}></div>}
                {value.state === 3 && <svg xmlns="http://www.w3.org/2000/svg" className="stroke-neutral shrink-0 h-6 w-6 absolute z-10" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </li>
            ))}
        </ul>
    );
}

export default ProcessLine;
