import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

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
        }
    ];

    const toggleFAQ = index => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="container mx-auto p-4 flex items-center flex-col mb-12 w-full" id="faq">
            <h3 className="group md:text-5xl mb-8 font-bold tracking-tight text-2xl py-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-info to-secondary">
            Frequently asked questions
            <a href="#faq" className="md:text-4xl text-xl ml-2 opacity-0 group-hover:opacity-100 bg-clip-text text-transparent bg-gradient-to-r from-primary/60 via-info/60 to-secondary/60 no-underline hover:from-primary hover:via-info hover:to-secondary">#</a>
          </h3>
            <div className="divide-y divide-neutral md:w-2/3 sm:w-full flex flex-col items-center">
                {faqs.map((faq, index) => (
                    <div key={index} className={`py-4 transition-all rounded-xl px-8 ${activeIndex === index ? 'bg-base-200' : ''}`}>
                        <button
                            className="flex items-center justify-between font-semibold w-full text-left md:text-lg text-sm"
                            onClick={() => toggleFAQ(index)}
                        >
                            <span className="w-11/12">{faq.question}</span>
                            {activeIndex === index ? <ChevronUpIcon className="h-4 w-4 text-primary" aria-hidden="true" /> : <ChevronDownIcon className="h-4 w-4 size-4 text-primary" aria-hidden="true" />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ${activeIndex === index ? 'max-h-56' : 'max-h-0'}`}>
                            <p className={`transition-opacity duration-500 my-8 md:text-lg text-sm ${activeIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                                {faq.answer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
