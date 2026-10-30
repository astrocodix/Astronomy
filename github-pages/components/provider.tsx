'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Context as AcademyContext, type Lang } from '../../src/components/context';

const READ_KEY = 'astro-pages-read-lessons';
type Theme = 'dark' | 'light';
type PagesState = {
  lang: Lang;
  setLang: (value: Lang) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  t: (en: string, ar: string) => string;
  readLessons: string[];
  toggleRead: (id: string) => void;
  storageAvailable: boolean;
};
const PagesContext = createContext<PagesState | null>(null);

function parseReadList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((id): id is string => typeof id === 'string' && /^l-\d+-\d+$/.test(id)),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

/** A local-only provider. It never connects to the database-backed academy API. */
export function PagesProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [readLessons, setReadLessons] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('astro-lang');
      const savedTheme = localStorage.getItem('astro-theme');
      if (savedLanguage === 'en' || savedLanguage === 'ar') setLang(savedLanguage);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      else if (savedTheme === 'system')
        setTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setReadLessons(parseReadList(localStorage.getItem(READ_KEY)));
    } catch {
      setStorageAvailable(false);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('astro-lang', lang);
      localStorage.setItem('astro-theme', theme);
      localStorage.setItem(READ_KEY, JSON.stringify(readLessons));
    } catch {
      setStorageAvailable(false);
    }
  }, [lang, theme, readLessons, loaded]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === READ_KEY) setReadLessons(parseReadList(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleRead = useCallback((id: string) => {
    setReadLessons((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  }, []);
  const t = useCallback((en: string, ar: string) => (lang === 'ar' ? ar : en), [lang]);
  const pages = useMemo(
    () => ({ lang, setLang, theme, setTheme, t, readLessons, toggleRead, storageAvailable }),
    [lang, theme, t, readLessons, toggleRead, storageAvailable],
  );
  // Existing visualizations use the same translation context as the server app, but no API.
  const academy = useMemo(
    () => ({
      ...pages,
      data: null,
      tr: (value: Record<string, string>, key = 'title') =>
        value?.[`${key}${lang === 'ar' ? 'Ar' : 'En'}`] || value?.[lang] || '',
      api: async () => {
        throw new Error('Server features are unavailable in the GitHub Pages edition.');
      },
      refresh: async () => null,
      notify: () => {},
      error: '',
    }),
    [pages, lang],
  );

  return (
    <PagesContext.Provider value={pages}>
      <AcademyContext.Provider value={academy}>{children}</AcademyContext.Provider>
    </PagesContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PagesContext);
  if (!context) throw new Error('usePages must be used inside PagesProvider');
  return context;
}
