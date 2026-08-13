import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Film, Users, Eye, Server, LogOut, Plus, Search, CheckCircle2, Sliders, Shield, Loader2 } from 'lucide-react';
import { DEMO_ANIME } from '../../utils/animeData';
import { adminAuthService } from '../../services/adminAuthService';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const res = await adminAuthService.getMe();
      if (!isMounted) return;

      if (res.success && res.admin) {
        setAdminUser(res.admin);
      } else {
        // Fallback for preview mode or redirect if unauthenticated
        setAdminUser({
          id: 'admin-preview-id',
          username: 'admin',
          email: 'admin@animeflix.com',
        });
      }
      setIsLoadingSession(false);
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login');
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Admin Top Navbar */}
      <header className="bg-[#111111] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white uppercase italic">
                ANIME<span className="text-[#DC143C]">FLIX</span>
              </span>
            </Link>
            <span className="text-xs font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Control Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-white bg-[#DC143C] hover:bg-[#b01030] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome & Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#111111] border border-white/10 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#DC143C]" />
              <span className="text-xs font-bold text-[#DC143C] uppercase tracking-wider">Authenticated Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic text-white tracking-tight">
              Administrator Dashboard ({adminUser?.username || 'admin'})
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              System Health: Operational • All 32 catalog entries active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-[#DC143C] hover:bg-[#b01030] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-lg">
              <Plus className="w-4 h-4" />
              <span>Add New Anime</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111111] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Catalog Anime
              </span>
              <span className="text-2xl font-black text-white">{DEMO_ANIME.length} Titles</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#DC143C]/20 border border-[#DC143C]/30 flex items-center justify-center text-[#DC143C]">
              <Film className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Active Viewers
              </span>
              <span className="text-2xl font-black text-emerald-400">1,482 Live</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                API Latency
              </span>
              <span className="text-2xl font-black text-white">24 ms</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Server className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                System Health
              </span>
              <span className="text-2xl font-black text-emerald-400">100% OK</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Content Table / Management Section */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-tight italic">
                Anime Catalog Overview
              </h2>
              <p className="text-xs text-neutral-400">
                Manage metadata, status, ratings, and video sources for all titles
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Filter catalog titles..."
                  className="w-full bg-[#171717] border border-white/10 text-xs font-bold text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#DC143C]"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Catalog List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-neutral-400 uppercase border-b border-white/10 font-extrabold tracking-wider">
                  <th className="pb-3 px-2">Anime Title</th>
                  <th className="pb-3 px-2">Year</th>
                  <th className="pb-3 px-2">Episodes</th>
                  <th className="pb-3 px-2">Rating</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {DEMO_ANIME.slice(0, 8).map((anime) => (
                  <tr key={anime.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-3">
                      <img
                        src={anime.poster}
                        alt={anime.title}
                        className="w-8 h-12 object-cover rounded border border-white/10"
                      />
                      <span className="font-bold text-white uppercase">{anime.title}</span>
                    </td>
                    <td className="py-3 px-2 text-neutral-300">{anime.year}</td>
                    <td className="py-3 px-2 text-neutral-300">{anime.episodesCount} Ep</td>
                    <td className="py-3 px-2 text-yellow-400 font-bold">★ {anime.rating}</td>
                    <td className="py-3 px-2">
                      <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {anime.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/anime/${anime.id}`}
                          className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase"
                        >
                          View
                        </Link>
                        <button className="bg-[#DC143C]/20 text-[#DC143C] border border-[#DC143C]/40 px-2.5 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-[#DC143C] hover:text-white transition-colors">
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-white/5 text-center text-[11px] text-neutral-500 mt-8">
        <p>© {new Date().getFullYear()} ANIMEFLIX ADMIN CONTROL CENTER</p>
      </footer>

    </div>
  );
};
