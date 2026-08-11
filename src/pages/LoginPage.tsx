import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md bg-[#171717] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-crimson flex items-center justify-center shadow-lg shadow-red-900/50">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <span className="text-2xl font-black text-white">
              ANIME<span className="text-red-600">FLIX</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in to access your custom watchlist & streaming history
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-600"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-red-600"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-neutral-900 border-white/10 text-red-600 focus:ring-0" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="hover:text-red-500 transition-colors">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-red-900/40 uppercase tracking-wider"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-500 font-bold hover:underline">
            Register now
          </Link>
        </p>

        {/* Phase 1 Notice */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-neutral-500">
          <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Phase 1 Frontend Preview: Form submit navigates to Profile.</span>
        </div>

      </div>
    </div>
  );
};
