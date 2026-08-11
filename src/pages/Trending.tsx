import React from 'react';
import { Flame } from 'lucide-react';
import { DEMO_ANIME } from '../utils/animeData';
import { AnimeCard } from '../components/AnimeCard';

export const Trending: React.FC = () => {
  const trendingList = DEMO_ANIME.filter((a) => a.isTrending);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-[#DC143C] font-bold text-xs uppercase tracking-widest mb-2">
          <Flame className="w-4 h-4 fill-[#DC143C]" />
          <span>Hot Right Now</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[#DC143C] hidden sm:block" />
          <span>Trending <span className="text-[#DC143C]">Leaderboard</span></span>
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl">
          The most watched and talked-about anime episodes this week based on community activity.
        </p>
      </div>

      {/* Grid with Ranking Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {trendingList.map((anime, index) => (
          <AnimeCard key={anime.id} anime={anime} rank={index + 1} />
        ))}
      </div>

    </div>
  );
};
