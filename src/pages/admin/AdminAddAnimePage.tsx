import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  ArrowLeft,
  Loader2,
  Film,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { animeService } from '../../services/animeService';
import { GENRES_LIST } from '../../utils/animeData';

export const AdminAddAnimePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [japaneseTitle, setJapaneseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Fantasy']);
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [status, setStatus] = useState<'Ongoing' | 'Completed'>('Ongoing');
  const [rating, setRating] = useState<number>(8.5);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(12);
  const [type, setType] = useState<'TV' | 'Movie' | 'OVA'>('TV');
  const [studio, setStudio] = useState('MAPPA');
  const [duration, setDuration] = useState('24m');
  const [language, setLanguage] = useState('Japanese (Sub/Dub)');
  const [posterImage, setPosterImage] = useState('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80');
  const [trailerUrl, setTrailerUrl] = useState('https://www.youtube.com/watch?v=MGRm4IzK1SQ');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(true);
  const [isPopular, setIsPopular] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Anime Title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }
    if (selectedGenres.length === 0) {
      setErrorMessage('Please select at least one genre.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        title: title.trim(),
        japaneseTitle: japaneseTitle.trim(),
        description: description.trim(),
        genres: selectedGenres,
        year: Number(releaseYear) || new Date().getFullYear(),
        status,
        rating: Number(rating) || 8.0,
        episodesCount: Number(totalEpisodes) || 12,
        type,
        studio: studio.trim() || 'Unknown Studio',
        duration: duration.trim() || '24m',
        language: language.trim() || 'Japanese',
        poster: posterImage.trim(),
        banner: bannerImage.trim(),
        trailerUrl: trailerUrl.trim(),
        featuredInHero: isFeatured,
        isTrending,
        isPopular,
        isTopRated: Number(rating) >= 8.5,
        isRecentlyAdded: true,
      };

      const res = await animeService.createAnime(payload);
      if (res.success) {
        navigate('/admin/anime', { replace: true });
      } else {
        setErrorMessage(res.message || 'Failed to create anime entry.');
      }
    } catch {
      setErrorMessage('Failed to create anime due to server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span>Back to Anime Catalog</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          
          <div className="mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC143C] bg-[#DC143C]/10 border border-[#DC143C]/20 px-2.5 py-0.5 rounded-md">
                Admin Entry
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#DC143C]" />
              <span>Add New Anime Title</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Provide metadata, cover imagery, and streaming attributes to publish a new series.
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
            
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Anime Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Anime Title <span className="text-[#DC143C]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solo Leveling"
                  required
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              {/* Japanese Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Japanese Title
                </label>
                <input
                  type="text"
                  value={japaneseTitle}
                  onChange={(e) => setJapaneseTitle(e.target.value)}
                  placeholder="e.g. 俺だけレベルアップな件 (Ore dake Level Up na Ken)"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Description / Synopsis <span className="text-[#DC143C]">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a captivating summary of the storyline and plot..."
                required
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DC143C] resize-none"
              />
            </div>

            {/* Genres Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-2">
                Select Genres <span className="text-[#DC143C]">*</span>
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
              
              {/* Release Year */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Release Year <span className="text-[#DC143C]">*</span>
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

              {/* Total Episodes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Total Episodes <span className="text-[#DC143C]">*</span>
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
            </div>

            {/* Studio, Duration, Type, Language */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Studio
                </label>
                <input
                  type="text"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  placeholder="e.g. Ufotable, MAPPA"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 24m"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Japanese (Sub/Dub)"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>

            {/* Media URLs */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Poster Image URL
                </label>
                <input
                  type="url"
                  value={posterImage}
                  onChange={(e) => setPosterImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Trailer Video URL (YouTube / MP4)
                </label>
                <input
                  type="url"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#DC143C]"
                />
              </div>
            </div>

            {/* Feature Flags */}
            <div className="p-4 bg-neutral-900/50 rounded-2xl border border-white/5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block">
                Showcase & Visibility Badges
              </span>
              <div className="flex flex-wrap items-center gap-6">
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
                  <span>Trending Now</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded bg-[#181818] border-white/20 text-[#DC143C] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Popular Titles</span>
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
                    <span>Adding Anime...</span>
                  </>
                ) : (
                  <span>Add Anime</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
