import React, { useState, useEffect, useContext } from 'react';
//import { AlertContext } from '../Alert/AlertContext';
import { PaperAirplaneIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { AlertContext } from '../Alert/AlertContext';

const NotificationsComponent = () => {
  const { notifications } = useContext(AlertContext);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [currentFormData, setCurrentFormData] = useState('')

  const domain = "https://us-central1-artilas-ecbb9.cloudfunctions.net/app"

  const handleFormDataChange = (formData) => {
    setCurrentFormData(formData);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true)

    try {
      const timestamp = new Date().toISOString();
      const language = window.navigator.language;
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const metadata = {
        browserInfo: window.navigator.userAgent,
        timestamp,
        language,
        screenResolution,
      };


      const response = await fetch(`${domain}/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...currentFormData, metadata })
      });

      if (response.ok) {
        setIsLoading(false)
        console.log('Feedback submitted successfully');
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000); // Reset success message after 3 seconds
      } else if (response.status === 300) {
        setIsLoading(false)
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000); // Reset success message after 3 seconds
      }
      else {
        setIsLoading(false)
        console.error('Error submitting feedback', response);
        setSendError(true);
        setTimeout(() => setSendError(false), 3000); // Reset success message after 3 seconds
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Network error:', error);
      setSendError(true);
      setTimeout(() => setSendError(false), 3000); // Reset success message after 3 seconds
    }
  };

  return (
    <>
      <h3 className="font-bold text-lg">Notifications</h3>
      <div className="w-full h-fit max-h-96 overflow-y-auto my-6">
        {notifications && notifications?.length !== 0 ?
          Object.values(notifications).map((value, index) => (
            <div key={index} onClick={() => handleFormDataChange(value)} className={`collapse ${value.long ? 'collapse-arrow' : ''} bg-base-200 my-2`}>
              <input type="radio" name="my-accordion-2" />
              <div className={`collapse-title text-md font-semibold flex flex-row gap-2 justify-between items-center`}>
                <div className="flex flex-row items-center justify-center gap-4">
                  {value.type == 'success' && <CheckCircleIcon className="h-6 w-6 text-primary" aria-hidden="true" />}
                  {value.type == 'error' && <ExclamationCircleIcon className="h-6 w-6 text-error" aria-hidden="true" />}
                  {value.type == 'warning' && <ExclamationTriangleIcon className="h-6 w-6 text-accent" aria-hidden="true" />}
                  {value.type == 'info' && <InformationCircleIcon className="h-6 w-6 text-info" aria-hidden="true" />}
                  {value.short}
                </div>
                <div className="flex flex-row gap-1">
                  <ClockIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  <p className="font-light text-xs">{value.time}</p>
                </div>
              </div>
              {value?.long ?
                <div className="collapse-content flex flex-col items-center justify-center">
                  <div className="divider divider-neutral w-full mt-[-6px] mb-0"></div>
                  <p>{value.long}</p>
                  {value.type == 'warning' || value.type == 'error' &&
                    <form className="flex flex-row w-full items-end justify-end mt-6" onSubmit={handleSubmit}>
                      <button
                        className={`btn btn-sm h-9 w-44 ${sendSuccess ? "btn-secondary" : sendError ? "btn-error" : "btn-info"} text-md`}
                        type="submit">
                        {!isLoading ? (
                          sendSuccess ? (
                            <>
                              <p>Feedback sent!</p>
                              <CheckCircleIcon className="h-6 w-6 " aria-hidden="true" />
                            </>
                          ) : (
                            sendError ? (
                              <>
                                <p>Error sending</p>
                                <ExclamationTriangleIcon className="h-6 w-6 " aria-hidden="true" />
                              </>
                            ) : (
                              <>
                                Send feedback
                                <PaperAirplaneIcon className="h-6 w-6 " aria-hidden="true" />
                              </>
                            )
                          )
                        ) : (
                          <div className="loading loading-spinner loading-sm"></div>
                        )}
                      </button>

                    </form>
                  }
                </div>
                :
                ''}
            </div>
          ))
          :
          <div className="flex items-center justify-center h-40">
            <p className="text-lg">You do not have any notifications.</p>
          </div>
        }
      </div>

    </>
  );
};

export default NotificationsComponent;

