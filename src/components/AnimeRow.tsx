import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeRowProps {
  title: string;
  icon?: React.ReactNode;
  animeList: Anime[];
  viewAllLink?: string;
  showRank?: boolean;
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  icon,
  animeList,
  viewAllLink,
  showRank = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!animeList || animeList.length === 0) return null;

  return (
    <div className="relative my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Row Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center uppercase">
          <span className="w-1 h-6 bg-[#DC143C] mr-3" />
          {title}
        </h2>

        <div className="flex items-center gap-3">
          {/* Desktop Left/Right Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#DC143C] hover:text-[#DC143C] transition"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#DC143C] hover:text-[#DC143C] transition"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View All Link */}
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#DC143C] hover:text-[#b01030] transition-colors uppercase tracking-wider ml-2"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2"
      >
        {animeList.map((anime, index) => (
          <div
            key={anime.id}
            className="flex-none w-[160px] sm:w-[200px] md:w-[220px]"
          >
            <AnimeCard anime={anime} rank={showRank ? index + 1 : undefined} />
          </div>
        ))}
      </div>

    </div>
  );
};
