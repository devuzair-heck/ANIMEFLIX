import React from 'react';
import { Trophy } from 'lucide-react';
import { DEMO_ANIME } from '../utils/animeData';
import { AnimeCard } from '../components/AnimeCard';

export const Popular: React.FC = () => {
  // Sort by popularity index / ratings
  const popularAnime = [...DEMO_ANIME]
    .sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.rating - a.rating;
    });

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-yellow-400 font-bold text-xs uppercase tracking-widest mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>All-Time Fan Favorites</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-10 bg-[#DC143C] hidden sm:block" />
            <span>Most Popular <span className="text-[#DC143C]">Anime</span></span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
            Top-ranked anime series praised for high production quality, captivating plots, and outstanding user ratings.
          </p>
        </div>

        {/* Anime Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {popularAnime.map((anime, idx) => (
            <AnimeCard key={anime.id} anime={anime} rank={idx + 1} />
          ))}
        </div>

      </div>
    </div>
  );
};
