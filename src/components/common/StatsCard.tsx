import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  colorClass?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass = 'from-brand-500/10 to-brand-600/5 border-brand-500/20 text-brand-400',
  trend
}) => {
  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${colorClass} glass-panel shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-3 text-[11px]">
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.value}
            </span>
          )}
          {description && <span className="text-slate-400 truncate">{description}</span>}
        </div>
      )}
    </div>
  );
};
export default StatsCard;
