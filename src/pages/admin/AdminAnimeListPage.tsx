import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Clapperboard,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { animeService } from '../../services/animeService';
import { Anime } from '../../types/anime';
import { GENRES_LIST } from '../../utils/animeData';

export const AdminAnimeListPage: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Anime | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await animeService.deleteAnime(deleteTarget.id);
      if (res.success) {
        setAnimeList((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setActionMessage(`"${deleteTarget.title}" deleted successfully.`);
        setTimeout(() => setActionMessage(null), 4000);
      }
      setDeleteTarget(null);
    } catch {
      // Handled
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAnime = animeList.filter((anime) => {
    const matchesSearch =
      anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anime.japaneseTitle && anime.japaneseTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (anime.studio && anime.studio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenre === 'All' || anime.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' || anime.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesGenre && matchesStatus;
  });

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
              Manage Anime Series
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
            <span>+ Add New Anime</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {actionMessage && (
          <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, Japanese title, or studio..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
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
          </div>
        </div>

        {/* Anime Catalog Table */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
              <span className="text-xs text-neutral-400 font-medium">Loading anime entries...</span>
            </div>
          ) : filteredAnime.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <Film className="w-10 h-10 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white uppercase">No anime match your query</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Try adjusting your search terms or genre filter to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Poster & Title</th>
                    <th className="py-3.5 px-4">Genre</th>
                    <th className="py-3.5 px-4">Year</th>
                    <th className="py-3.5 px-4">Episodes</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {filteredAnime.map((anime) => (
                    <tr key={anime.id} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Poster + Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-12 h-16 object-cover rounded-lg bg-neutral-800 shrink-0 border border-white/10"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate text-sm max-w-xs">{anime.title}</span>
                            <span className="text-[11px] text-neutral-400 block truncate">{anime.japaneseTitle || '—'}</span>
                            <span className="text-[10px] text-neutral-500 block truncate">{anime.studio}</span>
                          </div>
                        </div>
                      </td>

                      {/* Genre */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {anime.genres.slice(0, 3).map((g) => (
                            <span key={g} className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 text-[10px] font-medium border border-white/5">
                              {g}
                            </span>
                          ))}
                          {anime.genres.length > 3 && (
                            <span className="text-[10px] text-neutral-500">+{anime.genres.length - 3}</span>
                          )}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">{anime.year}</td>

                      {/* Episodes */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {anime.episodes?.length || anime.episodesCount || 12}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{Number(anime.rating || 8).toFixed(1)}</span>
                        </div>
                      </td>

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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/anime/${anime.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/anime/edit/${anime.id}`}
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
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase italic text-white">
                Delete Anime Confirmation
              </h3>
              <p className="text-xs text-neutral-400 mt-2">
                Are you sure you want to delete <span className="text-white font-bold">"{deleteTarget.title}"</span>? This will permanently remove the anime and all associated episodes.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
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
