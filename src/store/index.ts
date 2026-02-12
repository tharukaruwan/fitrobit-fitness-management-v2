import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';
import currencyReducer from './currencySlice';
import authReducer from './authSlice';
import sidebarReducer from './sidebarSlice';

export const store = configureStore({
  reducer: {
    language: languageReducer,
    currency: currencyReducer,
    auth: authReducer,
    sidebar: sidebarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
