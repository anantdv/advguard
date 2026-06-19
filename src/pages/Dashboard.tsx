import React from 'react';
import { useAppStore } from '../store/appStore';
import StatsCard from '../components/common/StatsCard';
import { 
  Users, HardDrive, ShieldCheck, ShieldAlert, ShieldOff, 
  AlertTriangle, Ticket, DollarSign, Calendar, TrendingUp,
  Clock, ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#5f8ebd', '#3d6ea2', '#94b3d1', '#c2d2e3', '#f43f5e', '#eab308'];

export const Dashboard: React.FC = () => {
  const { customers, devices, tickets, renewalHistory } = useAppStore();

  // Calculations
  const totalCustomers = customers.length;
  const totalDevices = devices.length;
  
  const activeLicenses = devices.filter(d => d.licenseStatus === 'Active' || d.licenseStatus === 'Trial').length;
  const expiredLicenses = devices.filter(d => d.licenseStatus === 'Expired').length;
  
  // Expiry in 7 & 30 Days
  const today = new Date('2026-06-19');
  
  const expiring7Days = devices.filter(d => {
    if (d.licenseStatus === 'Expired') return false;
    const end = new Date(d.licenseEndDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).length;
  
  const expiring30Days = devices.filter(d => {
    if (d.licenseStatus === 'Expired') return false;
    const end = new Date(d.licenseEndDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;

  const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled').length;
  const slaBreachedTickets = tickets.filter(t => t.slaStatus === 'Breached').length;

  // Renewals this month (June 2026)
  const renewalsThisMonth = devices.filter(d => {
    const end = new Date(d.licenseEndDate);
    return end.getFullYear() === 2026 && end.getMonth() === 5; // Month index 5 is June
  });
  
  const renewalsDueCount = renewalsThisMonth.length;
  
  // Forecast: Sum of standard pricing for these devices based on their license type
  const forecastRevenue = renewalsThisMonth.reduce((sum, d) => {
    let amount = 99; // Standard Monthly default
    if (d.licenseType === 'Quarterly') amount = 249;
    if (d.licenseType === 'Half-Yearly') amount = 499;
    if (d.licenseType === 'Yearly') amount = 899;
    return sum + amount;
  }, 0);

  // Chart Data: Devices by License Type
  const licenseTypeData = Object.entries(
    devices.reduce((acc, d) => {
      acc[d.licenseType] = (acc[d.licenseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Chart Data: Tickets by Priority
  const ticketPriorityData = Object.entries(
    tickets.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Chart Data: Revenue Forecast (Monthly buckets from July to Dec 2026)
  const forecastData = [
    { month: 'Jun 26', revenue: forecastRevenue },
    { month: 'Jul 26', revenue: 4500 },
    { month: 'Aug 26', revenue: 3200 },
    { month: 'Sep 26', revenue: 5800 },
    { month: 'Oct 26', revenue: 7100 },
    { month: 'Nov 26', revenue: 4900 },
    { month: 'Dec 26', revenue: 9500 },
  ];

  // Recently Renewed Devices
  const recentlyRenewed = [...renewalHistory]
    .filter(r => r.status === 'Confirmed')
    .slice(0, 5)
    .map(r => {
      const device = devices.find(d => d.id === r.deviceId);
      const customer = customers.find(c => c.id === r.customerId);
      return {
        ...r,
        deviceName: device?.systemName || 'Unknown Device',
        customerName: customer?.name || 'Unknown Customer'
      };
    });

  // Upcoming Expirations
  const upcomingExpirations = [...devices]
    .filter(d => d.licenseStatus !== 'Expired')
    .sort((a, b) => new Date(a.licenseEndDate).getTime() - new Date(b.licenseEndDate).getTime())
    .slice(0, 5);

  // Expired Devices
  const expiredDevicesList = devices.filter(d => d.licenseStatus === 'Expired').slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Performance & Subscriptions</h1>
          <p className="text-slate-400 text-xs">ADVGuard LicenseDesk Overview - Date Context: June 19, 2026</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatsCard 
          title="Total Customers" 
          value={totalCustomers} 
          icon={Users} 
          colorClass="from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-400"
        />
        <StatsCard 
          title="Total Devices" 
          value={totalDevices} 
          icon={HardDrive} 
          colorClass="from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400"
        />
        <StatsCard 
          title="Active Licenses" 
          value={activeLicenses} 
          icon={ShieldCheck} 
          colorClass="from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400"
          description="Services fully operational"
        />
        <StatsCard 
          title="Expired Devices" 
          value={expiredLicenses} 
          icon={ShieldOff} 
          colorClass="from-rose-500/10 to-rose-600/5 border-rose-500/20 text-rose-400"
          description="Needs instant renewal"
        />
        <StatsCard 
          title="Expiring In 7 Days" 
          value={expiring7Days} 
          icon={AlertTriangle} 
          colorClass="from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400"
          description={`Expiring in 30 days: ${expiring30Days}`}
        />
        <StatsCard 
          title="Open Tickets" 
          value={openTickets} 
          icon={Ticket} 
          colorClass="from-pink-500/10 to-pink-600/5 border-pink-500/20 text-pink-400"
        />
        <StatsCard 
          title="SLA Breached" 
          value={slaBreachedTickets} 
          icon={Clock} 
          colorClass="from-red-500/10 to-red-600/5 border-red-500/20 text-red-400"
          description="Urgent action required"
        />
        <StatsCard 
          title="Renewals Due (Month)" 
          value={renewalsDueCount} 
          icon={Calendar} 
          colorClass="from-sky-500/10 to-sky-600/5 border-sky-500/20 text-sky-400"
        />
        <StatsCard 
          title="Revenue Forecast" 
          value={`$${forecastRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          colorClass="from-teal-500/10 to-teal-600/5 border-teal-500/20 text-teal-400"
          description="This month renewals"
          trend={{ value: '+14%', positive: true }}
        />
        <StatsCard 
          title="Total Forecast" 
          value="$38,500" 
          icon={TrendingUp} 
          colorClass="from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400"
          description="Next 6-month pipeline"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Forecast Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">6-Month Renewal Revenue Forecast</h2>
            <span className="text-[10px] text-slate-500">USD ($) Forecast</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d6ea2" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3d6ea2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#5f8ebd" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Devices by License Type Pie Chart */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Devices by License Type</h2>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={licenseTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {licenseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] text-slate-400">
            {licenseTypeData.map((d, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Timelines & Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* License Expiry & Upcoming Renewals */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Upcoming Expirations</h2>
            <Link to="/devices" className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingExpirations.length === 0 ? (
              <p className="text-xs text-slate-500 p-2">No active devices expiring soon</p>
            ) : (
              upcomingExpirations.map(d => {
                const daysLeft = Math.ceil((new Date(d.licenseEndDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{d.systemName}</p>
                      <p className="text-[10px] text-slate-500">Model: {d.productModel}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${daysLeft <= 7 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {daysLeft} days
                      </span>
                      <p className="text-[9px] text-slate-500 mt-1">{d.licenseEndDate}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Expired Devices */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Expired / Suspended</h2>
            <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded font-bold">Renewal Needed</span>
          </div>
          <div className="space-y-3">
            {expiredDevicesList.length === 0 ? (
              <p className="text-xs text-slate-500 p-2">No expired devices</p>
            ) : (
              expiredDevicesList.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{d.systemName}</p>
                    <p className="text-[10px] text-slate-500">Serial: {d.serialNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400">
                      Expired
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1">{d.licenseEndDate}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Renewed Devices */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Recently Renewed</h2>
            <Link to="/renewals" className="text-[10px] text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1">
              History <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentlyRenewed.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                <div className="truncate">
                  <p className="font-semibold text-slate-200 truncate">{r.deviceName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{r.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">${r.amount}</p>
                  <p className="text-[9px] text-slate-500">{r.renewalDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tickets & SLA Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket priority breakdown bar chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">Tickets by Priority</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketPriorityData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11 }} />
                <Bar dataKey="value" fill="#3d6ea2" radius={[4, 4, 0, 0]}>
                  {ticketPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Status summary */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 glass-panel flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-4">SLA Breach Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Breached Tickets</p>
                    <p className="text-[10px] text-slate-500">Requires resolution immediate</p>
                  </div>
                </div>
                <span className="text-lg font-black text-red-400">{slaBreachedTickets}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Near Breach Tickets</p>
                    <p className="text-[10px] text-slate-500">Escalation countdown running</p>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-400">
                  {tickets.filter(t => t.slaStatus === 'Near Breach').length}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">Within SLA</p>
                    <p className="text-[10px] text-slate-500">Satisfying service limits</p>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-400">
                  {tickets.filter(t => t.slaStatus === 'Within SLA').length}
                </span>
              </div>
            </div>
          </div>
          <Link to="/tickets" className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 transition text-xs font-bold rounded-lg mt-4 block border border-slate-700/60">
            Open Ticketing Dashboard
          </Link>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
