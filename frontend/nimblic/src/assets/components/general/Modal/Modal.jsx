import { Fragment, useRef, useContext, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ModalContext } from './ModalContext'; // Adjust the import path as needed
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const Modal = () => {
  const { isModalOpen, modalContent, onConfirm, closeModal, modalActions } = useContext(ModalContext);
  const cancelButtonRef = useRef(null);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeModal();
  };

  return (
    <Transition.Root show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" initialFocus={cancelButtonRef} onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-opacity-50 bg-black transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-[99999] w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-base-200 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <button
                  className="btn btn-square btn-error btn-sm btn-outline absolute right-4 top-4"
                  onClick={closeModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="bg-base-300 px-4 pt-5 p-6 pb-0">
                  <div className="flex flex-col sm:items-start">
                    {modalContent}
                  </div>
                </div>
                <div className="bg-base-200 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                  {modalActions && modalActions.length !== 0 && (
                    <Fragment>
                      <button
                        type="button"
                        className={`btn w-24 min-w-fit ${modalActions[1] === 'Delete' ? 'btn-error' : 'btn-info'
                          }`}
                        onClick={() => handleConfirm()}
                      >
                        {modalActions[1]}
                      </button>
                      <button
                        type="button"
                        className="btn bg-base-300 w-24 min-w-fit "
                        onClick={closeModal}
                        ref={cancelButtonRef}
                      >
                        {modalActions[0]}
                      </button>
                    </Fragment>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
};

export default Modal;
