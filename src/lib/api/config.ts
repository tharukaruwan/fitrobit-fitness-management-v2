// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AUTH_ROUTES = {
  REFRESH_TOKEN: "/token/refresh",
  LOGOUT: "/token/logout",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;
