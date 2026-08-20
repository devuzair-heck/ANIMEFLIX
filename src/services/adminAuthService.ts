import axios from 'axios';
import { apiClient } from './apiConfig';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
}

export interface DashboardStats {
  totalAnime: number;
  totalEpisodes: number;
  publishedAnime: number;
  draftAnime: number;
}

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: AdminUser;
  error?: string;
}

const TOKEN_KEY = 'animeflix_admin_token';
const ADMIN_KEY = 'animeflix_admin_user';

export const adminAuthService = {
  /**
   * Returns current token from storage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Returns cached admin info from storage
   */
  getCachedAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * POST /api/admin/login
   * Performs direct admin authentication with username & password
   */
  async login(username: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>('/api/admin/login', {
        username: username.trim(),
        password,
      });

      const data: AdminLoginResponse = response?.data || { success: false };

      if (data.success && data.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, data.token);
          if (data.admin) {
            localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
          }
        }
      }

      return {
        success: Boolean(data.success),
        message: data.message || 'Login successful',
        token: data.token,
        admin: data.admin,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          return {
            success: false,
            error: 'Unable to connect to the server.',
          };
        }
        if (err.response.status === 401) {
          return {
            success: false,
            error: 'Invalid username or password.',
          };
        }
        if (err.response.status === 404) {
          return {
            success: false,
            error: 'Admin login service was not found. Please check the backend API configuration.',
          };
        }
        if (err.response.status === 500) {
          return {
            success: false,
            error: 'Server error. Please try again.',
          };
        }
        if (err.response.status === 400) {
          const errorData = (err.response.data as { error?: string; message?: string }) || {};
          return {
            success: false,
            error: errorData.message || errorData.error || 'Invalid request. Please check your credentials.',
          };
        }
        const errorData = (err.response.data as { error?: string; message?: string }) || {};
        return {
          success: false,
          error: errorData.message || errorData.error || 'Something went wrong. Please try again.',
        };
      }
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      };
    }
  },

  /**
   * GET /api/admin/me
   * Validates active admin session
   */
  async getMe(): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
      const response = await apiClient.get('/api/admin/me');
      const data = response?.data || {};

      if (data.success && data.admin) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
        }
        return { success: true, admin: data.admin };
      }

      return { success: false, error: 'Unauthorized.' };
    } catch {
      // Clear invalid state
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
      }
      return { success: false, error: 'Unauthorized.' };
    }
  },

  /**
   * POST /api/admin/logout
   * Destroys admin session cookie and local token
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      await apiClient.post('/api/admin/logout');
    } catch {
      // Proceed with local cleanup regardless
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
      }
    }
    return { success: true };
  },

  /**
   * GET /api/admin/dashboard/stats
   * Fetches realtime statistics directly from MongoDB
   */
  async getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    try {
      const response = await apiClient.get('/api/admin/dashboard/stats');
      const payload = response?.data || {};
      const stats: DashboardStats = {
        totalAnime: Number(payload?.totalAnime ?? payload?.stats?.totalAnime ?? 0),
        totalEpisodes: Number(payload?.totalEpisodes ?? payload?.stats?.totalEpisodes ?? 0),
        publishedAnime: Number(payload?.publishedAnime ?? payload?.stats?.publishedAnime ?? 0),
        draftAnime: Number(payload?.draftAnime ?? payload?.stats?.draftAnime ?? 0),
      };
      return { success: true, data: stats };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          return {
            success: false,
            error: 'Dashboard statistics service not found.',
            data: { totalAnime: 0, totalEpisodes: 0, publishedAnime: 0, draftAnime: 0 },
          };
        }
        if (err.response?.data?.message) {
          return {
            success: false,
            error: err.response.data.message,
            data: { totalAnime: 0, totalEpisodes: 0, publishedAnime: 0, draftAnime: 0 },
          };
        }
      }
      return {
        success: false,
        error: 'Unable to load dashboard statistics.',
        data: { totalAnime: 0, totalEpisodes: 0, publishedAnime: 0, draftAnime: 0 },
      };
    }
  },
};
