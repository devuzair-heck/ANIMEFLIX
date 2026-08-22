import mongoose, { Schema, Document } from 'mongoose';

export interface IGenre extends Document {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  animeCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema = new Schema<IGenre>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: '', trim: true },
    color: { type: String, default: '#DC143C' },
    animeCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Genre = mongoose.models.Genre || mongoose.model<IGenre>('Genre', GenreSchema);
