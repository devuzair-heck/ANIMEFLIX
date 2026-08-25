import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Episode, IEpisodeDoc } from '../models/Episode.js';
import { Anime } from '../models/Anime.js';
import { inMemoryAnimeList } from './animeController.js';

// In-memory episode store for offline / fallback mode
export const inMemoryEpisodeList: Array<{
  id: string;
  _id?: string;
  animeId: string;
  animeTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  number: number;
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
}> = [];

// Initialize inMemoryEpisodeList from inMemoryAnimeList if available
function syncInMemoryEpisodes() {
  if (inMemoryEpisodeList.length === 0 && inMemoryAnimeList.length > 0) {
    for (const anime of inMemoryAnimeList) {
      if (Array.isArray(anime.episodes)) {
        for (const ep of anime.episodes) {
          inMemoryEpisodeList.push({
            id: ep.id || `${anime.id}-ep-${ep.number}`,
            animeId: anime.id,
            animeTitle: anime.title,
            seasonNumber: (ep as any).seasonNumber || 1,
            episodeNumber: (ep as any).episodeNumber || ep.number || 1,
            number: ep.number || (ep as any).episodeNumber || 1,
            title: ep.title || `Episode ${ep.number}`,
            description: ep.description || '',
            thumbnail: ep.thumbnail || anime.banner || anime.poster || '',
            videoUrl: ep.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: ep.duration || '24:00',
            releaseDate: ep.airDate || new Date().toISOString().split('T')[0],
            airDate: ep.airDate || new Date().toISOString().split('T')[0],
            isPublished: ep.isPublished !== undefined ? Boolean(ep.isPublished) : true,
            isDubbed: Boolean(ep.isDubbed),
            language: ep.language || 'Japanese',
            subtitle: ep.subtitle || 'English',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
  }
}

// Sync on startup
syncInMemoryEpisodes();

export const episodeController = {
  /**
   * GET /api/episodes
   * Query params: animeId, season, seasonNumber, search
   */
  async getAllEpisodes(req: Request, res: Response): Promise<void> {
    const { animeId, season, seasonNumber, search } = req.query;

    try {
      let episodes: any[] = [];
      const dbConnected = mongoose.connection.readyState === 1;

      if (dbConnected) {
        try {
          const query: any = {};
          if (animeId && typeof animeId === 'string' && animeId !== 'all') {
            query.animeId = animeId.trim();
          }
          const sNum = Number(seasonNumber || season);
          if (!isNaN(sNum) && sNum > 0) {
            query.seasonNumber = sNum;
          }
          if (search && typeof search === 'string' && search.trim()) {
            query.$or = [
              { title: { $regex: search.trim(), $options: 'i' } },
              { animeTitle: { $regex: search.trim(), $options: 'i' } },
              { description: { $regex: search.trim(), $options: 'i' } },
            ];
          }

          episodes = await (Episode as any)
            .find(query)
            .sort({ seasonNumber: 1, episodeNumber: 1, number: 1 })
            .lean();

          // If Episode collection is empty, check if we need to pull from Anime docs
          if (episodes.length === 0 && (!animeId || animeId === 'all') && !search) {
            const animeDocs = await (Anime as any).find({}).lean();
            for (const doc of animeDocs) {
              if (Array.isArray(doc.episodes) && doc.episodes.length > 0) {
                for (const ep of doc.episodes) {
                  const epObj = {
                    id: ep.id || `${doc.id}-ep-${ep.number}`,
                    animeId: doc.id,
                    animeTitle: doc.title,
                    seasonNumber: (ep as any).seasonNumber || 1,
                    episodeNumber: (ep as any).episodeNumber || ep.number || 1,
                    number: ep.number || (ep as any).episodeNumber || 1,
                    title: ep.title,
                    description: ep.description || '',
                    thumbnail: ep.thumbnail || doc.banner || doc.poster || '',
                    videoUrl: ep.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    duration: ep.duration || '24:00',
                    releaseDate: ep.airDate || new Date().toISOString().split('T')[0],
                    airDate: ep.airDate || new Date().toISOString().split('T')[0],
                    isPublished: ep.isPublished !== undefined ? Boolean(ep.isPublished) : true,
                    isDubbed: Boolean(ep.isDubbed),
                    language: ep.language || 'Japanese',
                    subtitle: ep.subtitle || 'English',
                    createdAt: (doc as any).createdAt || new Date(),
                    updatedAt: (doc as any).updatedAt || new Date(),
                  };
                  episodes.push(epObj);

                  // Seed into Episode collection in background
                  (Episode as any).create(epObj).catch(() => {});
                }
              }
            }
          }
        } catch (dbErr) {
          console.warn('[Episode Get] DB fetch notice:', dbErr);
        }
      }

      // If episodes still empty or DB offline, use in-memory store
      if (episodes.length === 0) {
        syncInMemoryEpisodes();
        episodes = inMemoryEpisodeList.filter((ep) => {
          if (animeId && animeId !== 'all' && ep.animeId !== animeId) return false;
          const sNum = Number(seasonNumber || season);
          if (!isNaN(sNum) && sNum > 0 && ep.seasonNumber !== sNum) return false;
          if (search && typeof search === 'string' && search.trim()) {
            const q = search.trim().toLowerCase();
            return (
              ep.title.toLowerCase().includes(q) ||
              ep.animeTitle.toLowerCase().includes(q) ||
              ep.description.toLowerCase().includes(q)
            );
          }
          return true;
        });
      }

      // Sort episodes accurately: Season 1 Ep 1, Season 1 Ep 2... Season 2 Ep 1...
      episodes.sort((a, b) => {
        const sA = Number(a.seasonNumber || 1);
        const sB = Number(b.seasonNumber || 1);
        if (sA !== sB) return sA - sB;
        const eA = Number(a.episodeNumber || a.number || 0);
        const eB = Number(b.episodeNumber || b.number || 0);
        return eA - eB;
      });

      res.status(200).json({
        success: true,
        count: episodes.length,
        data: episodes,
      });
    } catch (err: any) {
      console.error('[Get All Episodes Error]', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve episodes',
        error: err?.message,
      });
    }
  },

  /**
   * GET /api/episodes/anime/:animeId
   * Public / Admin: Get episodes for specific anime
   */
  async getEpisodesByAnime(req: Request, res: Response): Promise<void> {
    const { animeId } = req.params;

    if (!animeId || typeof animeId !== 'string') {
      res.status(400).json({ success: false, message: 'Anime ID is required' });
      return;
    }

    try {
      const cleanAnimeId = animeId.trim();
      let episodes: any[] = [];
      const dbConnected = mongoose.connection.readyState === 1;

      if (dbConnected) {
        try {
          episodes = await (Episode as any)
            .find({ animeId: cleanAnimeId })
            .sort({ seasonNumber: 1, episodeNumber: 1, number: 1 })
            .lean();

          if (episodes.length === 0) {
            // Also check parent Anime document
            const animeDoc = await (Anime as any)
              .findOne({ $or: [{ id: cleanAnimeId }, { slug: cleanAnimeId }] })
              .lean();
            if (animeDoc && Array.isArray(animeDoc.episodes)) {
              episodes = animeDoc.episodes.map((ep: any) => ({
                id: ep.id || `${animeDoc.id}-ep-${ep.number}`,
                animeId: animeDoc.id,
                animeTitle: animeDoc.title,
                seasonNumber: ep.seasonNumber || 1,
                episodeNumber: ep.episodeNumber || ep.number || 1,
                number: ep.number || ep.episodeNumber || 1,
                title: ep.title,
                description: ep.description || '',
                thumbnail: ep.thumbnail || animeDoc.banner || animeDoc.poster || '',
                videoUrl: ep.videoUrl || '',
                duration: ep.duration || '24:00',
                releaseDate: ep.airDate || ep.releaseDate || '',
                isPublished: ep.isPublished !== undefined ? Boolean(ep.isPublished) : true,
                isDubbed: Boolean(ep.isDubbed),
                language: ep.language || 'Japanese',
                subtitle: ep.subtitle || 'English',
              }));
            }
          }
        } catch (dbErr) {
          console.warn('[Get Episodes By Anime DB Notice]', dbErr);
        }
      }

      if (episodes.length === 0) {
        syncInMemoryEpisodes();
        episodes = inMemoryEpisodeList.filter((e) => e.animeId === cleanAnimeId);
      }

      episodes.sort((a, b) => {
        const sA = Number(a.seasonNumber || 1);
        const sB = Number(b.seasonNumber || 1);
        if (sA !== sB) return sA - sB;
        const eA = Number(a.episodeNumber || a.number || 0);
        const eB = Number(b.episodeNumber || b.number || 0);
        return eA - eB;
      });

      res.status(200).json({
        success: true,
        count: episodes.length,
        data: episodes,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve anime episodes' });
    }
  },

  /**
   * GET /api/episodes/:id
   */
  async getEpisodeById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Episode ID is required' });
      return;
    }

    try {
      const cleanId = id.trim();
      let episode: any = null;

      if (mongoose.connection.readyState === 1) {
        try {
          const query: any[] = [{ id: cleanId }];
          if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            query.push({ _id: cleanId });
          }
          episode = await (Episode as any).findOne({ $or: query }).lean();
        } catch (err) {
          console.warn('[Get Episode By ID DB Notice]', err);
        }
      }

      if (!episode) {
        episode = inMemoryEpisodeList.find((e) => e.id === cleanId || e._id === cleanId) || null;
      }

      if (!episode) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: episode,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve episode' });
    }
  },

  /**
   * POST /api/episodes
   * Admin: Add new episode
   */
  async createEpisode(req: Request, res: Response): Promise<void> {
    const {
      animeId,
      seasonNumber,
      episodeNumber,
      number,
      title,
      description,
      thumbnail,
      videoUrl,
      duration,
      releaseDate,
      airDate,
      language,
      subtitle,
      isDubbed,
      isPublished,
    } = req.body;

    // 1. Validate required fields
    if (!animeId || typeof animeId !== 'string' || !animeId.trim()) {
      res.status(400).json({ success: false, message: 'Anime selection is required' });
      return;
    }

    const sNumber = Number(seasonNumber !== undefined ? seasonNumber : 1);
    if (isNaN(sNumber) || sNumber <= 0) {
      res.status(400).json({ success: false, message: 'Season number must be a positive number greater than 0' });
      return;
    }

    const epNumber = Number(episodeNumber !== undefined ? episodeNumber : number);
    if (isNaN(epNumber) || epNumber <= 0) {
      res.status(400).json({ success: false, message: 'Episode number must be a positive number greater than 0' });
      return;
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, message: 'Episode title is required' });
      return;
    }

    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.trim()) {
      res.status(400).json({ success: false, message: 'Video URL is required' });
      return;
    }

    const cleanAnimeId = animeId.trim();
    const cleanTitle = title.trim();
    const cleanVideoUrl = videoUrl.trim();
    const cleanReleaseDate = releaseDate || airDate || new Date().toISOString().split('T')[0];
    const generatedId = `${cleanAnimeId}-s${sNumber}-ep${epNumber}`;

    try {
      let parentAnimeTitle = cleanAnimeId;
      let parentAnimeDoc: any = null;

      // 2. Validate Parent Anime exists
      if (mongoose.connection.readyState === 1) {
        try {
          const queryConditions: any[] = [{ id: cleanAnimeId }, { slug: cleanAnimeId }];
          if (cleanAnimeId.match(/^[0-9a-fA-F]{24}$/)) {
            queryConditions.push({ _id: cleanAnimeId });
          }
          parentAnimeDoc = await (Anime as any).findOne({ $or: queryConditions });
          if (parentAnimeDoc) {
            parentAnimeTitle = parentAnimeDoc.title;
          }
        } catch (dbErr) {
          console.warn('[Parent Anime Check DB Notice]', dbErr);
        }
      }

      if (!parentAnimeDoc) {
        const memAnime = inMemoryAnimeList.find((a) => a.id === cleanAnimeId || a.slug === cleanAnimeId);
        if (memAnime) {
          parentAnimeTitle = memAnime.title;
        }
      }

      // 3. Prevent duplicate episodes inside the same Anime and Season
      if (mongoose.connection.readyState === 1) {
        try {
          const existingEpisode = await (Episode as any).findOne({
            animeId: cleanAnimeId,
            seasonNumber: sNumber,
            $or: [{ episodeNumber: epNumber }, { number: epNumber }, { id: generatedId }],
          });

          if (existingEpisode) {
            res.status(409).json({
              success: false,
              message: `Episode ${epNumber} (Season ${sNumber}) already exists for this anime series.`,
            });
            return;
          }
        } catch (dupErr) {
          console.warn('[Duplicate Check DB Notice]', dupErr);
        }
      }

      // Duplicate check in in-memory fallback
      const inMemDup = inMemoryEpisodeList.find(
        (e) => e.animeId === cleanAnimeId && e.seasonNumber === sNumber && (e.episodeNumber === epNumber || e.number === epNumber)
      );
      if (inMemDup) {
        res.status(409).json({
          success: false,
          message: `Episode ${epNumber} (Season ${sNumber}) already exists for this anime series.`,
        });
        return;
      }

      const newEpisodeData = {
        id: generatedId,
        animeId: cleanAnimeId,
        animeTitle: parentAnimeTitle,
        seasonNumber: sNumber,
        episodeNumber: epNumber,
        number: epNumber,
        title: cleanTitle,
        description: description ? String(description).trim() : '',
        thumbnail: thumbnail ? String(thumbnail).trim() : (parentAnimeDoc?.banner || parentAnimeDoc?.poster || ''),
        videoUrl: cleanVideoUrl,
        duration: duration ? String(duration).trim() : '24:00',
        releaseDate: cleanReleaseDate,
        airDate: cleanReleaseDate,
        language: language ? String(language).trim() : 'Japanese',
        subtitle: subtitle ? String(subtitle).trim() : 'English',
        isDubbed: Boolean(isDubbed),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      };

      let savedDoc: any = null;

      // 4. Save to MongoDB Episode Collection
      if (mongoose.connection.readyState === 1) {
        try {
          savedDoc = await (Episode as any).create(newEpisodeData);

          // Synchronize parent Anime document
          if (parentAnimeDoc) {
            if (!Array.isArray(parentAnimeDoc.episodes)) {
              parentAnimeDoc.episodes = [];
            }
            parentAnimeDoc.episodes.push(newEpisodeData);
            parentAnimeDoc.episodesCount = parentAnimeDoc.episodes.length;
            await parentAnimeDoc.save();
          }
        } catch (saveErr: any) {
          if (saveErr.code === 11000) {
            res.status(409).json({
              success: false,
              message: `Episode ${epNumber} of Season ${sNumber} already exists in database.`,
            });
            return;
          }
          console.error('[Episode DB Create Error]', saveErr);
        }
      }

      // 5. Synchronize in-memory fallback
      const inMemEp = {
        ...newEpisodeData,
        _id: savedDoc?._id ? String(savedDoc._id) : `ep-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryEpisodeList.push(inMemEp);

      const memParentAnime = inMemoryAnimeList.find((a) => a.id === cleanAnimeId || a.slug === cleanAnimeId);
      if (memParentAnime) {
        if (!memParentAnime.episodes) memParentAnime.episodes = [];
        memParentAnime.episodes.push(newEpisodeData as any);
        memParentAnime.episodesCount = memParentAnime.episodes.length;
      }

      res.status(201).json({
        success: true,
        message: 'Episode created successfully.',
        data: savedDoc ? savedDoc.toObject() : inMemEp,
      });
    } catch (err: any) {
      console.error('[Create Episode Error]', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to create episode',
      });
    }
  },

  /**
   * PUT /api/episodes/:id
   * Admin: Update existing episode
   */
  async updateEpisode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({ success: false, message: 'Episode ID parameter is required' });
      return;
    }

    try {
      const cleanId = id.trim();
      let updated = false;
      let updatedData: any = null;

      // Validation if fields are updated
      if (updates.seasonNumber !== undefined) {
        const sNum = Number(updates.seasonNumber);
        if (isNaN(sNum) || sNum <= 0) {
          res.status(400).json({ success: false, message: 'Season number must be a positive number greater than 0' });
          return;
        }
        updates.seasonNumber = sNum;
      }

      if (updates.episodeNumber !== undefined || updates.number !== undefined) {
        const epNum = Number(updates.episodeNumber !== undefined ? updates.episodeNumber : updates.number);
        if (isNaN(epNum) || epNum <= 0) {
          res.status(400).json({ success: false, message: 'Episode number must be a positive number greater than 0' });
          return;
        }
        updates.episodeNumber = epNum;
        updates.number = epNum;
      }

      if (updates.title !== undefined) {
        if (!updates.title || !String(updates.title).trim()) {
          res.status(400).json({ success: false, message: 'Episode title cannot be empty' });
          return;
        }
        updates.title = String(updates.title).trim();
      }

      if (updates.videoUrl !== undefined) {
        if (!updates.videoUrl || !String(updates.videoUrl).trim()) {
          res.status(400).json({ success: false, message: 'Video URL cannot be empty' });
          return;
        }
        updates.videoUrl = String(updates.videoUrl).trim();
      }

      // 1. Update in MongoDB Episode collection
      if (mongoose.connection.readyState === 1) {
        try {
          const queryConditions: any[] = [{ id: cleanId }];
          if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            queryConditions.push({ _id: cleanId });
          }

          const existingEp = await (Episode as any).findOne({ $or: queryConditions });
          if (existingEp) {
            // Check for duplicate conflict if changing animeId, seasonNumber, or episodeNumber
            const targetAnimeId = updates.animeId || existingEp.animeId;
            const targetSeason = updates.seasonNumber || existingEp.seasonNumber;
            const targetEpNum = updates.episodeNumber || existingEp.episodeNumber;

            if (
              targetAnimeId !== existingEp.animeId ||
              targetSeason !== existingEp.seasonNumber ||
              targetEpNum !== existingEp.episodeNumber
            ) {
              const conflict = await (Episode as any).findOne({
                _id: { $ne: existingEp._id },
                animeId: targetAnimeId,
                seasonNumber: targetSeason,
                episodeNumber: targetEpNum,
              });

              if (conflict) {
                res.status(409).json({
                  success: false,
                  message: `Another episode with Episode ${targetEpNum} (Season ${targetSeason}) already exists.`,
                });
                return;
              }
            }

            Object.assign(existingEp, updates);
            if (updates.releaseDate && !updates.airDate) existingEp.airDate = updates.releaseDate;
            if (updates.airDate && !updates.releaseDate) existingEp.releaseDate = updates.airDate;

            await existingEp.save();
            updatedData = existingEp.toObject();
            updated = true;

            // Also synchronize parent Anime document's embedded episodes
            const parentAnime = await (Anime as any).findOne({
              $or: [{ id: existingEp.animeId }, { slug: existingEp.animeId }],
            });
            if (parentAnime && Array.isArray(parentAnime.episodes)) {
              const epIdx = parentAnime.episodes.findIndex((e: any) => e.id === cleanId || e.id === existingEp.id);
              if (epIdx !== -1) {
                parentAnime.episodes[epIdx] = {
                  ...parentAnime.episodes[epIdx].toObject(),
                  ...updates,
                };
                await parentAnime.save();
              }
            }
          }
        } catch (dbErr: any) {
          if (dbErr.code === 11000) {
            res.status(409).json({
              success: false,
              message: 'Duplicate episode conflict inside season.',
            });
            return;
          }
          console.warn('[Update Episode DB Notice]', dbErr);
        }
      }

      // 2. Synchronize in-memory episode list
      const memIdx = inMemoryEpisodeList.findIndex((e) => e.id === cleanId || e._id === cleanId);
      if (memIdx !== -1) {
        inMemoryEpisodeList[memIdx] = {
          ...inMemoryEpisodeList[memIdx],
          ...updates,
          updatedAt: new Date(),
        };
        if (!updatedData) updatedData = inMemoryEpisodeList[memIdx];
        updated = true;
      }

      // Also update in-memory anime list embedded episodes
      for (const a of inMemoryAnimeList) {
        if (!Array.isArray(a.episodes)) continue;
        const eIdx = a.episodes.findIndex((e) => e.id === cleanId);
        if (eIdx !== -1) {
          a.episodes[eIdx] = { ...a.episodes[eIdx], ...updates };
          break;
        }
      }

      if (!updated) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Episode updated successfully.',
        data: updatedData,
      });
    } catch (err: any) {
      console.error('[Update Episode Error]', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to update episode',
      });
    }
  },

  /**
   * DELETE /api/episodes/:id
   * Admin: Permanently delete episode
   */
  async deleteEpisode(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({ success: false, message: 'Episode ID parameter is required' });
      return;
    }

    try {
      const cleanId = id.trim();
      let deleted = false;
      let targetAnimeId: string | null = null;

      // 1. Permanently delete from MongoDB Episode collection
      if (mongoose.connection.readyState === 1) {
        try {
          const queryConditions: any[] = [{ id: cleanId }];
          if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            queryConditions.push({ _id: cleanId });
          }

          const existingDoc = await (Episode as any).findOne({ $or: queryConditions });
          if (existingDoc) {
            targetAnimeId = existingDoc.animeId;
            await (Episode as any).deleteOne({ _id: existingDoc._id });
            deleted = true;
          } else {
            const delRes = await (Episode as any).deleteOne({ $or: queryConditions });
            if (delRes.deletedCount > 0) {
              deleted = true;
            }
          }

          // 2. Also remove from parent Anime document embedded episodes and update count
          const animeDocs = await (Anime as any).find({ 'episodes.id': cleanId });
          for (const aDoc of animeDocs) {
            const prevCount = aDoc.episodes.length;
            aDoc.episodes = aDoc.episodes.filter((e: any) => e.id !== cleanId);
            if (aDoc.episodes.length !== prevCount) {
              aDoc.episodesCount = aDoc.episodes.length;
              await aDoc.save();
              deleted = true;
            }
          }
        } catch (dbErr) {
          console.warn('[Delete Episode DB Notice]', dbErr);
        }
      }

      // 3. Remove from in-memory fallback stores
      const memIdx = inMemoryEpisodeList.findIndex((e) => e.id === cleanId || e._id === cleanId);
      if (memIdx !== -1) {
        inMemoryEpisodeList.splice(memIdx, 1);
        deleted = true;
      }

      for (const a of inMemoryAnimeList) {
        if (!Array.isArray(a.episodes)) continue;
        const prevCount = a.episodes.length;
        a.episodes = a.episodes.filter((e) => e.id !== cleanId);
        if (a.episodes.length !== prevCount) {
          a.episodesCount = a.episodes.length;
          deleted = true;
        }
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Episode not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Episode deleted successfully.',
      });
    } catch (err: any) {
      console.error('[Delete Episode Error]', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Failed to delete episode',
      });
    }
  },
};
