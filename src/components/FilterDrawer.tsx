import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { GENRES_LIST } from '../utils/animeData';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  onApply: () => void;
  onReset: () => void;
  isFiltered: boolean;
}

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
  { label: 'Newest Release', value: 'newest' },
  { label: 'Alphabetical (A - Z)', value: 'a-z' },
  { label: 'Reverse (Z - A)', value: 'z-a' },
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedGenre,
  setSelectedGenre,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
  selectedYear,
  setSelectedYear,
  selectedRating,
  setSelectedRating,
  selectedSort,
  setSelectedSort,
  onApply,
  onReset,
  isFiltered,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-md bg-[#0d0d0d] border-l border-white/10 h-full flex flex-col justify-between p-5 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#DC143C]" />
              <h3 className="text-lg font-black uppercase text-white tracking-tight">
                Filter Anime
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close Filter Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Genre Select */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Genre Category
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#141414] rounded-xl border border-white/5">
                {['All', ...GENRES_LIST].map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase transition-all ${
                      selectedGenre.toLowerCase() === genre.toLowerCase()
                        ? 'bg-[#DC143C] text-white shadow-md'
                        : 'bg-[#1a1a1a] text-neutral-300 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Release Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#DC143C]"
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
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Media Format
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#DC143C]"
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
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Release Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#DC143C]"
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
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Score / Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#DC143C]"
              >
                {RATING_OPTIONS.map((rt) => (
                  <option key={rt.value} value={rt.value} className="bg-[#111111]">
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Sort Order
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#DC143C]"
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

        {/* Footer Actions */}
        <div className="pt-6 border-t border-white/10 mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>

          {isFiltered && (
            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
