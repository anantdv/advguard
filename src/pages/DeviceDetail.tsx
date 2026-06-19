import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { 
  ArrowLeft, HardDrive, ShieldCheck, ShieldAlert, ShieldOff,
  User, RefreshCw, Plus, Ticket, Clock, Cpu, Calendar, Activity,
  Globe, Info, FileText, CheckCircle, Upload, Trash2, Download
} from 'lucide-react';
import { TicketCategory, TicketPriority, SupportTicket, PaymentStatus } from '../types';

export const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { devices, customers, plans, tickets, renewalHistory, addSupportTicket, renewDeviceLicense, currentUser } = useAppStore();

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [licenseFiles, setLicenseFiles] = useState<Array<{ id: string; name: string; size: string; date: string }>>([
    { id: '1', name: 'advguard_license_active.lic', size: '2.4 KB', date: '2026-06-19' }
  ]);

  // Renewal Form State
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [renewalAmount, setRenewalAmount] = useState<number>(99);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [remarks, setRemarks] = useState('');

  // Support Ticket Form State
  const [tSubject, setTSubject] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tCategory, setTCategory] = useState<TicketCategory>('Technical');
  const [tPriority, setTPriority] = useState<TicketPriority>('Medium');

  const device = devices.find(d => d.id === id);
  if (!device) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">Device profile not found.</p>
        <Link to="/devices" className="text-brand-400 font-bold hover:underline mt-2 inline-block">&larr; Back to Devices</Link>
      </div>
    );
  }

  const customer = customers.find(c => c.id === device.customerId);
  const deviceTickets = tickets.filter(t => t.deviceId === device.id);
  const deviceRenewals = renewalHistory.filter(r => r.deviceId === device.id);

  // Calculations for Expiry countdown
  const today = new Date('2026-06-19');
  const expiryDate = new Date(device.licenseEndDate);
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;

  // Support Expiry calculations
  const supportExpiryDate = new Date(device.supportValidUntil);
  const supportDaysLeft = Math.ceil((supportExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isSupportExpired = supportDaysLeft < 0;

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setRenewalAmount(plan.price);
    }
  };

  const handleCreateRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    
    renewDeviceLicense(device.id, selectedPlanId, renewalAmount, paymentStatus, remarks);
    setIsRenewModalOpen(false);
    setSelectedPlanId('');
    setRemarks('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tSubject || !tDesc) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-3)}`,
      customerId: device.customerId,
      deviceId: device.id,
      subject: tSubject,
      description: tDesc,
      category: tCategory,
      priority: tPriority,
      status: 'Open',
      createdBy: currentUser.name,
      createdDate: '2026-06-19 18:25:00',
      dueDate: '2026-06-21 18:25:00',
      slaPolicyId: 'sla-3',
      slaStatus: 'Within SLA',
      firstResponseDue: '2026-06-19 22:25:00',
      resolutionDue: '2026-06-21 18:25:00',
      comments: []
    };

    addSupportTicket(newTicket);
    setIsTicketModalOpen(false);
    setTSubject('');
    setTDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Back button header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/devices" className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Device details</span>
            <h1 className="text-base font-black text-white leading-none mt-0.5">{device.systemName}</h1>
          </div>
        </div>

        {/* Top bar actions */}
        <div className="flex items-center gap-2">
          {currentUser.role !== 'support' && (
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Renew License
            </button>
          )}
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <Ticket className="w-3.5 h-3.5" /> Create Ticket
          </button>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - device stats & cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Expiry Widget & Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* License Expiry Countdown */}
            <div className={`p-4.5 rounded-xl border glass-panel shadow-sm flex flex-col justify-between ${
              isExpired ? 'border-rose-500/20 bg-rose-950/10 text-rose-400' :
              daysLeft <= 30 ? 'border-amber-500/20 bg-amber-950/10 text-amber-400' :
              'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
            }`}>
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider opacity-80">License validity status</span>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-3xl font-black tracking-tight">
                    {isExpired ? 'Expired' : `${daysLeft} Days`}
                  </h3>
                  <span className="text-[10px] opacity-75 font-semibold">left</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] opacity-80 flex justify-between">
                <span>Ends on: {device.licenseEndDate}</span>
                <span className="font-bold uppercase tracking-wider">{device.licenseType} Plan</span>
              </div>
            </div>

            {/* Support Expiry Countdown */}
            <div className={`p-4.5 rounded-xl border glass-panel shadow-sm flex flex-col justify-between ${
              isSupportExpired ? 'border-rose-500/20 bg-rose-950/10 text-rose-400' :
              supportDaysLeft <= 30 ? 'border-amber-500/20 bg-amber-950/10 text-amber-400' :
              'border-indigo-500/20 bg-indigo-950/10 text-indigo-400'
            }`}>
              <div>
                <span className="text-[9px] uppercase font-black tracking-wider opacity-80">Support validity status</span>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-3xl font-black tracking-tight">
                    {isSupportExpired ? 'Expired' : `${supportDaysLeft} Days`}
                  </h3>
                  <span className="text-[10px] opacity-75 font-semibold">left</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] opacity-80 flex justify-between">
                <span>Coverage: {device.supportType}</span>
                <span className="font-bold uppercase">Ends: {device.supportValidUntil}</span>
              </div>
            </div>

          </div>

          {/* Device hardware specs details */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-400" /> Device System Specs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Hostname:</span>
                <span className="font-semibold text-slate-200 font-mono">{device.hostname}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Software version:</span>
                <span className="font-semibold text-slate-200 font-mono">{device.softwareVersion}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">System Uptime:</span>
                <span className="font-semibold text-slate-200">{device.uptime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">MAC Address:</span>
                <span className="font-semibold text-slate-200 font-mono">{device.macAddress}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">IP Address:</span>
                <span className="font-semibold text-slate-200 font-mono">{device.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-semibold text-slate-200 font-mono">{device.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Model Name:</span>
                <span className="font-semibold text-slate-200">{device.productModel}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">System Time:</span>
                <span className="font-semibold text-slate-200 font-mono">{device.systemTime}</span>
              </div>
              <div className="col-span-full flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-500">Last Sync:</span>
                <span className="font-semibold text-slate-200 font-mono flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> {device.lastSyncDate}
                </span>
              </div>
              <div className="col-span-full flex justify-between py-1.5">
                <span className="text-slate-500">Reboot Cause:</span>
                <span className="font-semibold text-slate-300 italic">{device.rebootCause}</span>
              </div>
            </div>
          </div>

          {/* Ticket history and recent renewals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Device Renewal History */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">Device Renewal Logs</h3>
              <div className="space-y-2">
                {deviceRenewals.map(r => (
                  <div key={r.id} className="p-2.5 rounded bg-slate-950/40 border border-slate-850 text-[11px] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-300">${r.amount}</p>
                      <p className="text-[9px] text-slate-500">Date: {r.renewalDate}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                      {r.paymentStatus}
                    </span>
                  </div>
                ))}
                {deviceRenewals.length === 0 && (
                  <p className="text-xs text-slate-500 p-2 italic text-center">No renewals recorded</p>
                )}
              </div>
            </div>

            {/* Device ticket log */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">Related Support Tickets</h3>
              <div className="space-y-2">
                {deviceTickets.map(t => (
                  <Link key={t.id} to={`/tickets/${t.id}`} className="p-2.5 rounded bg-slate-950/40 border border-slate-850 text-[11px] flex justify-between items-center hover:bg-slate-950/80 transition block">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-200 truncate">{t.subject}</p>
                      <p className="text-[9px] text-slate-500 font-bold">{t.id}</p>
                    </div>
                    <span className={`px-1 rounded text-[8px] font-bold ${t.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      {t.priority}
                    </span>
                  </Link>
                ))}
                {deviceTickets.length === 0 && (
                  <p className="text-xs text-slate-500 p-2 italic text-center">No related tickets logged</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right column - Customer summary & Location details */}
        <div className="space-y-6">
          {/* Customer profile preview */}
          {customer && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">Linked Customer profile</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-200">{customer.name}</h4>
                  <p className="text-[10px] text-slate-500">{customer.companyName}</p>
                </div>
                
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-slate-300">
                  <p>Rep: {customer.contactPerson}</p>
                  <p className="truncate">Email: {customer.email}</p>
                  <p>Phone: {customer.phone}</p>
                </div>

                <Link to={`/customers/${customer.id}`} className="w-full text-center py-2 bg-slate-800 hover:bg-slate-750 transition font-bold rounded text-[10px] text-brand-400 mt-2 block border border-slate-700/50">
                  View Full Customer Database Profile
                </Link>
              </div>
            </div>
          )}

          {/* Location details card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel text-xs space-y-2">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Physical Deployment Site</h3>
            <p className="font-medium text-slate-200 pt-1">{device.location}</p>
            <p className="text-[10px] text-slate-500">Installation context: Registered on {device.installationDate}</p>
          </div>

          {/* License Files Vault Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">License File Vault</h3>
              <label className="flex items-center gap-1.5 px-2 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold cursor-pointer text-[10px] transition shadow">
                <Upload className="w-3 h-3" /> Upload File
                <input
                  type="file"
                  className="hidden"
                  accept=".lic,.txt,.json,.key,.pem,.crt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const newFile = {
                        id: Date.now().toString(),
                        name: file.name,
                        size: `${(file.size / 1024).toFixed(1)} KB`,
                        date: new Date().toISOString().split('T')[0]
                      };
                      setLicenseFiles(prev => [...prev, newFile]);
                    }
                  }}
                />
              </label>
            </div>

            <div className="space-y-2">
              {licenseFiles.map(file => (
                <div key={file.id} className="p-2.5 rounded bg-slate-950/40 border border-slate-850 flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[9px] text-slate-500">{file.size} &bull; Uploaded {file.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent("ADVGuard Mock License Key Certificate File Content")}`}
                      download={file.name}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-355 hover:text-white transition"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setLicenseFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="p-1 rounded bg-slate-800 hover:bg-red-950/30 text-slate-355 hover:text-red-400 transition"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {licenseFiles.length === 0 && (
                <p className="text-xs text-slate-500 p-2 italic text-center">No license files uploaded</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Renew License Modal */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Process License Extension</h3>
              <button onClick={() => setIsRenewModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateRenewal} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Subscription Plan</label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200 focus:outline-none"
                >
                  <option value="">-- Choose Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Override Price ($)</label>
                <input
                  type="number"
                  value={renewalAmount}
                  onChange={(e) => setRenewalAmount(Number(e.target.value))}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                >
                  <option value="Paid">Paid / Confirmed</option>
                  <option value="Pending">Pending / Invoice Issued</option>
                  <option value="Failed">Failed / Declined</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Billing reference notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 transition font-bold rounded text-xs text-white">
                Process License Upgrade
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Register Support Case</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Subject / Summary</label>
                <input
                  type="text" required
                  placeholder="e.g. Dynamic Routing failure"
                  value={tSubject}
                  onChange={(e) => setTSubject(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Issue Description</label>
                <textarea
                  required
                  placeholder="Describe error logs, hardware LED status..."
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200 focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                  <select
                    value={tCategory}
                    onChange={(e) => setTCategory(e.target.value as TicketCategory)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                  >
                    <option value="Technical">Technical</option>
                    <option value="License">License</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Severity</label>
                  <select
                    value={tPriority}
                    onChange={(e) => setTPriority(e.target.value as TicketPriority)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-500 transition font-bold rounded text-xs text-white">
                Log Support Case
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default DeviceDetail;
