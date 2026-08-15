import axios from 'axios';
import { Anime, Episode } from '../types/anime';
import { DEMO_ANIME } from '../utils/animeData';

axios.defaults.withCredentials = true;

// Helper to keep local DEMO_ANIME synchronized
function syncLocalCatalog(updatedList: Anime[]) {
  if (Array.isArray(updatedList) && updatedList.length > 0) {
    // Preserve existing references or update in place
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
      const response = await axios.get<{ success: boolean; data: Anime[] }>('/api/anime', { params });
      if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        syncLocalCatalog(response.data.data);
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return DEMO_ANIME;
  },

  /**
   * Fetch single anime by ID or slug
   */
  async getAnimeById(id: string): Promise<Anime | null> {
    try {
      const response = await axios.get<{ success: boolean; data: Anime }>(`/api/anime/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback to local
    }
    return DEMO_ANIME.find((a) => a.id === id || a.slug === id) || null;
  },

  /**
   * Admin: Add new anime
   */
  async createAnime(animeData: Partial<Anime> & { [key: string]: any }): Promise<{ success: boolean; data?: Anime; message?: string }> {
    try {
      const response = await axios.post<{ success: boolean; data: Anime; message: string }>('/api/anime', animeData);
      if (response.data.success && response.data.data) {
        // Sync locally
        const created = response.data.data;
        const exists = DEMO_ANIME.some((a) => a.id === created.id);
        if (!exists) {
          DEMO_ANIME.unshift(created);
        }
        return { success: true, data: created, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Failed to create anime.' };
    } catch (err: any) {
      // Offline local creation fallback
      const generatedId = animeData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `anime-${Date.now()}`;
      const newAnime: Anime = {
        id: animeData.id || generatedId,
        slug: generatedId,
        title: animeData.title || 'Untitled Anime',
        japaneseTitle: animeData.japaneseTitle || '',
        description: animeData.description || '',
        poster: animeData.poster || animeData.posterImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        banner: animeData.banner || animeData.bannerImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        rating: Number(animeData.rating) || 8.0,
        year: Number(animeData.year || animeData.releaseYear) || new Date().getFullYear(),
        genres: Array.isArray(animeData.genres) ? animeData.genres : ['Action', 'Fantasy'],
        episodesCount: Number(animeData.episodesCount || animeData.totalEpisodes) || 12,
        status: (animeData.status as any) || 'Ongoing',
        type: (animeData.type as any) || 'TV',
        studio: animeData.studio || 'Unknown Studio',
        duration: animeData.duration || '24m',
        isSubbed: true,
        isDubbed: Boolean(animeData.isDubbed),
        isTrending: Boolean(animeData.isTrending || animeData.trending),
        isPopular: Boolean(animeData.isPopular || animeData.popular),
        isTopRated: (Number(animeData.rating) || 8.0) >= 8.5,
        isRecentlyAdded: true,
        featuredInHero: Boolean(animeData.featuredInHero || animeData.isFeatured || animeData.featured),
        episodes: Array.isArray(animeData.episodes) ? animeData.episodes : [],
      };
      DEMO_ANIME.unshift(newAnime);
      return { success: true, data: newAnime, message: 'Anime created successfully.' };
    }
  },

  /**
   * Admin: Update anime
   */
  async updateAnime(id: string, updates: Partial<Anime> & { [key: string]: any }): Promise<{ success: boolean; data?: Anime; message?: string }> {
    try {
      const response = await axios.put<{ success: boolean; data: Anime; message: string }>(`/api/anime/${id}`, updates);
      if (response.data.success && response.data.data) {
        const updated = response.data.data;
        const index = DEMO_ANIME.findIndex((a) => a.id === id || a.slug === id);
        if (index !== -1) {
          DEMO_ANIME[index] = { ...DEMO_ANIME[index], ...updated };
        }
        return { success: true, data: updated, message: response.data.message };
      }
    } catch {
      // Local fallback
    }

    const index = DEMO_ANIME.findIndex((a) => a.id === id || a.slug === id);
    if (index !== -1) {
      DEMO_ANIME[index] = { ...DEMO_ANIME[index], ...updates };
      return { success: true, data: DEMO_ANIME[index], message: 'Anime updated successfully.' };
    }

    return { success: false, message: 'Anime not found.' };
  },

  /**
   * Admin: Delete anime
   */
  async deleteAnime(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(`/api/anime/${id}`);
      if (response.data.success) {
        const idx = DEMO_ANIME.findIndex((a) => a.id === id || a.slug === id);
        if (idx !== -1) DEMO_ANIME.splice(idx, 1);
        return { success: true, message: response.data.message };
      }
    } catch {
      // Local fallback
    }

    const idx = DEMO_ANIME.findIndex((a) => a.id === id || a.slug === id);
    if (idx !== -1) {
      DEMO_ANIME.splice(idx, 1);
      return { success: true, message: 'Anime deleted successfully.' };
    }
    return { success: false, message: 'Anime not found.' };
  },

  /**
   * Admin: Get all episodes
   */
  async getAllEpisodes(animeId?: string): Promise<Array<Episode & { animeId: string; animeTitle: string }>> {
    try {
      const response = await axios.get<{ success: boolean; data: any[] }>('/api/episodes', {
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
      const response = await axios.post<{ success: boolean; data: Episode; message: string }>('/api/episodes', {
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
      const response = await axios.put<{ success: boolean; message: string }>(`/api/episodes/${episodeId}`, updates);
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
      const response = await axios.delete<{ success: boolean; message: string }>(`/api/episodes/${episodeId}`);
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
