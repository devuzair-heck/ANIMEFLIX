import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Star, Tv, Calendar } from 'lucide-react';
import { Anime } from '../types/anime';
import { useWatchlist } from '../context/WatchlistContext';
import { AnimeImage } from './AnimeImage';

interface HeroSliderProps {
  animeList: Anime[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ animeList }) => {
  const heroAnime = animeList.filter((a) => a.featuredInHero || a.isTrending).slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroAnime.length);
  }, [heroAnime.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroAnime.length) % heroAnime.length);
  }, [heroAnime.length]);

  // Auto-slide effect
  useEffect(() => {
    if (heroAnime.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, heroAnime.length]);

  if (!heroAnime || heroAnime.length === 0) return null;

  const currentAnime = heroAnime[currentIndex];
  const inWatchlist = isInWatchlist(currentAnime.id);

  const handleWatchNow = () => {
    const firstEpId = currentAnime.episodes[0]?.id || 'ep-1';
    navigate(`/watch/${currentAnime.id}/${firstEpId}`);
  };

  return (
    <div className="relative w-full h-[82vh] min-h-[550px] max-h-[800px] overflow-hidden bg-black group">
      
      {/* Background Banner with Smooth Transition */}
      <div className="absolute inset-0">
        {heroAnime.map((anime, index) => (
          <div
            key={anime.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <AnimeImage
              src={anime.banner || anime.poster}
              alt={anime.title}
              type="banner"
              animeTitle={anime.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover object-center scale-105 transform"
            />
            {/* Dark Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent w-full md:w-3/4" />
          </div>
        ))}
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 pt-28">
        <div className="max-w-2xl animate-in fade-in slide-in-from-left-4 duration-500 key={currentAnime.id}">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2 py-0.5 bg-[#DC143C] text-[10px] font-bold rounded text-white uppercase tracking-wider">
              TRENDING #{currentIndex + 1}
            </span>
            <span className="text-xs sm:text-sm text-gray-300 font-medium">
              {currentAnime.year} • {currentAnime.episodesCount} Episodes • {currentAnime.status}
            </span>
            <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-black/60 backdrop-blur px-2 py-0.5 rounded border border-white/10">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {currentAnime.rating}
            </span>
          </div>

          {/* Anime Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 leading-[0.9] uppercase italic text-white tracking-tight drop-shadow-md">
            {currentAnime.title}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base line-clamp-3 mb-8 leading-relaxed max-w-lg">
            {currentAnime.description}
          </p>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {currentAnime.genres.map((genre) => (
              <Link
                key={genre}
                to={`/genres?genre=${encodeURIComponent(genre)}`}
                className="bg-white/10 hover:bg-[#DC143C] text-gray-200 hover:text-white border border-white/10 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider transition-colors"
              >
                {genre}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleWatchNow}
              className="bg-[#DC143C] hover:bg-[#b01030] text-white px-8 py-3.5 rounded-sm font-bold flex items-center gap-2.5 transition shadow-lg uppercase tracking-wider"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>WATCH NOW</span>
            </button>

            <button
              onClick={() => toggleWatchlist(currentAnime)}
              className={`px-8 py-3.5 rounded-sm font-bold flex items-center gap-2 border transition uppercase tracking-wider backdrop-blur-md ${
                inWatchlist
                  ? 'bg-[#DC143C]/20 text-[#DC143C] border-[#DC143C]/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
            >
              {inWatchlist ? (
                <>
                  <BookmarkCheck className="w-5 h-5 text-[#DC143C]" />
                  <span>IN WATCHLIST</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5" />
                  <span>+ MY WATCHLIST</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-red-600 text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-red-600 text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Pagination Dots */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-30 flex items-center gap-2">
        {heroAnime.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-red-600' : 'w-2.5 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
