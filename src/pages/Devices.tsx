import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Device, DeviceStatus, LicenseStatus, LicenseType, SupportType } from '../types';
import { Link } from 'react-router-dom';
import { Search, HardDrive, Filter, SlidersHorizontal, Plus, AlertCircle } from 'lucide-react';
import FilterDrawer from '../components/common/FilterDrawer';

export const Devices: React.FC = () => {
  const { devices, customers, addDevice, isLoading } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLicenseStatus, setSelectedLicenseStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Device Form State
  const [systemName, setSystemName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [softwareVersion, setSoftwareVersion] = useState('v12.4.2');
  const [hostname, setHostname] = useState('');
  const [status, setStatus] = useState<DeviceStatus>('Active');
  const [licenseType, setLicenseType] = useState<LicenseType>('Yearly');
  const [supportType, setSupportType] = useState<SupportType>('8x5');
  const [location, setLocation] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);

  const filteredDevices = devices.filter(d => {
    const customer = customers.find(c => c.id === d.customerId);
    const customerName = customer ? customer.name.toLowerCase() : '';
    
    const matchesSearch = 
      d.systemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ipAddress.includes(searchTerm) ||
      customerName.includes(searchTerm.toLowerCase());
      
    const matchesStatus = selectedStatus === 'All' || d.status === selectedStatus;
    const matchesLicenseStatus = selectedLicenseStatus === 'All' || d.licenseStatus === selectedLicenseStatus;
    const matchesType = selectedType === 'All' || d.licenseType === selectedType;
    
    return matchesSearch && matchesStatus && matchesLicenseStatus && matchesType;
  });

  const getLicenseBadgeClass = (lStatus: LicenseStatus) => {
    switch (lStatus) {
      case 'Active': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Expiring Soon': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Expired': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'Trial': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Suspended': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    }
  };

  const getStatusDotClass = (dStatus: DeviceStatus) => {
    switch (dStatus) {
      case 'Active': return 'bg-emerald-500';
      case 'Inactive': return 'bg-slate-500';
      case 'Suspended': return 'bg-purple-500';
      case 'Retired': return 'bg-slate-700';
    }
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemName || !serialNumber || !customerId) return;

    // Calculate dates
    const startStr = new Date().toISOString().split('T')[0];
    const end = new Date();
    if (licenseType === 'Monthly') end.setMonth(end.getMonth() + 1);
    else if (licenseType === 'Quarterly') end.setMonth(end.getMonth() + 3);
    else if (licenseType === 'Half-Yearly') end.setMonth(end.getMonth() + 6);
    else if (licenseType === 'Yearly') end.setMonth(end.getMonth() + 12);
    const endStr = end.toISOString().split('T')[0];

    const newDev: Device = {
      id: serialNumber,
      customerId,
      systemName,
      systemId: '',
      softwareVersion,
      uptime: '100%',
      hostname: hostname || `${systemName.toLowerCase().replace(/ /g, '-')}.local`,
      rebootCause: 'None',
      systemTime: '2026-06-19 18:00:00',
      productModel: 'ADVGuard Firewall',
      serialNumber,
      macAddress: macAddress || '00:00:00:00:00:00',
      ipAddress: ipAddress || '192.168.1.1',
      location: location || 'Server Closet',
      installationDate: startStr,
      activationDate: startStr,
      status,
      lastSyncDate: '2026-06-19 18:00:00',
      licenseStatus: 'Active',
      licenseType,
      licenseStartDate: startStr,
      licenseEndDate: endStr,
      renewalDate: endStr,
      securitySuiteValidUntil: endStr,
      supportValidUntil: endStr,
      supportType,
      autoRenewal,
      lastRenewalDate: startStr,
      nextRenewalDueDate: endStr
    };

    await addDevice(newDev);
    setIsAddModalOpen(false);
    
    // Reset Form
    setSystemName('');
    setSerialNumber('');
    setCustomerId('');
    setMacAddress('');
    setIpAddress('');
    setHostname('');
    setLocation('');
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Network Device Registry</h1>
          <p className="text-slate-400 text-xs">Track systems, uptime, live syncing, and recurring licensing terms</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
        >
          <Plus className="w-4 h-4" /> Add Device
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by IP, Hostname, S/N, MAC, or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden md:flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-350"
          >
            <option value="All">All Device Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Retired">Retired</option>
          </select>

          <select
            value={selectedLicenseStatus}
            onChange={(e) => setSelectedLicenseStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-350"
          >
            <option value="All">All License Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Trial">Trial</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-350"
          >
            <option value="All">All Term Plans</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Yearly">Yearly</option>
            <option value="Lifetime">Lifetime</option>
          </select>
        </div>

        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Drawer for Mobile */}
      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          setSelectedStatus('All');
          setSelectedLicenseStatus('All');
          setSelectedType('All');
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Device Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-850 rounded text-slate-300"
            >
              <option value="All">All Device Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </FilterDrawer>

      {/* Devices List Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900 glass-panel">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              <th className="p-3">Device Name &amp; Model</th>
              <th className="p-3 hidden sm:table-cell">Client ID / Owner</th>
              <th className="p-3">Network Info</th>
              <th className="p-3">License status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredDevices.map(d => {
              const customer = customers.find(c => c.id === d.customerId);
              return (
                <tr key={d.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusDotClass(d.status)}`} />
                      <div className="truncate max-w-[150px]">
                        <p className="font-extrabold text-slate-200 truncate">{d.systemName}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{d.productModel}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-3 hidden sm:table-cell">
                    <p className="font-semibold text-slate-300 truncate max-w-[150px]">{customer?.name || 'Unknown'}</p>
                    <p className="text-[9px] text-slate-500 font-bold tracking-wider">{d.customerId}</p>
                  </td>

                  <td className="p-3">
                    <p className="font-mono text-slate-300 font-medium">{d.ipAddress}</p>
                    <p className="text-[9px] text-slate-500 font-bold">{d.macAddress}</p>
                  </td>

                  <td className="p-3">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getLicenseBadgeClass(d.licenseStatus)}`}>
                      {d.licenseStatus}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1">Expiry: {d.licenseEndDate}</p>
                  </td>

                  <td className="p-3 text-right">
                    <Link
                      to={`/devices/${d.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-850 border border-slate-700 hover:border-brand-500 hover:text-brand-400 text-slate-300 font-bold transition text-[10px]"
                    >
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })}

            {filteredDevices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                  {isLoading ? 'Loading live device registers...' : 'No devices found in this registry.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Register Network Asset</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateDevice} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">System Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Branch Router HQ"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Serial Number</label>
                  <input
                    type="text" required
                    placeholder="e.g. SN-9988X"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Linked Customer ID</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded focus:outline-none"
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.1"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">MAC Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 00:1A:2B:..."
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DeviceStatus)}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Term License</label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value as LicenseType)}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Support Level</label>
                  <select
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value as SupportType)}
                    className="w-full bg-slate-950 border border-slate-850 p-2 rounded"
                  >
                    <option value="Standard">Standard</option>
                    <option value="8x5">8x5 Level</option>
                    <option value="24x7">24x7 Level</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Installation Site / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Rack A Room 102"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={autoRenewal}
                  onChange={(e) => setAutoRenewal(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-850 text-brand-650"
                />
                <span>Enable automatic billing renewal alerts</span>
              </label>

              <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 transition font-bold rounded text-xs text-white">
                Register Device &amp; Sync to ERPNext
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Devices;
