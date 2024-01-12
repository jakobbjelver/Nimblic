import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './assets/components/Home/HomePage';
import SettingsPage from './assets/components/Settings/SettingsPage';
import ExplorePage from './assets/components/Explore/ExplorePage';
import DataQualityPage from './assets/components/DataQuality/DataQualityPage';
import StatisticsPage from './assets/components/Statistics/StatisticsPage';
import ViewDataPage from './assets/components/ViewData/ViewDataPage';
import Footer from './assets/components/general/Footer';
import { ThemeProvider } from './assets/components/general/Theme/ThemeContext';
import FileUploadProvider from './assets/components/general/Upload/FileUploadContext';
import SettingsProvider from './assets/components/Settings/SettingsContext';
import TabsProvider from './assets/components/general/Tabs/TabsContext';
import UploadPage from './assets/components/general/Upload/UploadPage';
import NotFoundPage from './assets/components/general/NotFoundPage';
import { ModalProvider } from './assets/components/general/Modal/ModalContext';
import AlertProvider from './assets/components/general/Alert/AlertContext';
import Modal from './assets/components/general/Modal/Modal';
import Body from './assets/components/general/Body'
import ContactPage from './assets/components/Home/Page/ContactPage'
import DataProtectionPolicy from './assets/components/Home/Page/DataProtectionPolicy'
import TermsOfService from './assets/components/Home/Page/TermsOfService'

const App = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider>
      <ModalProvider>
        <FileUploadProvider>
          <SettingsProvider>
            <AlertProvider>
              <TabsProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Body><HomePage /></Body>} />
                    <Route path="/explore" element={<Body><ExplorePage /></Body>} />
                    <Route path="/statistics" element={<Body><StatisticsPage /></Body>} />
                    <Route path="/data-quality" element={<Body><DataQualityPage /></Body>} />
                    <Route path="/data-quality" element={<Body><DataQualityPage /></Body>} />
                    <Route path="/new-upload" element={<Body><UploadPage /></Body>} />
                    <Route path="/settings" element={<Body><SettingsPage /></Body>} />
                    <Route path="/view-data" element={<Body><ViewDataPage /></Body>} />
                    <Route path="/contact" element={<Body><ContactPage /></Body>} />
                    <Route path="/data-protection-policy" element={<Body><DataProtectionPolicy /></Body>} />
                    <Route path="/terms-of-service" element={<Body><TermsOfService /></Body>} />
                    <Route path="*" element={<Body><NotFoundPage /></Body>} />
                  </Routes>
                </Router>
              </TabsProvider>
              <Modal />
            </AlertProvider>
          </SettingsProvider>
        </FileUploadProvider>
      </ModalProvider>
    </ThemeProvider>
  );
};

export default App;



