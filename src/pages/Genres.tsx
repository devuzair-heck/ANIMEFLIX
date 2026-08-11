import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { DEMO_ANIME, GENRES_LIST } from '../utils/animeData';

// Background images for genre cards
const GENRE_IMAGES: Record<string, string> = {
  Action: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
  Adventure: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
  Comedy: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
  Drama: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  Fantasy: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
  Romance: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
  Horror: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
  Mystery: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  'Sci-Fi': 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
  Sports: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
  Supernatural: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
  Thriller: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
  Historical: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
  Music: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
  School: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
  'Martial Arts': 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
};

export const Genres: React.FC = () => {
  const navigate = useNavigate();

  const handleGenreClick = (genre: string) => {
    navigate(`/browse?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#DC143C] font-bold text-xs uppercase tracking-widest mb-2">
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-10 bg-[#DC143C] hidden sm:block" />
            <span>Explore <span className="text-[#DC143C]">Anime Genres</span></span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl">
            Choose a genre to instantly view all matching anime titles in our catalog.
          </p>
        </div>

        {/* Genre Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {GENRES_LIST.map((genre) => {
            const count = DEMO_ANIME.filter((a) =>
              a.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
            ).length;

            const bgImage = GENRE_IMAGES[genre] || GENRE_IMAGES.Action;

            return (
              <div
                key={genre}
                onClick={() => handleGenreClick(genre)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleGenreClick(genre);
                  }
                }}
                className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-white/10 hover:border-[#DC143C] transition-all duration-300 cursor-pointer shadow-xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#DC143C]"
              >
                {/* Background Image */}
                <img
                  src={bgImage}
                  alt={genre}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-75"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 group-hover:via-black/40 transition-colors" />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#DC143C]/20 border border-[#DC143C]/40 text-[#DC143C] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {count} {count === 1 ? 'Title' : 'Titles'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white group-hover:bg-[#DC143C] transition-colors">
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-[#DC143C] transition-colors flex items-center gap-2">
                      <span>{genre}</span>
                      <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Discover top rated {genre.toLowerCase()} anime
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
