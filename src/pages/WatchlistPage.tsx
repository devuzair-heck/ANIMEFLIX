import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Play, Sparkles } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { AnimeCard } from '../components/AnimeCard';

export const WatchlistPage: React.FC = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed'>('all');

  const filteredWatchlist = watchlist.filter((anime) => {
    if (activeTab === 'ongoing') return anime.status === 'Ongoing';
    if (activeTab === 'completed') return anime.status === 'Completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest mb-2">
          <Bookmark className="w-4 h-4 fill-red-500" />
          <span>My Personal Collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          My <span className="text-red-600">Watchlist</span>
        </h1>
        <p className="text-neutral-400 text-sm mt-2">
          Manage your saved anime series. Changes are automatically synchronized in local memory.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
        {[
          { id: 'all', label: `All Saved (${watchlist.length})` },
          { id: 'ongoing', label: `Currently Airing (${watchlist.filter((a) => a.status === 'Ongoing').length})` },
          { id: 'completed', label: `Completed (${watchlist.filter((a) => a.status === 'Completed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'bg-[#171717] hover:bg-neutral-800 text-neutral-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {filteredWatchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredWatchlist.map((anime) => (
            <div key={anime.id} className="relative group">
              <AnimeCard anime={anime} />
              <button
                onClick={() => removeFromWatchlist(anime.id)}
                className="absolute top-2 right-2 z-30 p-2 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                title="Remove from Watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
          <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Your Watchlist is Empty</h3>
          <p className="text-sm text-neutral-400 mb-6">
            You haven't added any anime to your watchlist yet. Click the bookmark icon on any anime card to save it for later.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-red-900/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Anime Catalog</span>
          </Link>
        </div>
      )}

    </div>
  );
};
