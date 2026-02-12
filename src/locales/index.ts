import enTranslations from './en.json';
import arTranslations from './ar.json';
import siTranslations from './si.json';
import taTranslations from './ta.json';
import frTranslations from './fr.json';
import deTranslations from './de.json';
import thTranslations from './th.json';
import type { LanguageCode } from '@/store/languageSlice';

export type TranslationKeys = typeof enTranslations;

const translations: Record<LanguageCode, TranslationKeys> = {
  en: enTranslations,
  ar: arTranslations,
  si: siTranslations,
  ta: taTranslations,
  fr: frTranslations,
  de: deTranslations,
  th: thTranslations,
  // Fallback to English for languages not yet translated
  es: enTranslations,
  pt: enTranslations,
  ja: enTranslations,
  zh: enTranslations,
  ko: enTranslations,
  hi: enTranslations,
  ru: enTranslations,
};

export default translations;
