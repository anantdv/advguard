// Configuration parameters for ERPNext integration
export const ERPNEXT_CONFIG = {
  // Replace with your ERPNext domain (e.g. "https://your-erpnext.com")
  BASE_URL: import.meta.env.VITE_ERPNEXT_URL || 'http://localhost:8000',
  
  // Replace with your API credentials
  API_KEY: import.meta.env.VITE_ERPNEXT_API_KEY || '',
  API_SECRET: import.meta.env.VITE_ERPNEXT_API_SECRET || '',
  
  // Helper to check if configuration parameters are provided (otherwise fall back to mockup)
  isConfigured: () => {
    return !!(import.meta.env.VITE_ERPNEXT_URL && import.meta.env.VITE_ERPNEXT_API_KEY && import.meta.env.VITE_ERPNEXT_API_SECRET);
  }
};
export default ERPNEXT_CONFIG;
