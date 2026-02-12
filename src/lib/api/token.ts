import { STORAGE_KEYS } from "./config";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token management utilities.
 * Reads/writes JWT tokens from localStorage.
 */
export const TokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getTokens(): TokenPair | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  setTokens({ accessToken, refreshToken }: TokenPair): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
