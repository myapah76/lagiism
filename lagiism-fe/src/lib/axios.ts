import axios from 'axios';
import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from '../constants/api';

const ACCESS_TOKEN_KEY = 'lagiism_access_token';
const REFRESH_TOKEN_KEY = 'lagiism_refresh_token';

let cachedCsrfToken: string | null = null;
let memoryAccessToken: string | null = null;

export function setCsrfToken(token: string | null) {
  cachedCsrfToken = token;
}

export function setTokens(accessToken: string | null, refreshToken: string | null) {
  memoryAccessToken = accessToken;
  if (typeof window !== 'undefined') {
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

export function getAccessToken(): string | null {
  if (memoryAccessToken) return memoryAccessToken;
  if (typeof window !== 'undefined') {
    memoryAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    return memoryAccessToken;
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

export function clearTokens() {
  setTokens(null, null);
  setCsrfToken(null);
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const method = (config.method || 'get').toLowerCase();
  if (MUTATING_METHODS.has(method)) {
    const token = cachedCsrfToken || readCookie('XSRF-TOKEN');
    if (token) {
      config.headers.set('X-XSRF-TOKEN', token);
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const refreshed = response.headers?.['x-xsrf-token'];
    if (typeof refreshed === 'string' && refreshed.length > 0) {
      cachedCsrfToken = refreshed;
    }
    return response;
  },
  (error) => {
    const refreshed = error?.response?.headers?.['x-xsrf-token'];
    if (typeof refreshed === 'string' && refreshed.length > 0) {
      cachedCsrfToken = refreshed;
    }
    return Promise.reject(error);
  }
);
