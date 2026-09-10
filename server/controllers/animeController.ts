import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Anime, IAnime, IEpisode } from '../models/Anime.js';
import { Episode } from '../models/Episode.js';
import { INITIAL_ANIME_SEED } from '../data/defaultCatalog.js';
import { connectDB } from '../config/db.js';

/**
 * Helper to seed initial anime catalog safely and idempotently.
 * NEVER drops, replaces, or deletes any existing records.
 * Only inserts a seed anime if neither its id nor slug already exists in MongoDB.
 */
export async function seedInitialAnimeCatalog(): Promise<void> {
  try {
    await connectDB();
    for (const item of INITIAL_ANIME_SEED) {
      const existing = await (Anime as any).findOne({
        $or: [{ id: item.id }, { slug: item.slug }],
      });
      if (!existing) {
        await (Anime as any).create(item);
        console.log(`[Anime Seed] Seeded missing default anime: ${item.title}`);
      }
    }
    const totalCount = await (Anime as any).countDocuments();
    console.log(`[Anime DB] Total anime documents in MongoDB: ${totalCount}`);
  } catch (err) {
    console.error('[Anime Seed Error] Could not verify/seed catalog in MongoDB:', err);
  }
}

export const animeController = {
  /**
   * GET /api/anime
   * Returns list of anime from MongoDB with optional query filters
   */
  async getAllAnime(req: Request, res: Response): Promise<void> {
    try {
      await connectDB();
      const { search, genre, status, type, sortBy } = req.query;

      const query: any = {};
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
        query.$or = [
          { title: searchRegex },
          { japaneseTitle: searchRegex },
          { description: searchRegex },
        ];
      }

      let findQuery = (Anime as any).find(query);
      if (sortBy === 'rating') {
        findQuery = findQuery.sort({ rating: -1 });
      } else if (sortBy === 'latest' || sortBy === 'year') {
        findQuery = findQuery.sort({ year: -1, createdAt: -1 });
      } else if (sortBy === 'title') {
        findQuery = findQuery.sort({ title: 1 });
      } else {
        findQuery = findQuery.sort({ createdAt: -1 });
      }

      const animeList = await findQuery.lean();

      res.status(200).json({
        success: true,
        count: animeList.length,
        data: animeList,
      });
    } catch (err: any) {
      console.warn('[getAllAnime Warning] MongoDB unavailable, serving catalog fallback:', err?.message || err);
      res.status(200).json({
        success: true,
        count: INITIAL_ANIME_SEED.length,
        data: INITIAL_ANIME_SEED,
        fallback: true,
      });
    }
  },

  /**
   * GET /api/anime/:id
   * Fetch single anime from MongoDB by _id, id, or slug
   */
  async getAnimeById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (
      !id ||
      typeof id !== 'string' ||
      !id.trim() ||
      id === 'undefined' ||
      id === 'null' ||
      id === '[object Object]'
    ) {
      res.status(400).json({ success: false, message: 'Invalid anime ID parameter' });
      return;
    }

    try {
      await connectDB();
      const cleanId = id.trim();
      let anime: any = null;

      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        anime = await (Anime as any).findById(cleanId).lean();
      }
      if (!anime) {
        anime = await (Anime as any).findOne({
          $or: [{ id: cleanId }, { slug: cleanId }],
        }).lean();
      }

      if (!anime) {
        res.status(404).json({ success: false, message: 'Anime not found in database' });
        return;
      }

      if (anime._id) {
        anime._id = String(anime._id);
      }

      res.status(200).json({ success: true, data: anime, anime });
    } catch (err: any) {
      console.warn('[getAnimeById Warning] Database error, checking fallback catalog:', err?.message || err);
      const targetId = id ? id.trim() : '';
      const fallbackItem = INITIAL_ANIME_SEED.find(
        (a) => a.id === targetId || a.slug === targetId
      );
      if (fallbackItem) {
        res.status(200).json({ success: true, data: fallbackItem, anime: fallbackItem, fallback: true });
        return;
      }
      res.status(404).json({
        success: false,
        message: 'Anime not found in database.',
      });
    }
  },

  /**
   * POST /api/anime
   * Admin: Add new anime directly into MongoDB and verify persistence
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

      const baseSlug =
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || `anime-${Date.now()}`;

      let generatedSlug = baseSlug;
      let finalId = req.body.id || baseSlug;

      // Ensure slug and id uniqueness in database
      const existingDoc = await (Anime as any).findOne({
        $or: [{ id: finalId }, { slug: generatedSlug }],
      });
      if (existingDoc) {
        const suffix = Math.random().toString(36).substring(2, 7);
        generatedSlug = `${baseSlug}-${suffix}`;
        finalId = req.body.id ? `${req.body.id}-${suffix}` : generatedSlug;
      }

      // Normalize genres array
      let finalGenres: string[] = [];
      if (Array.isArray(genres)) {
        finalGenres = genres.map((g: any) => String(g).trim()).filter(Boolean);
      } else if (typeof genre === 'string' && genre.trim()) {
        finalGenres = genre.split(',').map((g) => g.trim()).filter(Boolean);
      } else if (Array.isArray(genre)) {
        finalGenres = genre.map((g: any) => String(g).trim()).filter(Boolean);
      }

      const finalYear = Number(releaseYear || year) || new Date().getFullYear();
      const finalRating = Number(rating) || 8.0;
      const finalEpisodesCount = Number(totalEpisodes || episodesCount) || 12;
      const finalPoster =
        poster ||
        posterImage ||
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';
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
        episodes:
          Array.isArray(req.body.episodes) && req.body.episodes.length > 0
            ? req.body.episodes
            : Array.from({ length: Math.min(finalEpisodesCount, 24) }, (_, i) => ({
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

      // 1. Insert directly into MongoDB
      const createdDoc = await (Anime as any).create(newAnimeData);

      if (!createdDoc || !createdDoc._id) {
        res.status(500).json({
          success: false,
          message: 'Database error: MongoDB document creation returned empty result.',
        });
        return;
      }

      // 2. Perform verification fetch from MongoDB
      const verifiedDoc = await (Anime as any).findById(createdDoc._id).lean();

      if (!verifiedDoc) {
        res.status(500).json({
          success: false,
          message: 'Database persistence verification failed: Document was not found in MongoDB after insert.',
        });
        return;
      }

      verifiedDoc._id = String(verifiedDoc._id);

      console.log(`[ANIME CREATE]
id: ${verifiedDoc._id}
title: ${verifiedDoc.title}
episodesCount: ${verifiedDoc.episodesCount}
timestamp: ${new Date().toISOString()}
route: POST /api/anime`);

      res.status(201).json({
        success: true,
        message: 'Anime added successfully to database',
        data: verifiedDoc,
        anime: verifiedDoc,
      });
    } catch (err: any) {
      console.error('[createAnime Error]', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to create anime document in database',
      });
    }
  },

  /**
   * PUT /api/anime/:id
   * Admin: Update anime in MongoDB without recreating or deleting document
   */
  async updateAnime(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (
      !id ||
      typeof id !== 'string' ||
      !id.trim() ||
      id === 'undefined' ||
      id === 'null' ||
      id === '[object Object]'
    ) {
      res.status(400).json({ success: false, message: 'Invalid anime ID parameter' });
      return;
    }

    try {
      await connectDB();
      const cleanId = id.trim();

      // Find existing document first to ensure it exists and preserve its identity
      let existingDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        existingDoc = await (Anime as any).findById(cleanId);
      }
      if (!existingDoc) {
        existingDoc = await (Anime as any).findOne({
          $or: [{ id: cleanId }, { slug: cleanId }],
        });
      }

      if (!existingDoc) {
        res.status(404).json({ success: false, message: 'Anime not found in database to update' });
        return;
      }

      const updates: Record<string, any> = {};

      if (req.body.title !== undefined && String(req.body.title).trim()) {
        updates.title = String(req.body.title).trim();
      }
      if (req.body.japaneseTitle !== undefined) {
        updates.japaneseTitle = String(req.body.japaneseTitle).trim();
      }
      if (req.body.description !== undefined) {
        updates.description = String(req.body.description).trim();
      }
      if (req.body.poster || req.body.posterImage) {
        updates.poster = String(req.body.poster || req.body.posterImage).trim();
      }
      if (req.body.banner || req.body.bannerImage) {
        updates.banner = String(req.body.banner || req.body.bannerImage).trim();
      }
      if (req.body.releaseYear !== undefined || req.body.year !== undefined) {
        updates.year = Number(req.body.releaseYear || req.body.year);
      }
      if (req.body.status !== undefined) {
        updates.status = req.body.status === 'Completed' ? 'Completed' : 'Ongoing';
      }
      if (req.body.type !== undefined) {
        updates.type = req.body.type;
      }
      if (req.body.rating !== undefined) {
        updates.rating = Number(req.body.rating);
        updates.isTopRated = updates.rating >= 8.5;
      }
      if (req.body.studio !== undefined) {
        updates.studio = String(req.body.studio).trim();
      }
      if (req.body.duration !== undefined) {
        updates.duration = String(req.body.duration).trim();
      }
      if (req.body.language !== undefined) {
        updates.language = String(req.body.language).trim();
      }
      if (req.body.isSubbed !== undefined) {
        updates.isSubbed = Boolean(req.body.isSubbed);
      }
      if (req.body.isDubbed !== undefined) {
        updates.isDubbed = Boolean(req.body.isDubbed);
      }
      if (req.body.trailerUrl !== undefined) {
        updates.trailerUrl = String(req.body.trailerUrl).trim();
      }
      if (req.body.featuredInHero !== undefined || req.body.isFeatured !== undefined) {
        updates.featuredInHero = Boolean(req.body.featuredInHero ?? req.body.isFeatured);
      }
      if (req.body.isTrending !== undefined) {
        updates.isTrending = Boolean(req.body.isTrending);
      }
      if (req.body.isPopular !== undefined) {
        updates.isPopular = Boolean(req.body.isPopular);
      }

      // Handle genres
      if (Array.isArray(req.body.genres)) {
        updates.genres = req.body.genres.map((g: any) => String(g).trim()).filter(Boolean);
      } else if (typeof req.body.genre === 'string' && req.body.genre.trim()) {
        updates.genres = req.body.genre.split(',').map((g: string) => g.trim()).filter(Boolean);
      }

      // Safe episode count updates: preserve all existing episodes
      const newEpCount =
        req.body.episodesCount !== undefined
          ? Number(req.body.episodesCount)
          : req.body.totalEpisodes !== undefined
          ? Number(req.body.totalEpisodes)
          : undefined;

      if (newEpCount !== undefined && !isNaN(newEpCount) && newEpCount >= 0) {
        updates.episodesCount = newEpCount;
        const currentEpisodes = Array.isArray(existingDoc.episodes) ? [...existingDoc.episodes] : [];

        // If new count is greater than current episode objects, append new episode objects
        if (currentEpisodes.length < newEpCount) {
          const bannerToUse = updates.banner || existingDoc.banner || existingDoc.poster;
          for (let i = currentEpisodes.length; i < newEpCount; i++) {
            currentEpisodes.push({
              id: `${existingDoc.id}-ep-${i + 1}`,
              number: i + 1,
              title: `Episode ${i + 1}`,
              thumbnail: bannerToUse,
              duration: updates.duration || existingDoc.duration || '24m',
              airDate: new Date().toISOString().split('T')[0],
              description: `Episode ${i + 1} of ${updates.title || existingDoc.title}.`,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              language: updates.language || existingDoc.language || 'Japanese',
              subtitle: 'English',
              isDubbed: false,
              isPublished: true,
            });
          }
          updates.episodes = currentEpisodes;
        }
      }

      // Perform atomic update using $set to keep document ID and unchanged fields completely intact
      const updatedDoc = await (Anime as any).findByIdAndUpdate(
        existingDoc._id,
        { $set: updates },
        { new: true, runValidators: false }
      ).lean();

      if (!updatedDoc) {
        res.status(500).json({
          success: false,
          message: 'Database update failed: Document not returned from MongoDB after update.',
        });
        return;
      }

      updatedDoc._id = String(updatedDoc._id);

      console.log(`[ANIME UPDATE]
id: ${updatedDoc._id}
title: ${updatedDoc.title}
episodesCount: ${updatedDoc.episodesCount}
timestamp: ${new Date().toISOString()}
route: PUT /api/anime/${cleanId}`);

      res.status(200).json({
        success: true,
        message: 'Anime updated successfully in database',
        data: updatedDoc,
        anime: updatedDoc,
      });
    } catch (err: any) {
      console.error('[Anime Update Error]', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to update anime in MongoDB',
      });
    }
  },

  /**
   * DELETE /api/anime/:id
   * Admin: Explicitly delete an anime from MongoDB
   */
  async deleteAnime(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (
      !id ||
      typeof id !== 'string' ||
      !id.trim() ||
      id === 'undefined' ||
      id === 'null' ||
      id === '[object Object]'
    ) {
      res.status(400).json({ success: false, message: 'Invalid anime ID parameter' });
      return;
    }

    try {
      await connectDB();
      const cleanId = id.trim();

      let targetDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        targetDoc = await (Anime as any).findById(cleanId);
      }
      if (!targetDoc) {
        targetDoc = await (Anime as any).findOne({
          $or: [{ id: cleanId }, { slug: cleanId }],
        });
      }

      if (!targetDoc) {
        res.status(404).json({ success: false, message: 'Anime not found in database to delete' });
        return;
      }

      // Delete the anime document from MongoDB
      await (Anime as any).deleteOne({ _id: targetDoc._id });

      // Clean up any standalone Episode documents associated with this anime
      await (Episode as any).deleteMany({
        $or: [
          { animeId: String(targetDoc._id) },
          { animeId: targetDoc.id },
          { animeId: targetDoc.slug },
        ],
      }).catch(() => {});

      console.log(`[ANIME DELETE]
id: ${targetDoc._id}
title: ${targetDoc.title}
timestamp: ${new Date().toISOString()}
route: DELETE /api/anime/${cleanId}`);

      res.status(200).json({
        success: true,
        message: `Anime "${targetDoc.title}" deleted successfully from database`,
      });
    } catch (err: any) {
      console.error('[Anime Delete Error]', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to delete anime from MongoDB',
      });
    }
  },

  /**
   * GET /api/episodes
   * List all episodes from MongoDB
   */
  async getAllEpisodes(req: Request, res: Response): Promise<void> {
    try {
      await connectDB();
      const { animeId } = req.query;
      const allEpisodes: Array<IEpisode & { animeId: string; animeTitle: string }> = [];

      const animeList = await (Anime as any).find({}).lean();

      for (const a of animeList) {
        if (animeId && a.id !== animeId && a.slug !== animeId && String(a._id) !== animeId) {
          continue;
        }
        if (Array.isArray(a.episodes)) {
          a.episodes.forEach((ep: any) => {
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
    } catch (err: any) {
      console.error('[getAllEpisodes Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve episodes from database' });
    }
  },

  /**
   * GET /api/anime/:id/episodes
   */
  async getAnimeEpisodes(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await connectDB();
      let anime: any = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        anime = await (Anime as any).findById(id).lean();
      }
      if (!anime) {
        anime = await (Anime as any).findOne({ $or: [{ id }, { slug: id }] }).lean();
      }

      if (!anime) {
        res.status(404).json({ success: false, message: 'Anime not found in database' });
        return;
      }

      res.status(200).json({
        success: true,
        data: anime.episodes || [],
      });
    } catch (err: any) {
      console.error('[getAnimeEpisodes Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve anime episodes' });
    }
  },

  /**
   * POST /api/anime/:id/episodes or POST /api/episodes
   * Admin: Add new episode directly to anime in MongoDB
   */
  async addEpisode(req: Request, res: Response): Promise<void> {
    const animeId = req.params.id || req.body.animeId;

    if (!animeId) {
      res.status(400).json({ success: false, message: 'Anime ID is required' });
      return;
    }

    try {
      await connectDB();
      let targetAnime: any = null;
      if (mongoose.Types.ObjectId.isValid(animeId)) {
        targetAnime = await (Anime as any).findById(animeId);
      }
      if (!targetAnime) {
        targetAnime = await (Anime as any).findOne({
          $or: [{ id: animeId }, { slug: animeId }],
        });
      }

      if (!targetAnime) {
        res.status(404).json({ success: false, message: 'Target anime not found in database' });
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

      const epNum = Number(number) || (targetAnime.episodes?.length || 0) + 1;
      const newEpisode: IEpisode = {
        id: req.body.id || `${targetAnime.id}-ep-${epNum}`,
        number: epNum,
        title: title || `Episode ${epNum}`,
        description: description || '',
        videoUrl:
          videoUrl ||
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: thumbnail || targetAnime.banner || targetAnime.poster,
        duration: duration || '24m',
        airDate: airDate || new Date().toISOString().split('T')[0],
        language: language || 'Japanese',
        subtitle: subtitle || 'English',
        isDubbed: Boolean(isDubbed),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      };

      if (!targetAnime.episodes) {
        targetAnime.episodes = [];
      }
      targetAnime.episodes.push(newEpisode);
      targetAnime.episodesCount = targetAnime.episodes.length;

      await targetAnime.save();

      res.status(201).json({
        success: true,
        message: 'Episode added successfully to database',
        data: newEpisode,
      });
    } catch (err: any) {
      console.error('[addEpisode Error]', err);
      res.status(500).json({ success: false, message: 'Failed to add episode to database' });
    }
  },

  /**
   * PUT /api/episodes/:id
   * Admin: Update episode in MongoDB
   */
  async updateEpisode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    try {
      await connectDB();
      const animeDocs = await (Anime as any).find({ 'episodes.id': id });

      if (!animeDocs || animeDocs.length === 0) {
        res.status(404).json({ success: false, message: 'Episode not found in database' });
        return;
      }

      let updatedEpisode: any = null;
      for (const doc of animeDocs) {
        const epIndex = doc.episodes.findIndex((e: any) => e.id === id);
        if (epIndex !== -1) {
          const current = doc.episodes[epIndex].toObject
            ? doc.episodes[epIndex].toObject()
            : doc.episodes[epIndex];
          doc.episodes[epIndex] = { ...current, ...updates };
          await doc.save();
          updatedEpisode = doc.episodes[epIndex];
          break;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Episode updated successfully in database',
        data: updatedEpisode,
      });
    } catch (err: any) {
      console.error('[updateEpisode Error]', err);
      res.status(500).json({ success: false, message: 'Failed to update episode in database' });
    }
  },

  /**
   * DELETE /api/episodes/:id
   * Admin: Delete episode from MongoDB
   */
  async deleteEpisode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      await connectDB();
      const animeDocs = await (Anime as any).find({ 'episodes.id': id });

      if (!animeDocs || animeDocs.length === 0) {
        res.status(404).json({ success: false, message: 'Episode not found in database' });
        return;
      }

      for (const doc of animeDocs) {
        const prevLen = doc.episodes.length;
        doc.episodes = doc.episodes.filter((e: any) => e.id !== id);
        if (doc.episodes.length < prevLen) {
          doc.episodesCount = doc.episodes.length;
          await doc.save();
          break;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Episode deleted successfully from database',
      });
    } catch (err: any) {
      console.error('[deleteEpisode Error]', err);
      res.status(500).json({ success: false, message: 'Failed to delete episode from database' });
    }
  },
};
