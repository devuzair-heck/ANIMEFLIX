import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminAuthService.login(username.trim(), password);

      if (response.success) {
        // Direct redirect to admin dashboard (NO 2FA / NO OTP)
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage(response.error || 'Invalid username or password.');
      }
    } catch {
      setErrorMessage('Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] relative selection:bg-[#DC143C] selection:text-white">
      {/* Cinematic Dark Background with Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#DC143C]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-neutral-900/40 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          id="admin-login-home-link"
          className="flex items-center gap-2 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DC143C] to-[#800020] flex items-center justify-center shadow-lg shadow-[#DC143C]/20 group-hover:scale-105 transition-transform duration-200">
            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
          <span className="text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-neutral-400">
            ANIME<span className="text-[#DC143C]">FLIX</span>
          </span>
        </Link>

        <Link
          to="/"
          id="admin-back-to-site-btn"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to AnimeFlix</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-[#121212]/95 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            
            {/* Header */}
            <div className="mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                  Restricted Access
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
                Admin Sign In
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your administrative credentials to manage AnimeFlix.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                id="admin-login-error"
                className="mb-5 bg-red-950/60 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Username Input */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
                >
                  Username <span className="text-[#DC143C]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    disabled={isLoading}
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
                >
                  Password <span className="text-[#DC143C]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    disabled={isLoading}
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] focus:ring-1 focus:ring-[#DC143C] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={isLoading}
                className="w-full mt-2 bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.99] text-white font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-[#DC143C]/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 text-center text-xs text-neutral-600">
        <p>© {new Date().getFullYear()} AnimeFlix Management Portal • Secure Direct Authentication</p>
      </footer>
    </div>
  );
};
