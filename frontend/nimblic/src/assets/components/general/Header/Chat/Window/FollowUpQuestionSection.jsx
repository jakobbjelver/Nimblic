import React from 'react';
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function FollowUpQuestionSection({ followUpQuestions, sendMessage, showTopicSelection, isSendingQuestions }) {

    if (showTopicSelection || followUpQuestions.length <= 0) return

    return (
        <div className="w-full pt-2 px-2 flex flex-row justify-center -translate-left-1/2 z-1 fixed z-[99]">
            <Disclosure className="w-fit">
                {({ open }) => (
                    <div className="flex flex-col items-center w-fit">
                        <div className="flex flex-row gap-2 max-w-2xl">
                            <Disclosure.Button disabled={isSendingQuestions} className={`${open ? '' : 'shadow-sm'} z-[999] gap-2 flex items-center w-fit justify-between rounded-lg bg-base-300 px-4 py-2 text-left text-sm font-medium text-primary disabled:text-primary/50 transition-all focus:outline-none focus-visible:ring focus-visible:ring-primary/75`}>
                                <SparklesIcon className={`w-5 h-5 ${isSendingQuestions ? 'text-primary/50' : 'text-primary'}`} />
                                <span>{followUpQuestions[0]}</span>
                                {isSendingQuestions ?
                                    <div className="loading loading-xs loading-spinner text-primary ml-2"></div>
                                    :
                                    <ChevronUpIcon
                                        className={`transition-all duration-300 ${!open ? 'rotate-180 transform' : ''
                                            } h-5 w-5 text-primary`}
                                    />}
                            </Disclosure.Button>
                        </div>
                        <Transition
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                        >
                            <Disclosure.Panel className="px-4 bg-base-300 pb-4 pt-14 shadow-sm rounded-2xl -mt-11 flex flex-col items-center justify-center gap-2">
                                {followUpQuestions.map((text, index) => (
                                    <Disclosure.Button
                                        key={index}
                                        onClick={() => sendMessage(text)}
                                        className="badge badge-primary rounded-2xl badge-outline text-neutral-content badge-md text-center h-fit w-fit cursor-pointer py-1.5 px-2 hover:bg-base-100/70 hover:shadow-sm"
                                    >
                                        {text}
                                    </Disclosure.Button>
                                ))}
                            </Disclosure.Panel>
                        </Transition>
                    </div>
                )}
            </Disclosure>
        </div >
    )
}

