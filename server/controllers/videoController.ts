import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Video, IVideo } from '../models/Video.js';
import { Anime } from '../models/Anime.js';

// In-memory fallback videos list
export const inMemoryVideos: IVideo[] = [];

// Seed sample videos from database episodes if needed
export async function seedInitialVideos(): Promise<void> {
  if (inMemoryVideos.length > 0) return;
  if (mongoose.connection.readyState === 1) {
    try {
      const animes = await (Anime as any).find({}).lean();
      animes.forEach((anime: any) => {
        if (Array.isArray(anime.episodes)) {
          anime.episodes.forEach((ep: any) => {
            inMemoryVideos.push({
              id: `vid-${anime.id}-${ep.number}`,
              animeId: anime.id,
              animeTitle: anime.title,
              episodeId: ep.id,
              episodeNumber: ep.number,
              videoUrl: ep.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              videoType: ep.videoUrl?.includes('.m3u8') ? 'HLS' : ep.videoUrl?.includes('embed') ? 'Embed' : 'MP4',
              quality: '1080p',
              language: ep.language || 'Japanese',
              subDub: ep.isDubbed ? 'DUB' : 'SUB',
              serverName: 'Server 1 (Primary - HD)',
              status: 'Active',
              createdAt: new Date(),
              updatedAt: new Date(),
            } as unknown as IVideo);
          });
        }
      });
    } catch {
      // Ignored
    }
  }
}

seedInitialVideos();

export const videoController = {
  /**
   * GET /api/videos
   */
  async getAllVideos(req: Request, res: Response): Promise<void> {
    try {
      const { animeId, episodeId, search, quality, subDub, videoType } = req.query;

      let query: any = {};
      if (animeId && typeof animeId === 'string' && animeId !== 'all') {
        query.animeId = animeId;
      }
      if (episodeId && typeof episodeId === 'string') {
        query.episodeId = episodeId;
      }
      if (quality && typeof quality === 'string' && quality !== 'all') {
        query.quality = quality;
      }
      if (subDub && typeof subDub === 'string' && subDub !== 'all') {
        query.subDub = subDub;
      }
      if (videoType && typeof videoType === 'string' && videoType !== 'all') {
        query.videoType = videoType;
      }
      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ animeTitle: regex }, { videoUrl: regex }, { serverName: regex }];
      }

      let videos: IVideo[] = [];

      if (mongoose.connection.readyState === 1) {
        try {
          videos = await (Video as any).find(query).sort({ createdAt: -1 }).lean();
        } catch {
          // Fallback
        }
      }

      if (videos.length === 0) {
        videos = inMemoryVideos.filter((v) => {
          if (animeId && animeId !== 'all' && v.animeId !== animeId) return false;
          if (episodeId && v.episodeId !== episodeId) return false;
          if (quality && quality !== 'all' && v.quality !== quality) return false;
          if (subDub && subDub !== 'all' && v.subDub !== subDub) return false;
          if (videoType && videoType !== 'all' && v.videoType !== videoType) return false;
          if (search && typeof search === 'string' && search.trim()) {
            const s = search.toLowerCase();
            const matches =
              v.animeTitle.toLowerCase().includes(s) ||
              v.videoUrl.toLowerCase().includes(s) ||
              v.serverName.toLowerCase().includes(s);
            if (!matches) return false;
          }
          return true;
        });
      }

      res.status(200).json({
        success: true,
        count: videos.length,
        data: videos,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve video streams' });
    }
  },

  /**
   * GET /api/videos/:id
   */
  async getVideoById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      let video: IVideo | null = null;
      if (mongoose.connection.readyState === 1) {
        try {
          video = await (Video as any).findOne({ id }).lean();
        } catch {
          // Fallback
        }
      }

      if (!video) {
        video = inMemoryVideos.find((v) => v.id === id) || null;
      }

      if (!video) {
        res.status(404).json({ success: false, message: 'Video stream not found' });
        return;
      }

      res.status(200).json({ success: true, data: video });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to retrieve video stream' });
    }
  },

  /**
   * POST /api/videos
   */
  async createVideo(req: Request, res: Response): Promise<void> {
    try {
      const {
        animeId,
        animeTitle,
        episodeId,
        episodeNumber,
        videoUrl,
        videoType,
        quality,
        language,
        subDub,
        serverName,
      } = req.body;

      if (!animeId || !videoUrl) {
        res.status(400).json({ success: false, message: 'Anime ID and Video URL are required' });
        return;
      }

      const generatedId = `vid-${animeId}-${episodeNumber || 1}-${Date.now().toString(36)}`;

      const newVideoData = {
        id: req.body.id || generatedId,
        animeId,
        animeTitle: animeTitle || 'Unknown Anime',
        episodeId: episodeId || `${animeId}-ep-${episodeNumber || 1}`,
        episodeNumber: Number(episodeNumber) || 1,
        videoUrl: videoUrl.trim(),
        videoType: (videoType as any) || (videoUrl.includes('.m3u8') ? 'HLS' : videoUrl.includes('embed') ? 'Embed' : 'MP4'),
        quality: (quality as any) || '1080p',
        language: language || 'Japanese',
        subDub: (subDub as any) || 'SUB',
        serverName: serverName || 'Server 1 (Primary - HD)',
        status: 'Active' as const,
      };

      let createdVideo: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          createdVideo = await Video.create(newVideoData);
        } catch {
          // Fallback
        }
      }

      if (!createdVideo) {
        createdVideo = {
          ...newVideoData,
          _id: `vid-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryVideos.unshift(createdVideo);
      }

      // Also ensure target Anime episode's videoUrl is updated
      try {
        if (mongoose.connection.readyState === 1) {
          await (Anime as any).updateOne(
            { id: animeId, 'episodes.number': Number(episodeNumber) },
            { $set: { 'episodes.$.videoUrl': videoUrl.trim() } }
          );
        }
      } catch {
        // Handled
      }

      res.status(201).json({
        success: true,
        message: 'Video source added successfully',
        data: createdVideo,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create video source' });
    }
  },

  /**
   * PUT /api/videos/:id
   */
  async updateVideo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    try {
      let updatedDoc: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          updatedDoc = await (Video as any).findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        } catch {
          // Fallback
        }
      }

      const index = inMemoryVideos.findIndex((v) => v.id === id);
      if (index !== -1) {
        inMemoryVideos[index] = {
          ...inMemoryVideos[index],
          ...updates,
          updatedAt: new Date(),
        };
        if (!updatedDoc) updatedDoc = inMemoryVideos[index];
      }

      if (!updatedDoc) {
        res.status(404).json({ success: false, message: 'Video stream not found to update' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Video stream updated successfully',
        data: updatedDoc,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update video stream' });
    }
  },

  /**
   * DELETE /api/videos/:id
   */
  async deleteVideo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      let deleted = false;
      if (mongoose.connection.readyState === 1) {
        try {
          const resDb = await (Video as any).deleteOne({ id });
          if (resDb.deletedCount > 0) deleted = true;
        } catch {
          // Fallback
        }
      }

      const index = inMemoryVideos.findIndex((v) => v.id === id);
      if (index !== -1) {
        inMemoryVideos.splice(index, 1);
        deleted = true;
      }

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Video stream not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Video stream deleted successfully',
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete video stream' });
    }
  },
};
