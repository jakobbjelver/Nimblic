import React, { useState } from 'react';
import DropdownSelection from './DropdownSelection';
import { TrashIcon } from '@heroicons/react/20/solid'

const ActionSection = ({ filteredTopics, selectedTopic, setSelectedTopic, showTopicSelection, deleteMessages }) => {
    const [isDeleting, setDeleting] = useState(false);


    const handleDeleteMessages = () => {
        setDeleting(true)
        deleteMessages()
        setDeleting(false)
    }

    return (
        <div className="bg-base-300 rounded-b-xl flex flex-row items-center justify-end px-6 gap-2">
            <DropdownSelection
                filteredTopics={filteredTopics}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                showTopicSelection={showTopicSelection}
            />
            {!showTopicSelection && <button className="btn btn-sm h-10 mb-4 bg-base-100 border-none gap-1 mt-4" onClick={handleDeleteMessages}>
                {!isDeleting ? 
                <>
                Clear conversation
                <TrashIcon className="h-4 w-4"/>
                </>
                : <div className="w-full flex items-center justify-center loading loading-spinner text-base-300"></div>}
            </button>}
        </div>
    );
};

export default ActionSection;
