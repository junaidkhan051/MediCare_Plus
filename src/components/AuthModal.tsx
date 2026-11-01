import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, phone });
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'patient' | 'doctor' | 'receptionist' | 'admin') => {
    switchDemoRole(role);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#124E78] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-900 flex items-center justify-center font-bold text-sm">
              M+
            </div>
            <span className="font-semibold text-lg text-white">MediCare Plus Account</span>
          </div>
          <p className="text-xs text-blue-100">
            {mode === 'login'
              ? 'Sign in to review appointments and clinical records.'
              : 'Create a new patient account for online appointments.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex gap-2 mt-4 bg-blue-950/40 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-[#124E78] font-bold shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'register' ? 'bg-white text-[#124E78] font-bold shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Register New Patient
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] focus:ring-1 focus:ring-[#124E78]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] focus:ring-1 focus:ring-[#124E78]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] focus:ring-1 focus:ring-[#124E78]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#124E78] focus:ring-1 focus:ring-[#124E78]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#124E78] hover:bg-[#0d3b5b] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'Sign In to MediCare Plus'
              ) : (
                'Create Patient Account'
              )}
            </button>
          </form>

          {/* Quick Demo Switcher for fast evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              1-Click Demo Profiles (For Instant Evaluation):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickDemo('patient')}
                className="p-2 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-slate-800">Patient</div>
                <div className="text-[10px] text-slate-500">james.wilson@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('doctor')}
                className="p-2 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-slate-800">Doctor (Cardiology)</div>
                <div className="text-[10px] text-slate-500">dr.sarah@medicareplus.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('receptionist')}
                className="p-2 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-slate-800">Receptionist</div>
                <div className="text-[10px] text-slate-500">reception@medicareplus.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="p-2 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold text-slate-800">Administrator</div>
                <div className="text-[10px] text-slate-500">admin@medicareplus.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
