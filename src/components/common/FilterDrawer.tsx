import React from 'react';
import { X, Filter } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onReset?: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  title = 'Filters',
  children,
  onReset
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer Body */}
      <div className="relative w-80 max-w-full h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-400" />
            <span className="font-bold text-sm text-white">{title}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {children}
        </div>

        {onReset && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex gap-3">
            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow transition"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default FilterDrawer;
