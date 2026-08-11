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
    <section className="relative my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center uppercase italic">
          <span className="w-1.5 h-6 sm:h-7 bg-[#DC143C] mr-2.5 sm:mr-3 rounded-full" />
          <span className="mr-2 flex items-center">{icon}</span>
          <span>{title}</span>
        </h2>

        <div className="flex items-center gap-3">
          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#DC143C] hover:bg-[#DC143C] transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#DC143C] hover:bg-[#DC143C] transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View All Link */}
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-xs font-bold text-[#DC143C] hover:text-[#b01030] transition-colors uppercase tracking-wider ml-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Swipeable Scrollable Row */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 touch-pan-x"
      >
        {animeList.map((anime, index) => (
          <div
            key={anime.id}
            className="flex-none w-[140px] sm:w-[180px] md:w-[210px] lg:w-[220px]"
          >
            <AnimeCard anime={anime} rank={showRank ? index + 1 : undefined} />
          </div>
        ))}
      </div>

    </section>
  );
};
