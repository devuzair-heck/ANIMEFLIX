import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';
import { Episode } from '../types/anime';
import { AnimeImage } from './AnimeImage';

interface EpisodeListProps {
  animeId: string;
  episodes: Episode[];
}

export const EpisodeList: React.FC<EpisodeListProps> = ({ animeId, episodes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter episodes by number or title/description
  const filteredEpisodes = episodes.filter((ep) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      ep.number.toString() === query ||
      ep.title.toLowerCase().includes(query) ||
      `episode ${ep.number}`.toLowerCase().includes(query) ||
      (ep.description && ep.description.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage);
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header & Episode Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-[#DC143C]" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            Episodes ({episodes.length})
          </h3>
        </div>

        {/* Episode Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search episode # or title..."
            className="w-full bg-[#080808] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] transition-colors"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Episode Grid */}
      {filteredEpisodes.length === 0 ? (
        <div className="text-center py-10 text-neutral-400 text-sm">
          No episodes found matching "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
          {paginatedEpisodes.map((ep) => (
            <Link
              key={ep.id}
              to={`/watch/${animeId}/${ep.id}`}
              className="group bg-[#171717] hover:bg-[#222222] border border-white/5 hover:border-[#DC143C]/60 p-3 rounded-xl flex items-center gap-3.5 transition-all shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                <AnimeImage
                  src={ep.thumbnail}
                  alt={ep.title}
                  type="thumbnail"
                  animeTitle={ep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-7 h-7 text-white fill-white drop-shadow" />
                </div>
                <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur text-[10px] text-white px-1.5 py-0.5 rounded font-bold border border-white/10">
                  {ep.duration}
                </span>
              </div>

              {/* Ep Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black bg-[#DC143C]/20 text-[#DC143C] px-1.5 py-0.5 rounded uppercase border border-[#DC143C]/30">
                    EP {ep.number}
                  </span>
                  {ep.airDate && (
                    <span className="text-[10px] text-neutral-500">{ep.airDate}</span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#DC143C] transition-colors">
                  {ep.title}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-1">
                  {ep.description || 'Watch HD subbed & dubbed stream'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5 text-xs text-neutral-400">
          <span>
            Page {currentPage} of {totalPages} ({filteredEpisodes.length} episodes)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#080808] border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 disabled:hover:bg-[#080808] transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white px-2">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#080808] border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 disabled:hover:bg-[#080808] transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
