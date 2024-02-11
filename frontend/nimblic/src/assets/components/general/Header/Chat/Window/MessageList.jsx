import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // If using Tippy for tooltips
import { ExclamationCircleIcon, BookOpenIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
const MessageList = ({ messages, isSending }) => {
    const messageListRef = useRef(null);
    const markdownRef = useRef(null);
    const [tabState, setTabState] = useState({});

    const selectTab = (messageId, tabId) => {
        setTabState(prevState => ({
            ...prevState,
            [messageId]: tabId, // Update the tab state for the specific message
        }));
    };


    useEffect(() => {
        if (isSending && messageListRef.current) {
            if (messageListRef.current) {
                messageListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [isSending]);

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];

        if (markdownRef.current) {
            // First, remove any existing spinner to ensure there's at most one spinner in the markdown
            const existingSpinners = markdownRef.current.querySelectorAll('.loading-ring');
            existingSpinners.forEach(spinner => {
                const parent = spinner.parentNode;
                if (parent) {
                    parent.removeChild(spinner);
                    if (parent.classList.contains("with-spinner")) {
                        parent.classList.remove("with-spinner");
                    }
                }
            });

            if (lastMessage && lastMessage.state === 'PROCESSING') {
                // Find the last text-containing element or text node
                let targetNode = markdownRef.current.lastElementChild; // Last child element of the container
                while (targetNode && (targetNode.lastChild || targetNode.lastElementChild)) {
                    targetNode = targetNode.lastChild || targetNode.lastElementChild;
                    if (targetNode.nodeType === Node.TEXT_NODE && targetNode.textContent.trim() !== "") {
                        break; // Found the last non-empty text node
                    }
                }

                // Append spinner as an inline element right after the last text
                if (targetNode.nodeType === Node.TEXT_NODE) {
                    // For text nodes, insert the spinner HTML right after the text node
                    const span = document.createElement('span');
                    span.className = "loading loading-ring text-primary loading-md mx-1";
                    span.innerHTML = "...";
                    span.style.display = 'inline-block';
                    span.style.verticalAlign = 'middle';
                    targetNode.parentNode.insertBefore(span, targetNode.nextSibling);
                } else {
                    // For element nodes, append the spinner HTML inside the element
                    targetNode.innerHTML += `<span class="loading loading-ring text-primary loading-md mt-1 mx-2" style="display: inline-block; vertical-align: middle;">...</span>`;
                }
            }
        }
    }, [messages]);


    const renderAvatar = (message) => {
        if (message.state !== 'ERROR' && message.role) {
            switch (message.role) {
                case 'user':
                    return <img alt="Chat user" src={message.avatar} />;
                case 'ai':
                    return <img alt="AI chatbot" src={message.avatar} />;
                default:
                    return <span className="text-xl">{message.name ? message.name.charAt(0).toUpperCase() : ':)'}</span>;
            }
        } else {
            return <ExclamationCircleIcon className="h-full w-full text-error" aria-hidden="true" />;
        }
    };

    return (
        <div ref={messageListRef} className="overflow-y-auto overflow-x-hidden max-h-[550px]">
            <div className="chat-window bg-base-200 py-4 px-8 mt-14 mb-12">
                <div className="messages flex gap-2 flex-col-reverse">
                    {messages.map((message, index) => (
                        message &&
                        <div key={index} className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                            <div className={`chat-image avatar placeholder bg-base-100 ring-1 ring-base-200 rounded-full`}>
                                <div className={`w-10 rounded-full ${message.state == 'ERROR' ? 'bg-base-300 flex items-center justify-center' : message.role === 'ai' && 'p-1 bg-base-300'}`}>
                                    {renderAvatar(message)}
                                </div>
                            </div>
                            <div className="chat-header mx-2">
                                {message.name}
                                <time className="text-xs opacity-50 ml-1">{message.time}</time>
                            </div>
                            <div ref={markdownRef} className={`chat-bubble shadow-md ${message.role === 'user' ? 'before:bg-secondary bg-gradient-to-br from-primary to-secondary text-slate-200' : message.state == 'ERROR' ? 'before:bg-error bg-gradient-to-tr from-error to-[#ed5f4e] text-neutral' : 'before:bg-base-100 bg-gradient-to-tr from-base-100 to-base-300 text-neutral-content/90'}`}>
                                {message.role === 'user' ?
                                    <p className="overflow-hidden text-ellipsis">{message.text}</p>
                                    : message.state == 'SENDING' ? <span className="loading loading-dots loading-sm mt-1 mx-1.5"></span>
                                        : <>
                                            <MarkdownContent content={message.text} glossary={message.metadata?.glossary} />
                                        </>
                                }
                                {message.role === 'ai' && message.state === "DONE" && message.metadata && (message.metadata.actionableSteps || message.metadata.resources) && (
                                    <div className="flex flex-col items-end h-fit mt-16">
                                        <div className="flex gap-2 z-[1] mr-2 -mt-12 -mb-1">
                                            {message.metadata.resources && <label htmlFor="tab1" className={`cursor-pointer p-2 bg-base-200 rounded-full ${tabState[message.time] === 'tab1' ? 'ring-1 ring-secondary/50' : ''}`} onClick={() => selectTab(message.time, "tab1")}>
                                                <BookOpenIcon className="h-5 w-5 text-secondary" aria-hidden="true" />
                                            </label>}
                                            {message.metadata.actionableSteps && <label htmlFor="tab2" className={`cursor-pointer p-2 bg-base-200 rounded-full ${tabState[message.time] === 'tab2' ? 'ring-1 ring-secondary/50' : ''}`} onClick={() => selectTab(message.time, "tab2")}>
                                                <BoltIcon className="h-5 w-5 text-secondary" aria-hidden="true" />
                                            </label>}
                                        </div>
                                        <div className="w-full bg-base-300 rounded-lg overflow-hidden -mt-10 mb-3 h-fit">
                                            <input type="radio" id="tab1" name="my_tabs_1" className="hidden" aria-controls="tab-content-1" />
                                            <div id="tab-content-1" role="tabpanel" className={`mr-[70px] ${tabState[message.time] === 'tab1' ? 'block' : 'hidden'} p-4`}>
                                                {message.metadata.resources.map((link, index) => (
                                                    <Link key={index} to={link.url} className="block p-2 underline hover:text-primary underline-offset-2">
                                                        {link.title}
                                                    </Link>
                                                ))}
                                            </div>
                                            <input type="radio" id="tab2" name="my_tabs_1" className="hidden" aria-controls="tab-content-2" />
                                            <div id="tab-content-2" role="tabpanel" className={`mr-[70px] ${tabState[message.time] === 'tab2' ? 'block' : 'hidden'} p-4`}>
                                                <div className="flex flex-col gap-2">
                                                    {message.metadata.actionableSteps.map((action, index) => (
                                                        <p key={index}>• {action.step || action}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessageList;


import rehypeRaw from 'rehype-raw'; // If you're adding HTML inside Markdown

const MarkdownContent = ({ content, glossary }) => {
    const preprocessContent = (content, glossary) => {
        if (!glossary) return content;

        let processedContent = content;
        glossary.forEach(({ term }) => {
            let str = term.term || term
            console.log("str", str)
            // Escape special characters in term for regex use
            const escapedTerm = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'g');
            processedContent = processedContent.replace(regex, '<span className="text-info font-bold">$1</span>');
        });

        return processedContent;
    };

    const processedContent = useMemo(() => preprocessContent(content, glossary), [content, glossary]);

    return (
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {processedContent}
        </ReactMarkdown>
    );
};