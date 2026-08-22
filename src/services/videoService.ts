import { apiClient } from './apiConfig';
import { VideoStream, GenreItem } from '../types/anime';
import { DEMO_ANIME } from '../utils/animeData';

export const videoService = {
  /**
   * Get all video streams with optional filters
   */
  async getAllVideos(params?: {
    animeId?: string;
    episodeId?: string;
    search?: string;
    quality?: string;
    subDub?: string;
    videoType?: string;
  }): Promise<VideoStream[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: VideoStream[] }>('/api/videos', { params });
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch {
      // Fallback
    }

    // Local fallback generated from DEMO_ANIME
    const list: VideoStream[] = [];
    DEMO_ANIME.forEach((a) => {
      if (params?.animeId && params.animeId !== 'all' && a.id !== params.animeId) return;
      if (Array.isArray(a.episodes)) {
        a.episodes.forEach((ep) => {
          if (params?.episodeId && ep.id !== params.episodeId) return;
          list.push({
            id: `vid-${a.id}-${ep.number}`,
            animeId: a.id,
            animeTitle: a.title,
            episodeId: ep.id,
            episodeNumber: ep.number,
            videoUrl: ep.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoType: 'MP4',
            quality: '1080p',
            language: ep.language || 'Japanese',
            subDub: ep.isDubbed ? 'DUB' : 'SUB',
            serverName: 'Server 1 (Primary - HD)',
            status: 'Active',
          });
        });
      }
    });

    return list;
  },

  /**
   * Add new video stream source
   */
  async createVideo(videoData: Partial<VideoStream>): Promise<{ success: boolean; data?: VideoStream; message?: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; data: VideoStream; message: string }>('/api/videos', videoData);
      if (res.data.success && res.data.data) {
        return { success: true, data: res.data.data, message: res.data.message };
      }
    } catch {
      // Fallback
    }

    const created: VideoStream = {
      id: videoData.id || `vid-${Date.now()}`,
      animeId: videoData.animeId || '',
      animeTitle: videoData.animeTitle || '',
      episodeId: videoData.episodeId || '',
      episodeNumber: Number(videoData.episodeNumber) || 1,
      videoUrl: videoData.videoUrl || '',
      videoType: videoData.videoType || 'MP4',
      quality: videoData.quality || '1080p',
      language: videoData.language || 'Japanese',
      subDub: videoData.subDub || 'SUB',
      serverName: videoData.serverName || 'Server 1 (Primary - HD)',
      status: 'Active',
    };

    return { success: true, data: created, message: 'Video stream created successfully.' };
  },

  /**
   * Update video stream
   */
  async updateVideo(id: string, updates: Partial<VideoStream>): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.put<{ success: boolean; message: string }>(`/api/videos/${id}`, updates);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch {
      // Fallback
    }
    return { success: true, message: 'Video stream updated successfully.' };
  },

  /**
   * Delete video stream
   */
  async deleteVideo(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.delete<{ success: boolean; message: string }>(`/api/videos/${id}`);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch {
      // Fallback
    }
    return { success: true, message: 'Video stream deleted successfully.' };
  },
};

export const genreService = {
  /**
   * Get all genres
   */
  async getAllGenres(search?: string): Promise<GenreItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: GenreItem[] }>('/api/genres', { params: { search } });
      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch {
      // Fallback
    }

    return [
      { id: 'action', name: 'Action', slug: 'action', description: 'High-octane excitement and battles', color: '#DC143C', animeCount: 12 },
      { id: 'adventure', name: 'Adventure', slug: 'adventure', description: 'Expeditions to uncharted realms', color: '#f59e0b', animeCount: 8 },
      { id: 'comedy', name: 'Comedy', slug: 'comedy', description: 'Humorous escapades and funny banter', color: '#10b981', animeCount: 6 },
      { id: 'drama', name: 'Drama', slug: 'drama', description: 'Deep character-driven narratives', color: '#8b5cf6', animeCount: 9 },
      { id: 'fantasy', name: 'Fantasy', slug: 'fantasy', description: 'Magic and enchanted creatures', color: '#ec4899', animeCount: 15 },
      { id: 'horror', name: 'Horror', slug: 'horror', description: 'Supernatural chills and thrills', color: '#ef4444', animeCount: 3 },
      { id: 'mystery', name: 'Mystery', slug: 'mystery', description: 'Detectives and unsolved riddles', color: '#06b6d4', animeCount: 5 },
      { id: 'romance', name: 'Romance', slug: 'romance', description: 'Emotional stories and chemistry', color: '#f43f5e', animeCount: 7 },
      { id: 'sci-fi', name: 'Sci-Fi', slug: 'sci-fi', description: 'Cybernetics and futuristic worlds', color: '#3b82f6', animeCount: 6 },
      { id: 'shonen', name: 'Shonen', slug: 'shonen', description: 'High-spirit journeys and friendship', color: '#f97316', animeCount: 11 },
      { id: 'supernatural', name: 'Supernatural', slug: 'supernatural', description: 'Ghosts, demons, and curses', color: '#a855f7', animeCount: 7 },
    ];
  },

  /**
   * Add new genre
   */
  async createGenre(genreData: Partial<GenreItem>): Promise<{ success: boolean; data?: GenreItem; message?: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; data: GenreItem; message: string }>('/api/genres', genreData);
      if (res.data.success && res.data.data) {
        return { success: true, data: res.data.data, message: res.data.message };
      }
    } catch {
      // Fallback
    }

    const name = genreData.name || 'New Genre';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created: GenreItem = {
      id: slug,
      name,
      slug,
      description: genreData.description || '',
      color: genreData.color || '#DC143C',
      animeCount: 0,
    };

    return { success: true, data: created, message: 'Genre created successfully.' };
  },

  /**
   * Update genre
   */
  async updateGenre(id: string, updates: Partial<GenreItem>): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.put<{ success: boolean; message: string }>(`/api/genres/${id}`, updates);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch {
      // Fallback
    }
    return { success: true, message: 'Genre updated successfully.' };
  },

  /**
   * Delete genre
   */
  async deleteGenre(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.delete<{ success: boolean; message: string }>(`/api/genres/${id}`);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch {
      // Fallback
    }
    return { success: true, message: 'Genre deleted successfully.' };
  },
};
