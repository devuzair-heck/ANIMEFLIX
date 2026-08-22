import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    id: { type: String, required: true, unique: true, index: true },
    animeId: { type: String, required: true, index: true },
    animeTitle: { type: String, required: true, trim: true },
    episodeId: { type: String, required: true, index: true },
    episodeNumber: { type: Number, required: true },
    videoUrl: { type: String, required: true, trim: true },
    videoType: { type: String, enum: ['MP4', 'HLS', 'Embed'], default: 'MP4' },
    quality: { type: String, enum: ['1080p', '720p', '480p', 'Auto'], default: '1080p' },
    language: { type: String, default: 'Japanese' },
    subDub: { type: String, enum: ['SUB', 'DUB', 'BOTH'], default: 'SUB' },
    serverName: { type: String, default: 'Server 1 (Primary - HD)' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  {
    timestamps: true,
  }
);

export const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
