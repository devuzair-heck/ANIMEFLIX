import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#171717] rounded-xl overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[2/3] w-full bg-neutral-800/60" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-neutral-800/80 rounded w-3/4" />
        <div className="flex justify-between items-center mt-1">
          <div className="h-3 bg-neutral-800/60 rounded w-1/3" />
          <div className="h-3 bg-neutral-800/60 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const LoadingGrid: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading AnimeFlix...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-[#DC143C]/20 border-t-[#DC143C] rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</span>
    </div>
  );
};
