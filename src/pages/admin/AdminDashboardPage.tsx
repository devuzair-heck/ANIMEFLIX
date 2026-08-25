import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  ListVideo,
  FileEdit,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  Sparkles,
  Star,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { animeService } from '../../services/animeService';
import { adminAuthService, DashboardStats } from '../../services/adminAuthService';
import { Anime } from '../../types/anime';

export const AdminDashboardPage: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnime: 0,
    totalEpisodes: 0,
    publishedAnime: 0,
    draftAnime: 0,
  });
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Anime | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setStatsError(null);
    try {
      // Fetch both catalog and dynamic backend metrics
      const [animes, statsRes] = await Promise.all([
        animeService.getAllAnime().catch(() => []),
        adminAuthService.getDashboardStats().catch(() => ({
          success: false,
          data: { totalAnime: 0, totalEpisodes: 0, publishedAnime: 0, draftAnime: 0 },
          error: 'Unable to load dashboard statistics.',
        })),
      ]);

      setAnimeList(animes || []);

      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        if (statsRes && 'error' in statsRes && statsRes.error) {
          setStatsError(statsRes.error);
        }
        // Fallback calculation directly from fetched catalog
        const totalEp = (animes || []).reduce((acc, a) => acc + (a.episodes?.length || a.episodesCount || 0), 0);
        const draftCount = (animes || []).filter((a) => (a as any).status === 'Draft' || (a as any).isPublished === false).length;
        setStats({
          totalAnime: (animes || []).length,
          totalEpisodes: totalEp,
          publishedAnime: (animes || []).length - draftCount,
          draftAnime: draftCount,
        });
      }
    } catch (err) {
      console.error('[Admin Dashboard] Load error:', err);
      setStatsError('Unable to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshStats = async () => {
    setIsRefreshingStats(true);
    setStatsError(null);
    try {
      const statsRes = await adminAuthService.getDashboardStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else if (statsRes.error) {
        setStatsError(statsRes.error);
      }
    } catch {
      setStatsError('Unable to load dashboard statistics.');
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const targetId = (deleteTarget as any)._id || deleteTarget.id;
      await animeService.deleteAnime(targetId);
      setAnimeList((prev) => prev.filter((a) => a.id !== deleteTarget.id && (a as any)._id !== (deleteTarget as any)._id));
      setDeleteTarget(null);
      // Refresh stats after deletion
      await refreshStats();
    } catch {
      // Handled
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950/30 border border-white/10 rounded-2xl p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                AnimeFlix Admin Panel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
              Welcome, Admin
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Monitor platform metrics, manage series catalogs, configure video streams, and publish new episodes.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/anime/add"
              id="dashboard-quick-add-anime"
              className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-[#DC143C]/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Anime</span>
            </Link>
            <Link
              to="/admin/anime"
              id="dashboard-quick-manage-anime"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-white/10 transition-all"
            >
              <Film className="w-4 h-4" />
              <span>Manage Anime</span>
            </Link>
            <Link
              to="/admin/episodes"
              id="dashboard-quick-manage-episodes"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-white/10 transition-all"
            >
              <ListVideo className="w-4 h-4" />
              <span>Manage Episodes</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Live Database Metrics
            </h3>
            <button
              type="button"
              onClick={refreshStats}
              disabled={isRefreshingStats}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Refresh MongoDB Stats"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingStats ? 'animate-spin text-[#DC143C]' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {statsError && (
            <div className="bg-amber-950/40 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Unable to load dashboard statistics. Displaying local catalog metrics.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Anime */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Anime</span>
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-[#DC143C] flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white tracking-tight">{stats.totalAnime}</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Active titles in database</span>
              </div>
            </div>

            {/* Total Episodes */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Episodes</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <ListVideo className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white tracking-tight">{stats.totalEpisodes}</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Streamable episodes</span>
              </div>
            </div>

            {/* Published Anime */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Published Anime</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white tracking-tight">{stats.publishedAnime}</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Live on website</span>
              </div>
            </div>

            {/* Draft Anime */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Draft Anime</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileEdit className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white tracking-tight">{stats.draftAnime}</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">Unpublished drafts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Anime Catalog Section */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#DC143C]" />
                <span>Recent Anime Catalog</span>
              </h2>
              <p className="text-xs text-neutral-400">Overview of titles available on the platform</p>
            </div>
            <Link
              to="/admin/anime"
              className="text-xs font-bold text-[#DC143C] hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View Full Catalog ({animeList.length})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#DC143C] animate-spin" />
              <span className="text-xs text-neutral-400">Loading catalog data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                  <tr>
                    <th className="py-3.5 px-4">Anime</th>
                    <th className="py-3.5 px-4">Genre</th>
                    <th className="py-3.5 px-4">Year</th>
                    <th className="py-3.5 px-4">Episodes</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {animeList.slice(0, 8).map((anime) => (
                    <tr key={anime.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Poster + Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={anime.poster}
                            alt={anime.title}
                            className="w-10 h-14 object-cover rounded-md bg-neutral-800 shrink-0 border border-white/5"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-xs">{anime.title}</span>
                            <span className="text-[11px] text-neutral-500 block truncate">{anime.japaneseTitle || anime.studio}</span>
                          </div>
                        </div>
                      </td>

                      {/* Genre */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {anime.genres.slice(0, 2).map((g) => (
                            <span key={g} className="px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 text-[10px] font-medium">
                              {g}
                            </span>
                          ))}
                          {anime.genres.length > 2 && (
                            <span className="text-[10px] text-neutral-500">+{anime.genres.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-3 px-4 font-mono">{anime.year}</td>

                      {/* Episodes */}
                      <td className="py-3 px-4 font-mono">{anime.episodesCount !== undefined ? anime.episodesCount : (anime.episodes?.length || 12)}</td>

                      {/* Rating */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{anime.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            anime.status === 'Ongoing'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {anime.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/anime/${anime.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="View on site"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/anime/edit/${(anime as any)._id || anime.id}`}
                            className="p-1.5 text-neutral-400 hover:text-[#DC143C] rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Edit Anime"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(anime)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg bg-white/5 hover:bg-red-950/40 transition-colors"
                            title="Delete Anime"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                  <span>Delete Anime</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
