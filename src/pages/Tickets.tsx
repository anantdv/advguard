import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { SupportTicket, TicketPriority, TicketStatus, TicketCategory } from '../types';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  MessageSquare, User, Filter, SlidersHorizontal, LayoutGrid, ListTodo
} from 'lucide-react';
import FilterDrawer from '../components/common/FilterDrawer';

export const Tickets: React.FC = () => {
  const { tickets, customers, devices, addSupportTicket, currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Ticket Form State
  const [newCustId, setNewCustId] = useState('');
  const [newDevId, setNewDevId] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('Technical');
  const [newPriority, setNewPriority] = useState<TicketPriority>('Medium');

  const filteredTickets = tickets.filter(t => {
    const cust = customers.find(c => c.id === t.customerId);
    const dev = devices.find(d => d.id === t.deviceId);
    const matchString = `${t.id} ${t.subject} ${cust?.name} ${dev?.systemName}`.toLowerCase();
    
    const matchesSearch = matchString.includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  const getPriorityClass = (priority: TicketPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Low': return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getSLAClass = (status: string) => {
    switch (status) {
      case 'Breached': return 'bg-red-500/20 text-red-400 border border-red-500/35';
      case 'Near Breach': return 'bg-amber-500/20 text-amber-400 border border-amber-500/35';
      default: return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35';
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustId || !newSubject || !newDesc) return;

    const newTck: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      customerId: newCustId,
      deviceId: newDevId || 'DEV-GENERIC',
      subject: newSubject,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
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

    addSupportTicket(newTck);
    setIsAddModalOpen(false);
    
    // Reset Form
    setNewCustId('');
    setNewDevId('');
    setNewSubject('');
    setNewDesc('');
  };

  const kanbanColumns: TicketStatus[] = ['Open', 'Assigned', 'In Progress', 'Waiting for Customer', 'Resolved'];

  return (
    <div className="space-y-5">
      {/* Header Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Support Tickets &amp; SLA Console</h1>
          <p className="text-slate-400 text-xs">Track service desk cases, active response count downs, and escalations</p>
        </div>
        
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex gap-1 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded flex items-center gap-1 font-bold ${viewMode === 'list' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ListTodo className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded flex items-center gap-1 font-bold ${viewMode === 'kanban' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <Plus className="w-4 h-4" /> Add Ticket
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by case summary, device serial, client, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Desktop selects */}
        <div className="hidden md:flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-350"
          >
            <option value="All">All Statuses</option>
            {kanbanColumns.map(col => <option key={col} value={col}>{col}</option>)}
            <option value="Closed">Closed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-35"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-35"
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="License">License</option>
            <option value="Renewal">Renewal</option>
            <option value="Billing">Billing</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>

        {/* Mobile Filter */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          setSelectedStatus('All');
          setSelectedPriority('All');
          setSelectedCategory('All');
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
            >
              <option value="All">All Statuses</option>
              {kanbanColumns.map(col => <option key={col} value={col}>{col}</option>)}
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </FilterDrawer>

      {/* List / Kanban Switchable Area */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTickets.map(t => {
            const cust = customers.find(c => c.id === t.customerId);
            const dev = devices.find(d => d.id === t.deviceId);
            return (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 glass-panel glass-panel-hover flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs"
              >
                <div className="space-y-1 truncate pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-500 font-mono">{t.id}</span>
                    <span className="text-[9px] px-1 bg-slate-800 rounded text-slate-400 font-bold">{t.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm truncate">{t.subject}</h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    Client: {cust?.name} &bull; Node: {dev?.systemName || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getPriorityClass(t.priority)}`}>
                    {t.priority}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getSLAClass(t.slaStatus)}`}>
                    SLA: {t.slaStatus}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-950 text-slate-300">
                    {t.status}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5" /> {t.comments.length}
                  </div>
                </div>
              </Link>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No tickets matched current selection filters.
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(column => {
            const columnTickets = filteredTickets.filter(t => t.status === column);
            return (
              <div key={column} className="w-72 shrink-0 bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col max-h-[70vh]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">{column}</span>
                  <span className="text-[10px] bg-slate-950 font-bold text-slate-500 px-1.5 rounded">{columnTickets.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5">
                  {columnTickets.map(t => (
                    <Link
                      key={t.id}
                      to={`/tickets/${t.id}`}
                      className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg block text-xs space-y-2 hover:border-brand-500 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-extrabold text-slate-500 font-mono text-[9px]">{t.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${getPriorityClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 leading-snug line-clamp-2">{t.subject}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800/40 pt-2 mt-1">
                        <span className="truncate max-w-[100px]">By: {t.createdBy}</span>
                        <span className={`px-1 rounded ${getSLAClass(t.slaStatus)}`}>{t.slaStatus}</span>
                      </div>
                    </Link>
                  ))}
                  {columnTickets.length === 0 && (
                    <p className="text-[10px] text-slate-600 text-center py-6">Empty Column</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Ticket Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-xs text-slate-200">Register Support Case</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-4 space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Customer Account</label>
                <select
                  required
                  value={newCustId}
                  onChange={(e) => {
                    setNewCustId(e.target.value);
                    setNewDevId('');
                  }}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-205 focus:outline-none"
                >
                  <option value="">-- Choose Account --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Linked Device</label>
                <select
                  value={newDevId}
                  onChange={(e) => setNewDevId(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-205 focus:outline-none"
                >
                  <option value="">-- Choose Device (Optional) --</option>
                  {devices.filter(d => d.customerId === newCustId).map(d => (
                    <option key={d.id} value={d.id}>{d.systemName} ({d.productModel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Issue Subject</label>
                <input
                  type="text" required
                  placeholder="Summary of error message..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Problem Description</label>
                <textarea
                  required
                  placeholder="Mention configuration details, error codes..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded text-slate-200 min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded"
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
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 p-2 rounded"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 transition font-bold rounded text-xs text-white">
                Log Support Case
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Tickets;
