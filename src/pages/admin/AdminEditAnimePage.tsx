import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Edit,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { animeService } from '../../services/animeService';
import { GENRES_LIST } from '../../utils/animeData';
import { Anime } from '../../types/anime';

export const AdminEditAnimePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [originalAnime, setOriginalAnime] = useState<Anime | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [japaneseTitle, setJapaneseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterImage, setPosterImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(2024);
  const [status, setStatus] = useState<'Ongoing' | 'Completed'>('Ongoing');
  const [type, setType] = useState<'TV' | 'Movie' | 'OVA'>('TV');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(8.5);
  const [duration, setDuration] = useState('24m');
  const [totalEpisodes, setTotalEpisodes] = useState<number>(12);
  const [language, setLanguage] = useState('Japanese');
  const [isSubbed, setIsSubbed] = useState(true);
  const [isDubbed, setIsDubbed] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [studio, setStudio] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');

  // Image load error states for preview
  const [posterError, setPosterError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnime() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await animeService.getAnimeById(id);
        if (data) {
          setOriginalAnime(data);
          setTitle(data.title || '');
          setJapaneseTitle(data.japaneseTitle || '');
          setDescription(data.description || '');
          setPosterImage(data.poster || '');
          setBannerImage(data.banner || '');
          setSelectedGenres(data.genres || []);
          setReleaseYear(data.year || new Date().getFullYear());
          setStatus(data.status || 'Ongoing');
          setType(data.type || 'TV');
          setRating(data.rating || 8.0);
          setTotalEpisodes(data.episodesCount !== undefined ? data.episodesCount : (data.episodes?.length || 12));
          setDuration(data.duration || '24m');
          setLanguage(data.language || 'Japanese');
          setIsSubbed(data.isSubbed ?? true);
          setIsDubbed(Boolean(data.isDubbed));
          setStudio(data.studio || '');
          setTrailerUrl(data.trailerUrl || '');
          setIsFeatured(Boolean(data.featuredInHero));
          setIsTrending(Boolean(data.isTrending));
          setIsPopular(Boolean(data.isPopular));
        } else {
          setErrorMessage('Anime not found in database.');
        }
      } catch {
        setErrorMessage('Failed to fetch anime details from server.');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnime();
  }, [id]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !originalAnime) return;

    if (!title.trim()) {
      setErrorMessage('Anime Title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }
    if (!posterImage.trim()) {
      setErrorMessage('Poster Image URL is required.');
      return;
    }
    if (selectedGenres.length === 0) {
      setErrorMessage('Please select at least one genre.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updates = {
        title: title.trim(),
        japaneseTitle: japaneseTitle.trim(),
        description: description.trim(),
        poster: posterImage.trim(),
        banner: bannerImage.trim() || posterImage.trim(),
        genres: selectedGenres,
        year: Number(releaseYear),
        status,
        type,
        rating: Number(rating),
        episodesCount: Number(totalEpisodes),
        totalEpisodes: Number(totalEpisodes),
        studio: studio.trim() || 'Unknown Studio',
        duration: duration.trim() || '24m',
        language: language.trim() || 'Japanese',
        isSubbed,
        isDubbed,
        trailerUrl: trailerUrl.trim(),
        featuredInHero: isFeatured,
        isTrending,
        isPopular,
        isTopRated: Number(rating) >= 8.5,
      };

      const targetId = originalAnime._id || originalAnime.id || id;
      const res = await animeService.updateAnime(targetId, updates);
      if (res.success) {
        navigate('/admin/anime', { replace: true });
      } else {
        setErrorMessage(res.message || 'Failed to update anime.');
      }
    } catch {
      setErrorMessage('Server error while saving anime modifications.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#DC143C] animate-spin" />
          <span className="text-xs text-neutral-400 font-medium">Loading anime details...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/anime"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Anime Management</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          
          <div className="mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                Admin Editor
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#DC143C]" />
              <span>Edit Anime — {originalAnime?.title}</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Modify anime metadata, cover art, tags, and broadcast statuses in real-time.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 bg-red-950/60 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Title & Japanese Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Title <span className="text-[#DC143C]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Japanese Title
                </label>
                <input
                  type="text"
                  value={japaneseTitle}
                  onChange={(e) => setJapaneseTitle(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Description <span className="text-[#DC143C]">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] resize-none"
              />
            </div>

            {/* Live Image Previews Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#161616] rounded-2xl border border-white/5">
              
              {/* Poster URL + Live Preview */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                  Poster Image URL <span className="text-[#DC143C]">*</span>
                </label>
                <input
                  type="url"
                  value={posterImage}
                  onChange={(e) => {
                    setPosterImage(e.target.value);
                    setPosterError(false);
                  }}
                  required
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
                
                {/* Live Preview Box */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-20 h-28 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {posterImage && !posterError ? (
                      <img
                        src={posterImage}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                        onError={() => setPosterError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-600 p-2 text-center">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[9px] uppercase font-bold">No Preview</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400">
                    <span className="font-bold text-white block">Poster Live Preview</span>
                    <span className="text-[11px] text-neutral-500">Vertical orientation (3:4 ratio)</span>
                  </div>
                </div>
              </div>

              {/* Banner URL + Live Preview */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={bannerImage}
                  onChange={(e) => {
                    setBannerImage(e.target.value);
                    setBannerError(false);
                  }}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />

                {/* Live Preview Box */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-40 h-24 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {bannerImage && !bannerError ? (
                      <img
                        src={bannerImage}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                        onError={() => setBannerError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-600 p-2 text-center">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[9px] uppercase font-bold">No Banner</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400">
                    <span className="font-bold text-white block">Banner Live Preview</span>
                    <span className="text-[11px] text-neutral-500">Widescreen hero (16:9 ratio)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Genres Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Genres <span className="text-[#DC143C]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES_LIST.map((g) => {
                  const isSelected = selectedGenres.includes(g);
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-[#DC143C] border-[#DC143C] text-white'
                          : 'bg-[#181818] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Year */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Year <span className="text-[#DC143C]">*</span>
                </label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  min={1960}
                  max={2030}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                >
                  <option value="TV">TV Series</option>
                  <option value="Movie">Movie</option>
                  <option value="OVA">OVA / Special</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Rating (0.0 - 10.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>

            {/* Total Episodes, Duration, Language, Studio */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Episodes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Episodes
                </label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={totalEpisodes}
                  onChange={(e) => setTotalEpisodes(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              {/* Studio */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Studio
                </label>
                <input
                  type="text"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>

            {/* Sub/Dub & Flags */}
            <div className="p-4 bg-neutral-900/50 rounded-2xl border border-white/5 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block">
                Sub / Dub & Showcase Visibility
              </span>
              
              <div className="flex flex-wrap items-center gap-6">
                
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isSubbed}
                    onChange={(e) => setIsSubbed(e.target.checked)}
                    className="rounded bg-[#181818] border-white/20 text-[#DC143C] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Subtitled (Sub)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isDubbed}
                    onChange={(e) => setIsDubbed(e.target.checked)}
                    className="rounded bg-[#181818] border-white/20 text-[#DC143C] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Dubbed (Dub)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-[#181818] border-white/20 text-[#DC143C] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Featured Hero Slider</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded bg-[#181818] border-white/20 text-[#DC143C] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Trending</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded bg-[#181818] border-white/20 text-[#DC143C] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Popular</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
              <Link
                to="/admin/anime"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#DC143C] hover:bg-[#b01030] active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#DC143C]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
