import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Anime, IAnime, IEpisode } from '../models/Anime.js';
import { Episode } from '../models/Episode.js';
import { INITIAL_ANIME_SEED } from '../data/defaultCatalog.js';
import { connectDB } from '../config/db.js';

// In-memory fallback anime store for resilient operation when MongoDB is offline
export const inMemoryAnimeList: IAnime[] = [...(INITIAL_ANIME_SEED as unknown as IAnime[])];

/**
 * Helper to seed initial anime catalog if database is empty
 */
export async function seedInitialAnimeCatalog(demoAnimeList?: any[]): Promise<void> {
  try {
    await connectDB();
    const seedList = demoAnimeList && demoAnimeList.length > 0 ? demoAnimeList : INITIAL_ANIME_SEED;
    const count = await (Anime as any).countDocuments();
    if (count === 0 && seedList && seedList.length > 0) {
      await Anime.insertMany(seedList);
      console.log(`[Anime Seed] ${seedList.length} anime seeded into MongoDB.`);
    } else {
      console.log(`[Anime DB] MongoDB contains ${count} anime documents.`);
    }
  } catch (err) {
    console.warn('[Anime Seed] MongoDB check notice:', err);
    // In-memory fallback
    if (inMemoryAnimeList.length === 0) {
      const fallbackList = demoAnimeList && demoAnimeList.length > 0 ? demoAnimeList : INITIAL_ANIME_SEED;
      fallbackList.forEach((item) => {
        inMemoryAnimeList.push({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as IAnime);
      });
      console.log(`[Anime Fallback] ${inMemoryAnimeList.length} anime initialized in memory store.`);
    }
  }
}

export const animeController = {
  /**
   * GET /api/anime
   * Returns list of anime with optional query filters
   */
  async getAllAnime(req: Request, res: Response): Promise<void> {
    try {
      await connectDB();
      const { search, genre, status, type, sortBy } = req.query;

      let query: any = {};
      if (genre && typeof genre === 'string' && genre !== 'All') {
        query.genres = { $in: [new RegExp(`^${genre}$`, 'i')] };
      }
      if (status && typeof status === 'string' && status !== 'All') {
        query.status = new RegExp(`^${status}$`, 'i');
      }
      if (type && typeof type === 'string' && type !== 'All') {
        query.type = new RegExp(`^${type}$`, 'i');
      }
      if (search && typeof search === 'string' && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: searchRegex }, { japaneseTitle: searchRegex }, { description: searchRegex }];
      }

      let animeList: IAnime[] = [];
      try {
        let findQuery = (Anime as any).find(query);
        if (sortBy === 'rating') findQuery = findQuery.sort({ rating: -1 });
        else if (sortBy === 'latest' || sortBy === 'year') findQuery = findQuery.sort({ year: -1, createdAt: -1 });
        else if (sortBy === 'title') findQuery = findQuery.sort({ title: 1 });
        else findQuery = findQuery.sort({ createdAt: -1 });

        animeList = await findQuery.lean();
      } catch {
        // Fallback to in-memory filter
        animeList = inMemoryAnimeList.filter((a) => {
          if (genre && genre !== 'All' && !a.genres.some((g) => g.toLowerCase() === String(genre).toLowerCase())) return false;
          if (status && status !== 'All' && a.status.toLowerCase() !== String(status).toLowerCase()) return false;
          if (type && type !== 'All' && a.type.toLowerCase() !== String(type).toLowerCase()) return false;
          if (search && typeof search === 'string' && search.trim()) {
            const s = search.toLowerCase();
            const matches =
              a.title.toLowerCase().includes(s) ||
              (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(s)) ||
              (a.description && a.description.toLowerCase().includes(s));
            if (!matches) return false;
          }
          return true;
        });

        if (sortBy === 'rating') animeList.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'title') animeList.sort((a, b) => a.title.localeCompare(b.title));
        else animeList.sort((a, b) => b.year - a.year);
      }

      res.status(200).json({
        success: true,
        count: animeList.length,
        data: animeList,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve anime catalog' });
    }
  },

  /**
   * GET /api/anime/:id
   * Fetch single anime by ID or slug
   */
  async getAnimeById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim() || id === 'undefined' || id === 'null' || id === '[object Object]') {
      res.status(400).json({ success: false, message: 'Invalid anime ID parameter' });
      return;
    }

    try {
      await connectDB();
      const cleanId = id.trim();
      let anime: any = null;
      try {
        if (mongoose.Types.ObjectId.isValid(cleanId)) {
          anime = await (Anime as any).findById(cleanId).lean();
        }
        if (!anime) {
          anime = await (Anime as any).findOne({ $or: [{ id: cleanId }, { slug: cleanId }] }).lean();
        }
      } catch (dbErr) {
        console.warn('[Anime getAnimeById] MongoDB query warning:', dbErr);
      }

      if (!anime) {
        anime = inMemoryAnimeList.find(
          (a) => (a as any)._id === cleanId || a.id === cleanId || a.slug === cleanId
        ) || null;
      }

      if (!anime) {
        res.status(404).json({ success: false, message: 'Anime not found' });
        return;
      }

      if (anime && anime._id) {
        anime._id = String(anime._id);
      }

      res.status(200).json({ success: true, data: anime, anime });
    } catch {
      res.status(500).json({ success: false, message: 'Error retrieving anime' });
    }
  },

  /**
   * POST /api/anime
   * Admin: Add new anime
   */
  async createAnime(req: Request, res: Response): Promise<void> {
    try {
      await connectDB();
      const {
        title,
        japaneseTitle,
        description,
        genre,
        genres,
        releaseYear,
        year,
        status,
        rating,
        totalEpisodes,
        episodesCount,
        type,
        studio,
        duration,
        language,
        poster,
        posterImage,
        banner,
        bannerImage,
        trailerUrl,
        isFeatured,
        featured,
        isTrending,
        trending,
        isPopular,
        popular,
      } = req.body;

      if (!title || !title.trim()) {
        res.status(400).json({ success: false, message: 'Anime title is required.' });
        return;
      }

      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `anime-${Date.now()}`;

      let generatedSlug = baseSlug;
      let finalId = req.body.id || baseSlug;

      // Ensure slug and id uniqueness in database
      try {
        const existingDoc = await (Anime as any).findOne({ $or: [{ id: finalId }, { slug: generatedSlug }] });
        if (existingDoc) {
          const suffix = Math.random().toString(36).substring(2, 7);
          generatedSlug = `${baseSlug}-${suffix}`;
          finalId = req.body.id ? `${req.body.id}-${suffix}` : generatedSlug;
        }
      } catch {
        // Handled
      }

      // Normalize genres array
      let finalGenres: string[] = [];
      if (Array.isArray(genres)) finalGenres = genres;
      else if (typeof genre === 'string' && genre.trim()) {
        finalGenres = genre.split(',').map((g) => g.trim()).filter(Boolean);
      } else if (Array.isArray(genre)) {
        finalGenres = genre;
      }

      const finalYear = Number(releaseYear || year) || new Date().getFullYear();
      const finalRating = Number(rating) || 8.0;
      const finalEpisodesCount = Number(totalEpisodes || episodesCount) || 12;
      const finalPoster = poster || posterImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
      const finalBanner = banner || bannerImage || finalPoster;

      const newAnimeData = {
        id: finalId,
        slug: generatedSlug,
        title: title.trim(),
        japaneseTitle: (japaneseTitle || '').trim(),
        description: (description || '').trim(),
        poster: finalPoster,
        banner: finalBanner,
        trailerUrl: trailerUrl || '',
        rating: finalRating,
        year: finalYear,
        genres: finalGenres.length > 0 ? finalGenres : ['Action', 'Fantasy'],
        episodesCount: finalEpisodesCount,
        status: status === 'Completed' ? 'Completed' : 'Ongoing',
        type: type === 'Movie' || type === 'OVA' ? type : 'TV',
        studio: (studio || 'Unknown Studio').trim(),
        duration: duration || '24m',
        language: language || 'Japanese',
        isSubbed: true,
        isDubbed: req.body.isDubbed ?? false,
        isTrending: Boolean(isTrending ?? trending),
        isPopular: Boolean(isPopular ?? popular),
        isTopRated: finalRating >= 8.5,
        isRecentlyAdded: true,
        featuredInHero: Boolean(isFeatured ?? featured),
        episodes: Array.isArray(req.body.episodes) && req.body.episodes.length > 0
          ? req.body.episodes
          : Array.from({ length: Math.min(finalEpisodesCount, 12) }, (_, i) => ({
              id: `${finalId}-ep-${i + 1}`,
              number: i + 1,
              title: `Episode ${i + 1}`,
              thumbnail: finalBanner,
              duration: duration || '24m',
              airDate: `${finalYear}-01-01`,
              description: `Episode ${i + 1} of ${title}.`,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              language: language || 'Japanese',
              subtitle: 'English',
              isDubbed: false,
              isPublished: true,
            })),
        characters: req.body.characters || [],
      };

      let createdAnime: any = null;
      try {
        const createdDoc = await Anime.create(newAnimeData);
        createdAnime = createdDoc.toObject ? createdDoc.toObject() : createdDoc;
      } catch (dbErr) {
        console.warn('[createAnime] MongoDB insert notice:', dbErr);
        // In-memory fallback
        createdAnime = {
          ...newAnimeData,
          _id: `anime-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryAnimeList.unshift(createdAnime);
      }

      if (createdAnime && createdAnime._id) {
        createdAnime._id = String(createdAnime._id);
      }

      res.status(201).json({
        success: true,
        message: 'Anime added successfully',
        data: createdAnime,
        anime: createdAnime,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create anime entry' });
    }
  },

  /**
   * PUT /api/anime/:id
   * Admin: Update anime without duplicating or deleting records
   */
  async updateAnime(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim() || id === 'undefined' || id === 'null' || id === '[object Object]') {
      res.status(400).json({ success: false, message: 'Invalid anime ID parameter' });
      return;
    }

    try {
      await connectDB();
      const cleanId = id.trim();
      const updates = { ...req.body };
      // Critical: Never allow _id, __v, or unique ID/slug fields to be corrupted during update
      delete updates._id;
      delete updates.__v;
      delete updates.id;
      delete updates.slug;

      // Clean up aliases and normalize numeric fields
      if (updates.posterImage) updates.poster = updates.posterImage;
      if (updates.bannerImage) updates.banner = updates.bannerImage;
      if (updates.releaseYear !== undefined) updates.year = Number(updates.releaseYear);
      if (updates.totalEpisodes !== undefined) updates.episodesCount = Number(updates.totalEpisodes);
      if (updates.episodesCount !== undefined) updates.episodesCount = Number(updates.episodesCount);
      if (updates.rating !== undefined) updates.rating = Number(updates.rating);
      if (updates.year !== undefined) updates.year = Number(updates.year);
      if (updates.genres && Array.isArray(updates.genres)) {
        updates.genres = updates.genres.map((g: any) => String(g).trim()).filter(Boolean);
      } else if (updates.genre && typeof updates.genre === 'string') {
        updates.genres = updates.genre.split(',').map((g: string) => g.trim()).filter(Boolean);
      }

      let updatedDoc: any = null;

      // 1. Try finding and updating in MongoDB
      try {
        if (mongoose.Types.ObjectId.isValid(cleanId)) {
          updatedDoc = await (Anime as any).findByIdAndUpdate(
            cleanId,
            { $set: updates },
            { new: true, runValidators: false }
          ).lean();
        }
        if (!updatedDoc) {
          updatedDoc = await (Anime as any).findOneAndUpdate(
            { $or: [{ id: cleanId }, { slug: cleanId }] },
            { $set: updates },
            { new: true, runValidators: false }
          ).lean();
        }
      } catch (dbErr) {
        console.warn('[Anime Update] MongoDB findOneAndUpdate note:', dbErr);
      }

      // 2. Also update fallback in-memory store if present
      const memIndex = inMemoryAnimeList.findIndex(
        (a) => (a as any)._id === cleanId || a.id === cleanId || a.slug === cleanId
      );
      if (memIndex !== -1) {
        inMemoryAnimeList[memIndex] = {
          ...inMemoryAnimeList[memIndex],
          ...updates,
          updatedAt: new Date(),
        };
        if (!updatedDoc) {
          updatedDoc = inMemoryAnimeList[memIndex];
        }
      }

      if (!updatedDoc) {
        res.status(404).json({ success: false, message: 'Anime not found to update' });
        return;
      }

      if (updatedDoc && updatedDoc._id) {
        updatedDoc._id = String(updatedDoc._id);
      }

      res.status(200).json({
        success: true,
        message: 'Anime updated successfully',
        data: updatedDoc,
        anime: updatedDoc,
      });
    } catch (err: any) {
      console.error('[Anime Update] Internal server error:', err);
      res.status(500).json({ success: false, message: 'Failed to update anime' });
    }
  },

  /**
   * DELETE /api/anime/:id
   * Admin: Delete anime
   */
  async deleteAnime(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim() || id === 'undefined' || id === 'null' || id === '[object Object]') {
      res.status(400).json({ success: false, message: 'Invalid anime ID parameter' });
      return;
    }

    try {
      await connectDB();
      const cleanId = id.trim();
      let deleted = false;

      // 1. Try finding and deleting from MongoDB
      try {
        if (mongoose.Types.ObjectId.isValid(cleanId)) {
          const doc = await (Anime as any).findById(cleanId);
          if (doc) {
            await (Anime as any).deleteOne({ _id: doc._id });
            await (Episode as any).deleteMany({ $or: [{ animeId: String(doc._id) }, { animeId: doc.id }, { animeId: doc.slug }] }).catch(() => {});
            deleted = true;
          }
        }
        if (!deleted) {
          const existingDoc = await (Anime as any).findOne({ $or: [{ id: cleanId }, { slug: cleanId }] });
          if (existingDoc) {
            await (Anime as any).deleteOne({ _id: existingDoc._id });
            await (Episode as any).deleteMany({ $or: [{ animeId: String(existingDoc._id) }, { animeId: existingDoc.id }, { animeId: existingDoc.slug }] }).catch(() => {});
            deleted = true;
          }
        }
      } catch (dbErr) {
        console.warn('[Anime Delete] MongoDB operation note:', dbErr);
      }

      // 2. Also remove from inMemoryAnimeList fallback store if present
      const memIndex = inMemoryAnimeList.findIndex(
        (a) => a.id === cleanId || a.slug === cleanId || (a as any)._id === cleanId
      );
      if (memIndex !== -1) {
        inMemoryAnimeList.splice(memIndex, 1);
        deleted = true;
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Anime not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Anime deleted successfully',
      });
    } catch (err: any) {
      console.error('[Anime Delete Error]', err);
      res.status(500).json({ success: false, message: err?.message || 'Failed to delete anime' });
    }
  },

  /**
   * GET /api/episodes
   * Admin: List all episodes across all anime or filtered by animeId
   */
  async getAllEpisodes(req: Request, res: Response): Promise<void> {
    try {
      const { animeId } = req.query;
      let allEpisodes: Array<IEpisode & { animeId: string; animeTitle: string }> = [];

      let animeList: IAnime[] = [];
      try {
        animeList = await (Anime as any).find({}).lean();
      } catch {
        animeList = inMemoryAnimeList;
      }

      if (animeList.length === 0) {
        animeList = inMemoryAnimeList;
      }

      for (const a of animeList) {
        if (animeId && a.id !== animeId && a.slug !== animeId) continue;
        if (Array.isArray(a.episodes)) {
          a.episodes.forEach((ep) => {
            allEpisodes.push({
              ...ep,
              animeId: a.id,
              animeTitle: a.title,
            });
          });
        }
      }

      res.status(200).json({
        success: true,
        count: allEpisodes.length,
        data: allEpisodes,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve episodes' });
    }
  },

  /**
   * GET /api/anime/:id/episodes
   */
  async getAnimeEpisodes(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      let anime: IAnime | null = null;
      try {
        anime = await (Anime as any).findOne({ $or: [{ id }, { slug: id }] }).lean();
      } catch {
        anime = inMemoryAnimeList.find((a) => a.id === id || a.slug === id) || null;
      }

      if (!anime) {
        res.status(404).json({ success: false, message: 'Anime not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: anime.episodes || [],
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve anime episodes' });
    }
  },

  /**
   * POST /api/anime/:id/episodes or POST /api/episodes
   * Admin: Add new episode
   */
  async addEpisode(req: Request, res: Response): Promise<void> {
    const animeId = req.params.id || req.body.animeId;

    if (!animeId) {
      res.status(400).json({ success: false, message: 'Anime ID is required' });
      return;
    }

    const {
      number,
      title,
      description,
      videoUrl,
      thumbnail,
      duration,
      airDate,
      language,
      subtitle,
      isDubbed,
      isPublished,
    } = req.body;

    const newEpisode: IEpisode = {
      id: req.body.id || `${animeId}-ep-${number || Date.now()}`,
      number: Number(number) || 1,
      title: title || `Episode ${number || 1}`,
      description: description || '',
      videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: thumbnail || '',
      duration: duration || '24m',
      airDate: airDate || new Date().toISOString().split('T')[0],
      language: language || 'Japanese',
      subtitle: subtitle || 'English',
      isDubbed: Boolean(isDubbed),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    };

    try {
      let updated = false;
      try {
        const doc = await (Anime as any).findOne({ $or: [{ id: animeId }, { slug: animeId }] });
        if (doc) {
          doc.episodes.push(newEpisode);
          doc.episodesCount = doc.episodes.length;
          await doc.save();
          updated = true;
        }
      } catch {
        // In-memory fallback
      }

      const memAnime = inMemoryAnimeList.find((a) => a.id === animeId || a.slug === animeId);
      if (memAnime) {
        if (!memAnime.episodes) memAnime.episodes = [];
        memAnime.episodes.push(newEpisode);
        memAnime.episodesCount = memAnime.episodes.length;
        updated = true;
      }

      if (!updated) {
        res.status(404).json({ success: false, message: 'Target anime not found' });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Episode added successfully',
        data: newEpisode,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to add episode' });
    }
  },

  /**
   * PUT /api/episodes/:id
   * Admin: Update episode
   */
  async updateEpisode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    try {
      let updated = false;
      let updatedEpisode: IEpisode | null = null;

      try {
        const animeDocs = await (Anime as any).find({ 'episodes.id': id });
        for (const doc of animeDocs) {
          const epIndex = doc.episodes.findIndex((e: any) => e.id === id);
          if (epIndex !== -1) {
            doc.episodes[epIndex] = { ...doc.episodes[epIndex].toObject(), ...updates };
            await doc.save();
            updatedEpisode = doc.episodes[epIndex];
            updated = true;
            break;
          }
        }
      } catch {
        // In-memory fallback
      }

      for (const a of inMemoryAnimeList) {
        if (!a.episodes) continue;
        const epIndex = a.episodes.findIndex((e) => e.id === id);
        if (epIndex !== -1) {
          a.episodes[epIndex] = { ...a.episodes[epIndex], ...updates };
          updatedEpisode = a.episodes[epIndex];
          updated = true;
          break;
        }
      }

      if (!updated) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Episode updated successfully',
        data: updatedEpisode,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update episode' });
    }
  },

  /**
   * DELETE /api/episodes/:id
   * Admin: Delete episode
   */
  async deleteEpisode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      let deleted = false;

      try {
        const animeDocs = await (Anime as any).find({ 'episodes.id': id });
        for (const doc of animeDocs) {
          const prevLen = doc.episodes.length;
          doc.episodes = doc.episodes.filter((e: any) => e.id !== id);
          if (doc.episodes.length < prevLen) {
            doc.episodesCount = doc.episodes.length;
            await doc.save();
            deleted = true;
            break;
          }
        }
      } catch {
        // In-memory fallback
      }

      for (const a of inMemoryAnimeList) {
        if (!a.episodes) continue;
        const prevLen = a.episodes.length;
        a.episodes = a.episodes.filter((e) => e.id !== id);
        if (a.episodes.length < prevLen) {
          a.episodesCount = a.episodes.length;
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Episode deleted successfully',
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete episode' });
    }
  },
};
