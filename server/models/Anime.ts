import mongoose, { Schema, Document } from 'mongoose';

export interface IEpisode {
  id: string;
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl?: string;
  airDate?: string;
  description?: string;
  language?: string;
  subtitle?: string;
  isDubbed?: boolean;
  isPublished?: boolean;
}

export interface ICharacter {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string;
  voiceActor: string;
}

export interface IAnime extends Document {
  id: string;
  slug: string;
  title: string;
  japaneseTitle: string;
  description: string;
  poster: string;
  banner: string;
  trailerUrl?: string;
  rating: number;
  year: number;
  genres: string[];
  episodesCount: number;
  status: 'Ongoing' | 'Completed';
  type: 'TV' | 'Movie' | 'OVA';
  studio: string;
  duration: string;
  language?: string;
  isSubbed: boolean;
  isDubbed: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
  isTopRated?: boolean;
  isRecentlyAdded?: boolean;
  featuredInHero?: boolean;
  episodes: IEpisode[];
  characters?: ICharacter[];
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    duration: { type: String, default: '24m' },
    videoUrl: { type: String, default: '' },
    airDate: { type: String, default: '' },
    description: { type: String, default: '' },
    language: { type: String, default: 'Japanese' },
    subtitle: { type: String, default: 'English' },
    isDubbed: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { _id: false }
);

const CharacterSchema = new Schema<ICharacter>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['Main', 'Supporting'], default: 'Main' },
    image: { type: String, default: '' },
    voiceActor: { type: String, default: '' },
  },
  { _id: false }
);

const AnimeSchema = new Schema<IAnime>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    japaneseTitle: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    poster: { type: String, default: '' },
    banner: { type: String, default: '' },
    trailerUrl: { type: String, default: '' },
    rating: { type: Number, default: 8.0 },
    year: { type: Number, default: new Date().getFullYear() },
    genres: { type: [String], default: [] },
    episodesCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
    type: { type: String, enum: ['TV', 'Movie', 'OVA'], default: 'TV' },
    studio: { type: String, default: '' },
    duration: { type: String, default: '24m' },
    language: { type: String, default: 'Japanese' },
    isSubbed: { type: Boolean, default: true },
    isDubbed: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isTopRated: { type: Boolean, default: false },
    isRecentlyAdded: { type: Boolean, default: true },
    featuredInHero: { type: Boolean, default: false },
    episodes: { type: [EpisodeSchema], default: [] },
    characters: { type: [CharacterSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Anime = mongoose.models.Anime || mongoose.model<IAnime>('Anime', AnimeSchema);
