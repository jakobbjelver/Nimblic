import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Disclosure, Transition } from '@headlessui/react'

const faqs = [  
    {
        question: 'Can I upload a file of any size?',
        answer: 'Yes, you can! While large files over 10 MB (for the free level) and 50 MB (for the enterprise level) will be sampled to decrease processing time, you don\'t need to scale down the file when uploading. You will be presented with an option to sample it.'
    },
    {
        question: 'My file contains sensitive data. How can I be assured that it is safe?',
        answer: 'Nimblic will never store your data at rest. Data is only temporarily stored while processing the analysis. Not even the analysis is stored anywhere, except on your own device. For more information, please head over to our privacy section.'
    },
    {
        question: 'The app does not include the features I want, who can I contact?',
        answer: 'You can directly contact the developer to propose features. All feedback is appreciated. With an enterprise level subscription, you also have the opportunity to directly influence the app\'s development and steer the product in a direction you\'d like to see.'
    },
    {
        question: 'How does Nimblic differ from OpenAI\'s GPT or Google\'s Gemini?',
        answer: `Nimblic stands out with its user-friendly interface designed for a broad audience, from beginners to experts, making it highly accessible for those without extensive technical skills. 
        \nIt specializes in Exploratory Data Analysis (EDA), offering tailored tools for effective data exploration, unlike the more general-purpose approach of OpenAI's Advanced Data Analysis. 
        \nAdditionally, Nimblic emphasizes data security and privacy, ensuring user data is protected and confidential, a crucial aspect for users who prioritize data safety. 
        \nIn the end, this means a more straightforward experience that everyone can use, and might even be cheaper. Nimblic does not serve to compete with existing AI tools, but instead offers a higher level and tailored use than with general AI, and is determined to incorporate it into the app in future versions.`
    }
    
];

function FAQ() {
    return (
        <div className="container mx-auto p-4 flex items-center flex-col mb-12 w-full" id="faq">
            <h3 className="group md:text-5xl mb-8 font-bold tracking-tight text-2xl py-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-info to-secondary">
                Frequently asked questions
                <a href="#faq" className="md:text-4xl text-xl ml-2 opacity-0 group-hover:opacity-100 bg-clip-text text-transparent bg-gradient-to-r from-primary/60 via-info/60 to-secondary/60 no-underline hover:from-primary hover:via-info hover:to-secondary">#</a>
            </h3>
            <div className="divide-y space-y-2 divide-neutral md:w-2/3 sm:w-full flex flex-col items-center">
                {faqs.map((faq, index) => (
                    <Disclosure key={index} as="div" className="py-4 w-full bg-base-200 rounded-xl px-6">
                        <>
                            <Disclosure.Button className="flex items-center justify-between font-semibold w-full text-left md:text-lg text-sm">
                                <span>{faq.question}</span>
                                <ChevronDownIcon className='h-4 w-4 text-primary ui-open:rotate-180 ui-open:transform duration-200'/>
                            </Disclosure.Button>
                            <Transition
                                enter="transition duration-100 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0 h-0"
                            >
                            <Disclosure.Panel className="pt-4">
                            <div className="divider my-0"></div>
                                <div className="rounded-lg bg-base-200 px-6 py-4 text-md leading-6 whitespace-pre-line">
                                {faq.answer}
                                </div>
                            </Disclosure.Panel>
                            </Transition>
                        </>
                    </Disclosure>
                ))}
            </div>
        </div>
    );
}

export default FAQ;
