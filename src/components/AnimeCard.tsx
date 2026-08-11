import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Info, Bookmark, BookmarkCheck } from 'lucide-react';
import { Anime } from '../types/anime';
import { useWatchlist } from '../context/WatchlistContext';
import { AnimeImage } from './AnimeImage';

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, rank }) => {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(anime.id);

  const handleCardClick = () => {
    navigate(`/anime/${anime.id}`);
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const firstEpId = anime.episodes[0]?.id || 'ep-1';
    navigate(`/watch/${anime.id}/${firstEpId}`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(anime);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col cursor-pointer select-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-[#171717] rounded-xl overflow-hidden border border-white/10 transition-all duration-300 group-hover:scale-[1.03] group-hover:border-[#DC143C]/60 shadow-lg">
        
        {/* Rank Badge if specified */}
        {rank !== undefined && (
          <div
            className={`absolute top-2 left-2 z-20 px-2 py-0.5 rounded font-black text-[10px] sm:text-xs shadow-md tracking-wider ${
              rank === 1
                ? 'bg-[#DC143C] text-white'
                : rank === 2
                ? 'bg-slate-300 text-black'
                : rank === 3
                ? 'bg-amber-700 text-white'
                : 'bg-black/85 text-white border border-white/20'
            }`}
          >
            #{rank}
          </div>
        )}

        {/* SUB/DUB Badges */}
        <div className="absolute top-2 right-2 z-20 flex gap-1">
          {anime.isSubbed && anime.isDubbed ? (
            <span className="bg-black/85 backdrop-blur text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10 text-white">
              SUB | DUB
            </span>
          ) : anime.isSubbed ? (
            <span className="bg-black/85 backdrop-blur text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10 text-white">
              SUB
            </span>
          ) : (
            <span className="bg-black/85 backdrop-blur text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10 text-white">
              DUB
            </span>
          )}
        </div>

        {/* Bookmark Quick Toggle (Always visible on mobile touch top-right overlay if needed or hover) */}
        <button
          onClick={handleBookmarkClick}
          className={`absolute bottom-2 right-2 z-30 sm:hidden p-2 rounded-full shadow-lg backdrop-blur-md transition-transform active:scale-95 ${
            inWatchlist
              ? 'bg-[#DC143C] text-white'
              : 'bg-black/80 text-neutral-300 border border-white/20'
          }`}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Poster Image */}
        <AnimeImage
          src={anime.poster}
          alt={`${anime.title} anime poster`}
          type="poster"
          animeTitle={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Action Overlay (Desktop & Devices) */}
        <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3 z-20">
          <div className="flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {/* WATCH NOW Button */}
            <button
              onClick={handleWatchClick}
              className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-bold py-2 rounded-md flex items-center justify-center gap-1.5 text-xs tracking-wider uppercase transition-colors shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Now</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              {/* DETAILS Button */}
              <Link
                to={`/anime/${anime.id}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] uppercase transition-colors border border-white/10"
              >
                <Info className="w-3 h-3" />
                <span>Details</span>
              </Link>

              {/* WATCHLIST Toggle */}
              <button
                onClick={handleBookmarkClick}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors border ${
                  inWatchlist
                    ? 'bg-[#DC143C]/30 text-[#DC143C] border-[#DC143C]/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck className="w-3 h-3 text-[#DC143C]" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3 h-3" />
                    <span>Bookmark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Card Info Below Poster */}
      <div className="mt-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-[#DC143C] transition-colors uppercase tracking-tight">
          {anime.title}
        </h3>

        <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-neutral-400">
          <span>
            {anime.year} • {anime.episodesCount} Eps
          </span>
          <span className="text-yellow-400 font-bold flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {anime.rating}
          </span>
        </div>
      </div>
    </div>
  );
};
