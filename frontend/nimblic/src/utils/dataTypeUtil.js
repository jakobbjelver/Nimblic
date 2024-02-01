import { faCube, faList, faCalendarDays, faHashtag, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

export function mapDataTypesToIcons(dataTypes) {
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
  
    return dataTypes.map(type => iconMapping[type] || faQuestionCircle); // Default icon
  }
