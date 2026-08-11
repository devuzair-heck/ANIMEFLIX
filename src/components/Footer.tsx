import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, Github, Twitter, Disc as Discord, Youtube, Instagram } from 'lucide-react';
import { GENRES_LIST } from '../utils/animeData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 mt-20 pt-14 pb-8 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-[#DC143C]">
                ANIMEFLIX
              </span>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              ANIMEFLIX is your ultimate destination for high-definition anime streaming. Discover trending series, iconic classics, and the newest releases with editorial dark mode aesthetics.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-[#171717] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="Discord"
              >
                <Discord className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-[#171717] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-[#171717] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-[#171717] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase">Navigation</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-red-500 transition-colors">Browse Anime</Link>
              </li>
              <li>
                <Link to="/genres" className="hover:text-red-500 transition-colors">Genres</Link>
              </li>
              <li>
                <Link to="/trending" className="hover:text-red-500 transition-colors">Trending</Link>
              </li>
              <li>
                <Link to="/popular" className="hover:text-red-500 transition-colors">Popular</Link>
              </li>
            </ul>
          </div>

          {/* Top Genres */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase">Top Genres</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {GENRES_LIST.slice(0, 6).map((genre) => (
                <li key={genre}>
                  <Link
                    to={`/genres?genre=${encodeURIComponent(genre)}`}
                    className="hover:text-red-500 transition-colors"
                  >
                    {genre} Anime
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Account & Support */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-sm tracking-wider uppercase">Account</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link to="/watchlist" className="hover:text-red-500 transition-colors">My Watchlist</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-red-500 transition-colors">Profile & Settings</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-red-500 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-red-500 transition-colors">Create Account</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 gap-4 uppercase tracking-wider">
          <div className="flex items-center space-x-6">
            <span>© {new Date().getFullYear()} ANIMEFLIX INC.</span>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
          <div className="flex items-center space-x-4">
            <span>Region: United States</span>
            <div className="flex space-x-1.5">
              <div className="w-3.5 h-3.5 bg-white/10 rounded-full" />
              <div className="w-3.5 h-3.5 bg-white/10 rounded-full" />
              <div className="w-3.5 h-3.5 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
