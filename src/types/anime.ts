export interface Episode {
  id: string;
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  airDate?: string;
  description?: string;
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
