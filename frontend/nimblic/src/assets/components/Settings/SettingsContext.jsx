import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext({
  settings: null,
  setSettings: () => {},
});

const SettingsProvider = ({ children }) => {
  const loadInitialSettings = () => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      encryption: 'Standard',
      skillLevel: 'beginner'
    };
  };

  const [settings, setSettings] = useState(loadInitialSettings);  

  useEffect(() => {
    try {
      const settingsString = JSON.stringify(settings);
      localStorage.setItem('settings', settingsString);
    } catch (error) {
      console.error("Could not save settings in local storage.", error);
    }
  }, [settings]);
  

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
