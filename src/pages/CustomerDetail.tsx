import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { 
  Building, User, Mail, Phone, Globe, Calendar, 
  MapPin, ShieldCheck, Ticket, History, Plus, CheckCircle, 
  Clock, ShieldAlert, ArrowLeft, PenSquare, Edit, Notebook
} from 'lucide-react';
import { CustomerContact } from '../types';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, devices, tickets, renewalHistory, updateCustomerContacts, updateCustomerAddress, updateCustomerNotes } = useAppStore();
  const [activeTab, setActiveTab] = useState<'devices' | 'tickets' | 'renewals' | 'contacts' | 'notes'>('devices');

  const customer = customers.find(c => c.id === id);
  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">Customer profile not found.</p>
        <Link to="/customers" className="text-brand-400 font-bold hover:underline mt-2 inline-block">&larr; Back to Customers</Link>
      </div>
    );
  }

  // Linked Assets
  const linkedDevices = devices.filter(d => d.customerId === customer.id);
  const linkedTickets = tickets.filter(t => t.customerId === customer.id);
  const linkedRenewals = renewalHistory.filter(r => r.customerId === customer.id);

  // States for Contacts Management
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cDesignation, setCDesignation] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cMobile, setCMobile] = useState('');
  const [cDept, setCDept] = useState('');

  // Note State
  const [noteText, setNoteText] = useState(customer.notes || '');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cEmail) return;

    const newContact: CustomerContact = {
      name: cName,
      designation: cDesignation,
      email: cEmail,
      mobile: cMobile,
      department: cDept,
      isPrimary: false,
      receivesRenewalAlerts: true,
      receivesSupportUpdates: true
    };

    updateCustomerContacts(customer.id, [...customer.contacts, newContact]);
    setIsAddContactOpen(false);
    // Reset form
    setCName('');
    setCDesignation('');
    setCEmail('');
    setCMobile('');
    setCDept('');
  };

  const handleSaveNotes = () => {
    updateCustomerNotes(customer.id, noteText);
    alert('Notes updated successfully');
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link to="/customers" className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Customer Profile</span>
          <h1 className="text-lg font-black text-white leading-none mt-0.5">{customer.name}</h1>
        </div>
      </div>

      {/* Main Core Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-600/30 text-brand-400">
                  {customer.type}
                </span>
                <h2 className="text-lg font-black text-slate-100 mt-2">{customer.companyName || customer.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{customer.notes || 'No account manager notes registered.'}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${customer.status === 'Active' ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/25 text-rose-400 border border-rose-500/30'}`}>
                  {customer.status}
                </span>
                <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" /> Since {customer.customerSince}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800/80 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Primary Contact</span>
                <p className="text-slate-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-400" /> {customer.contactPerson}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Email Address</span>
                <a href={`mailto:${customer.email}`} className="text-brand-400 font-medium flex items-center gap-1.5 hover:underline truncate">
                  <Mail className="w-3.5 h-3.5" /> {customer.email}
                </a>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Phone / Hotline</span>
                <p className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-400" /> {customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Asset & Records Tabs Navigation */}
          <div className="border-b border-slate-800 flex gap-2 overflow-x-auto pb-px">
            {(['devices', 'tickets', 'renewals', 'contacts', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-bold capitalize whitespace-nowrap transition border-b-2 -mb-px ${
                  activeTab === tab 
                    ? 'border-brand-500 text-brand-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content */}
          <div className="min-h-[250px]">
            {activeTab === 'devices' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Linked Devices ({linkedDevices.length})</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {linkedDevices.map(d => (
                    <Link
                      key={d.id}
                      to={`/devices/${d.id}`}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-xs text-slate-200">{d.systemName}</p>
                          <p className="text-[10px] text-slate-500">Model: {d.productModel}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          d.licenseStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                          d.licenseStatus === 'Expiring Soon' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {d.licenseStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-4 border-t border-slate-800/40 pt-2.5">
                        <span>IP: {d.ipAddress}</span>
                        <span>Expiry: {d.licenseEndDate}</span>
                      </div>
                    </Link>
                  ))}
                  {linkedDevices.length === 0 && (
                    <p className="text-xs text-slate-500 col-span-full p-6 text-center border border-dashed border-slate-800 rounded-xl">No devices assigned to this customer</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Support Tickets ({linkedTickets.length})</h3>
                <div className="space-y-2">
                  {linkedTickets.map(t => (
                    <Link
                      key={t.id}
                      to={`/tickets/${t.id}`}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-4">
                        <span className="text-[9px] font-bold text-slate-500">{t.id}</span>
                        <p className="font-semibold text-slate-200 truncate mt-0.5">{t.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          t.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {t.priority}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.status === 'Resolved' || t.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {linkedTickets.length === 0 && (
                    <p className="text-xs text-slate-500 p-6 text-center border border-dashed border-slate-800 rounded-xl">No tickets found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'renewals' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Renewal Transactions ({linkedRenewals.length})</h3>
                <div className="space-y-2">
                  {linkedRenewals.map(r => (
                    <div
                      key={r.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">ID: {r.id}</p>
                        <p className="text-[10px] text-slate-500">Plan Amount: ${r.amount} &bull; Processed on: {r.renewalDate}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        r.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {r.paymentStatus}
                      </span>
                    </div>
                  ))}
                  {linkedRenewals.length === 0 && (
                    <p className="text-xs text-slate-500 p-6 text-center border border-dashed border-slate-800 rounded-xl">No renewal logs recorded</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Authorized Personnel</h3>
                  <button 
                    onClick={() => setIsAddContactOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-brand-600/30 text-brand-400 border border-brand-500/20 rounded hover:bg-brand-600/40 text-[10px] font-bold transition"
                  >
                    <Plus className="w-3 h-3" /> Add Contact
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customer.contacts.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-200">{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.designation} &bull; {c.department}</p>
                        </div>
                        {c.isPrimary && (
                          <span className="text-[8px] bg-brand-600/20 border border-brand-500/30 text-brand-400 font-bold px-1.5 py-0.5 rounded uppercase">Primary</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-850">
                        <p>Email: {c.email}</p>
                        <p>Mobile: {c.mobile}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Internal Account Notes</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record customer status, special requirements, pricing models agreed..."
                  className="w-full min-h-[150px] p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 transition text-xs font-bold rounded-lg text-white"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account Manager & Addresses */}
        <div className="space-y-6">
          
          {/* Account Manager Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Account Management</h3>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center font-bold text-white text-xs">
                {customer.accountManager?.split(' ').map(n=>n[0]).join('') || 'AM'}
              </div>
              <div>
                <p className="font-semibold text-slate-200">{customer.accountManager || 'None Assigned'}</p>
                <p className="text-[9px] text-slate-500">Corporate Account Manager</p>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Corporate &amp; Tax Info</h3>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">VAT / Tax ID:</span>
                <span className="font-mono text-slate-200 font-bold">{customer.taxId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Website:</span>
                <span className="text-brand-400 font-semibold truncate max-w-[150px]">{customer.website || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-xs space-y-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400" />
              <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Registered Addresses</h3>
            </div>
            
            <div className="space-y-2 border-t border-slate-850 pt-2 text-[11px] text-slate-300">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Billing Address</span>
                <p>{customer.address.billingLine1}</p>
                {customer.address.billingLine2 && <p>{customer.address.billingLine2}</p>}
                <p>{customer.address.city}, {customer.address.state}, {customer.address.country} - {customer.address.postalCode}</p>
              </div>
              
              <div className="pt-2 border-t border-slate-850">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Shipping Location</span>
                <p className="text-slate-400">{customer.address.shippingAddress}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Register Contact Representative</h3>
              <button onClick={() => setIsAddContactOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleAddContact} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text" required
                  placeholder="e.g. John Doe"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Designation</label>
                <input
                  type="text" required
                  placeholder="e.g. CTO / IT Lead"
                  value={cDesignation}
                  onChange={(e) => setCDesignation(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</label>
                <input
                  type="email" required
                  placeholder="name@company.com"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mobile</label>
                <input
                  type="text" required
                  placeholder="+1-555-1234"
                  value={cMobile}
                  onChange={(e) => setCMobile(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. IT Operations"
                  value={cDept}
                  onChange={(e) => setCDept(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded focus:outline-none focus:border-brand-500"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-500 transition font-bold rounded text-xs text-white">
                Save Contact Representative
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default CustomerDetail;
