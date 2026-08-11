import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, User, Menu, X, Play, Flame, Compass } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse', path: '/browse' },
    { name: 'Genres', path: '/genres' },
    { name: 'Trending', path: '/trending' },
    { name: 'Popular', path: '/popular' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav border-b border-white/10 shadow-lg py-3'
          : 'bg-gradient-to-b from-[#080808]/90 via-[#080808]/50 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tighter text-[#DC143C]">
              ANIMEFLIX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? 'text-white font-bold border-b-2 border-[#DC143C] pb-0.5'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Expandable Search Input / Button */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search anime, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-56 lg:w-64 bg-[#171717] border border-red-600/50 text-white text-sm rounded-full pl-9 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Search Anime"
                  aria-label="Search anime"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Watchlist Icon with badge */}
            <Link
              to="/watchlist"
              className="relative p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Watchlist"
              aria-label="Watchlist"
            >
              <Bookmark className="w-5 h-5" />
              {watchlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#DC143C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </Link>

            {/* Profile / Login */}
            <Link
              to="/profile"
              className="w-8 h-8 rounded bg-[#DC143C] hover:bg-[#b01030] flex items-center justify-center text-xs font-bold text-white transition-colors shadow"
              title="User Profile"
            >
              A
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => navigate('/search')}
              className="p-2 text-neutral-300 hover:text-white rounded-full"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/watchlist"
              className="relative p-2 text-neutral-300 hover:text-white rounded-full"
              aria-label="Watchlist"
            >
              <Bookmark className="w-5 h-5" />
              {watchlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white rounded-xl bg-[#171717] border border-white/10 ml-1 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer & Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Semi-transparent backdrop */}
          <div
            className="fixed inset-0 top-[60px] bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-50 md:hidden bg-[#0d0d0d] border-b border-white/10 px-4 pt-4 pb-6 shadow-2xl animate-in slide-in-from-top duration-300 max-h-[calc(100vh-70px)] overflow-y-auto">
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search anime title, genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#171717] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#DC143C]"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-xl text-base font-bold flex items-center justify-between transition-all ${
                      active
                        ? 'bg-[#DC143C] text-white shadow-lg'
                        : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-xs opacity-60">→</span>
                  </Link>
                );
              })}
              <Link
                to="/watchlist"
                className={`px-4 py-3 rounded-xl text-base font-bold flex items-center justify-between transition-all ${
                  isActive('/watchlist')
                    ? 'bg-[#DC143C] text-white shadow-lg'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>My Watchlist</span>
                {watchlist.length > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {watchlist.length}
                  </span>
                )}
              </Link>
            </nav>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-bold text-white bg-[#DC143C] hover:bg-[#b01030] px-4 py-3 rounded-xl w-full justify-center shadow-lg transition-colors uppercase tracking-wider"
              >
                <User className="w-4 h-4" />
                <span>Account & Profile</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
