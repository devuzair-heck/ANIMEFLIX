import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Flame, X } from 'lucide-react';
import { DEMO_ANIME, GENRES_LIST } from '../utils/animeData';
import { AnimeCard } from '../components/AnimeCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const results = DEMO_ANIME.filter((anime) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      anime.title.toLowerCase().includes(q) ||
      anime.japaneseTitle.toLowerCase().includes(q) ||
      anime.genres.some((g) => g.toLowerCase().includes(q)) ||
      anime.studio.toLowerCase().includes(q)
    );
  });

  const popularKeywords = ['Attack on Titan', 'Demon Slayer', 'Solo Leveling', 'Jujutsu Kaisen', 'One Piece'];

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Search Input Hero Header */}
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-6">
          Search <span className="text-red-600">ANIMEFLIX</span>
        </h1>

        <div className="relative">
          <input
            type="text"
            placeholder="Type anime title, character, studio or genre..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoFocus
            className="w-full bg-[#171717] border border-white/10 text-white text-base rounded-2xl pl-12 pr-10 py-4 focus:outline-none focus:border-red-600 shadow-2xl transition-all"
          />
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Popular Keyword Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-neutral-500 font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" /> Popular:
          </span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => handleQueryChange(kw)}
              className="bg-[#171717] hover:bg-red-600/20 text-neutral-300 hover:text-white border border-white/10 px-3 py-1 rounded-full font-medium transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">
          {query ? `Search Results for "${query}"` : 'All Anime'}
        </h2>
        <span className="text-sm text-neutral-400 font-semibold">
          {results.length} Matches
        </span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
          <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Results Found</h3>
          <p className="text-sm text-neutral-400">
            Try checking for typos or searching with different keywords like genre or format.
          </p>
        </div>
      )}

    </div>
  );
};
