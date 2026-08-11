import React, { createContext, useContext, useState, useEffect } from 'react';
import { Anime } from '../types/anime';

interface WatchlistContextType {
  watchlist: Anime[];
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (anime: Anime) => void;
  toastMessage: string | null;
  clearToast: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Anime[]>(() => {
    try {
      const saved = localStorage.getItem('animeflix_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('animeflix_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToWatchlist = (anime: Anime) => {
    if (!isInWatchlist(anime.id)) {
      setWatchlist((prev) => [...prev, anime]);
      showToast(`Added "${anime.title}" to Watchlist`);
    }
  };

  const removeFromWatchlist = (id: string) => {
    const item = watchlist.find((a) => a.id === id);
    setWatchlist((prev) => prev.filter((a) => a.id !== id));
    if (item) {
      showToast(`Removed "${item.title}" from Watchlist`);
    }
  };

  const isInWatchlist = (id: string) => {
    return watchlist.some((a) => a.id === id);
  };

  const toggleWatchlist = (anime: Anime) => {
    if (isInWatchlist(anime.id)) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime);
    }
  };

  const clearToast = () => setToastMessage(null);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
