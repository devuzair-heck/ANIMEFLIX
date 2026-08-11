import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { DEMO_ANIME, GENRES_LIST } from '../utils/animeData';
import { AnimeCard } from '../components/AnimeCard';

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialGenre = searchParams.get('genre') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'latest' | 'title'>('popularity');

  const filteredAnime = useMemo(() => {
    return DEMO_ANIME.filter((anime) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = anime.title.toLowerCase().includes(q);
        const jpMatch = anime.japaneseTitle.toLowerCase().includes(q);
        const studioMatch = anime.studio.toLowerCase().includes(q);
        const genreMatch = anime.genres.some((g) => g.toLowerCase().includes(q));
        if (!titleMatch && !jpMatch && !studioMatch && !genreMatch) return false;
      }

      // Genre
      if (selectedGenre !== 'All' && !anime.genres.includes(selectedGenre)) {
        return false;
      }

      // Type
      if (selectedType !== 'All' && anime.type !== selectedType) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All' && anime.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'latest') return b.year - a.year;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [searchQuery, selectedGenre, selectedType, selectedStatus, sortBy]);

  const resetFilters = () => {
    setSelectedGenre('All');
    setSearchQuery('');
    setSelectedType('All');
    setSelectedStatus('All');
    setSortBy('popularity');
    setSearchParams({});
  };

  const isFiltered = selectedGenre !== 'All' || searchQuery !== '' || selectedType !== 'All' || selectedStatus !== 'All';

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-10 bg-[#DC143C] hidden sm:block" />
          <span>Browse <span className="text-[#DC143C]">Anime Library</span></span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Explore our complete catalog of subbed and dubbed anime series and movies.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#171717] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, studio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-600"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Genre Dropdown */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-600"
            >
              <option value="All">All Genres</option>
              {GENRES_LIST.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-600"
            >
              <option value="All">All Formats (TV / Movie)</option>
              <option value="TV">TV Series</option>
              <option value="Movie">Movie</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-600"
            >
              <option value="All">All Status (Ongoing / Completed)</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

        </div>

        {/* Bottom Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <SlidersHorizontal className="w-4 h-4 text-[#DC143C]" />
            <span className="uppercase font-bold tracking-wider">Sort By:</span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'popularity', label: 'Popularity' },
                { id: 'rating', label: 'Rating' },
                { id: 'latest', label: 'Year' },
                { id: 'title', label: 'A-Z' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSortBy(item.id as any)}
                  className={`px-3 py-1 rounded-sm text-xs font-bold uppercase transition-colors ${
                    sortBy === item.id
                      ? 'bg-[#DC143C] text-white'
                      : 'bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-300 border border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-[#DC143C] hover:text-[#b01030] font-bold uppercase tracking-wider transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-neutral-400">
          Showing <span className="text-white font-bold">{filteredAnime.length}</span> anime titles
        </p>
      </div>

      {/* Anime Grid */}
      {filteredAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
          <Filter className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Anime Found</h3>
          <p className="text-sm text-neutral-400 mb-6">
            We couldn't find any anime matching your filter criteria. Try clearing search filters.
          </p>
          <button
            onClick={resetFilters}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
};
