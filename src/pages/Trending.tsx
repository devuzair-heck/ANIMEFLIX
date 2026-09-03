import React, { useState, useEffect } from 'react';
import { Flame, Trophy, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { animeService } from '../services/animeService';
import { Anime } from '../types/anime';
import { AnimeCard } from '../components/AnimeCard';

export const Trending: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrendingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await animeService.getAllAnime();
      setAnimeList(data);
    } catch (err: any) {
      console.error('[Trending Error] Failed to load anime:', err);
      setError('Failed to load trending anime from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-[#DC143C] animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-neutral-400">
          Loading leaderboard from database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase italic mb-2">Unable to Load Leaderboard</h2>
        <p className="text-sm text-neutral-400 max-w-md mb-6">{error}</p>
        <button
          type="button"
          onClick={loadTrendingData}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DC143C] hover:bg-[#b01030] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // Sort anime by trending / rating
  const trendingAnime = [...animeList].sort((a, b) => {
    if (a.isTrending && !b.isTrending) return -1;
    if (!a.isTrending && b.isTrending) return 1;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[#DC143C] font-bold text-xs uppercase tracking-widest mb-2">
            <Flame className="w-4 h-4 fill-[#DC143C]" />
            <span>Weekly Leaderboard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-10 bg-[#DC143C] hidden sm:block" />
            <span>
              Trending <span className="text-[#DC143C]">Anime</span>
            </span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
            Ranked #1 to #{trendingAnime.length} based on global view counts, episode releases, and community ratings.
          </p>
        </div>

        {/* Top 3 Featured Podiums banner */}
        {trendingAnime.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {trendingAnime.slice(0, 3).map((anime, idx) => {
              const ranks = [
                { label: 'RANK #1', color: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black', badge: 'GOLD' },
                { label: 'RANK #2', color: 'bg-gradient-to-r from-slate-300 to-slate-100 text-black', badge: 'SILVER' },
                { label: 'RANK #3', color: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white', badge: 'BRONZE' },
              ][idx];

              return (
                <div
                  key={anime.id}
                  className="relative bg-[#111111] border border-white/10 rounded-2xl p-4 flex gap-4 overflow-hidden shadow-2xl hover:border-[#DC143C] transition-colors"
                >
                  <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10">
                    <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded shadow ${ranks.color}`}>
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded mb-1.5 uppercase ${ranks.color}`}>
                        <Trophy className="w-3 h-3 inline mr-1" />
                        {ranks.badge} LEADER
                      </span>
                      <h3 className="text-base font-bold text-white truncate uppercase">{anime.title}</h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{anime.description}</p>
                    </div>
                    <div className="text-[11px] text-yellow-400 font-bold mt-2">
                      ★ {anime.rating} / 10 • {anime.episodesCount} Episodes
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Ranked Leaderboard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {trendingAnime.map((anime, index) => (
            <AnimeCard key={anime.id} anime={anime} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};
