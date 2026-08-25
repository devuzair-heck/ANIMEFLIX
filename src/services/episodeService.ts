import { apiClient } from './apiConfig';
import { Episode } from '../types/anime';
import { DEMO_ANIME } from '../utils/animeData';

export interface CreateEpisodePayload {
  animeId: string;
  seasonNumber: number;
  episodeNumber: number;
  number?: number;
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl: string;
  duration?: string;
  releaseDate?: string;
  airDate?: string;
  language?: string;
  subtitle?: string;
  isDubbed?: boolean;
  isPublished?: boolean;
}

export interface UpdateEpisodePayload {
  animeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  number?: number;
  title?: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  duration?: string;
  releaseDate?: string;
  airDate?: string;
  language?: string;
  subtitle?: string;
  isDubbed?: boolean;
  isPublished?: boolean;
}

export const episodeService = {
  /**
   * Fetch all episodes or filter by animeId, season, search
   */
  async getAllEpisodes(params?: {
    animeId?: string;
    season?: number;
    seasonNumber?: number;
    search?: string;
  }): Promise<Episode[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        count: number;
        data: Episode[];
      }>('/api/episodes', { params });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('[EpisodeService] API fetch warning, falling back to local dataset:', err);
    }

    // Fallback logic
    const eps: Episode[] = [];
    DEMO_ANIME.forEach((a) => {
      if (params?.animeId && params.animeId !== 'all' && a.id !== params.animeId && a.slug !== params.animeId) {
        return;
      }
      if (Array.isArray(a.episodes)) {
        a.episodes.forEach((ep) => {
          const sNum = (ep as any).seasonNumber || 1;
          if (params?.season && sNum !== params.season) return;
          if (params?.seasonNumber && sNum !== params.seasonNumber) return;
          if (params?.search && params.search.trim()) {
            const q = params.search.trim().toLowerCase();
            const match =
              ep.title.toLowerCase().includes(q) ||
              a.title.toLowerCase().includes(q) ||
              (ep.description && ep.description.toLowerCase().includes(q));
            if (!match) return;
          }

          eps.push({
            ...ep,
            animeId: a.id,
            animeTitle: a.title,
            seasonNumber: (ep as any).seasonNumber || 1,
            episodeNumber: (ep as any).episodeNumber || ep.number || 1,
            number: ep.number || (ep as any).episodeNumber || 1,
            releaseDate: ep.airDate || ep.releaseDate || '2024-01-01',
          });
        });
      }
    });

    eps.sort((a, b) => {
      const sA = a.seasonNumber || 1;
      const sB = b.seasonNumber || 1;
      if (sA !== sB) return sA - sB;
      return (a.episodeNumber || a.number || 0) - (b.episodeNumber || b.number || 0);
    });

    return eps;
  },

  /**
   * Fetch episodes for a specific anime
   */
  async getEpisodesByAnime(animeId: string): Promise<Episode[]> {
    return this.getAllEpisodes({ animeId });
  },

  /**
   * Fetch single episode by ID
   */
  async getEpisodeById(id: string): Promise<Episode | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Episode }>(`/api/episodes/${id}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    for (const a of DEMO_ANIME) {
      if (Array.isArray(a.episodes)) {
        const found = a.episodes.find((e) => e.id === id || (e as any)._id === id);
        if (found) {
          return {
            ...found,
            animeId: a.id,
            animeTitle: a.title,
            seasonNumber: (found as any).seasonNumber || 1,
            episodeNumber: (found as any).episodeNumber || found.number || 1,
          };
        }
      }
    }
    return null;
  },

  /**
   * Admin: Add new episode
   */
  async createEpisode(payload: CreateEpisodePayload): Promise<{
    success: boolean;
    data?: Episode;
    message?: string;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: Episode;
      }>('/api/episodes', payload);

      if (response.data && response.data.success) {
        const ep = response.data.data;

        // Also update local DEMO_ANIME cache
        const targetAnime = DEMO_ANIME.find((a) => a.id === payload.animeId || a.slug === payload.animeId);
        if (targetAnime) {
          if (!targetAnime.episodes) targetAnime.episodes = [];
          targetAnime.episodes.push(ep);
          targetAnime.episodesCount = targetAnime.episodes.length;
        }

        return {
          success: true,
          data: ep,
          message: response.data.message || 'Episode created successfully.',
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to create episode',
      };
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Server error while creating episode.';
      return {
        success: false,
        message: errMsg,
      };
    }
  },

  /**
   * Admin: Update episode
   */
  async updateEpisode(
    id: string,
    updates: UpdateEpisodePayload
  ): Promise<{ success: boolean; data?: Episode; message?: string }> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data?: Episode;
      }>(`/api/episodes/${id}`, updates);

      if (response.data && response.data.success) {
        // Also update DEMO_ANIME local cache
        for (const a of DEMO_ANIME) {
          if (!Array.isArray(a.episodes)) continue;
          const idx = a.episodes.findIndex((e) => e.id === id || (e as any)._id === id);
          if (idx !== -1) {
            a.episodes[idx] = {
              ...a.episodes[idx],
              ...updates,
            } as any;
            break;
          }
        }

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Episode updated successfully.',
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to update episode',
      };
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Server error while updating episode.';
      return {
        success: false,
        message: errMsg,
      };
    }
  },

  /**
   * Admin: Permanently delete episode
   */
  async deleteEpisode(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/api/episodes/${id}`);

      if (response.data && response.data.success) {
        // Also remove from DEMO_ANIME cache
        for (const a of DEMO_ANIME) {
          if (!Array.isArray(a.episodes)) continue;
          const idx = a.episodes.findIndex((e) => e.id === id || (e as any)._id === id);
          if (idx !== -1) {
            a.episodes.splice(idx, 1);
            a.episodesCount = a.episodes.length;
            break;
          }
        }

        return {
          success: true,
          message: response.data.message || 'Episode deleted successfully.',
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Failed to delete episode',
      };
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'Server error while deleting episode.';
      return {
        success: false,
        message: errMsg,
      };
    }
  },
};
