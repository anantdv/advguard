import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './routes';

import { useEffect } from 'react';
import { useAppStore } from './store/appStore';

function App() {
  const { fetchLiveERPData, isLoading } = useAppStore();

  useEffect(() => {
    fetchLiveERPData();
  }, [fetchLiveERPData]);

  return (
    <Router>
      <AppLayout>
        {isLoading && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-bold mt-4 tracking-wider">Syncing with ERPNext...</p>
          </div>
        )}
        <AppRoutes />
      </AppLayout>
    </Router>
  );
}

export default App;
