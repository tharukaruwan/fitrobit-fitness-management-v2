import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LanguageCode = 'en' | 'ar' | 'si' | 'ta' | 'fr' | 'de' | 'th' | 'es' | 'pt' | 'ja' | 'zh' | 'ko' | 'hi' | 'ru';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', direction: 'ltr', flag: '🇱🇰' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flag: '🇩🇪' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', flag: '🇹🇭' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', flag: '🇷🇺' },
];

interface LanguageState {
  currentLanguage: LanguageCode;
  translations: Record<string, string>;
  isLoading: boolean;
}

const getStoredLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-language');
    if (stored && supportedLanguages.some(l => l.code === stored)) {
      return stored as LanguageCode;
    }
  }
  return 'en';
};

const initialState: LanguageState = {
  currentLanguage: getStoredLanguage(),
  translations: {},
  isLoading: false,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('app-language', action.payload);
      
      // Update document direction for RTL languages
      const lang = supportedLanguages.find(l => l.code === action.payload);
      if (lang) {
        document.documentElement.dir = lang.direction;
        document.documentElement.lang = action.payload;
      }
    },
    setTranslations: (state, action: PayloadAction<Record<string, string>>) => {
      state.translations = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLanguage, setTranslations, setLoading } = languageSlice.actions;
export default languageSlice.reducer;
