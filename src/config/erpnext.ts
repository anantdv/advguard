// Configuration parameters for ERPNext integration
export const ERPNEXT_CONFIG = {
  BASE_URL: import.meta.env.VITE_ERPNEXT_URL || 'http://182.71.135.110:8088',
  
  isConfigured: () => {
    return !!(import.meta.env.VITE_ERPNEXT_URL);
  }
};
export default ERPNEXT_CONFIG;
