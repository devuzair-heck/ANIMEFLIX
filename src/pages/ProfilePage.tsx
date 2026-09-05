import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Tv, Clock, Heart, Award, Settings, ShieldCheck, Play, ArrowUpRight } from 'lucide-react';
import { animeService } from '../services/animeService';
import { Anime } from '../types/anime';
import { useWatchlist } from '../context/WatchlistContext';

export const ProfilePage: React.FC = () => {
  const { watchlist } = useWatchlist();
  const [animeList, setAnimeList] = useState<Anime[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await animeService.getAllAnime();
        if (isMounted) setAnimeList(data);
      } catch {
        // Handled
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const watchHistory = animeList.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Profile Card Header */}
      <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-red-600 to-crimson p-1 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop"
                alt="Profile Avatar"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
              <Award className="w-3 h-3" /> VIP
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Alex Mercer</h1>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">@otaku_alex • Member since Jan 2024</p>
              </div>

              <div className="flex gap-2 justify-center sm:justify-start">
                <Link
                  to="/login"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Account Login
                </Link>
              </div>
            </div>

            <p className="text-xs text-neutral-300 max-w-lg mt-2">
              Avid anime enthusiast watching Shounen, Dark Fantasy, and Psychological thrillers.
            </p>
          </div>

        </div>

      </div>

      {/* User Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-600/20 text-red-500">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">142</span>
            <p className="text-xs text-neutral-400 font-medium">Episodes Watched</p>
          </div>
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">56h</span>
            <p className="text-xs text-neutral-400 font-medium">Watch Time</p>
          </div>
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{watchlist.length}</span>
            <p className="text-xs text-neutral-400 font-medium">Saved Anime</p>
          </div>
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">Action</span>
            <p className="text-xs text-neutral-400 font-medium">Top Favorite Genre</p>
          </div>
        </div>

      </div>

      {/* Continue Watching Section */}
      <div className="mb-8">
        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          <span>Recently Watched</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {watchHistory.map((anime) => (
            <div
              key={anime.id}
              className="bg-[#171717] border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-red-600/50 transition-colors"
            >
              <img src={anime.poster} alt={anime.title} className="w-16 h-20 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{anime.title}</h4>
                <p className="text-xs text-neutral-400 mt-1">Ep 4 of {anime.episodesCount}</p>

                {/* Progress bar */}
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-red-600 h-full w-2/3" />
                </div>
              </div>

              <Link
                to={`/watch/${anime.id}/ep-1`}
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl flex-shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 1 Backend Notice */}
      <div className="bg-gradient-to-r from-red-950/30 to-[#171717] border border-red-600/30 rounded-2xl p-6 text-sm text-neutral-300">
        <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
          <Settings className="w-4 h-4" />
          <span>Phase 1 Frontend Foundation Active</span>
        </div>
        <p className="text-xs text-neutral-400">
          Full user authentication, persistent cloud sync, custom avatars, and watchlist database storage will be connected in Phase 2 backend integration.
        </p>
      </div>

    </div>
  );
};
