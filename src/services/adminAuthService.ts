import axios from 'axios';

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  requireOtp?: boolean;
  challengeId?: string;
  token?: string;
  error?: string;
}

export interface VerifyOtpPayload {
  challengeId?: string;
  emailOtp: string;
  smsOtp: string;
}

// Configure axios defaults for credentials/cookies
axios.defaults.withCredentials = true;

export const adminAuthService = {
  /**
   * Sends admin login credentials to backend API
   * POST /api/admin/login
   */
  async login(username: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await axios.post<AdminLoginResponse>('/api/admin/login', {
        username,
        password,
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as { error?: string; message?: string };
        return {
          success: false,
          error: errorData.error || errorData.message || 'Invalid username or password.',
        };
      }
      return {
        success: false,
        error: 'Invalid username or password.',
      };
    }
  },

  /**
   * Verifies Admin Email and SMS OTPs
   * POST /api/admin/verify-otp
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await axios.post('/api/admin/verify-otp', payload);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as { error?: string; message?: string };
        return {
          success: false,
          error: errorData.error || errorData.message || 'Invalid verification codes.',
        };
      }
      return {
        success: false,
        error: 'Invalid verification codes. Please check both email and SMS codes.',
      };
    }
  },

  /**
   * Triggers backend to resend OTP codes
   * POST /api/admin/resend-otp
   */
  async resendOtp(challengeId?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await axios.post('/api/admin/resend-otp', { challengeId });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as { error?: string; message?: string };
        return {
          success: false,
          error: errorData.error || errorData.message || 'Failed to resend verification codes.',
        };
      }
      return {
        success: false,
        error: 'Unable to request new codes. Please try again.',
      };
    }
  },

  /**
   * Verifies current admin session
   * GET /api/admin/me
   */
  async getMe(): Promise<{ success: boolean; admin?: { id: string; username: string; email: string }; error?: string }> {
    try {
      const response = await axios.get('/api/admin/me');
      return response.data;
    } catch {
      return { success: false, error: 'Unauthorized.' };
    }
  },

  /**
   * Logs out admin and clears session cookie
   * POST /api/admin/logout
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
