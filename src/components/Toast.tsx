import React from 'react';
import { Bookmark, Check, X } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useWatchlist();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#171717] text-white px-5 py-3.5 rounded-xl border border-red-600/30 shadow-2xl shadow-red-950/30 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
        <Bookmark className="w-5 h-5 fill-red-500" />
      </div>
      <span className="text-sm font-medium">{toastMessage}</span>
      <button
        onClick={clearToast}
        className="ml-2 text-neutral-400 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
