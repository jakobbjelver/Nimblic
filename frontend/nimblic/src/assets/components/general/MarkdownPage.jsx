import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownPage = ({ markdownUrl }) => {
    const [content, setContent] = useState('');
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetch(markdownUrl)
            .then((response) => response.text())
            .then((text) => setContent(text))
            .catch((error) => console.error('Error loading the Markdown file:', error))
            .finally(() => setLoading(false));
    }, [markdownUrl]);

    return (
        <div className="md:mt-32 mt-24 isolate px-6 md:py-12 py-8 my-12 lg:px-8 bg-base-200 rounded-xl markdown-content xl:w-1/2 lg:w-2/3 w-full">
            {isLoading ? 
                <div className="w-full h-[65vh] flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            :
                <ReactMarkdown>{content}</ReactMarkdown>
            }
        </div>
    );
};

export default MarkdownPage;
