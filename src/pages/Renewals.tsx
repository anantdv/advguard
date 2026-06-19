import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { SubscriptionPlan, SupportType, PaymentStatus, RenewalStatus } from '../types';
import { 
  Plus, Search, RefreshCw, Calendar, AlertTriangle, 
  DollarSign, CheckCircle, Clock, FileSpreadsheet, Send
} from 'lucide-react';
import Pagination from '../components/common/Pagination';

export const Renewals: React.FC = () => {
  const { plans, renewalHistory, devices, customers, addSubscriptionPlan, renewDeviceLicense } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'plans' | 'reminders'>('history');
  
  // Modal toggles
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isManualRenewOpen, setIsManualRenewOpen] = useState(false);

  // New Plan State
  const [pName, setPName] = useState('');
  const [pDuration, setPDuration] = useState<'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly'>('Yearly');
  const [pPrice, setPPrice] = useState<number>(899);
  const [pSupport, setPSupport] = useState<SupportType>('24x7');
  const [pDesc, setPDesc] = useState('');

  // Manual Renewal State
  const [rDeviceId, setRDeviceId] = useState('');
  const [rPlanId, setRPlanId] = useState('');
  const [rAmount, setRAmount] = useState<number>(0);
  const [rStatus, setRStatus] = useState<PaymentStatus>('Paid');
  const [rRemarks, setRRemarks] = useState('');

  // Filter States for Renewal History
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filteredHistory = renewalHistory.filter(h => {
    const device = devices.find(d => d.id === h.deviceId);
    const customer = customers.find(c => c.id === h.customerId);
    const matchStr = `${h.id} ${device?.systemName} ${customer?.name}`.toLowerCase();
    return matchStr.includes(searchTerm.toLowerCase());
  });

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate Overdue & Upcoming
  const today = new Date('2026-06-19');
  
  const overdueDevices = devices.filter(d => {
    const expiry = new Date(d.licenseEndDate);
    return expiry < today && d.licenseStatus === 'Expired';
  });

  const upcomingRenewals = devices.filter(d => {
    const expiry = new Date(d.licenseEndDate);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30; // within next 30 days
  });

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;
    
    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: pName,
      duration: pDuration,
      price: pPrice,
      currency: 'USD',
      includedSupportType: pSupport,
      description: pDesc,
      active: true
    };

    addSubscriptionPlan(newPlan);
    setIsPlanModalOpen(false);
    setPName('');
    setPDesc('');
  };

  const handleManualRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rDeviceId || !rPlanId) return;

    renewDeviceLicense(rDeviceId, rPlanId, rAmount, rStatus, rRemarks);
    setIsManualRenewOpen(false);
    setRDeviceId('');
    setRPlanId('');
    setRAmount(0);
    setRRemarks('');
  };

  const triggerReminder = (deviceName: string, customerEmail: string) => {
    alert(`Renewal Alert Email simulated to primary rep for ${deviceName} (${customerEmail})`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Subscription Plan &amp; Renewal Engine</h1>
          <p className="text-slate-400 text-xs">Manage catalog rates, collect renewal invoicing, and audit transaction records</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsManualRenewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Post Renewal Payment
          </button>
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Define Plan
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-800 flex gap-2">
        <button 
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${activeSubTab === 'history' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          Transaction History
        </button>
        <button 
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${activeSubTab === 'plans' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          Active Subscriptions Catalog
        </button>
        <button 
          onClick={() => setActiveSubTab('reminders')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${activeSubTab === 'reminders' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          Alerts &amp; Reminders List
        </button>
      </div>

      {/* Content panel */}
      <div className="min-h-[300px]">
        {activeSubTab === 'history' && (
          <div className="space-y-4">
            
            {/* Search filter bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter transactions by customer, device name or invoice ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900 glass-panel">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-3">Receipt / Ref</th>
                    <th className="p-3">Client Customer</th>
                    <th className="p-3">Device Node</th>
                    <th className="p-3">Terms Extension</th>
                    <th className="p-3 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedHistory.map(h => {
                    const dev = devices.find(d => d.id === h.deviceId);
                    const cust = customers.find(c => c.id === h.customerId);
                    return (
                      <tr key={h.id} className="hover:bg-slate-850/30 transition">
                        <td className="p-3">
                          <p className="font-semibold text-slate-200">{h.id}</p>
                          <span className="text-[9px] text-slate-500">{h.renewalDate}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-200">{cust?.name || 'Unknown'}</p>
                          <span className="text-[9px] text-slate-500">{h.customerId}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-200">{dev?.systemName || 'Hardware Node'}</p>
                          <span className="text-[9px] text-slate-500">ID: {h.deviceId}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-[11px]">{h.previousEndDate} &rarr;</p>
                          <p className="text-[11px] text-brand-400 font-bold">{h.newEndDate}</p>
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-black text-slate-200">${h.amount}</p>
                          <span className={`px-1 rounded text-[9px] font-bold ${
                            h.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {h.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredHistory.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />

          </div>
        )}

        {activeSubTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-1.5 py-0.5 bg-brand-600/20 text-brand-400 rounded text-[9px] font-bold uppercase">{p.duration}</span>
                    <p className="text-lg font-black text-white">${p.price}</p>
                  </div>
                  <h3 className="font-bold text-xs text-slate-200 mt-3">{p.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                </div>
                <div className="border-t border-slate-800/60 pt-3 mt-4 text-[10px] text-slate-500">
                  Included Support: <span className="text-slate-300 font-bold">{p.includedSupportType}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'reminders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Overdue Renewals Card */}
            <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/60 space-y-4">
              <h3 className="text-xs font-black uppercase text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Overdue Invoices ({overdueDevices.length})
              </h3>
              <div className="space-y-3">
                {overdueDevices.map(d => {
                  const cust = customers.find(c => c.id === d.customerId);
                  return (
                    <div key={d.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{d.systemName}</p>
                        <p className="text-[10px] text-slate-500">Owner: {cust?.name} &bull; Expired: {d.licenseEndDate}</p>
                      </div>
                      <button
                        onClick={() => triggerReminder(d.systemName, cust?.email || '')}
                        className="p-1.5 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition text-[10px] font-bold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Remind
                      </button>
                    </div>
                  );
                })}
                {overdueDevices.length === 0 && <p className="text-xs text-slate-500 italic p-3 text-center">No overdue renewals detected</p>}
              </div>
            </div>

            {/* Upcoming Expiry List */}
            <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/60 space-y-4">
              <h3 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Expirations Upcoming (7-30 Days) ({upcomingRenewals.length})
              </h3>
              <div className="space-y-3">
                {upcomingRenewals.map(d => {
                  const cust = customers.find(c => c.id === d.customerId);
                  return (
                    <div key={d.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-200">{d.systemName}</p>
                        <p className="text-[10px] text-slate-500">Owner: {cust?.name} &bull; Expiry: {d.licenseEndDate}</p>
                      </div>
                      <button
                        onClick={() => triggerReminder(d.systemName, cust?.email || '')}
                        className="p-1.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition text-[10px] font-bold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Remind
                      </button>
                    </div>
                  );
                })}
                {upcomingRenewals.length === 0 && <p className="text-xs text-slate-500 italic p-3 text-center">No upcoming expirations in next 30 days</p>}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Define Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Create Subscription Plan</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleAddPlan} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Plan Name</label>
                <input
                  type="text" required
                  placeholder="e.g. ADVGuard Ultimate Enterprise"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-250 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Duration</label>
                  <select
                    value={pDuration}
                    onChange={(e) => setPDuration(e.target.value as any)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-300"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Price (USD)</label>
                  <input
                    type="number" required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Included Support Level</label>
                <select
                  value={pSupport}
                  onChange={(e) => setPSupport(e.target.value as SupportType)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-300"
                >
                  <option value="Standard">Standard (8x5)</option>
                  <option value="8x5">Business 8x5</option>
                  <option value="24x7">Enterprise 24x7</option>
                  <option value="Premium">Premium VIP (24x7)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Catalog Description</label>
                <textarea
                  placeholder="Included security modules..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none min-h-[60px]"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-500 transition font-bold rounded text-xs text-white">
                Add Subscription Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual renewal invoice post modal */}
      {isManualRenewOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Post Renewal Payment</h3>
              <button onClick={() => setIsManualRenewOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleManualRenewalSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Device Node</label>
                <select
                  required
                  value={rDeviceId}
                  onChange={(e) => setRDeviceId(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-205 focus:outline-none"
                >
                  <option value="">-- Choose Device --</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.systemName} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Renewal Plan</label>
                <select
                  required
                  value={rPlanId}
                  onChange={(e) => {
                    setRPlanId(e.target.value);
                    const plan = plans.find(p => p.id === e.target.value);
                    if (plan) setRAmount(plan.price);
                  }}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none"
                >
                  <option value="">-- Choose Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Billing Amount ($)</label>
                <input
                  type="number" required
                  value={rAmount}
                  onChange={(e) => setRAmount(Number(e.target.value))}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Collection Status</label>
                <select
                  value={rStatus}
                  onChange={(e) => setRStatus(e.target.value as PaymentStatus)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded"
                >
                  <option value="Paid">Paid / Confirmed</option>
                  <option value="Pending">Pending / Invoiced</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Payment Remarks</label>
                <input
                  type="text"
                  placeholder="Check or Card transaction ID"
                  value={rRemarks}
                  onChange={(e) => setRRemarks(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 transition font-bold rounded text-xs text-white">
                Submit Transaction
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Renewals;
