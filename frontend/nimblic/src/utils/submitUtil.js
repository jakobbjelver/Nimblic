// utils.js

const getMetadata = () => {
    const timestamp = new Date().toISOString();
    const language = window.navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const browserInfo = window.navigator.userAgent;
  
    return { timestamp, language, screenResolution, browserInfo };
  };
  
  export const submitFormData = async (endpoint = 'https://us-central1-artilas-ecbb9.cloudfunctions.net/app', formData, additionalMetadata = {}) => {
    console.log("two")

    const metadata = getMetadata();
    const data = {
      ...formData,
      metadata: { ...metadata },
      user: { ...additionalMetadata }
    };
  
    try {
      console.log("SUBMITTING")
      const response = await fetch(`${endpoint}/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
  
      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw error;  
    }
  };
  