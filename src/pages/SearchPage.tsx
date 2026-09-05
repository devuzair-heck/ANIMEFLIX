import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, RotateCcw, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { animeService } from '../services/animeService';
import { Anime } from '../types/anime';
import { SearchBar } from '../components/SearchBar';
import { AnimeCard } from '../components/AnimeCard';
import { EmptyState } from '../components/EmptyState';

const SEARCH_CHIPS = [
  'Solo Leveling',
  'Demon Slayer',
  'Jujutsu Kaisen',
  'Attack on Titan',
  'Action',
  'Fantasy',
  'Romance',
  'Movie',
  'ufotable',
  'MAPPA'
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await animeService.getAllAnime();
      setAnimeList(data);
    } catch (err: any) {
      console.error('[SearchPage Error] Failed to load anime catalog:', err);
      setError('Unable to load anime catalog from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQueryChange = (newQuery: string) => {
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleChipClick = (chip: string) => {
    setSearchParams({ q: chip });
  };

  const handleClear = () => {
    setSearchParams({});
  };

  // Filter search results
  const results = useMemo(() => {
    if (!query.trim()) return animeList;

    const q = query.toLowerCase().trim();
    return animeList.filter((anime) => {
      const titleMatch = anime.title?.toLowerCase().includes(q) || anime.japaneseTitle?.toLowerCase().includes(q);
      const genreMatch = anime.genres?.some((g) => g.toLowerCase().includes(q));
      const descMatch = anime.description?.toLowerCase().includes(q);
      const studioMatch = anime.studio?.toLowerCase().includes(q);
      const typeMatch = anime.type?.toLowerCase().includes(q);
      return Boolean(titleMatch || genreMatch || descMatch || studioMatch || typeMatch);
    });
  }, [animeList, query]);

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-[#DC143C] font-bold text-xs uppercase tracking-widest mb-2 bg-[#DC143C]/10 border border-[#DC143C]/20 px-3 py-1 rounded-full">
            <SearchIcon className="w-3.5 h-3.5" />
            <span>Instant Search</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight">
            Search <span className="text-[#DC143C]">Anime</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Search our library by title, genre, studio, or storyline description.
          </p>
        </div>

        {/* Large Search Input */}
        <div className="max-w-3xl mx-auto mb-6">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for anime e.g. Naruto, Solo Leveling, Action..."
            size="lg"
            autoFocus
          />
        </div>

        {/* Popular Keyword Chips */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10 max-w-3xl mx-auto">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider mr-1">
            Trending Searches:
          </span>
          {SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                query.toLowerCase() === chip.toLowerCase()
                  ? 'bg-[#DC143C] text-white border-[#DC143C]'
                  : 'bg-[#111111] text-neutral-300 hover:text-white border-white/10 hover:border-[#DC143C]/50'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Search Results Summary Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
              {query ? `Search Results (${results.length})` : `All Anime Catalog (${results.length})`}
            </h2>
            {query && (
              <span className="text-xs text-neutral-400 italic">for "{query}"</span>
            )}
          </div>

          {query && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-bold text-[#DC143C] hover:text-[#b01030] uppercase tracking-wider transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Search
            </button>
          )}
        </div>

        {/* Results Grid / Empty State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Searching database catalog...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-950/40 border border-red-500/30 text-center flex flex-col items-center max-w-md mx-auto my-8">
            <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Catalog Connection Error</h3>
            <p className="text-xs text-neutral-400 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DC143C] hover:bg-[#b01030] text-white text-xs font-bold uppercase transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title="No Anime Found"
            message={`We couldn't find any anime matching "${query}". Try searching for another title, genre, or keyword.`}
            onClear={handleClear}
            clearLabel="Clear Search"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
