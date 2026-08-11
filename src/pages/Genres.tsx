import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, Sparkles } from 'lucide-react';
import { DEMO_ANIME, GENRES_LIST } from '../utils/animeData';
import { AnimeCard } from '../components/AnimeCard';

export const Genres: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreFromUrl = searchParams.get('genre') || 'Action';

  const [activeGenre, setActiveGenre] = useState(genreFromUrl);

  useEffect(() => {
    setActiveGenre(searchParams.get('genre') || 'Action');
  }, [searchParams]);

  const handleSelectGenre = (genre: string) => {
    setActiveGenre(genre);
    setSearchParams({ genre });
  };

  const animeInGenre = DEMO_ANIME.filter((a) =>
    a.genres.includes(activeGenre)
  );

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-red-500 font-bold text-xs uppercase tracking-widest mb-2">
          <Grid className="w-4 h-4" />
          <span>Category Explorer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Anime <span className="text-red-600">Genres</span>
        </h1>
        <p className="text-neutral-400 text-sm mt-2 max-w-2xl">
          Filter anime series by their thematic genres. Select any category below to view top-rated titles.
        </p>
      </div>

      {/* Genre Pills Slider / Grid */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-10 pb-4 border-b border-white/10">
        {GENRES_LIST.map((genre) => {
          const count = DEMO_ANIME.filter((a) => a.genres.includes(genre)).length;
          const isActive = genre === activeGenre;

          return (
            <button
              key={genre}
              onClick={() => handleSelectGenre(genre)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 scale-105'
                  : 'bg-[#171717] hover:bg-neutral-800 text-neutral-300 border border-white/5'
              }`}
            >
              <span>{genre}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isActive ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Genre Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span>{activeGenre} Anime</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        <span className="text-sm font-semibold text-neutral-400">
          {animeInGenre.length} Titles
        </span>
      </div>

      {/* Anime Grid */}
      {animeInGenre.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {animeInGenre.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
          <p className="text-neutral-400 text-sm">
            No titles available under {activeGenre} yet. Select another genre above!
          </p>
        </div>
      )}

    </div>
  );
};
