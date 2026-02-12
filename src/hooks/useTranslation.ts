import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import translations from '@/locales';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}` | K
        : K
      : never
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<typeof translations.en>;

export function useTranslation() {
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);
  
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations[currentLanguage] || translations.en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            return key;
          }
        }
        break;
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace parameters like {min}, {max}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return result;
  }, [currentLanguage]);

  return { t, currentLanguage };
}
