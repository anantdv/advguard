import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { 
  LayoutDashboard, Users, ShieldAlert, FileText, Settings, 
  Menu, Bell, Wrench, RefreshCw, Key, LogOut, User
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, notifications, markNotificationAsRead, logout } = useAppStore();
  const location = useLocation();
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'support', 'sales'] },
    { name: 'Devices', href: '/devices', icon: Wrench, roles: ['admin', 'support', 'sales'] },
    { name: 'Renewals', href: '/renewals', icon: RefreshCw, roles: ['admin', 'sales'] },
    { name: 'Tickets', href: '/tickets', icon: ShieldAlert, roles: ['admin', 'support'] },
    { name: 'SLA Configs', href: '/sla', icon: Key, roles: ['admin'] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const unreadNotifs = notifications.filter(n => !n.read);
  const currentPath = location.pathname;

  if (currentPath === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img src="/cropped-ADV-Logo-300x115.png" alt="AnantDV Logo" className="h-8 object-contain" />
            <div>
              <span className="font-extrabold text-sm tracking-wider text-slate-200">ADVGUARD</span>
              <p className="text-[10px] text-brand-400 font-semibold tracking-wide -mt-1">LicenseDesk</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4 border-b border-slate-800 text-xs">
          <label className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Session Identity</label>
          <div className="p-2 rounded bg-slate-950/40 border border-slate-850 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-200">{currentUser.name}</p>
              <p className="text-[9px] text-slate-500 capitalize">{currentUser.role} Desk Staff</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded bg-slate-850 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation
            .filter(item => item.roles.includes(currentUser.role))
            .map((item, idx) => {
              const active = currentPath.startsWith(item.href);
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    active 
                      ? 'bg-brand-600/25 border-l-4 border-brand-500 text-brand-400 font-bold' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Header bar */}
        <header className="h-14 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2 md:hidden">
            <img src="/cropped-ADV-Logo-300x115.png" alt="AnantDV Logo" className="h-6 object-contain" />
          </div>

          <div className="hidden md:flex items-center text-xs font-semibold text-slate-450">
            ADVGuard Management Portal &bull; Live ERPNext Database Sync Active
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications Center */}
            <div className="relative">
              <button 
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 transition text-slate-300 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">System Notifications</span>
                    <span className="text-[10px] text-slate-500">{unreadNotifs.length} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            setNotifMenuOpen(false);
                          }}
                          className={`p-3 border-b border-slate-800/60 text-xs cursor-pointer hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-brand-950/20 border-l-2 border-brand-500' : ''}`}
                        >
                          <p className="text-[11px] leading-relaxed text-slate-450">{n.message}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:bg-slate-805 hover:text-white transition text-slate-300"
              >
                <div className="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                  {currentUser.name.slice(0, 2)}
                </div>
                <span className="hidden sm:inline text-xs font-semibold pr-1 max-w-[100px] truncate">{currentUser.name}</span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
                  <div className="p-3 bg-slate-950 border-b border-slate-800">
                    <p className="font-bold text-slate-200 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email || `${currentUser.name}@company.com`}</p>
                    <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-brand-950 text-brand-400 border border-brand-500/20">
                      {currentUser.role} Account
                    </span>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-rose-400 hover:bg-rose-950/20 transition-colors font-bold text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          {children}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg">
        {navigation
          .filter(item => item.roles.includes(currentUser.role) && item.name !== 'SLA Configs' && item.name !== 'Reports' && item.name !== 'Settings')
          .slice(0, 5)
          .map((item, idx) => {
            const active = currentPath.startsWith(item.href);
            return (
              <Link
                key={idx}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors duration-200 ${
                  active ? 'text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span>{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
};
export default AppLayout;
