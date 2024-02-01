import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faList, faCalendarDays, faHashtag, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { truncateLabel } from 'src/utils/textFormat';

function mapDataTypesToIcons(dataTypes) {
  const iconMapping = {
    "object": faCube,
    "int8": faHashtag,
    "int16": faHashtag,
    "int32": faHashtag,
    "float16": faHashtag,
    "float32": faHashtag,
    "float64": faHashtag,
    "category": faList,
    "datetime64[ns, UTC]": faCalendarDays
  };

  return dataTypes.map(type => iconMapping[type] || faQuestionCircle);
}

export default function Dropdown({
  items,
  dataTypes,
  selectedItem,
  onChange,
  height = 400,
  textLength = 16,
  color = null,
  position = "bottom",
  label
}) {
  const [selected, setSelected] = useState(selectedItem || "Select");
  const isDisabled = !items || items.length <= 0
  const handleItemClick = (item) => {
    onChange(item);
    setSelected(item);
  };

  const positionClasses = position === "top"
    ? "bottom-full translate-y-2 mb-2.5"
    : "top-full -translate-y-2";

  return (
    <div className="flex flex-row gap-2 p-2 items-center justify-center z-[999]">
      {label && <p className="text-xs font-bold">{label.toUpperCase()}</p>}
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div>
              <Menu.Button disabled={isDisabled} className={`btn btn-sm h-10 bg-base-100 border-none min-w-[90px] max-w-[1000px] font-semibold text-${color} whitespace-nowrap`}>
                {isDisabled ? '—' : selectedItem ? truncateLabel(selectedItem.toUpperCase(), textLength) : selected.toUpperCase()}
                <ChevronDownIcon
                                className={`transition-all duration-300 ${open ? 'rotate-180 transform' : ''
                                    } h-5 w-5 text-primary`}
                            />
              </Menu.Button>
            </div>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
              <Menu.Items className={`absolute left-1/2 shadow-lg transform -translate-x-1/2 flex-nowrap my-3 dropdown-content menu backdrop-blur-xl bg-neutral/40 rounded-xl overflow-y-auto z-50 p-2 w-fit max-h-[${height}px] overflow-y-auto overflow-x-auto ${positionClasses}`}>
                {items && items.length > 0 && items.map((item, index) => (
                  <Menu.Item as="li" key={item}>
                    {({ active }) => (
                      <button
                        className="px-8 whitespace-nowrap"
                        onClick={() => handleItemClick(item)}
                      >
                        {item == selectedItem && <CheckIcon className="absolute left-1 h-5 w-5 text-primary" aria-hidden="true" />}
                        {truncateLabel(item, 50)}
                        {dataTypes && dataTypes[index] &&
                          <>
                            <div className="flex flex-grow"></div>
                            <FontAwesomeIcon icon={mapDataTypesToIcons([dataTypes[index]])[0]} className="text-neutral-content/70 ml-2" />
                          </>
                        }
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
}
