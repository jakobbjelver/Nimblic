import React, { useRef, useEffect, forwardRef, useState } from 'react';
import { truncateLabel } from 'src/utils/textFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faList, faCalendarDays, faHashtag, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

function mapDataTypesToIcons(dataTypes) {
  const iconMapping = {
    "object": faCube,
    "int8": faHashtag,
    "int16": faHashtag,
    "int32": faHashtag,
    "int16": faHashtag,
    "float16": faHashtag,
    "float32": faHashtag, 
    "float64": faHashtag,
    "category": faList,
    "datetime64[ns, UTC]": faCalendarDays
  };

  return dataTypes.map(type => iconMapping[type] || 'faQuestionCircle'); // Default icon
}

const Dropdown = forwardRef(({ items, dataTypes, selectedItem, onChange, label = "Select Item", height=400, textLength=16, color=null}, ref) => {
  const dropdownRef = useRef(null);

  // Handle item click
  const handleItemClick = (item) => {
    onChange(item); // Update the selected item

    // Manually close the 'details' element
    if (dropdownRef.current) {
      dropdownRef.current.open = false;
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dropdownRef.current.open = false;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ul className="menu rounded-lg mb-4" >
      <li className="relative"> {/* Add relative positioning here */}
        <details ref={ref} >
          <summary className={`min-w-[100px] max-w-[1000px] font-semibold bg-base-100 text-${color}`}>
            {selectedItem ? truncateLabel(selectedItem.toUpperCase(), textLength) : label.toUpperCase()}
          </summary>
          <ul tabIndex={0} className={`dropdown-content absolute left-1/2 transform -translate-x-1/2 bg-base-100 z-50 p-2 shadow rounded-box w-fit max-h-[${height}px] overflow-y-auto overflow-x-auto`}>
            {items?.map((item, index) => (
              <li key={item}>
                <a onClick={() => handleItemClick(item)} className="px-8 whitespace-nowrap">
                  {truncateLabel(item, 50)}
                  {dataTypes && dataTypes[index] && 
                    <FontAwesomeIcon icon={mapDataTypesToIcons([dataTypes[index]])[0]} className="text-neutral-content/70" />
                  }
                </a>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </ul>

  );
})

export default Dropdown;
