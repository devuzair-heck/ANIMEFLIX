import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, Clock, Sparkles, Trophy, Grid } from 'lucide-react';
import { DEMO_ANIME, GENRES_LIST } from '../utils/animeData';
import { HeroSlider } from '../components/HeroSlider';
import { AnimeRow } from '../components/AnimeRow';

export const Home: React.FC = () => {
  const trendingAnime = DEMO_ANIME.filter((a) => a.isTrending);
  const popularAnime = DEMO_ANIME.filter((a) => a.isPopular);
  const recentlyAdded = DEMO_ANIME.filter((a) => a.isRecentlyAdded);
  const topRated = DEMO_ANIME.filter((a) => a.isTopRated);
  const latestEpisodes = DEMO_ANIME.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      
      {/* Hero Section */}
      <HeroSlider animeList={DEMO_ANIME} />

      {/* Main Content Rows */}
      <main className="relative z-20 -mt-6">
        
        {/* Trending Anime Row */}
        <AnimeRow
          title="Trending Now"
          icon={<Flame className="w-6 h-6 fill-red-500" />}
          animeList={trendingAnime}
          viewAllLink="/trending"
          showRank={true}
        />

        {/* Popular Anime Row */}
        <AnimeRow
          title="Most Popular"
          icon={<Star className="w-6 h-6 fill-amber-400" />}
          animeList={popularAnime}
          viewAllLink="/popular"
        />

        {/* Recently Added Row */}
        <AnimeRow
          title="Recently Added"
          icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
          animeList={recentlyAdded}
          viewAllLink="/browse"
        />

        {/* Genre Grid Feature Banner */}
        <section className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/40 via-[#171717] to-[#111111] border border-red-600/30 rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="text-red-500 text-xs font-bold uppercase tracking-widest bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full">
                Explore Categories
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
                Discover Anime by Genre
              </h3>
              <p className="text-sm text-neutral-400">
                From high-octane Action and dark Fantasy to wholesome Slice of Life — find exactly what you're in the mood for.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {GENRES_LIST.slice(0, 8).map((genre) => (
                  <Link
                    key={genre}
                    to={`/genres?genre=${encodeURIComponent(genre)}`}
                    className="bg-black/60 hover:bg-red-600 text-neutral-300 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/genres"
              className="relative z-10 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-red-900/40 hover:scale-105 transition-all"
            >
              Browse All Genres
            </Link>
          </div>
        </section>

        {/* Latest Episode Releases */}
        <AnimeRow
          title="Latest Episodes"
          icon={<Clock className="w-6 h-6 text-emerald-400" />}
          animeList={latestEpisodes}
          viewAllLink="/browse"
        />

        {/* Top Rated Anime */}
        <AnimeRow
          title="Top Rated All Time"
          icon={<Trophy className="w-6 h-6 text-amber-500" />}
          animeList={topRated}
          viewAllLink="/browse"
        />

      </main>

    </div>
  );
};
