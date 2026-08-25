import mongoose, { Schema, Document } from 'mongoose';

export interface IEpisodeDoc extends Document {
  id: string;
  animeId: string;
  animeTitle?: string;
  seasonNumber: number;
  episodeNumber: number;
  number: number; // Aliased to episodeNumber for backward compatibility
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  releaseDate: string;
  airDate?: string;
  isPublished: boolean;
  isDubbed: boolean;
  language: string;
  subtitle: string;
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisodeDoc>(
  {
    id: { type: String, required: true, index: true },
    animeId: { type: String, required: true, index: true, trim: true },
    animeTitle: { type: String, default: '', trim: true },
    seasonNumber: { type: Number, required: true, default: 1, min: 1 },
    episodeNumber: { type: Number, required: true, min: 1 },
    number: { type: Number, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    thumbnail: { type: String, default: '', trim: true },
    videoUrl: { type: String, required: true, trim: true },
    duration: { type: String, default: '24:00', trim: true },
    releaseDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    airDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    isPublished: { type: Boolean, default: true },
    isDubbed: { type: Boolean, default: false },
    language: { type: String, default: 'Japanese', trim: true },
    subtitle: { type: String, default: 'English', trim: true },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate episode numbers inside the same anime & season
EpisodeSchema.index({ animeId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });

// Pre-save hook to ensure number matches episodeNumber and id is generated if missing
EpisodeSchema.pre('save', function () {
  if (!this.number) {
    this.number = this.episodeNumber;
  }
  if (!this.episodeNumber && this.number) {
    this.episodeNumber = this.number;
  }
  if (!this.id) {
    this.id = `${this.animeId}-s${this.seasonNumber || 1}-ep${this.episodeNumber}`;
  }
  if (!this.airDate && this.releaseDate) {
    this.airDate = this.releaseDate;
  }
  if (!this.releaseDate && this.airDate) {
    this.releaseDate = this.airDate;
  }
});

export const Episode = mongoose.models.Episode || mongoose.model<IEpisodeDoc>('Episode', EpisodeSchema);
