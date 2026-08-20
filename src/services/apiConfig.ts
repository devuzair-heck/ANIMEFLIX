import axios from 'axios';

/**
 * Resolves the API Base URL.
 * If VITE_API_URL is provided in environment variables (e.g. deployed frontend calling external backend),
 * use it. Otherwise, defaults to relative path for unified / proxied / same-origin deployments.
 */
export function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const customUrl =
      (import.meta as any).env.VITE_API_URL ||
      (import.meta as any).env.VITE_BACKEND_URL ||
      (import.meta as any).env.VITE_API_BASE_URL;
    if (customUrl && typeof customUrl === 'string' && customUrl.trim() !== '') {
      return customUrl.trim().replace(/\/$/, '');
    }
  }
  return '';
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Pre-configured Axios instance for AnimeFlix
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available in local storage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('animeflix_admin_token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
