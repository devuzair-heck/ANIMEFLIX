import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, KeyRound, Server } from 'lucide-react';
import { adminAuthService } from '../../services/adminAuthService';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (isSubmitting) return;

    setErrorMessage(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Specific client-side validation messages
    if (!trimmedUsername && !trimmedPassword) {
      setErrorMessage('Please enter your username and password.');
      return;
    }

    if (!trimmedUsername) {
      setErrorMessage('Please enter your username.');
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await adminAuthService.login(trimmedUsername, trimmedPassword);

      if (result.success) {
        navigate('/admin/verify', {
          state: { challengeId: result.challengeId },
        });
      } else {
        setErrorMessage(result.error || 'Invalid username or password.');
      }
    } catch {
      setErrorMessage('Authentication failed. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between relative overflow-hidden selection:bg-[#DC143C] selection:text-white">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#DC143C]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#DC143C] flex items-center justify-center shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
            ANIME<span className="text-[#DC143C]">FLIX</span>
            <span className="text-xs font-bold text-neutral-400 not-italic uppercase ml-2 tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded">
              ADMIN
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to AnimeFlix</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 my-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Desktop Left Side: Branding / Visual Panel */}
          <div className="lg:col-span-6 xl:col-span-7 hidden lg:flex flex-col justify-center pr-6">
            <div className="inline-flex items-center gap-2 bg-[#DC143C]/10 border border-[#DC143C]/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#DC143C] uppercase tracking-widest w-fit mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Administrative Control Center</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white uppercase tracking-tight italic leading-tight mb-4">
              MANAGEMENT PORTAL & <span className="text-[#DC143C]">SYSTEM SURVEILLANCE</span>
            </h1>

            <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-xl">
              Secure administration area for managing the AnimeFlix platform. Authenticate with your administrator credentials to access real-time telemetry, manage anime catalog metadata, review user watchlists, and oversee system performance.
            </p>

            {/* Feature Security Pills */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                <KeyRound className="w-5 h-5 text-[#DC143C]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">2FA Protection</span>
                <span className="text-[10px] text-neutral-400">OTP Code Verification</span>
              </div>

              <div className="bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                <Server className="w-5 h-5 text-[#DC143C]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">API Gateway</span>
                <span className="text-[10px] text-neutral-400">Encrypted JWT Session</span>
              </div>

              <div className="bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                <ShieldCheck className="w-5 h-5 text-[#DC143C]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">Rate Limited</span>
                <span className="text-[10px] text-neutral-400">Brute Force Guard</span>
              </div>
            </div>
          </div>

          {/* Right Side (Stacked on Mobile): Admin Login Form Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-[#111111]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DC143C]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Title Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight italic">
                    Admin Sign In
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase bg-[#DC143C]/20 text-[#DC143C] border border-[#DC143C]/40 px-2 py-0.5 rounded">
                    RESTRICTED
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Enter your admin credentials to access the management portal.
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-6 bg-red-950/60 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Username Field */}
                <div>
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2"
                  >
                    Username <span className="text-[#DC143C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="admin-username"
                      type="text"
                      name="username"
                      autoComplete="username"
                      required
                      disabled={isSubmitting}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter administrator username"
                      className="w-full bg-[#171717] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] transition-colors disabled:opacity-50"
                      aria-label="Admin Username"
                    />
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2"
                  >
                    Password <span className="text-[#DC143C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      disabled={isSubmitting}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#171717] border border-white/10 rounded-xl pl-10 pr-12 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] transition-colors disabled:opacity-50"
                      aria-label="Admin Password"
                    />
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Bottom Back Button & Info */}
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
                <Link
                  to="/"
                  className="text-xs text-neutral-400 hover:text-white font-bold transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to AnimeFlix Main Site</span>
                </Link>

                <p className="text-[11px] text-neutral-500 text-center">
                  Protected portal. Unauthorized access attempts are monitored and logged.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 border-t border-white/5 text-center text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} ANIMEFLIX ADMIN PORTAL • ALL RIGHTS RESERVED</p>
      </footer>

    </div>
  );
};
