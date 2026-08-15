import axios from 'axios';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: AdminUser;
  error?: string;
}

// Enable sending cookies with cross-site requests if applicable
axios.defaults.withCredentials = true;

export const adminAuthService = {
  /**
   * POST /api/admin/login
   * Performs direct admin authentication with username & password
   */
  async login(username: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await axios.post<AdminLoginResponse>('/api/admin/login', {
        username,
        password,
      });
      return response.data;
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
        const errorData = err.response.data as { error?: string; message?: string };
        return {
          success: false,
          error: errorData.message || errorData.error || 'Unable to sign in. Please try again.',
        };
      }
      return {
        success: false,
        error: 'Unable to sign in. Please try again.',
      };
    }
  },

  /**
   * GET /api/admin/me
   * Validates active admin session
   */
  async getMe(): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
      const response = await axios.get('/api/admin/me');
      return response.data;
    } catch {
      return { success: false, error: 'Unauthorized.' };
    }
  },

  /**
   * POST /api/admin/logout
   * Destroys admin session cookie
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await axios.post('/api/admin/logout');
      return response.data;
    } catch {
      return { success: false };
    }
  },
};
