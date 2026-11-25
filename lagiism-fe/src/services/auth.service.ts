import { API_ENDPOINTS } from '../constants/api';
import { apiGet, apiPost } from '../lib/api-client';
import {
  clearTokens,
  getRefreshToken,
  setCsrfToken,
  setTokens,
} from '../lib/axios';
import { AuthTokenResponse, AuthUser } from '../types/api';

export const authService = {
  async fetchCsrf(): Promise<string> {
    const data = await apiGet<{ headerName: string; token: string }>(
      API_ENDPOINTS.AUTH.CSRF
    );
    if (data?.token) {
      setCsrfToken(data.token);
    }
    return data.token;
  },

  async register(
    email: string,
    fullName: string,
    password: string
  ): Promise<AuthTokenResponse> {
    const res = await apiPost<AuthTokenResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      email,
      fullName,
      password,
    });
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  async login(email: string, password: string): Promise<AuthTokenResponse> {
    await this.fetchCsrf();
    const res = await apiPost<AuthTokenResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  async loginWithGoogle(idToken: string): Promise<AuthTokenResponse> {
    const res = await apiPost<AuthTokenResponse>(API_ENDPOINTS.AUTH.GOOGLE, {
      idToken,
    });
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  async refresh(): Promise<AuthTokenResponse> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const res = await apiPost<AuthTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  async me(): Promise<AuthUser> {
    return apiGet<AuthUser>(API_ENDPOINTS.AUTH.ME);
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      await apiPost<void>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } finally {
      clearTokens();
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiPost<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await this.fetchCsrf();
    await apiPost<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    await this.fetchCsrf();
    await apiPost<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
  },
};
