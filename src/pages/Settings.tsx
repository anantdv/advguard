import React from 'react';
import { useAppStore } from '../store/appStore';
import { Shield, Key, Eye, HelpCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser } = useAppStore();

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">System Preferences</h1>
        <p className="text-slate-400 text-xs">Manage workspace parameters, client portals settings, and simulation keys</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-400" /> Active Session Diagnostics
            </h3>

            <div className="space-y-3.5 text-xs text-slate-350">
              <div className="flex justify-between py-2 border-b border-slate-850">
                <span className="text-slate-500">Identity Name:</span>
                <span className="font-semibold text-slate-200">{currentUser.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-850">
                <span className="text-slate-500">Authorized Role:</span>
                <span className="font-bold text-brand-400 uppercase tracking-wider">{currentUser.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-850">
                <span className="text-slate-500">Diagnostic ID:</span>
                <span className="font-mono text-slate-305">{currentUser.id}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Associated Client ID:</span>
                <span className="font-mono text-slate-200">{currentUser.customerId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Client Portal Configuration switches */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-brand-400" /> Client Portal Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <div>
                  <p className="font-bold text-slate-200">Allow client-side contact editing</p>
                  <p className="text-[10px] text-slate-500">Permit customer users to update mobile numbers and emails from portal view</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <div>
                  <p className="font-bold text-slate-200">Enforce auto-renew reminders</p>
                  <p className="text-[10px] text-slate-500">Dispatch alerts 30 days prior even for devices configured on Auto Renewal</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <div>
                  <p className="font-bold text-slate-200">Public visibility of ticket priority</p>
                  <p className="text-[10px] text-slate-500">Let customer portal users modify case severity levels to Critical/High</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Diagnostic info */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel text-xs space-y-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sandbox Information</h3>
          </div>
          <p className="text-slate-400 leading-relaxed pt-1">
            This application is executing in Sandbox Demonstration Mode. Changing identities using the top/bottom switch selectors refreshes state parameters instantly.
          </p>
        </div>

      </div>

    </div>
  );
};
export default Settings;
