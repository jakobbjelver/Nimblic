import React from 'react';
import Dropdown from '../../../Dropdown';

const DropdownSelection = ({ filteredTopics, selectedTopic, setSelectedTopic, showTopicSelection }) => {
    return (
        <>
            {!showTopicSelection && selectedTopic && (
                <Dropdown
                    items={filteredTopics}
                    selectedItem={selectedTopic}
                    textLength={30}
                    onChange={setSelectedTopic}
                    position={"top"}
                />
            )}
            </>
    );
};

export default DropdownSelection;
