import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search, Film } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080808] text-white pt-28 pb-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-[#111111] border border-white/10 rounded-2xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#DC143C]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-2xl bg-[#DC143C]/20 border border-[#DC143C]/40 flex items-center justify-center text-[#DC143C] mx-auto mb-6 shadow-xl">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <span className="text-[#DC143C] text-xs font-black uppercase tracking-widest bg-[#DC143C]/10 px-3 py-1 rounded-full border border-[#DC143C]/20">
          Error 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-4 mb-2">
          Page Not Found
        </h1>

        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been relocated. Explore our collection or search for your favorite anime title below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#DC143C] hover:bg-[#b01030] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-red-950/40"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/browse"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl border border-white/10 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Browse Anime</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
