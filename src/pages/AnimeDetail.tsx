import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Star, Bookmark, BookmarkCheck, Share2, Tv, Calendar, Clock, Film, ArrowLeft, Check, ListFilter } from 'lucide-react';
import { DEMO_ANIME } from '../utils/animeData';
import { useWatchlist } from '../context/WatchlistContext';
import { AnimeRow } from '../components/AnimeRow';

export const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [copied, setCopied] = useState(false);

  const anime = DEMO_ANIME.find((a) => a.id === id) || DEMO_ANIME[0];
  const inWatchlist = isInWatchlist(anime.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartWatch = () => {
    const firstEpId = anime.episodes[0]?.id || 'ep-1';
    navigate(`/watch/${anime.id}/${firstEpId}`);
  };

  const relatedAnime = DEMO_ANIME.filter(
    (a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g))
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-16">
      
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        <img
          src={anime.banner || anime.poster}
          alt={anime.title}
          className="w-full h-full object-cover object-center filter brightness-90 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/60 to-transparent" />
      </div>

      {/* Main Detail Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 sm:-mt-64 pb-16">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-300 hover:text-white bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Left Column: Poster Image & Meta */}
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <div className="w-56 sm:w-64 md:w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-red-950/30 bg-[#171717] mb-6">
              <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
            </div>

            {/* Quick Spec Box */}
            <div className="w-full bg-[#171717] border border-white/10 rounded-2xl p-5 text-sm flex flex-col gap-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Japanese</span>
                <span className="font-semibold text-white text-right line-clamp-1">{anime.japaneseTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Studio</span>
                <span className="font-semibold text-white">{anime.studio}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Format</span>
                <span className="font-semibold text-white">{anime.type}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Status</span>
                <span className="font-semibold text-emerald-400">{anime.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Episode Duration</span>
                <span className="font-semibold text-white">{anime.duration}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Actions, Episode List */}
          <div className="md:col-span-3 flex flex-col gap-6">
            
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {anime.rating} / 10
                </span>
                <span className="bg-black/60 border border-white/10 text-neutral-300 px-3 py-1 rounded-lg text-xs font-semibold">
                  {anime.year}
                </span>
                <span className="bg-black/60 border border-white/10 text-neutral-300 px-3 py-1 rounded-lg text-xs font-semibold">
                  {anime.episodesCount} Episodes
                </span>
                <span className="bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs font-bold">
                  SUB & DUB
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
                {anime.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 my-4">
                {anime.genres.map((genre) => (
                  <Link
                    key={genre}
                    to={`/genres?genre=${encodeURIComponent(genre)}`}
                    className="bg-[#171717] hover:bg-red-600 border border-white/10 text-neutral-300 hover:text-white px-3.5 py-1 rounded-full text-xs font-semibold transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 my-6">
                <button
                  onClick={handleStartWatch}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3.5 rounded-xl flex items-center gap-2.5 shadow-xl shadow-red-900/40 hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>START WATCHING (EP 1)</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(anime)}
                  className={`font-semibold px-5 py-3.5 rounded-xl flex items-center gap-2 border transition-colors ${
                    inWatchlist
                      ? 'bg-red-600/20 text-red-400 border-red-500/50'
                      : 'bg-[#171717] hover:bg-neutral-800 text-white border-white/10'
                  }`}
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkCheck className="w-5 h-5 text-red-500" />
                      <span>SAVED IN WATCHLIST</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      <span>ADD TO WATCHLIST</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-xl bg-[#171717] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 transition-colors"
                  title="Share"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Synopsis */}
              <div className="bg-[#171717] border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Synopsis</h3>
                <p className="text-neutral-200 text-sm sm:text-base leading-relaxed">
                  {anime.description}
                </p>
              </div>

            </div>

            {/* Episode List Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-red-600" />
                  <span>Episodes ({anime.episodes.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {anime.episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${anime.id}/${ep.id}`}
                    className="group bg-[#171717] hover:bg-[#222222] border border-white/5 hover:border-red-600/50 p-3 rounded-xl flex items-center gap-3 transition-all"
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                      <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-bold">
                        {ep.duration}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-red-500 block">
                        EPISODE {ep.number}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        {ep.title}
                      </h4>
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        Subbed & Dubbed HD
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Voice Actors / Characters Preview */}
            {anime.characters && anime.characters.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-black text-white mb-4">Main Characters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {anime.characters.map((char) => (
                    <div key={char.id} className="bg-[#171717] border border-white/5 p-3 rounded-xl flex items-center gap-3">
                      <img src={char.image} alt={char.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                      <div>
                        <h5 className="text-sm font-bold text-white">{char.name}</h5>
                        <p className="text-xs text-neutral-400">VA: {char.voiceActor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Recommended Anime Row */}
        <div className="mt-16">
          <AnimeRow
            title="You Might Also Like"
            animeList={relatedAnime}
          />
        </div>

      </div>

    </div>
  );
};
