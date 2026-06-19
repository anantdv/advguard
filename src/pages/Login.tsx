import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password. Please verify your ERPNext credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please check ERPNext network availability.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-2xl border border-slate-800 bg-slate-900 glass-panel shadow-2xl space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <img src="/cropped-ADV-Logo-300x115.png" alt="ADVGuard Logo" className="h-12 mx-auto object-contain" />
          <h2 className="text-lg font-black text-white tracking-tight">LicenseDesk Access Portal</h2>
          <p className="text-slate-500 text-xs">Authenticating via your secure ERPNext account</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/15 text-red-400 text-xs flex gap-2 items-start animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Username / Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="administrator / your-email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:text-slate-450 transition font-bold rounded-lg text-xs text-white shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying Credentials...
              </>
            ) : (
              'Log In to LicenseDesk'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
export default Login;
