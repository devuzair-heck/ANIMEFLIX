import React, { useState, useEffect, useMemo } from 'react';
import {
  ListVideo,
  PlusCircle,
  Edit2,
  Trash2,
  Play,
  Film,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
  Calendar,
  Clock,
  Video,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { animeService } from '../../services/animeService';
import { episodeService, CreateEpisodePayload, UpdateEpisodePayload } from '../../services/episodeService';
import { Anime, Episode } from '../../types/anime';

export const AdminEpisodesPage: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form inputs
  const [formAnimeId, setFormAnimeId] = useState<string>('');
  const [formSeasonNumber, setFormSeasonNumber] = useState<number>(1);
  const [formEpisodeNumber, setFormEpisodeNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDuration, setFormDuration] = useState('24:00');
  const [formReleaseDate, setFormReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLanguage, setFormLanguage] = useState('Japanese');
  const [formSubtitle, setFormSubtitle] = useState('English');
  const [formIsDubbed, setFormIsDubbed] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Form Validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const loadData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const [animes, allEps] = await Promise.all([
        animeService.getAllAnime(),
        episodeService.getAllEpisodes(),
      ]);

      setAnimeList(animes);
      setEpisodes(allEps);
    } catch (err: any) {
      setErrorMessage('Failed to load episodes and anime data from server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available seasons for current selected anime
  const availableSeasons = useMemo(() => {
    const relevantEpisodes = selectedAnimeId === 'all'
      ? episodes
      : episodes.filter((e) => e.animeId === selectedAnimeId);
    
    const seasonSet = new Set<number>();
    seasonSet.add(1);
    relevantEpisodes.forEach((ep) => {
      if (ep.seasonNumber && ep.seasonNumber > 0) {
        seasonSet.add(ep.seasonNumber);
      }
    });
    return Array.from(seasonSet).sort((a, b) => a - b);
  }, [episodes, selectedAnimeId]);

  // Filter and Sort episodes: Season 1 Ep 1, Season 1 Ep 2... Season 2 Ep 1...
  const filteredEpisodes = useMemo(() => {
    return episodes
      .filter((ep) => {
        // Anime Filter
        if (selectedAnimeId !== 'all' && ep.animeId !== selectedAnimeId) {
          return false;
        }

        // Season Filter
        if (selectedSeason !== 'all') {
          const sNum = Number(selectedSeason);
          const epSeason = ep.seasonNumber || 1;
          if (epSeason !== sNum) return false;
        }

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchesTitle = ep.title?.toLowerCase().includes(q);
          const matchesAnime = ep.animeTitle?.toLowerCase().includes(q);
          const matchesEpNum = String(ep.episodeNumber || ep.number).includes(q);
          const matchesDesc = ep.description?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesAnime && !matchesEpNum && !matchesDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort primarily by Season, then by Episode Number
        const sA = a.seasonNumber || 1;
        const sB = b.seasonNumber || 1;
        if (sA !== sB) return sA - sB;
        const eA = a.episodeNumber || a.number || 0;
        const eB = b.episodeNumber || b.number || 0;
        return eA - eB;
      });
  }, [episodes, selectedAnimeId, selectedSeason, searchQuery]);

  // Open modal for ADD
  const handleOpenAddModal = () => {
    setEditingEpisode(null);
    setFormErrors({});

    const defaultAnimeId = selectedAnimeId !== 'all'
      ? selectedAnimeId
      : (animeList[0]?.id || '');
    
    const targetAnime = animeList.find((a) => a.id === defaultAnimeId);
    const existingAnimeEps = episodes.filter((e) => e.animeId === defaultAnimeId);
    
    const targetSeason = selectedSeason !== 'all' ? Number(selectedSeason) : 1;
    const seasonEpisodes = existingAnimeEps.filter((e) => (e.seasonNumber || 1) === targetSeason);
    const nextEpisodeNumber = seasonEpisodes.length > 0
      ? Math.max(...seasonEpisodes.map((e) => e.episodeNumber || e.number || 0)) + 1
      : 1;

    setFormAnimeId(defaultAnimeId);
    setFormSeasonNumber(targetSeason);
    setFormEpisodeNumber(nextEpisodeNumber);
    setFormTitle(`Episode ${nextEpisodeNumber}`);
    setFormDescription(`Episode ${nextEpisodeNumber} of ${targetAnime?.title || 'series'}.`);
    setFormThumbnail(targetAnime?.banner || targetAnime?.poster || '');
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setFormDuration('24:00');
    setFormReleaseDate(new Date().toISOString().split('T')[0]);
    setFormLanguage('Japanese');
    setFormSubtitle('English');
    setFormIsDubbed(false);
    setFormIsPublished(true);

    setIsModalOpen(true);
  };

  // Open modal for EDIT
  const handleOpenEditModal = (ep: Episode) => {
    setEditingEpisode(ep);
    setFormErrors({});

    setFormAnimeId(ep.animeId || '');
    setFormSeasonNumber(ep.seasonNumber || 1);
    setFormEpisodeNumber(ep.episodeNumber || ep.number || 1);
    setFormTitle(ep.title || '');
    setFormDescription(ep.description || '');
    setFormThumbnail(ep.thumbnail || '');
    setFormVideoUrl(ep.videoUrl || '');
    setFormDuration(ep.duration || '24:00');
    setFormReleaseDate(ep.releaseDate || ep.airDate || new Date().toISOString().split('T')[0]);
    setFormLanguage(ep.language || 'Japanese');
    setFormSubtitle(ep.subtitle || 'English');
    setFormIsDubbed(Boolean(ep.isDubbed));
    setFormIsPublished(ep.isPublished !== undefined ? Boolean(ep.isPublished) : true);

    setIsModalOpen(true);
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formAnimeId || !formAnimeId.trim()) {
      errors.animeId = 'Please select a target anime series.';
    }

    if (!formSeasonNumber || formSeasonNumber < 1) {
      errors.seasonNumber = 'Season number must be 1 or greater.';
    }

    if (!formEpisodeNumber || formEpisodeNumber < 1) {
      errors.episodeNumber = 'Episode number must be 1 or greater.';
    }

    if (!formTitle || !formTitle.trim()) {
      errors.title = 'Episode title is required.';
    }

    if (!formVideoUrl || !formVideoUrl.trim()) {
      errors.videoUrl = 'Video URL is required (MP4, HLS, or stream link).';
    }

    // Check for client-side duplicate within the same anime & season
    const isDuplicate = episodes.some((ep) => {
      // If editing, skip self
      if (editingEpisode && (ep.id === editingEpisode.id || (ep as any)._id === (editingEpisode as any)._id)) {
        return false;
      }
      const matchAnime = ep.animeId === formAnimeId;
      const matchSeason = (ep.seasonNumber || 1) === formSeasonNumber;
      const matchEpNum = (ep.episodeNumber || ep.number) === formEpisodeNumber;
      return matchAnime && matchSeason && matchEpNum;
    });

    if (isDuplicate) {
      errors.episodeNumber = `Episode ${formEpisodeNumber} (Season ${formSeasonNumber}) already exists for this anime.`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler for Add / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: CreateEpisodePayload = {
      animeId: formAnimeId.trim(),
      seasonNumber: Number(formSeasonNumber),
      episodeNumber: Number(formEpisodeNumber),
      number: Number(formEpisodeNumber),
      title: formTitle.trim(),
      description: formDescription.trim(),
      thumbnail: formThumbnail.trim(),
      videoUrl: formVideoUrl.trim(),
      duration: formDuration.trim() || '24:00',
      releaseDate: formReleaseDate || new Date().toISOString().split('T')[0],
      airDate: formReleaseDate || new Date().toISOString().split('T')[0],
      language: formLanguage.trim() || 'Japanese',
      subtitle: formSubtitle.trim() || 'English',
      isDubbed: Boolean(formIsDubbed),
      isPublished: Boolean(formIsPublished),
    };

    try {
      if (editingEpisode) {
        // UPDATE Existing Episode
        const targetId = editingEpisode.id || (editingEpisode as any)._id;
        const res = await episodeService.updateEpisode(targetId, payload as UpdateEpisodePayload);
        if (res.success) {
          setSuccessMessage(res.message || `Episode ${formEpisodeNumber} updated successfully.`);
          setIsModalOpen(false);
          await loadData(true);
        } else {
          setErrorMessage(res.message || 'Failed to update episode.');
        }
      } else {
        // CREATE New Episode
        const res = await episodeService.createEpisode(payload);
        if (res.success) {
          setSuccessMessage(res.message || `Episode ${formEpisodeNumber} created successfully.`);
          setIsModalOpen(false);
          await loadData(true);
        } else {
          setErrorMessage(res.message || 'Failed to create episode.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred while saving the episode.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  // Submit Handler for Delete
  const handleDeleteEpisode = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const targetId = deleteTarget.id || (deleteTarget as any)._id;
      const res = await episodeService.deleteEpisode(targetId);

      if (res.success) {
        setSuccessMessage(
          res.message || `Episode ${deleteTarget.episodeNumber || deleteTarget.number} deleted permanently.`
        );
        setDeleteTarget(null);
        await loadData(true);
      } else {
        setErrorMessage(res.message || 'Failed to delete episode.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while deleting episode.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  // Helper to get anime title by ID
  const getAnimeTitle = (animeId?: string) => {
    if (!animeId) return 'Unknown Anime';
    const found = animeList.find((a) => a.id === animeId || a.slug === animeId);
    return found ? found.title : animeId;
  };

  const selectedAnimeObj = animeList.find((a) => a.id === selectedAnimeId);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C] animate-pulse" />
                Episode Management System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white flex items-center gap-2.5">
              <ListVideo className="w-7 h-7 text-[#DC143C]" />
              <span>Episodes Dashboard</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Manage video streaming episodes, seasons, subtitles, release dates, and direct MongoDB video sources.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              id="admin-refresh-episodes-btn"
              className="p-2.5 rounded-xl bg-[#141414] hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Episode List"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#DC143C]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              id="admin-add-episode-btn"
              className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-[#DC143C]/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Episode</span>
            </button>
          </div>
        </div>

        {/* Global Notifications / Banners */}
        {successMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-4 py-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-950/60 border border-red-500/40 text-red-300 px-4 py-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Filters & Selection Toolbar */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Anime Selector Dropdown */}
            <div className="md:col-span-5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#DC143C]" />
                <span>Select Anime Series</span>
              </label>
              <div className="relative">
                <select
                  id="admin-select-anime"
                  value={selectedAnimeId}
                  onChange={(e) => {
                    setSelectedAnimeId(e.target.value);
                    setSelectedSeason('all');
                  }}
                  className="w-full bg-[#171717] border border-white/10 hover:border-white/20 focus:border-[#DC143C] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none pr-9 font-medium"
                >
                  <option value="all">All Anime ({animeList.length} titles)</option>
                  {animeList.map((a) => {
                    const count = episodes.filter((e) => e.animeId === a.id).length;
                    return (
                      <option key={a.id} value={a.id}>
                        {a.title} ({count} eps)
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Season Filter Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#DC143C]" />
                <span>Filter Season</span>
              </label>
              <div className="relative">
                <select
                  id="admin-select-season"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full bg-[#171717] border border-white/10 hover:border-white/20 focus:border-[#DC143C] rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none pr-9 font-medium"
                >
                  <option value="all">All Seasons</option>
                  {availableSeasons.map((s) => (
                    <option key={s} value={String(s)}>
                      Season {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Search Input Box */}
            <div className="md:col-span-4">
              <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#DC143C]" />
                <span>Search Episode</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="admin-search-episodes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, number..."
                  className="w-full bg-[#171717] border border-white/10 hover:border-white/20 focus:border-[#DC143C] rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-medium"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Active Filter Badges */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-neutral-300">
                Showing {filteredEpisodes.length} {filteredEpisodes.length === 1 ? 'episode' : 'episodes'}
              </span>
              {selectedAnimeObj && (
                <span className="inline-flex items-center gap-1 bg-[#DC143C]/10 text-[#DC143C] border border-[#DC143C]/20 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  {selectedAnimeObj.title}
                </span>
              )}
              {selectedSeason !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-white/5 text-neutral-300 border border-white/10 px-2 py-0.5 rounded-md text-[11px]">
                  Season {selectedSeason}
                </span>
              )}
            </div>

            {(selectedAnimeId !== 'all' || selectedSeason !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAnimeId('all');
                  setSelectedSeason('all');
                  setSearchQuery('');
                }}
                className="text-[11px] text-[#DC143C] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Episodes Content (Table for Desktop, Cards for Mobile) */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
              <span className="text-xs text-neutral-400 font-medium">Loading episodes from database...</span>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 mb-4 shadow-inner">
                <ListVideo className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">No episodes found</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                {selectedAnimeId !== 'all'
                  ? `No episodes currently exist for "${getAnimeTitle(selectedAnimeId)}". Add the first episode to make it streamable.`
                  : 'No episodes match your search criteria. You can create a new episode using the button below.'}
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-5 inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add First Episode</span>
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (md and above) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs" id="episodes-admin-table">
                  <thead className="bg-[#161616] text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                    <tr>
                      <th className="py-4 px-4 w-16">Ep #</th>
                      <th className="py-4 px-4 min-w-[220px]">Title & Thumbnail</th>
                      <th className="py-4 px-4 min-w-[150px]">Anime Series</th>
                      <th className="py-4 px-4 w-24">Season</th>
                      <th className="py-4 px-4 w-24">Duration</th>
                      <th className="py-4 px-4 w-32">Release Date</th>
                      <th className="py-4 px-4 w-28">Status</th>
                      <th className="py-4 px-4 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300">
                    {filteredEpisodes.map((ep) => {
                      const epNum = ep.episodeNumber || ep.number || 1;
                      const seasonNum = ep.seasonNumber || 1;
                      const epTitle = ep.title || `Episode ${epNum}`;
                      const animeName = ep.animeTitle || getAnimeTitle(ep.animeId);

                      return (
                        <tr
                          key={ep.id || (ep as any)._id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Ep # */}
                          <td className="py-3.5 px-4 font-mono font-black text-[#DC143C] text-sm">
                            #{epNum}
                          </td>

                          {/* Title + Thumbnail Preview */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 aspect-video rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/10 flex items-center justify-center">
                                {ep.thumbnail ? (
                                  <img
                                    src={ep.thumbnail}
                                    alt={epTitle}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback on image load error
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                                  <Play className="w-3.5 h-3.5 text-white/80 fill-white" />
                                </div>
                              </div>

                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate max-w-xs text-xs">
                                  {epTitle}
                                </span>
                                <span className="text-[10px] text-neutral-400 block truncate max-w-xs mt-0.5">
                                  {ep.description || 'No description provided'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Anime Series */}
                          <td className="py-3.5 px-4 font-semibold text-neutral-200 max-w-[180px] truncate">
                            {animeName}
                          </td>

                          {/* Season */}
                          <td className="py-3.5 px-4 font-mono font-medium text-neutral-300">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/5">
                              Season {seasonNum}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 font-mono text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              <span>{ep.duration || '24:00'}</span>
                            </div>
                          </td>

                          {/* Release Date */}
                          <td className="py-3.5 px-4 text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-neutral-500" />
                              <span>{ep.releaseDate || ep.airDate || 'N/A'}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                ep.isPublished !== false
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}
                            >
                              {ep.isPublished !== false ? 'Published' : 'Draft'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(ep)}
                                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                title="Edit Episode"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-neutral-300 hover:text-white" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(ep)}
                                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Delete Episode"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredEpisodes.map((ep) => {
                  const epNum = ep.episodeNumber || ep.number || 1;
                  const seasonNum = ep.seasonNumber || 1;
                  const epTitle = ep.title || `Episode ${epNum}`;
                  const animeName = ep.animeTitle || getAnimeTitle(ep.animeId);

                  return (
                    <div key={ep.id || (ep as any)._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 aspect-video rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/10">
                            {ep.thumbnail ? (
                              <img
                                src={ep.thumbnail}
                                alt={epTitle}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                <Play className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#DC143C] block font-mono">
                              Season {seasonNum} • Episode {epNum}
                            </span>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{epTitle}</h4>
                            <span className="text-[10px] text-neutral-400 block line-clamp-1">{animeName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ep)}
                            className="p-2 text-neutral-300 hover:text-white bg-white/5 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(ep)}
                            className="p-2 text-red-400 bg-red-950/30 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-900/60 px-3 py-2 rounded-lg">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {ep.duration || '24:00'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          {ep.releaseDate || ep.airDate || 'N/A'}
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          {ep.isPublished !== false ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ADD / EDIT EPISODE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                    <ListVideo className="w-5 h-5 text-[#DC143C]" />
                    <span>{editingEpisode ? `Edit Episode ${formEpisodeNumber}` : 'Add New Episode'}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {editingEpisode
                      ? 'Modify episode metadata, stream URL, and publishing properties.'
                      : 'Create a new episode and associate it directly with an anime series.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitForm} className="space-y-4" id="episode-form">
                
                {/* Anime Series & Season & Episode Number */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  
                  {/* Anime Selection */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Anime Series <span className="text-[#DC143C]">*</span>
                    </label>
                    <select
                      value={formAnimeId}
                      onChange={(e) => setFormAnimeId(e.target.value)}
                      disabled={Boolean(editingEpisode) || isSubmitting}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C] disabled:opacity-60"
                    >
                      {animeList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                    {formErrors.animeId && (
                      <span className="text-[10px] text-red-400 font-semibold block mt-1">{formErrors.animeId}</span>
                    )}
                  </div>

                  {/* Season Number */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Season # <span className="text-[#DC143C]">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formSeasonNumber}
                      onChange={(e) => setFormSeasonNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={isSubmitting}
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                    {formErrors.seasonNumber && (
                      <span className="text-[10px] text-red-400 font-semibold block mt-1">{formErrors.seasonNumber}</span>
                    )}
                  </div>

                  {/* Episode Number */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Episode # <span className="text-[#DC143C]">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formEpisodeNumber}
                      onChange={(e) => setFormEpisodeNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={isSubmitting}
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                    {formErrors.episodeNumber && (
                      <span className="text-[10px] text-red-400 font-semibold block mt-1">{formErrors.episodeNumber}</span>
                    )}
                  </div>

                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Episode Title <span className="text-[#DC143C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. To You, 2,000 Years in the Future"
                    required
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                  />
                  {formErrors.title && (
                    <span className="text-[10px] text-red-400 font-semibold block mt-1">{formErrors.title}</span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Episode Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Summary of episode plot points..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C] resize-none"
                  />
                </div>

                {/* Video URL & Thumbnail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#DC143C]" />
                      <span>Video Stream URL</span> <span className="text-[#DC143C]">*</span>
                    </label>
                    <input
                      type="url"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="https://.../video.mp4"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                    {formErrors.videoUrl && (
                      <span className="text-[10px] text-red-400 font-semibold block mt-1">{formErrors.videoUrl}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Thumbnail URL</span>
                    </label>
                    <input
                      type="url"
                      value={formThumbnail}
                      onChange={(e) => setFormThumbnail(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="https://.../thumbnail.jpg"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>
                </div>

                {/* Duration & Release Date & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Duration</span>
                    </label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="24:00"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Release Date</span>
                    </label>
                    <input
                      type="date"
                      value={formReleaseDate}
                      onChange={(e) => setFormReleaseDate(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Audio / Language
                    </label>
                    <input
                      type="text"
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Japanese"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>
                </div>

                {/* Subtitle & Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Subtitles
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="English"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsDubbed}
                        onChange={(e) => setFormIsDubbed(e.target.checked)}
                        disabled={isSubmitting}
                        className="rounded bg-[#181818] border-white/20 text-[#DC143C] w-4 h-4 cursor-pointer"
                      />
                      <span>Dubbed</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsPublished}
                        onChange={(e) => setFormIsPublished(e.target.checked)}
                        disabled={isSubmitting}
                        className="rounded bg-[#181818] border-white/20 text-[#DC143C] w-4 h-4 cursor-pointer"
                      />
                      <span>Published</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-5 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#DC143C]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{editingEpisode ? 'Updating episode...' : 'Adding episode...'}</span>
                      </>
                    ) : (
                      <span>{editingEpisode ? 'Save Changes' : 'Create Episode'}</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase italic text-white">
                Delete Episode Confirmation
              </h3>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="text-[#DC143C] font-bold">
                  Episode {deleteTarget.episodeNumber || deleteTarget.number} (
                  {deleteTarget.title})
                </span>{' '}
                from <span className="text-white font-bold">{getAnimeTitle(deleteTarget.animeId)}</span>?
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                This will permanently delete the episode record from the MongoDB database.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEpisode}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-red-900/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting episode...</span>
                    </>
                  ) : (
                    <span>Permanently Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
