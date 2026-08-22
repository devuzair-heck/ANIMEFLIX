import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Play,
  LayoutDashboard,
  Film,
  PlusCircle,
  ListVideo,
  Video,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clapperboard,
} from 'lucide-react';
import { adminAuthService, AdminUser } from '../../services/adminAuthService';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAdmin() {
      const res = await adminAuthService.getMe();
      if (isMounted && res.success && res.admin) {
        setAdmin(res.admin);
      }
    }
    loadAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Anime Management', path: '/admin/anime', icon: Film },
    { label: 'Add Anime', path: '/admin/anime/add', icon: PlusCircle },
    { label: 'Episodes', path: '/admin/episodes', icon: ListVideo },
    { label: 'Videos & Streams', path: '/admin/videos', icon: Video },
    { label: 'Genres & Tags', path: '/admin/genres', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#DC143C] selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#101010]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DC143C] to-[#800020] flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
          <span className="text-base font-black italic tracking-tight">
            ANIME<span className="text-[#DC143C]">FLIX</span> <span className="text-[10px] text-neutral-400 font-normal ml-1">ADMIN</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5"
            title="View Public Site"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#101010] border-r border-white/10 shrink-0 select-none">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DC143C] to-[#800020] flex items-center justify-center shadow-lg shadow-[#DC143C]/20">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black italic tracking-tighter leading-none">
                  ANIME<span className="text-[#DC143C]">FLIX</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400 mt-0.5">
                  Management
                </span>
              </div>
            </Link>
          </div>

          {/* User Badge */}
          <div className="px-5 py-4 border-b border-white/5 bg-neutral-900/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#DC143C]/20 border border-[#DC143C]/40 flex items-center justify-center text-[#DC143C]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white truncate">
                  {admin?.username || 'AnimiAFLIXZ'}
                </span>
                <span className="text-[10px] text-[#DC143C] uppercase tracking-wider font-semibold">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              Core Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#DC143C] text-white shadow-lg shadow-[#DC143C]/25'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}

            <div className="pt-6 px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              System
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clapperboard className="w-4 h-4 shrink-0" />
                <span>View Public Site</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </Link>
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-white/10">
            <button
              type="button"
              id="admin-sidebar-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout Session</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
            <div className="w-4/5 max-w-xs bg-[#101010] h-full flex flex-col p-4 border-r border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </div>
                  <span className="font-black italic text-sm">ANIMEFLIX ADMIN</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-[#DC143C] text-white'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowSettingsModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </button>

                <Link
                  to="/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>View Public Website</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#080808] overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#DC143C]" />
                <span>Admin Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-neutral-300">
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-neutral-500 block mb-1">Authenticated Account</span>
                <span className="font-bold text-white">{admin?.username || 'AnimiAFLIXZ'}</span>
              </div>
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-neutral-500 block mb-1">Authentication Mode</span>
                <span className="font-bold text-emerald-400">Direct Secure Backend Authentication</span>
              </div>
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-white/5">
                <span className="text-neutral-500 block mb-1">System Health</span>
                <span className="font-bold text-emerald-400">Operational • Database Connected</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="bg-[#DC143C] hover:bg-[#b01030] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
