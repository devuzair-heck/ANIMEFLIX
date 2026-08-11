import React, { useState } from 'react';
import { Film, ImageOff } from 'lucide-react';

interface AnimeImageProps {
  src?: string;
  alt: string;
  type?: 'poster' | 'banner' | 'thumbnail';
  animeTitle?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

export const AnimeImage: React.FC<AnimeImageProps> = ({
  src,
  alt,
  type = 'poster',
  animeTitle,
  className = '',
  loading = 'lazy',
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const displayTitle = animeTitle || alt || 'AnimeFlix';

  // Determine standard aspect ratio class if not overridden by caller
  const aspectClass =
    type === 'poster'
      ? 'aspect-[2/3]'
      : type === 'banner'
      ? 'aspect-[16/9] md:aspect-[21/9]'
      : 'aspect-[16/9]';

  // Fallback UI when image fails to load or is missing
  if (hasError || !src) {
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden bg-gradient-to-br from-[#181824] via-[#0f0f18] to-[#0a0a0f] border border-white/10 flex flex-col items-center justify-center p-4 text-center select-none ${aspectClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-2 max-w-full px-2">
          {/* AnimeFlix Brand Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 text-[10px] font-bold tracking-widest uppercase">
            <Film className="w-3 h-3 text-red-500" />
            <span>ANIMEFLIX</span>
          </div>

          {/* Anime Title */}
          <h4 className="text-xs sm:text-sm font-semibold text-gray-200 line-clamp-2 leading-tight">
            {displayTitle}
          </h4>

          {/* Type Badge */}
          <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
            {type}
          </span>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-red-600/20 to-transparent" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-[#12121c] ${className}`}
    >
      {/* Skeleton Shimmer Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
