import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { SLAConfig, TicketPriority, SupportType } from '../types';
import { Key, Plus, CheckCircle, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

export const SLA: React.FC = () => {
  const { slaConfigs, addSLAConfig } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Config State
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Critical');
  const [supportType, setSupportType] = useState<SupportType>('Premium');
  const [firstResponse, setFirstResponse] = useState<number>(0.5);
  const [resolution, setResolution] = useState<number>(2);
  const [hours, setHours] = useState('24x7');
  const [esc1, setEsc1] = useState('');
  const [esc2, setEsc2] = useState('');

  const handleAddSLA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newConfig: SLAConfig = {
      id: `sla-${Date.now()}`,
      name,
      customerType: 'All',
      supportType,
      priority,
      firstResponseTime: firstResponse,
      resolutionTime: resolution,
      businessHours: hours,
      escalation1: esc1 || 'Tier 2 Engineer',
      escalation2: esc2 || 'Support Manager',
      escalation3: 'VP Operations',
      active: true
    };

    addSLAConfig(newConfig);
    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">SLA Configuration Center</h1>
          <p className="text-slate-400 text-xs">Configure response, resolution and escalations paths based on Priority and Support Level</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
        >
          <Plus className="w-4 h-4" /> Create SLA Policy
        </button>
      </div>

      {/* SLA Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slaConfigs.map(c => (
          <div key={c.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[8px] font-extrabold uppercase tracking-wider font-mono">{c.businessHours}</span>
                <h3 className="font-extrabold text-sm text-slate-200 mt-2">{c.name}</h3>
                <p className="text-[10px] text-slate-500">Applies to: {c.supportType} &bull; Priority: {c.priority}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/20 text-emerald-400`}>
                Active Policy
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-850 py-3 my-2">
              <div>
                <span className="text-slate-500 font-bold block text-[9px] uppercase">First Response Target</span>
                <p className="font-extrabold text-slate-200 text-sm mt-0.5">{c.firstResponseTime} hr</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[9px] uppercase">Resolution Deadline</span>
                <p className="font-extrabold text-slate-200 text-sm mt-0.5">{c.resolutionTime} hrs</p>
              </div>
            </div>

            {/* Escalations Flow */}
            <div className="space-y-2">
              <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Escalation path Matrix</span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-medium">
                <span className="bg-slate-950 p-1.5 rounded">{c.escalation1}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="bg-slate-950 p-1.5 rounded">{c.escalation2}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="bg-slate-950 p-1.5 rounded">{c.escalation3}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Define SLA Policy</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleAddSLA} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Policy Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Critical Enterprise Support SLA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Support Plan</label>
                  <select
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value as SupportType)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded"
                  >
                    <option value="Standard">Standard</option>
                    <option value="8x5">Business 8x5</option>
                    <option value="24x7">24x7</option>
                    <option value="Premium">Premium VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">First Resp (hours)</label>
                  <input
                    type="number" step="0.5" required
                    value={firstResponse}
                    onChange={(e) => setFirstResponse(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-205"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Resolution (hours)</label>
                  <input
                    type="number" step="1" required
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-205"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Escalation Engineer Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Shift Lead / Manager"
                  value={esc1}
                  onChange={(e) => setEsc1(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-205 focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-500 transition font-bold rounded text-xs text-white">
                Create SLA Policy Rules
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default SLA;
