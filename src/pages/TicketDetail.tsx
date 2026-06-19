import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { 
  ArrowLeft, Clock, MessageSquare, AlertTriangle, ShieldCheck,
  User, CheckCircle, HelpCircle, HardDrive, RefreshCw, Send, EyeOff
} from 'lucide-react';
import { TicketStatus, TicketPriority } from '../types';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tickets, customers, devices, assignTicket, updateTicketStatus, updateTicketPriority, addTicketComment, currentUser } = useAppStore();

  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">Ticket not found.</p>
        <Link to="/tickets" className="text-brand-400 font-bold hover:underline mt-2 inline-block">&larr; Back to Tickets</Link>
      </div>
    );
  }

  const customer = customers.find(c => c.id === ticket.customerId);
  const device = devices.find(d => d.id === ticket.deviceId);

  const handleAssign = (assignee: string) => {
    assignTicket(ticket.id, assignee, currentUser);
  };

  const handleStatusChange = (status: TicketStatus) => {
    updateTicketStatus(ticket.id, status, currentUser);
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    updateTicketPriority(ticket.id, priority, currentUser);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addTicketComment(ticket.id, commentText, currentUser, isInternal);
    setCommentText('');
    setIsInternal(false);
  };

  const getPriorityColor = (p: TicketPriority) => {
    switch (p) {
      case 'Critical': return 'text-red-400 border-red-500/30 bg-red-950/20';
      case 'High': return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
      case 'Medium': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'Low': return 'text-slate-400 border-slate-700 bg-slate-800/30';
    }
  };

  const getSLAColor = (s: string) => {
    switch (s) {
      case 'Breached': return 'bg-red-500/20 text-red-450 border border-red-500/30';
      case 'Near Breach': return 'bg-amber-500/20 text-amber-450 border border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30';
    }
  };

  const visibleComments = ticket.comments.filter(c => {
    if (c.isInternal) {
      // Internal comments are only visible to staff (admin or support)
      return currentUser.role === 'admin' || currentUser.role === 'support';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Navigation Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{ticket.id} &bull; Category: {ticket.category}</span>
            <h1 className="text-base font-black text-white leading-none mt-0.5">{ticket.subject}</h1>
          </div>
        </div>

        {/* SLA Status badge */}
        <span className={`px-2.5 py-1 rounded text-xs font-bold text-center ${getSLAColor(ticket.slaStatus)}`}>
          SLA Limit: {ticket.slaStatus}
        </span>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Thread and conversations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main ticket context */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <span className="text-slate-500 text-xs">Logged by {ticket.createdBy} on {ticket.createdDate}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Conversation Thread */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand-400" /> Correspondence History ({visibleComments.length})
            </h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {visibleComments.map(c => {
                const isAuthorStaff = c.authorRole === 'admin' || c.authorRole === 'support';
                return (
                  <div 
                    key={c.id} 
                    className={`p-3 rounded-lg border text-xs ${
                      c.isInternal ? 'bg-purple-950/15 border-purple-900/40' :
                      isAuthorStaff ? 'bg-slate-900 border-slate-800' :
                      'bg-brand-950/10 border-brand-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-250">{c.authorName}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-500">({c.authorRole})</span>
                        {c.isInternal && (
                          <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 text-purple-400 px-1 rounded flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" /> Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500">{c.timestamp}</span>
                    </div>
                    <p className="text-slate-350 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                  </div>
                );
              })}
              {visibleComments.length === 0 && (
                <p className="text-xs text-slate-500 italic p-2 text-center">No replies or updates logged on this ticket.</p>
              )}
            </div>

            {/* Post Reply */}
            <form onSubmit={handleCommentSubmit} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <textarea
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full min-h-[90px] p-3 text-xs bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <div className="flex justify-between items-center">
                {(currentUser.role === 'admin' || currentUser.role === 'support') ? (
                  <label className="flex items-center gap-2 text-slate-400 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5 text-purple-400" /> Internal Note (Staff Only)
                    </span>
                  </label>
                ) : <div />}

                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 transition text-xs font-bold rounded-lg text-white flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right column - Controls, assignee, client detail */}
        <div className="space-y-6">
          
          {/* Ticket State Controls */}
          {(currentUser.role === 'admin' || currentUser.role === 'support') && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-4">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Desk Operations</h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Workflow Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-slate-200"
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Customer">Waiting for Customer (Pause SLA)</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Assignee</label>
                  <select
                    value={ticket.assignedTo || ''}
                    onChange={(e) => handleAssign(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-slate-200"
                  >
                    <option value="">-- Unassigned --</option>
                    <option value="Alex Mercer (L2 Dev)">Alex Mercer</option>
                    <option value="Nadia Petrova (L1 Support)">Nadia Petrova</option>
                    <option value="Sam Wilson (Billing Ops)">Sam Wilson</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Ticket Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Device Context */}
          {device && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-2 text-xs">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Associated Asset</h3>
              <div className="pt-1">
                <p className="font-extrabold text-slate-200 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-brand-400" /> {device.systemName}
                </p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{device.id} &bull; Model: {device.productModel}</p>
                <Link to={`/devices/${device.id}`} className="text-brand-400 font-bold hover:underline block text-[10px] mt-2">
                  Open device console &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Customer profile link */}
          {customer && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 glass-panel space-y-2 text-xs">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Associated Customer Account</h3>
              <div className="pt-1">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-400" /> {customer.name}
                </p>
                <p className="text-[9px] text-slate-500">Contact Email: {customer.email}</p>
                <Link to={`/customers/${customer.id}`} className="text-brand-400 font-bold hover:underline block text-[10px] mt-2">
                  Open customer account details &rarr;
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default TicketDetail;
