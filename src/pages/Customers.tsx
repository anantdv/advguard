import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, UserCheck, ShieldAlert, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import FilterDrawer from '../components/common/FilterDrawer';
import Pagination from '../components/common/Pagination';

export const Customers: React.FC = () => {
  const { customers, addCustomer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new Customer
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CustomerType>('Company');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTaxId, setNewTaxId] = useState('');
  const [newBillingLine1, setNewBillingLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newStateVal, setNewStateVal] = useState('');
  const [newCountry, setNewCountry] = useState('USA');
  const [newPostalCode, setNewPostalCode] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = selectedType === 'All' || c.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newContactPerson) return;

    const newCust: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: newName,
      type: newType,
      companyName: newCompanyName || undefined,
      contactPerson: newContactPerson,
      email: newEmail,
      phone: newPhone,
      status: 'Active',
      customerSince: new Date().toISOString().split('T')[0],
      address: {
        billingLine1: newBillingLine1,
        city: newCity,
        state: newStateVal,
        country: newCountry,
        postalCode: newPostalCode,
        shippingAddress: `${newBillingLine1}, ${newCity}, ${newStateVal}, ${newCountry}, ${newPostalCode}`,
        sameAsBilling: true
      },
      contacts: [
        {
          name: newContactPerson,
          designation: 'Primary Contact',
          email: newEmail,
          mobile: newPhone,
          department: 'IT',
          isPrimary: true,
          receivesRenewalAlerts: true,
          receivesSupportUpdates: true
        }
      ]
    };

    addCustomer(newCust);
    setIsAddModalOpen(false);
    // Reset Form
    setNewName('');
    setNewCompanyName('');
    setNewContactPerson('');
    setNewEmail('');
    setNewPhone('');
    setNewTaxId('');
    setNewBillingLine1('');
    setNewCity('');
    setNewStateVal('');
    setNewPostalCode('');
  };

  const getStatusBadgeClass = (status: CustomerStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Inactive': return 'bg-slate-500/20 text-slate-400 border border-slate-700';
      case 'Suspended': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Customer Database</h1>
          <p className="text-slate-400 text-xs">Manage customer accounts, primary contacts, and addresses</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search & Mobile Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, name, email, or company..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
        
        {/* Desktop inline filters */}
        <div className="hidden md:flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Company">Company</option>
            <option value="Government">Government</option>
            <option value="Reseller">Reseller</option>
            <option value="Individual">Individual</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Filters Drawer */}
      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          setSelectedType('All');
          setSelectedStatus('All');
          setCurrentPage(1);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Customer Type</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
            >
              <option value="All">All Types</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Company">Company</option>
              <option value="Government">Government</option>
              <option value="Reseller">Reseller</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </FilterDrawer>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCustomers.map(customer => (
          <Link
            key={customer.id}
            to={`/customers/${customer.id}`}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-brand-500/40 glass-panel glass-panel-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-brand-400 tracking-wider uppercase bg-brand-950/40 px-1.5 py-0.5 rounded">
                    {customer.type}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-200 mt-1">{customer.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{customer.companyName || 'No Company Name'}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${getStatusBadgeClass(customer.status)}`}>
                  {customer.status}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-slate-800/50 pt-3">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-semibold text-slate-300">{customer.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{customer.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{customer.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 text-[10px] text-brand-400 font-bold border-t border-slate-800/20 text-right">
              View Profile &amp; Devices &rarr;
            </div>
          </Link>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No customers match the current filters.
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-sm text-slate-200">Register New Customer</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CustomerType)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-300"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Company">Company</option>
                    <option value="Government">Government</option>
                    <option value="Reseller">Reseller</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="Legal name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Primary technical contact"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Tax ID / VAT / GST</label>
                  <input
                    type="text"
                    placeholder="VAT number"
                    value={newTaxId}
                    onChange={(e) => setNewTaxId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="Direct mobile"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-brand-400 mb-2">Billing Address</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Street Address Line 1"
                    value={newBillingLine1}
                    onChange={(e) => setNewBillingLine1(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-200"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={newStateVal}
                      onChange={(e) => setNewStateVal(e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-850 p-2 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 transition font-bold rounded-lg text-xs"
              >
                Register Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Customers;
