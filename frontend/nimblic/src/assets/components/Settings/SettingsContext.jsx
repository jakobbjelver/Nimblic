import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext({
  settings: null,
  setSettings: () => {},
});

const SettingsProvider = ({ children }) => {
  const initialSettings = localStorage.getItem('settings')
  const [settings, setSettings] = useState(initialSettings);  

  // Load uploadData from local storage when the component mounts
  useEffect(() => {
    const initialSettings = localStorage.getItem('settings');
    if (initialSettings) {
        setSettings(initialSettings);
    }
  }, []);

  // Save uploadData to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('settings', settings);

    } catch {
      setErrorMessage("Could not save settings in local storage.")
    }
  }, [settings]);


  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
