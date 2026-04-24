import React, { useState } from 'react';
import { Zap, LogIn, LogOut, User, Coins, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">ConCom</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {mode === 'login'
            ? "Login to unlock server processing and earn tokens"
            : "New accounts start with 10 free tokens"}
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition pr-10"
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-brand hover:shadow-lg"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-brand-600 font-medium hover:underline">
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

interface NavbarProps {
  onAuthOpen: (mode?: 'login' | 'register') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthOpen }) => {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-brand">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Con<span className="text-brand-600">Com</span></span>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1.5 text-sm font-medium">
                <Coins size={14} />
                <span>{user.tokens} tokens</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User size={14} />
                <span className="hidden sm:inline truncate max-w-[140px]">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuthOpen('login')}
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors px-3 py-2"
              >
                Log in
              </button>
              <button
                onClick={() => onAuthOpen('register')}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-brand hover:shadow-lg"
              >
                Sign up free
              </button>
            </>
          )}
        </div>
      </div>
      {/* Export AuthModal so it can be rendered from App */}
    </header>
  );
};

export { AuthModal };
export default Navbar;
