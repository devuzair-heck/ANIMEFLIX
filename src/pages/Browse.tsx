import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { DEMO_ANIME, GENRES_LIST } from '../utils/animeData';
import { AnimeCard } from '../components/AnimeCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { LoadingGrid } from '../components/Loading';
import { FilterDrawer } from '../components/FilterDrawer';

const YEARS = ['All', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', 'Older'];
const STATUS_OPTIONS = ['All', 'Ongoing', 'Completed'];
const TYPE_OPTIONS = ['All', 'TV', 'Movie', 'OVA'];
const RATING_OPTIONS = [
  { label: 'All Ratings', value: 'All' },
  { label: '8.0+ Rating', value: '8' },
  { label: '7.0+ Rating', value: '7' },
  { label: '6.0+ Rating', value: '6' },
];
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
  { label: 'A - Z', value: 'a-z' },
  { label: 'Z - A', value: 'z-a' },
];

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Read URL query params with defaults
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || 'All';
  const selectedStatus = searchParams.get('status') || 'All';
  const selectedType = searchParams.get('type') || 'All';
  const selectedYear = searchParams.get('year') || 'All';
  const selectedRating = searchParams.get('rating') || 'All';
  const selectedSort = searchParams.get('sort') || 'popularity';

  // Helper to update individual parameter while preserving others
  const updateParam = (key: string, value: string) => {
    setIsLoading(true);
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '' || (key === 'sort' && value === 'popularity')) {
      newParams.delete(key);
      if (key === 'search') newParams.delete('q');
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
    setTimeout(() => setIsLoading(false), 150);
  };

  const handleSearchChange = (q: string) => {
    updateParam('q', q);
  };

  const resetAllFilters = () => {
    setIsLoading(true);
    setSearchParams({});
    setTimeout(() => setIsLoading(false), 150);
  };

  // Check if any filter is active
  const isFiltered = Boolean(
    searchQuery ||
      selectedGenre !== 'All' ||
      selectedStatus !== 'All' ||
      selectedType !== 'All' ||
      selectedYear !== 'All' ||
      selectedRating !== 'All' ||
      selectedSort !== 'popularity'
  );

  // Combined Filtering Logic
  const filteredAnime = useMemo(() => {
    return DEMO_ANIME.filter((anime) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = anime.title.toLowerCase().includes(q) || anime.japaneseTitle.toLowerCase().includes(q);
        const matchesGenre = anime.genres.some((g) => g.toLowerCase().includes(q));
        const matchesDesc = anime.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesGenre && !matchesDesc) return false;
      }

      // 2. Genre Filter
      if (selectedGenre !== 'All') {
        const hasGenre = anime.genres.some(
          (g) => g.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      // 3. Status Filter
      if (selectedStatus !== 'All') {
        if (anime.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // 4. Type Filter
      if (selectedType !== 'All') {
        if (anime.type.toLowerCase() !== selectedType.toLowerCase()) return false;
      }

      // 5. Year Filter
      if (selectedYear !== 'All') {
        if (selectedYear === 'Older') {
          if (anime.year >= 2019) return false;
        } else {
          if (anime.year.toString() !== selectedYear) return false;
        }
      }

      // 6. Rating Filter
      if (selectedRating !== 'All') {
        const minRating = parseFloat(selectedRating);
        if (anime.rating < minRating) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (selectedSort === 'rating') {
        return b.rating - a.rating;
      }
      if (selectedSort === 'newest') {
        return b.year - a.year;
      }
      if (selectedSort === 'a-z') {
        return a.title.localeCompare(b.title);
      }
      if (selectedSort === 'z-a') {
        return b.title.localeCompare(a.title);
      }
      // Default: popularity
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating;
    });
  }, [searchQuery, selectedGenre, selectedStatus, selectedType, selectedYear, selectedRating, selectedSort]);

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Heading */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-[#DC143C] font-bold text-xs uppercase tracking-widest mb-1.5">
            <Filter className="w-4 h-4" />
            <span>Catalog Explorer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-10 bg-[#DC143C] hidden sm:block" />
            <span>Browse <span className="text-[#DC143C]">Anime</span></span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl">
            Filter our complete collection by genre, release status, format, release year, or rating.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search anime title, genre, studio, or keyword..."
            size="lg"
          />
        </div>

        {/* Filters Section Wrapper */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
          
          {/* Mobile Filter Toggle Button */}
          <div className="flex sm:hidden items-center justify-between pb-3 border-b border-white/10">
            <span className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#DC143C]" />
              Filter Catalog {isFiltered && <span className="text-[#DC143C]">(Active)</span>}
            </span>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#DC143C] hover:bg-[#b01030] text-white px-3.5 py-2 rounded-xl uppercase tracking-wider transition-colors shadow-md"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Drawer for Mobile */}
          <FilterDrawer
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            selectedGenre={selectedGenre}
            setSelectedGenre={(g) => updateParam('genre', g)}
            selectedStatus={selectedStatus}
            setSelectedStatus={(s) => updateParam('status', s)}
            selectedType={selectedType}
            setSelectedType={(t) => updateParam('type', t)}
            selectedYear={selectedYear}
            setSelectedYear={(y) => updateParam('year', y)}
            selectedRating={selectedRating}
            setSelectedRating={(r) => updateParam('rating', r)}
            selectedSort={selectedSort}
            setSelectedSort={(s) => updateParam('sort', s)}
            onApply={() => setMobileFiltersOpen(false)}
            onReset={resetAllFilters}
            isFiltered={isFiltered}
          />

          {/* Desktop Filters (Hidden on small mobile) */}
          <div className="hidden sm:block space-y-5">
            
            {/* Genre Filter Chips */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Genres
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['All', ...GENRES_LIST].map((genre) => {
                  const active = selectedGenre.toLowerCase() === genre.toLowerCase();
                  return (
                    <button
                      key={genre}
                      onClick={() => updateParam('genre', genre)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors ${
                        active
                          ? 'bg-[#DC143C] text-white shadow-md'
                          : 'bg-[#080808] hover:bg-white/10 text-neutral-300 border border-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdown Filters Row: Status, Type, Year, Rating, Sort */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-white/5">
              
              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => updateParam('status', e.target.value)}
                  className="w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#DC143C]"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st} className="bg-[#111111]">
                      {st === 'All' ? 'All Statuses' : st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Format
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => updateParam('type', e.target.value)}
                  className="w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#DC143C]"
                >
                  {TYPE_OPTIONS.map((tp) => (
                    <option key={tp} value={tp} className="bg-[#111111]">
                      {tp === 'All' ? 'All Formats' : tp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => updateParam('year', e.target.value)}
                  className="w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#DC143C]"
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#111111]">
                      {yr === 'All' ? 'All Years' : yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Minimum Rating
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => updateParam('rating', e.target.value)}
                  className="w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#DC143C]"
                >
                  {RATING_OPTIONS.map((rt) => (
                    <option key={rt.value} value={rt.value} className="bg-[#111111]">
                      {rt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Sort Order
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="w-full bg-[#080808] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#DC143C]"
                >
                  {SORT_OPTIONS.map((so) => (
                    <option key={so.value} value={so.value} className="bg-[#111111]">
                      {so.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>

          {/* Results Summary Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white bg-[#DC143C]/20 border border-[#DC143C]/40 px-2.5 py-1 rounded-md text-[#DC143C]">
                {filteredAnime.length} {filteredAnime.length === 1 ? 'anime' : 'anime'} found
              </span>
              {searchQuery && (
                <span className="text-neutral-400 italic">
                  for "{searchQuery}"
                </span>
              )}
            </div>

            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 text-[#DC143C] hover:text-[#b01030] font-bold uppercase tracking-wider transition-colors ml-auto sm:ml-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            )}
          </div>

        </div>

        {/* Anime Cards Grid */}
        {isLoading ? (
          <LoadingGrid count={10} />
        ) : filteredAnime.length === 0 ? (
          <EmptyState
            title="No Anime Matched"
            message="No anime in our catalog matched all of your filter parameters. Try clearing some criteria."
            onClear={resetAllFilters}
            clearLabel="Reset All Filters"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
