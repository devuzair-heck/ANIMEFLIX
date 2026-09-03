import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Genre, IGenre } from '../models/Genre.js';
import { Anime } from '../models/Anime.js';

// Default Genres preset
export const DEFAULT_GENRES: Array<Partial<IGenre>> = [
  { id: 'action', name: 'Action', slug: 'action', description: 'High-octane excitement, battles, martial arts, and heroic adventures.', color: '#DC143C' },
  { id: 'adventure', name: 'Adventure', slug: 'adventure', description: 'Expeditions to uncharted realms, treasure quests, and world discovery.', color: '#f59e0b' },
  { id: 'comedy', name: 'Comedy', slug: 'comedy', description: 'Humorous escapades, witty banter, and laugh-out-loud moments.', color: '#10b981' },
  { id: 'drama', name: 'Drama', slug: 'drama', description: 'Deep character-driven narratives, emotional depth, and moral dilemmas.', color: '#8b5cf6' },
  { id: 'fantasy', name: 'Fantasy', slug: 'fantasy', description: 'Magic, mythical creatures, enchanted kingdoms, and spells.', color: '#ec4899' },
  { id: 'horror', name: 'Horror', slug: 'horror', description: 'Supernatural chills, psychological suspense, and terrifying monsters.', color: '#ef4444' },
  { id: 'mystery', name: 'Mystery', slug: 'mystery', description: 'Intricate whodunits, detectives, clues, and unsolved riddles.', color: '#06b6d4' },
  { id: 'romance', name: 'Romance', slug: 'romance', description: 'Love stories, romantic chemistry, heartbreak, and emotional bonds.', color: '#f43f5e' },
  { id: 'sci-fi', name: 'Sci-Fi', slug: 'sci-fi', description: 'Futuristic technology, space exploration, cybernetics, and time travel.', color: '#3b82f6' },
  { id: 'shonen', name: 'Shonen', slug: 'shonen', description: 'Inspiring growth, fierce tournaments, and enduring bonds of friendship.', color: '#f97316' },
  { id: 'slice-of-life', name: 'Slice of Life', slug: 'slice-of-life', description: 'Everyday moments, school life, friendship, and gentle relaxing humor.', color: '#14b8a6' },
  { id: 'supernatural', name: 'Supernatural', slug: 'supernatural', description: 'Ghosts, spirits, deities, esoteric powers, and occult phenomena.', color: '#a855f7' },
  { id: 'sports', name: 'Sports', slug: 'sports', description: 'Athletic competitions, high teamwork, championships, and training discipline.', color: '#22c55e' },
  { id: 'psychological', name: 'Psychological', slug: 'psychological', description: 'Mind games, manipulation, philosophical introspection, and thrillers.', color: '#6366f1' },
  { id: 'mecha', name: 'Mecha', slug: 'mecha', description: 'Giant robotic machines, futuristic battle armor, and planetary wars.', color: '#64748b' },
];

export const inMemoryGenres: IGenre[] = DEFAULT_GENRES.map((g) => ({
  ...g,
  animeCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as IGenre));

// Compute initial counts from database
async function updateGenreCounts() {
  if (mongoose.connection.readyState === 1) {
    try {
      const animes: any[] = await (Anime as any).find({}, { genres: 1 }).lean();
      inMemoryGenres.forEach((genre) => {
        genre.animeCount = animes.filter((a: any) =>
          a.genres?.some((g: string) => g.toLowerCase() === genre.name.toLowerCase() || g.toLowerCase() === (genre.slug || '').toLowerCase())
        ).length;
      });
    } catch {
      // Ignored
    }
  }
}
updateGenreCounts();

export const genreController = {
  /**
   * GET /api/genres
   */
  async getAllGenres(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      updateGenreCounts();

      let genres: IGenre[] = [];
      if (mongoose.connection.readyState === 1) {
        try {
          genres = await (Genre as any).find({}).sort({ name: 1 }).lean();
        } catch {
          // Fallback
        }
      }

      if (genres.length === 0) {
        genres = inMemoryGenres;
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.toLowerCase();
        genres = genres.filter((g) => g.name.toLowerCase().includes(s) || g.description.toLowerCase().includes(s));
      }

      res.status(200).json({
        success: true,
        count: genres.length,
        data: genres,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve genres' });
    }
  },

  /**
   * POST /api/genres
   */
  async createGenre(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, color } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Genre name is required' });
        return;
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const id = slug || `genre-${Date.now()}`;

      const newGenre = {
        id,
        name: name.trim(),
        slug,
        description: (description || '').trim(),
        color: color || '#DC143C',
        animeCount: 0,
      };

      let created: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          created = await Genre.create(newGenre);
        } catch {
          // Fallback
        }
      }

      if (!created) {
        created = {
          ...newGenre,
          _id: `gen-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryGenres.push(created);
      }

      res.status(201).json({
        success: true,
        message: 'Genre created successfully',
        data: created,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create genre' });
    }
  },

  /**
   * PUT /api/genres/:id
   */
  async updateGenre(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    try {
      if (updates.name) {
        updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      let updatedDoc: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          updatedDoc = await (Genre as any).findOneAndUpdate({ $or: [{ id }, { slug: id }] }, { $set: updates }, { new: true }).lean();
        } catch {
          // Fallback
        }
      }

      const index = inMemoryGenres.findIndex((g) => g.id === id || g.slug === id);
      if (index !== -1) {
        inMemoryGenres[index] = {
          ...inMemoryGenres[index],
          ...updates,
          updatedAt: new Date(),
        };
        if (!updatedDoc) updatedDoc = inMemoryGenres[index];
      }

      if (!updatedDoc) {
        res.status(404).json({ success: false, message: 'Genre not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Genre updated successfully',
        data: updatedDoc,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update genre' });
    }
  },

  /**
   * DELETE /api/genres/:id
   */
  async deleteGenre(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      let deleted = false;
      if (mongoose.connection.readyState === 1) {
        try {
          const resDb = await (Genre as any).deleteOne({ $or: [{ id }, { slug: id }] });
          if (resDb.deletedCount > 0) deleted = true;
        } catch {
          // Fallback
        }
      }

      const index = inMemoryGenres.findIndex((g) => g.id === id || g.slug === id);
      if (index !== -1) {
        inMemoryGenres.splice(index, 1);
        deleted = true;
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Genre not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Genre deleted successfully',
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete genre' });
    }
  },
};
