import React from 'react';

const TopicSelection = ({ filteredTopics, sendMessage, text, showTopicSelection }) => {
    return (
        <div className="flex flex-col">
            {showTopicSelection && (
                <div className="mb-4 mt-8">
                    <p className="w-full text-center font-bold text-sm tracking-wider">SELECT A TOPIC</p>
                    <div className="flex flex-wrap gap-1.5 py-3 items-center justify-center">
                        {filteredTopics.map((topic, index) => (
                            <div key={index} onClick={() => sendMessage(text, topic)} className="badge badge-neutral badge-lg whitespace-nowrap cursor-pointer py-4 px-3 hover:bg-base-100/70 hover:shadow-sm">
                                {topic}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicSelection;
