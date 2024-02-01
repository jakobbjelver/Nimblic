import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ExclamationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const MessageList = ({ messages, isSending }) => {
    const messageListRef = useRef(null);

    useEffect(() => {
        if(isSending && messageListRef.current) {
            if (messageListRef.current) {
                messageListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [isSending]);

    const renderAvatar = (message) => {
        switch (message.avatarType) {
            case 'user':
                return <img alt="Chat user" src={message.avatar} />;
            case 'error':
                return <ExclamationCircleIcon className="h-full w-full text-error" aria-hidden="true" />;
            case 'ai':
                return <img alt="AI chatbot" src={message.avatar} />;
            default:
                return <span className="text-xl">{message.name ? message.name.charAt(0).toUpperCase() : ':)'}</span>;
        }
    };

    return (
        <div ref={messageListRef} className="overflow-y-auto overflow-x-hidden max-h-[550px]">
            <div className="chat-window bg-base-200 py-4 px-8 mt-14 mb-12">
                <div className="messages flex gap-2 flex-col-reverse">
                    {messages.map((message, index) => (
                        <div key={index} className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}>
                            <div className={`chat-image avatar ${message.avatarType ? '' : 'placeholder bg-base-100 ring-1 ring-base-200 rounded-full'}`}>
                                <div className={`w-10 rounded-full ${message.avatarType === 'user' ? '' : message.avatarType === 'error' ? 'bg-base-300 flex items-center justify-center' : 'p-1 bg-base-300'}`}>
                                    {renderAvatar(message)}
                                </div>
                            </div>
                            <div className="chat-header mx-2">
                                {message.name}
                                <time className="text-xs opacity-50 ml-1">{message.time}</time>
                            </div>
                            <div className={`chat-bubble shadow-md ${message.type === 'user' ? 'before:bg-secondary bg-gradient-to-br from-primary to-secondary text-slate-200' : message.type === 'error' ? 'before:bg-error bg-gradient-to-tr from-error to-[#ed5f4e] text-neutral' : 'before:bg-base-100 bg-gradient-to-tr from-base-100 to-base-300 text-neutral-content/90'}`}>
                                {message.type === 'user' ? <p className="overflow-hidden text-ellipsis">{message.text}</p> : message.state == 'PROCESSING' ? <span className="loading loading-dots loading-sm mt-1 mx-1.5"></span> : <ReactMarkdown>{message.text}</ReactMarkdown>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessageList;
