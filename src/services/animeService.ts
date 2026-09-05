import { apiClient } from './apiConfig';
import { Anime, Episode } from '../types/anime';

export const animeService = {
  /**
   * Fetch all anime with optional filters from the MongoDB backend
   */
  async getAllAnime(params?: {
    search?: string;
    genre?: string;
    status?: string;
    type?: string;
    sortBy?: string;
  }): Promise<Anime[]> {
    try {
      const response = await apiClient.get<any>('/api/anime', { params });
      const raw = response?.data;
      let list: Anime[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.data)) list = raw.data;
        else if (Array.isArray(raw.anime)) list = raw.anime;
        else if (Array.isArray(raw.results)) list = raw.results;
      }
      return list;
    } catch (err: any) {
      console.warn('[animeService.getAllAnime] Initial fetch notice, retrying in 400ms...', err);
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const retryResponse = await apiClient.get<any>('/api/anime', { params });
        const raw = retryResponse?.data;
        let list: Anime[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (raw && typeof raw === 'object') {
          if (Array.isArray(raw.data)) list = raw.data;
          else if (Array.isArray(raw.anime)) list = raw.anime;
          else if (Array.isArray(raw.results)) list = raw.results;
        }
        return list;
      } catch (retryErr: any) {
        console.error('[animeService.getAllAnime] Error retrieving anime from server:', retryErr);
        try {
          const { DEMO_ANIME } = await import('../utils/animeData');
          return DEMO_ANIME;
        } catch {
          return [];
        }
      }
    }
  },

  /**
   * Fetch single anime by ID or slug directly from MongoDB backend
   */
  async getAnimeById(id: string): Promise<Anime | null> {
    try {
      const response = await apiClient.get<any>(`/api/anime/${id}`);
      const raw = response?.data;
      let item: Anime | null = null;
      if (raw && typeof raw === 'object') {
        if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) item = raw.data;
        else if (raw.anime && typeof raw.anime === 'object' && !Array.isArray(raw.anime)) item = raw.anime;
        else if (raw.id || raw._id || raw.title) item = raw;
      }
      return item;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      console.warn('[animeService.getAnimeById] Initial fetch notice, retrying in 400ms...', err);
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const response = await apiClient.get<any>(`/api/anime/${id}`);
        const raw = response?.data;
        let item: Anime | null = null;
        if (raw && typeof raw === 'object') {
          if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) item = raw.data;
          else if (raw.anime && typeof raw.anime === 'object' && !Array.isArray(raw.anime)) item = raw.anime;
          else if (raw.id || raw._id || raw.title) item = raw;
        }
        return item;
      } catch (retryErr: any) {
        if (retryErr.response?.status === 404) {
          return null;
        }
        try {
          const { DEMO_ANIME } = await import('../utils/animeData');
          const fallback = DEMO_ANIME.find((a) => a.id === id || a.slug === id);
          if (fallback) return fallback;
        } catch {}
        console.error('[animeService.getAnimeById] Error fetching anime from server:', retryErr);
        throw retryErr;
      }
    }
  },

  /**
   * Admin: Add new anime directly into database
   */
  async createAnime(
    animeData: Partial<Anime> & { [key: string]: any }
  ): Promise<{ success: boolean; data?: Anime; anime?: Anime; message?: string }> {
    try {
      const response = await apiClient.post<any>('/api/anime', animeData);
      const raw = response?.data;
      let created: Anime | null = null;
      if (raw && typeof raw === 'object') {
        if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) created = raw.data;
        else if (raw.anime && typeof raw.anime === 'object' && !Array.isArray(raw.anime)) created = raw.anime;
        else if (raw.id || raw._id || raw.title) created = raw;
      }
      if (created) {
        return {
          success: true,
          data: created,
          anime: created,
          message: raw?.message || 'Anime created successfully in database.',
        };
      }
      return { success: false, message: raw?.message || 'Failed to create anime.' };
    } catch (err: any) {
      console.error('[animeService.createAnime] Server error:', err);
      const msg = err.response?.data?.message || err.message || 'Database error: Failed to add anime';
      return { success: false, message: msg };
    }
  },

  /**
   * Admin: Update anime in database
   */
  async updateAnime(
    id: string,
    updates: Partial<Anime> & { [key: string]: any }
  ): Promise<{ success: boolean; data?: Anime; anime?: Anime; message?: string }> {
    try {
      const response = await apiClient.put<any>(`/api/anime/${id}`, updates);
      const raw = response?.data;
      let updated: Anime | null = null;
      if (raw && typeof raw === 'object') {
        if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) updated = raw.data;
        else if (raw.anime && typeof raw.anime === 'object' && !Array.isArray(raw.anime)) updated = raw.anime;
        else if (raw.id || raw._id || raw.title) updated = raw;
      }
      if (updated) {
        return {
          success: true,
          data: updated,
          anime: updated,
          message: raw?.message || 'Anime updated successfully in database.',
        };
      }
      return { success: false, message: raw?.message || 'Failed to update anime.' };
    } catch (err: any) {
      console.error('[animeService.updateAnime] Server error:', err);
      const msg = err.response?.data?.message || err.message || 'Database error: Failed to update anime';
      return { success: false, message: msg };
    }
  },

  /**
   * Admin: Delete anime from database
   */
  async deleteAnime(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/anime/${id}`);
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message || 'Anime deleted successfully.' };
      }
      return { success: false, message: response.data?.message || 'Unable to delete anime.' };
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.response?.data?.error || err.message || 'Unable to delete anime from database.';
      return { success: false, message: errMsg };
    }
  },

  /**
   * Admin: Get all episodes
   */
  async getAllEpisodes(animeId?: string): Promise<Array<Episode & { animeId: string; animeTitle: string }>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/episodes', {
        params: { animeId },
      });
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('[animeService.getAllEpisodes] Error:', err);
      throw err;
    }
  },

  /**
   * Admin: Add episode to anime
   */
  async addEpisode(
    animeId: string,
    episodeData: Partial<Episode> & { [key: string]: any }
  ): Promise<{ success: boolean; data?: Episode; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Episode; message: string }>('/api/episodes', {
        animeId,
        ...episodeData,
      });
      if (response.data && response.data.success && response.data.data) {
        return { success: true, data: response.data.data, message: response.data.message };
      }
      return { success: false, message: response.data?.message || 'Failed to add episode' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Database error: Failed to add episode',
      };
    }
  },

  /**
   * Admin: Update episode
   */
  async updateEpisode(
    episodeId: string,
    updates: Partial<Episode> & { [key: string]: any }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string }>(`/api/episodes/${episodeId}`, updates);
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data?.message || 'Failed to update episode' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Database error: Failed to update episode',
      };
    }
  },

  /**
   * Admin: Delete episode
   */
  async deleteEpisode(episodeId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/episodes/${episodeId}`);
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data?.message || 'Failed to delete episode' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Database error: Failed to delete episode',
      };
    }
  },
};
