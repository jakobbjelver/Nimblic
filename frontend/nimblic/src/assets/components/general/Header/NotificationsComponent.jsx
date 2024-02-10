import React, { useState, useContext } from 'react';
//import { AlertContext } from '../Alert/AlertContext';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { AlertContext } from '../Alert/AlertContext';
import FormSubmitButton from '../FormSubmitButton';

const NotificationsComponent = () => {
  const { notifications } = useContext(AlertContext);
  const [currentFormData, setCurrentFormData] = useState('')

  const domain = "https://us-central1-artilas-ecbb9.cloudfunctions.net/app"

  const handleFormDataChange = (formData) => {
    setCurrentFormData(formData);
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
                  <div className="w-full flex items-end justify-end mt-6">
                    <form className="flex flex-row w-40">
                      <FormSubmitButton
                        formData={{text: currentFormData }}
                        textStates={{success: 'Feedback sent!', default: 'Send feedback', error: 'Error sending'}}
                      />
                    </form>
                    </div>
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

