import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Star, Bookmark, BookmarkCheck, Share2, ArrowLeft, Check, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { AnimeRow } from '../components/AnimeRow';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EpisodeList } from '../components/EpisodeList';
import { AnimeImage } from '../components/AnimeImage';
import { animeService } from '../services/animeService';
import { Anime } from '../types/anime';

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [copied, setCopied] = useState(false);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [relatedAnime, setRelatedAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnimeDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const found = await animeService.getAnimeById(id);
      setAnime(found);
      if (found) {
        const all = await animeService.getAllAnime().catch(() => []);
        const targetId = (found as any)._id || found.id;
        const rel = all
          .filter((a) => {
            const aId = (a as any)._id || a.id;
            return aId !== targetId && a.genres?.some((g) => found.genres?.includes(g));
          })
          .slice(0, 10);
        setRelatedAnime(rel);
      }
    } catch (err: any) {
      console.error('[AnimeDetail Error] Failed to retrieve anime details:', err);
      setErrorMessage('Failed to retrieve anime details from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnimeDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-28 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <Loader2 className="w-10 h-10 text-[#DC143C] animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Fetching anime details from database...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-28 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase italic mb-2">Database Error</h2>
        <p className="text-sm text-neutral-400 max-w-md mb-6">{errorMessage}</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={loadAnimeDetail}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC143C] hover:bg-[#b01030] text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
          <Link
            to="/browse"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // If invalid anime ID, display error handling state
  if (!anime) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-28 pb-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#DC143C]/10 border border-[#DC143C]/20 flex items-center justify-center text-[#DC143C] mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Anime Not Found</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          The requested anime series could not be found in our database records. It may have been removed.
        </p>
        <Link
          to="/browse"
          className="bg-[#DC143C] hover:bg-[#b01030] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-colors shadow-lg"
        >
          Back to Browse
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(anime.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartWatch = () => {
    const firstEpId = anime.episodes?.[0]?.id || 'ep-1';
    navigate(`/watch/${anime.id}/${firstEpId}`);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-16">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[380px] sm:h-[480px] overflow-hidden">
        <AnimeImage
          src={anime.banner || anime.poster}
          alt={anime.title}
          type="banner"
          animeTitle={anime.title}
          className="w-full h-full object-cover object-center filter brightness-90 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/70 to-transparent" />
      </div>

      {/* Main Detail Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-60 pb-20">
        {/* Navigation & Breadcrumb Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <Breadcrumbs
            items={[
              { label: 'Anime', path: '/browse' },
              { label: anime.title },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column: Poster Image & Specs Card */}
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <div className="w-52 sm:w-64 md:w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-red-950/40 bg-[#171717] mb-6">
              <AnimeImage
                src={anime.poster}
                alt={anime.title}
                type="poster"
                animeTitle={anime.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Information Card */}
            <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-xs flex flex-col gap-3 shadow-xl">
              <h3 className="font-extrabold text-white uppercase tracking-wider text-[11px] border-b border-white/10 pb-2 text-[#DC143C]">
                Anime Information
              </h3>

              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Japanese Title</span>
                <span className="font-semibold text-white text-right line-clamp-1 max-w-[140px]">
                  {anime.japaneseTitle || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Studio</span>
                <span className="font-semibold text-white">{anime.studio || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Format Type</span>
                <span className="font-semibold text-white">{anime.type || 'TV'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Release Status</span>
                <span className="font-semibold text-emerald-400">{anime.status || 'Ongoing'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Release Year</span>
                <span className="font-semibold text-white">{anime.year || '2024'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Episodes</span>
                <span className="font-semibold text-white">
                  {anime.episodesCount || anime.episodes?.length || 0} Eps
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Duration</span>
                <span className="font-semibold text-white">{anime.duration || '24m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Language</span>
                <span className="font-semibold text-[#DC143C]">
                  {anime.language || 'Japanese'} (Sub & Dub)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Actions, Episode List */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-lg text-xs font-bold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {anime.rating} / 10
                </span>
                <span className="bg-black/60 border border-white/10 text-neutral-300 px-3 py-1 rounded-lg text-xs font-semibold">
                  {anime.year}
                </span>
                <span className="bg-black/60 border border-white/10 text-neutral-300 px-3 py-1 rounded-lg text-xs font-semibold">
                  {anime.episodesCount || anime.episodes?.length || 0} Episodes
                </span>
                <span className="bg-[#DC143C]/20 text-[#DC143C] border border-[#DC143C]/40 px-2.5 py-1 rounded-lg text-xs font-black uppercase">
                  SUB & DUB HD
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight mb-2">
                {anime.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 my-4">
                {(anime.genres || []).map((genre) => (
                  <Link
                    key={genre}
                    to={`/browse?genre=${encodeURIComponent(genre)}`}
                    className="bg-[#111111] hover:bg-[#DC143C] border border-white/10 text-neutral-300 hover:text-white px-3.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 my-6">
                <button
                  onClick={handleStartWatch}
                  className="bg-[#DC143C] hover:bg-[#b01030] text-white font-black px-6 py-3.5 rounded-sm flex items-center gap-2.5 shadow-xl shadow-red-950/50 hover:scale-105 transition-all text-xs tracking-wider uppercase"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH NOW (EP 1)</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(anime)}
                  className={`font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-sm flex items-center gap-2 border transition-colors ${
                    inWatchlist
                      ? 'bg-[#DC143C]/20 text-[#DC143C] border-[#DC143C]/50'
                      : 'bg-[#111111] hover:bg-neutral-800 text-white border-white/10'
                  }`}
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-[#DC143C]" />
                      <span>Saved in Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-sm bg-[#111111] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 transition-colors"
                  title="Share Anime"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Overview / Synopsis Card */}
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs font-bold text-[#DC143C] uppercase tracking-wider mb-2">Overview</h3>
                <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed">
                  {anime.description}
                </p>
              </div>
            </div>

            {/* Episode System */}
            <div className="mt-2">
              <EpisodeList animeId={anime.id} episodes={anime.episodes || []} />
            </div>

            {/* Main Characters Section */}
            {anime.characters && anime.characters.length > 0 && (
              <div className="mt-2 bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                  Main Characters & Voice Actors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {anime.characters.map((char) => (
                    <div key={char.id} className="bg-[#171717] border border-white/5 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                        <AnimeImage
                          src={char.image}
                          alt={char.name}
                          type="poster"
                          animeTitle={char.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase">{char.name}</h5>
                        <p className="text-[11px] text-neutral-400">VA: {char.voiceActor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* More Like This (Related Anime) */}
        {relatedAnime.length > 0 && (
          <div className="mt-16">
            <AnimeRow
              title="More Like This"
              animeList={relatedAnime}
            />
          </div>
        )}
      </div>
    </div>
  );
};
