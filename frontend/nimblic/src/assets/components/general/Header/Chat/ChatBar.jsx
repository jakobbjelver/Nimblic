import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';
import ChatWindow from './ChatWindow';
import ReactDOM from 'react-dom';
const ChatBar = ({ isChatBarOpen, setIsChatBarOpen }) => {
  const chatWindowRef = useRef();
  const inputRef = useRef(null);  // Create a new ref for the input

  const [isSending, setSending] = useState(false);
  const [isDisabled, setDisabled] = useState(false);

  const handleInputClick = (event) => {
    if (inputRef.current) {
      inputRef.current.focus(); // Manually focus the input field
    }
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop propagation to avoid toggling
  };

  useEffect(() => {
    if (isChatBarOpen && inputRef.current && chatWindowRef.current) {
      inputRef.current.focus();
    } else {
      setDisabled(false)
    }
  }, [isChatBarOpen]);

  const handleKeySend = (event) => {
    if (event.key === 'Enter') {

      if (!isChatBarOpen || isDisabled || isSending || !inputRef.current.value) return;

      event.preventDefault();
      const message = event.currentTarget.value;
      chatWindowRef.current.sendMessage(message);
      event.currentTarget.value = ''; // Clear the input field
    } else if (event.key === ' ') {
      event.stopPropagation();
    }
  }

  const handleButtonSend = (event) => {
    if (!isChatBarOpen || isDisabled || isSending || !inputRef.current.value) return;

    console.log("Sending via button")
    const message = inputRef.current.value
    chatWindowRef.current.sendMessage(message);
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop propagation to avoid toggling
  }

  const FormInput = forwardRef((props, ref) => (
    <>
      <div className="relative z-[1000] w-72 ui-open:w-full transition-all" ref={ref} {...props}>
        <input
          type="text"
          placeholder="Ask AI"
          className="input input-bordered w-full rounded-xl"
          onKeyDown={handleKeySend}
          ref={inputRef}
          onClick={isChatBarOpen ? handleInputClick : null}  // Updated click handler
        />
        <label className={`swap ui-open:swap-active h-8 w-8 absolute right-3 bottom-[8px] p-1 rounded-md ${isChatBarOpen ? isDisabled || isSending ? 'bg-primary/50 cursor-wait transition-colors' : 'bg-primary hover:bg-primary/90 transition-colors' : ''}`} onClick={handleButtonSend}>
          <div className="swap-off cursor-pointer"><ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8 text-primary" aria-hidden="true" /></div>
          <div className="swap-on cursor-pointer flex items-center justify-center">
            {!isSending ?
              <PaperAirplaneIcon className="h-8 w-8 p-1 rounded-md text-slate-200" aria-hidden="true" />
              :
              <div className="loading loading-spinner loading-sm text-base-300"></div>
            }
          </div>
        </label>
      </div>
    </>
  ));

  return (
    <>
      <div className="flex-1 mr-24 ml-2">
        <div className="form-control flex items-center relative w-[750px]">
          <Popover
            className="relative w-full transition-all"
          >
            {({ open, close }) => {
              useEffect(() => {
                if (open !== isChatBarOpen) {
                  setIsChatBarOpen(open);
                }
              }, [open]);

              return (
                <>
                  <Popover.Button
                    as={FormInput}  // Updated click handler
                  />
                  <Transition
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1 w-80"
                    enterTo="opacity-100 translate-y-0 w-full"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0 w-full"
                    leaveTo="opacity-0 translate-y-1 w-80"
                    className="z-20"
                  >
                    <Popover.Panel className="absolute w-full top-[-10px] shadow-xl bg-base-200 z-20 rounded-b-xl"> {/* Increase z-index here */}
                      <div className="w-full mt-5 ui-not-open:hidden">
                        <ChatWindow ref={chatWindowRef} setSending={setSending} isSending={isSending} setShowTopicSelection={setDisabled} showTopicSelection={isDisabled} />
                      </div>
                    </Popover.Panel>
                  </Transition>
                  {open && ReactDOM.createPortal(
                    <div className="fixed inset-0 backdrop-blur-lg z-10" onClick={() => close()}>
                    </div>,
                    document.body
                  )}
                </>
              );
            }}
          </Popover>
        </div>
      </div>
    </>
  );
};

export default ChatBar;
