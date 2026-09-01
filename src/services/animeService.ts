import { apiClient } from './apiConfig';
import { Anime, Episode } from '../types/anime';
import { DEMO_ANIME } from '../utils/animeData';

// Helper to keep local DEMO_ANIME synchronized
function syncLocalCatalog(updatedList: Anime[]) {
  if (Array.isArray(updatedList) && updatedList.length > 0) {
    DEMO_ANIME.length = 0;
    updatedList.forEach((a) => DEMO_ANIME.push(a));
  }
}

export const animeService = {
  /**
   * Fetch all anime with optional filters
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
      syncLocalCatalog(list);
      return list;
    } catch (err) {
      console.error('[animeService.getAllAnime] Error fetching anime from server:', err);
      throw err;
    }
  },

  /**
   * Fetch single anime by ID or slug
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
      if (item) {
        return item;
      }
    } catch (err) {
      console.warn('[animeService.getAnimeById] Error fetching anime from server:', err);
    }
    return DEMO_ANIME.find((a) => a.id === id || a.slug === id || (a as any)._id === id) || null;
  },

  /**
   * Admin: Add new anime
   */
  async createAnime(animeData: Partial<Anime> & { [key: string]: any }): Promise<{ success: boolean; data?: Anime; anime?: Anime; message?: string }> {
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
        const exists = DEMO_ANIME.some((a) => a.id === created!.id || ((a as any)._id && (a as any)._id === (created as any)._id));
        if (!exists) {
          DEMO_ANIME.unshift(created);
        }
        return { success: true, data: created, anime: created, message: raw?.message || 'Anime created successfully.' };
      }
      return { success: false, message: raw?.message || 'Failed to create anime.' };
    } catch (err: any) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
      return { success: false, message: 'Server error: Failed to add anime to database.' };
    }
  },

  /**
   * Admin: Update anime
   */
  async updateAnime(id: string, updates: Partial<Anime> & { [key: string]: any }): Promise<{ success: boolean; data?: Anime; anime?: Anime; message?: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; data?: Anime; anime?: Anime; message: string }>(`/api/anime/${id}`, updates);
      if (response.data && response.data.success && (response.data.data || response.data.anime)) {
        const updated = (response.data.data || response.data.anime)!;
        const index = DEMO_ANIME.findIndex((a) => a.id === id || a.slug === id || (a as any)._id === id);
        if (index !== -1) {
          DEMO_ANIME[index] = { ...DEMO_ANIME[index], ...updated };
        }
        return { success: true, data: updated, anime: updated, message: response.data.message || 'Anime updated successfully.' };
      }
      return { success: false, message: response.data?.message || 'Failed to update anime.' };
    } catch (err: any) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
      return { success: false, message: 'Server error: Failed to update anime.' };
    }
  },

  /**
   * Admin: Delete anime
   */
  async deleteAnime(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/anime/${id}`);
      if (response.data && response.data.success) {
        const idx = DEMO_ANIME.findIndex((a) => a.id === id || a.slug === id || (a as any)._id === id);
        if (idx !== -1) DEMO_ANIME.splice(idx, 1);
        return { success: true, message: response.data.message || 'Anime deleted successfully.' };
      }
      return { success: false, message: response.data?.message || 'Unable to delete anime.' };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unable to delete anime.';
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
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch {
      // Fallback to local
    }

    const eps: Array<Episode & { animeId: string; animeTitle: string }> = [];
    DEMO_ANIME.forEach((a) => {
      if (animeId && a.id !== animeId && a.slug !== animeId) return;
      if (Array.isArray(a.episodes)) {
        a.episodes.forEach((ep) => {
          eps.push({
            ...ep,
            animeId: a.id,
            animeTitle: a.title,
          });
        });
      }
    });
    return eps;
  },

  /**
   * Admin: Add episode to anime
   */
  async addEpisode(animeId: string, episodeData: Partial<Episode> & { [key: string]: any }): Promise<{ success: boolean; data?: Episode; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Episode; message: string }>('/api/episodes', {
        animeId,
        ...episodeData,
      });
      if (response.data.success && response.data.data) {
        const ep = response.data.data;
        const target = DEMO_ANIME.find((a) => a.id === animeId || a.slug === animeId);
        if (target) {
          if (!target.episodes) target.episodes = [];
          target.episodes.push(ep);
          target.episodesCount = target.episodes.length;
        }
        return { success: true, data: ep, message: response.data.message };
      }
    } catch {
      // Fallback
    }

    const target = DEMO_ANIME.find((a) => a.id === animeId || a.slug === animeId);
    if (target) {
      if (!target.episodes) target.episodes = [];
      const newEp: Episode = {
        id: episodeData.id || `${animeId}-ep-${episodeData.number || target.episodes.length + 1}`,
        number: Number(episodeData.number) || target.episodes.length + 1,
        title: episodeData.title || `Episode ${episodeData.number || target.episodes.length + 1}`,
        thumbnail: episodeData.thumbnail || target.banner,
        duration: episodeData.duration || '24m',
        airDate: episodeData.airDate || new Date().toISOString().split('T')[0],
        description: episodeData.description || `Episode ${episodeData.number || 1} of ${target.title}.`,
      };
      target.episodes.push(newEp);
      target.episodesCount = target.episodes.length;
      return { success: true, data: newEp, message: 'Episode added successfully.' };
    }

    return { success: false, message: 'Target anime not found.' };
  },

  /**
   * Admin: Update episode
   */
  async updateEpisode(episodeId: string, updates: Partial<Episode> & { [key: string]: any }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string }>(`/api/episodes/${episodeId}`, updates);
      if (response.data.success) {
        for (const a of DEMO_ANIME) {
          if (!a.episodes) continue;
          const idx = a.episodes.findIndex((e) => e.id === episodeId);
          if (idx !== -1) {
            a.episodes[idx] = { ...a.episodes[idx], ...updates };
            break;
          }
        }
        return { success: true, message: response.data.message };
      }
    } catch {
      // Fallback
    }

    for (const a of DEMO_ANIME) {
      if (!a.episodes) continue;
      const idx = a.episodes.findIndex((e) => e.id === episodeId);
      if (idx !== -1) {
        a.episodes[idx] = { ...a.episodes[idx], ...updates };
        return { success: true, message: 'Episode updated successfully.' };
      }
    }

    return { success: false, message: 'Episode not found.' };
  },

  /**
   * Admin: Delete episode
   */
  async deleteEpisode(episodeId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/episodes/${episodeId}`);
      if (response.data.success) {
        for (const a of DEMO_ANIME) {
          if (!a.episodes) continue;
          const idx = a.episodes.findIndex((e) => e.id === episodeId);
          if (idx !== -1) {
            a.episodes.splice(idx, 1);
            a.episodesCount = a.episodes.length;
            break;
          }
        }
        return { success: true, message: response.data.message };
      }
    } catch {
      // Fallback
    }

    for (const a of DEMO_ANIME) {
      if (!a.episodes) continue;
      const idx = a.episodes.findIndex((e) => e.id === episodeId);
      if (idx !== -1) {
        a.episodes.splice(idx, 1);
        a.episodesCount = a.episodes.length;
        return { success: true, message: 'Episode deleted successfully.' };
      }
    }

    return { success: false, message: 'Episode not found.' };
  },
};
