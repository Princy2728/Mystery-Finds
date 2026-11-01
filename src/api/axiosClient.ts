import axios, { AxiosError } from 'axios';

export interface ApiClientError {
  code: string;
  message: string;
  status: number;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
export const SESSION_STORAGE_KEY = 'mr_session_token';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach stored session token to every request for iframe / partitioned cookie support
apiClient.interceptors.request.use((config) => {
  try {
    const savedToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedToken) {
      config.headers['X-Player-Session'] = savedToken;
    }
  } catch {
    // Ignore storage errors in restrictive environments
  }
  return config;
});

// Intercept responses to extract and persist session tokens
apiClient.interceptors.response.use(
  (response) => {
    try {
      const headerToken = response.headers?.['x-player-session'];
      const bodyToken = (response.data as { data?: { sessionToken?: string } })?.data?.sessionToken;
      const token = headerToken || bodyToken;
      if (token && typeof token === 'string') {
        localStorage.setItem(SESSION_STORAGE_KEY, token);
      }
    } catch {
      // Ignore storage errors
    }
    return response;
  },
  (error: AxiosError<{ success: false; error?: { code?: string; message?: string } }>) => {
    const status = error.response?.status || 500;
    const errorData = error.response?.data?.error;
    const code = errorData?.code || (status === 404 ? 'CASE_NOT_FOUND' : 'INTERNAL_ERROR');
    const message =
      errorData?.message ||
      error.message ||
      'An unexpected error occurred while contacting the precinct.';

    const normalizedError: ApiClientError = {
      code,
      message,
      status,
    };

    return Promise.reject(normalizedError);
  }
);
