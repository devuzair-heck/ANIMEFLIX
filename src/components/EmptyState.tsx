import React from 'react';
import { Film, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onClear?: () => void;
  clearLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No anime found',
  message = 'We couldn\'t find any anime matching your current search or filters. Try adjusting your selections.',
  onClear,
  clearLabel = 'Clear Filters',
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#111111]/80 border border-white/5 rounded-2xl my-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#DC143C] mb-4 shadow-xl">
        <Film className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">{message}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-[#b01030] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-sm transition-colors shadow-lg shadow-red-950/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{clearLabel}</span>
        </button>
      )}
    </div>
  );
};
