import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Star, Info, Bookmark, BookmarkCheck } from 'lucide-react';
import { Anime } from '../types/anime';
import { useWatchlist } from '../context/WatchlistContext';

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, rank }) => {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(anime.id);

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
    <div className="group relative flex flex-col">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-[#171717] rounded-lg overflow-hidden border border-white/5 transition-transform duration-300 hover:scale-105">
        
        {/* Rank Badge if specified */}
        {rank !== undefined && (
          <div className={`absolute top-2 left-2 z-10 w-7 h-7 rounded flex items-center justify-center font-black text-xs shadow-lg ${
            rank === 1
              ? 'bg-[#DC143C] text-white'
              : rank === 2
              ? 'bg-slate-300 text-black'
              : rank === 3
              ? 'bg-amber-700 text-white'
              : 'bg-black/80 text-white border border-white/20'
          }`}>
            #{rank}
          </div>
        )}

        {/* SUB/DUB Badges */}
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {anime.isSubbed && anime.isDubbed ? (
            <span className="bg-black/80 backdrop-blur text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10 text-white">
              SUB | DUB
            </span>
          ) : anime.isSubbed ? (
            <span className="bg-black/80 backdrop-blur text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10 text-white">
              SUB
            </span>
          ) : (
            <span className="bg-black/80 backdrop-blur text-[9px] px-1.5 py-0.5 rounded font-bold border border-white/10 text-white">
              DUB
            </span>
          )}
        </div>

        {/* Poster Image */}
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20">
          
          <div className="flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {/* WATCH NOW Button */}
            <button
              onClick={handleWatchClick}
              className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-bold py-2 rounded-sm flex items-center justify-center gap-1.5 text-xs tracking-wider uppercase transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Watch Now
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              {/* DETAILS Button */}
              <Link
                to={`/anime/${anime.id}`}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 rounded-sm flex items-center justify-center gap-1 text-[10px] uppercase transition-colors border border-white/10"
              >
                <Info className="w-3 h-3" />
                Details
              </Link>

              {/* WATCHLIST Toggle */}
              <button
                onClick={handleBookmarkClick}
                className={`py-1.5 rounded-sm flex items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors border ${
                  inWatchlist
                    ? 'bg-[#DC143C]/30 text-[#DC143C] border-[#DC143C]/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck className="w-3 h-3 text-[#DC143C]" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3 h-3" />
                    Bookmark
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Card Info Below Poster */}
      <div className="mt-2.5">
        <Link
          to={`/anime/${anime.id}`}
          className="text-sm font-bold text-white truncate block group-hover:text-[#DC143C] transition uppercase"
        >
          {anime.title}
        </Link>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-gray-500">
            {anime.year} • {anime.episodesCount} Eps
          </span>
          <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {anime.rating}
          </span>
        </div>
      </div>

    </div>
  );
};
