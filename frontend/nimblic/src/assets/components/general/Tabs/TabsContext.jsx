import React, { createContext, useContext, useState} from 'react';


export const TabsContext = createContext({
    activeIndex: 0,
    setActiveIndex: () => {},
  });

const TabsProvider = ({ children }) => {
    const [activeIndex, setActiveIndex] = useState(0)
  
    return (
      <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
        {children}
      </TabsContext.Provider>
    );
  };
  
  export default TabsProvider;