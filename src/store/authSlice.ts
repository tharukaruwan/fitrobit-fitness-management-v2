import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { TokenManager, TokenPair } from "@/lib/api";
import Request from "@/lib/api/client";
import { AUTH_ROUTES } from "@/lib/api/config";

const STORAGE_KEY = "fitrobit_user";

// The user object from the login API response — extensible for future fields
export interface AuthUser {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  ownerName?: string;
  logo?: string;
  cover?: string;
  type?: string;
  role?: string;
  status?: string;
  address?: string;
  username?: string;
  pwa?: string;
  senderId?: string;
  welcomeMsg?: string;
  calander?: boolean;
  terminated?: boolean;
  blackListed?: boolean;
  settings?: Record<string, unknown>;
  memberIdPattern?: Record<string, unknown>;
  selfSignupIdPattern?: Record<string, unknown>;
  employeeIdPattern?: Record<string, unknown>;
  location?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  renewalDay?: string;
  gatekey?: string;
  // Employee-specific fields
  isEmployee?: boolean;
  employeeName?: string;
  [key: string]: unknown; // allow future fields
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthUser | null;
}

// Load persisted user from localStorage
const loadPersistedUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const persistUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Silently fail
  }
};

const initialState: AuthState = {
  isAuthenticated: TokenManager.isAuthenticated(),
  isLoading: false,
  error: null,
  user: loadPersistedUser(),
};

// Logout thunk
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await Request.delete(AUTH_ROUTES.LOGOUT);
  } catch {
    // Continue logout even if API call fails
  }
  TokenManager.clearTokens();
  localStorage.removeItem(STORAGE_KEY);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setTokens(_state, action: PayloadAction<TokenPair>) {
      TokenManager.setTokens(action.payload);
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      persistUser(action.payload);
    },
    clearUser(state) {
      state.user = null;
      persistUser(null);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.error = null;
      state.user = null;
    });
  },
});

export const { setAuthenticated, setTokens, setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;
