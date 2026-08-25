export interface Episode {
  _id?: string;
  id: string;
  animeId?: string;
  animeTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl?: string;
  releaseDate?: string;
  airDate?: string;
  description?: string;
  language?: string;
  subtitle?: string;
  isDubbed?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoStream {
  id: string;
  animeId: string;
  animeTitle: string;
  episodeId: string;
  episodeNumber: number;
  videoUrl: string;
  videoType: 'MP4' | 'HLS' | 'Embed';
  quality: '1080p' | '720p' | '480p' | 'Auto';
  language: string;
  subDub: 'SUB' | 'DUB' | 'BOTH';
  serverName: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface GenreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  animeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string;
  voiceActor: string;
}

export interface Anime {
  id: string;
  slug: string;
  title: string;
  japaneseTitle: string;
  description: string;
  poster: string;
  banner: string;
  rating: number;
  year: number;
  genres: string[];
  episodesCount: number;
  status: 'Ongoing' | 'Completed';
  type: 'TV' | 'Movie' | 'OVA';
  studio: string;
  duration: string;
  language?: string;
  trailerUrl?: string;
  isSubbed: boolean;
  isDubbed: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
  isTopRated?: boolean;
  isRecentlyAdded?: boolean;
  episodes: Episode[];
  characters?: Character[];
  featuredInHero?: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  genre: string;
  type: string;
  status: string;
  year: string;
  sortBy: 'popularity' | 'rating' | 'latest' | 'title';
}
