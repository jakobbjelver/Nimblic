import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const DataProtectionPolicy = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetch('content/policies/data_protection_policy.md')
            .then((response) => response.text())
            .then((text) => setContent(text))
            .catch((error) => console.error('Error loading the Markdown file:', error));
    }, []);

    return (
        <div className="md:mt-32 mt-24 isolate px-6 md:py-12 py-8 my-12 lg:px-8 bg-base-200 rounded-xl markdown-content xl:w-1/2 lg:w-2/3 w-full">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default DataProtectionPolicy;
