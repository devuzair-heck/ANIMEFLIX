import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Film,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { animeService } from '../../services/animeService';
import { Anime } from '../../types/anime';
import { GENRES_LIST } from '../../utils/animeData';

export const AdminAnimeListPage: React.FC = () => {
  const location = useLocation();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Anime | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Check for navigation flash messages
  useEffect(() => {
    const flash = (location.state as any)?.message || (location.state as any)?.successMessage;
    if (flash) {
      setActionMessage(flash);
      const t = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAnime = async () => {
    setIsLoading(true);
    try {
      const data = await animeService.getAllAnime();
      setAnimeList(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const targetId = (deleteTarget as any)._id || deleteTarget.id;
      const res = await animeService.deleteAnime(targetId);
      if (res.success) {
        setAnimeList((prev) => prev.filter((a) => a.id !== deleteTarget.id && (a as any)._id !== (deleteTarget as any)._id));
        setActionMessage(res.message || 'Anime deleted successfully.');
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionError(res.message || 'Failed to delete anime. Please try again.');
        setTimeout(() => setActionError(null), 5000);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setActionError(err?.message || 'Error occurred while deleting anime.');
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Extract available years for filter
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(animeList.map((a) => a.year).filter(Boolean))).sort((a, b) => b - a);
    return years;
  }, [animeList]);

  // Filtered anime list
  const filteredAnime = useMemo(() => {
    return animeList.filter((anime) => {
      const s = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !s ||
        anime.title.toLowerCase().includes(s) ||
        (anime.japaneseTitle && anime.japaneseTitle.toLowerCase().includes(s)) ||
        (anime.studio && anime.studio.toLowerCase().includes(s));

      const matchesGenre =
        selectedGenre === 'All' || anime.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' || anime.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesYear =
        selectedYear === 'All' || anime.year.toString() === selectedYear;

      return matchesSearch && matchesGenre && matchesStatus && matchesYear;
    });
  }, [animeList, searchQuery, selectedGenre, selectedStatus, selectedYear]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, selectedStatus, selectedYear]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAnime.length / itemsPerPage) || 1;
  const paginatedAnime = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAnime.slice(start, start + itemsPerPage);
  }, [filteredAnime, currentPage, itemsPerPage]);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                Catalog Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
              Anime Management
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Browse, search, edit, and organize all anime titles ({filteredAnime.length} total)
            </p>
          </div>

          <Link
            to="/admin/anime/add"
            id="admin-manage-add-anime-btn"
            className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-[#DC143C]/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Anime</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {actionMessage && (
          <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="bg-red-950/50 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Search & Filters Bar */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime by title, Japanese title..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
            
            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#DC143C]"
            >
              <option value="All">All Genres</option>
              {GENRES_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#DC143C]"
            >
              <option value="All">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#DC143C]"
            >
              <option value="All">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Anime Catalog Table */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
              <span className="text-xs text-neutral-400 font-medium">Loading anime...</span>
            </div>
          ) : filteredAnime.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <Film className="w-10 h-10 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white uppercase">No anime found.</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                No matching anime series in the catalog. Click "+ Add Anime" to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Poster</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Year</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Genres</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Episodes</th>
                    <th className="py-3.5 px-4">Featured</th>
                    <th className="py-3.5 px-4">Trending</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {paginatedAnime.map((anime) => (
                    <tr key={anime.id || (anime as any)._id || anime.title} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Poster */}
                      <td className="py-3.5 px-4">
                        <img
                          src={anime.poster}
                          alt={anime.title}
                          className="w-11 h-15 object-cover rounded-lg bg-neutral-800 shrink-0 border border-white/10"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate text-sm">{anime.title}</span>
                          <span className="text-[11px] text-neutral-400 block truncate">{anime.japaneseTitle || '—'}</span>
                          <span className="text-[10px] text-neutral-500 block truncate">{anime.studio}</span>
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">{anime.year}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            anime.status === 'Ongoing'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-300 border border-white/5'
                          }`}
                        >
                          {anime.status}
                        </span>
                      </td>

                      {/* Genres */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {anime.genres.slice(0, 2).map((g) => (
                            <span key={g} className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 text-[10px] font-medium border border-white/5">
                              {g}
                            </span>
                          ))}
                          {anime.genres.length > 2 && (
                            <span className="text-[10px] text-neutral-500">+{anime.genres.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{Number(anime.rating || 8).toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Episodes */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {anime.episodesCount !== undefined ? anime.episodesCount : (anime.episodes?.length || 12)}
                      </td>

                      {/* Featured */}
                      <td className="py-3.5 px-4">
                        {anime.featuredInHero ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">No</span>
                        )}
                      </td>

                      {/* Trending */}
                      <td className="py-3.5 px-4">
                        {anime.isTrending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2 py-0.5 rounded-md">
                            <Flame className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">No</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/anime/${anime.id || (anime as any)._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/anime/edit/${(anime as any)._id || anime.id}`}
                            className="p-2 text-neutral-400 hover:text-[#DC143C] rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Edit Anime"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(anime)}
                            className="p-2 text-neutral-400 hover:text-red-400 rounded-lg bg-white/5 hover:bg-red-950/40 transition-colors"
                            title="Delete Anime"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {filteredAnime.length > itemsPerPage && (
            <div className="p-4 bg-[#141414] border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Showing <span className="text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="text-white font-bold">
                  {Math.min(currentPage * itemsPerPage, filteredAnime.length)}
                </span>{' '}
                of <span className="text-white font-bold">{filteredAnime.length}</span> anime
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === pg
                        ? 'bg-[#DC143C] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase italic text-white">
                Delete Anime Confirmation
              </h3>
              
              <p className="text-xs text-neutral-300">
                Are you sure you want to delete this anime: <span className="text-white font-bold">"{deleteTarget.title}"</span>?
              </p>

              {/* Associated Episodes Warning */}
              {(deleteTarget.episodes?.length || deleteTarget.episodesCount || 0) > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                  <span className="font-bold block mb-0.5">Warning:</span>
                  This anime has episodes associated with it. Deleting the anime may affect those episodes.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
