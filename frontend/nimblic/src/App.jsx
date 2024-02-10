import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './assets/components/Home/HomePage';
import SettingsPage from './assets/components/Settings/SettingsPage';
import ExplorePage from './assets/components/Explore/ExplorePage';
import DataQualityPage from './assets/components/DataQuality/DataQualityPage';
import StatisticsPage from './assets/components/Statistics/StatisticsPage';
import ViewDataPage from './assets/components/ViewData/ViewDataPage';
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
import MarkdownPage from './assets/components/general/MarkdownPage'
import ErrorBoundary from './assets/components/general/Error/ErrorBoundary';
import ErrorPage from './assets/components/general/Error/ErrorPage';

const App = () => {
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    const handleGlobalError = (message, source, lineno, colno, error) => {
      console.error('Global Error:', { message, source, lineno, colno, error });
      setGlobalError({ error: error, errorInfo: message });
      return false; // Prevent the default handling (like window.alert)
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      setGlobalError({ error: event.reason });
      return false;
    };

    window.onerror = handleGlobalError;
    window.onunhandledrejection = handleUnhandledRejection;

    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
      setGlobalError(null)
    };
  }, []);

  return (
    <Router>
    <ErrorBoundary globalError={globalError}>
      <ThemeProvider>
        <ModalProvider>
          <FileUploadProvider>
            <SettingsProvider>
              <AlertProvider>
                <TabsProvider>
                    <Routes>
                      <Route path="/" element={<Body><HomePage /></Body>} />
                      <Route path="/explore/:id?" element={<Body><ExplorePage /></Body>} />
                      <Route path="/statistics" element={<Body><StatisticsPage /></Body>} />
                      <Route path="/data-quality" element={<Body><DataQualityPage /></Body>} />
                      <Route path="/uploads" element={<Body><UploadPage /></Body>} />
                      <Route path="/settings" element={<Body><SettingsPage /></Body>} />
                      <Route path="/view-data" element={<Body><ViewDataPage /></Body>} />
                      <Route path="/contact" element={<Body><ContactPage /></Body>} />
                      <Route path="/data-protection-policy" element={<Body><MarkdownPage markdownUrl="https://raw.githubusercontent.com/jakobbjelver/Nimblic/main/policies/data_protection_policy.md" /></Body>} />
                      <Route path="/terms-of-service" element={<Body><MarkdownPage markdownUrl="https://raw.githubusercontent.com/jakobbjelver/Nimblic/main/policies/terms_of_service.md" /></Body>} />
                      <Route path="/blog" element={<Body><MarkdownPage markdownUrl="https://raw.githubusercontent.com/jakobbjelver/Nimblic/main/blog/blog.md" /></Body>} />
                      <Route path="*" element={<Body><NotFoundPage /></Body>} />
                      <Route path="/error" element={<Body><ErrorPage /></Body>} />
                    </Routes>
                </TabsProvider>
                <Modal />
              </AlertProvider>
            </SettingsProvider>
          </FileUploadProvider>
        </ModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
    </Router>
  );
};

export default App;



