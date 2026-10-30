'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
export type Lang = 'en' | 'ar';
export type Stage = {
  id: string;
  order: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  color: string;
  status: string;
  modules: Module[];
};
export type Module = {
  id: string;
  stageId: string;
  order: number;
  titleEn: string;
  titleAr: string;
  status: string;
  lessons: LessonRef[];
  _count: { questions: number };
};
export type LessonRef = {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  duration: number;
  order: number;
  difficulty: string;
  reviewStatus: string;
  _count: { questions: number };
};
export type AppData = {
  user: any;
  stages: Stage[];
  progress: any;
  settings: { passingScore: number; enforcePrerequisites: boolean };
  tutor: any;
  counts: { questions: number; lessons: number; modules: number };
  pilot: boolean;
};
export async function request(path: string, options: RequestInit = {}, language = 'en') {
  const headers = new Headers(options.headers);
  headers.set('x-astroverse-client', 'academy');
  headers.set('Accept-Language', language);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const res = await fetch(`/api/${path.replace(/^\//, '')}`, {
    ...options,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      language === 'ar' ? data.errorAr || data.error : data.error || 'Request failed',
    );
  return data;
}
const Context = createContext<any>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [lang, setLanguage] = useState<Lang>('en');
  const [theme, setThemeState] = useState('system');
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<{ id: number; text: string; kind: string }[]>([]);
  const initialized = useRef(false);
  const langRef = useRef(lang);
  langRef.current = lang;
  const notify = useCallback((text: string, kind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((v) => [...v.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts((v) => v.filter((x) => x.id !== id)), 5000);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const d = await request('bootstrap', {}, langRef.current);
      setData(d);
      setError('');
      return d;
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const storedLang = localStorage.getItem('astro-lang') as Lang;
    const storedTheme = localStorage.getItem('astro-theme');
    if (storedLang) setLanguage(storedLang);
    if (storedTheme) setThemeState(storedTheme);
    refresh().then((d) => {
      if (!storedLang && d?.user.profile?.language) setLanguage(d.user.profile.language);
      if (!storedTheme && d?.user.profile?.theme) setThemeState(d.user.profile.theme);
    });
  }, [refresh]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('astro-lang', lang);
  }, [lang]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme);
    apply();
    localStorage.setItem('astro-theme', theme);
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  const api = useCallback(
    (path: string, options: RequestInit = {}) => request(path, options, langRef.current),
    [],
  );
  const setLang = (v: Lang) => {
    setLanguage(v);
    if (data)
      request('profile', { method: 'PATCH', body: JSON.stringify({ language: v }) }).catch(
        () => {},
      );
  };
  const setTheme = (v: string) => {
    setThemeState(v);
    if (data)
      request('profile', { method: 'PATCH', body: JSON.stringify({ theme: v }) }).catch(() => {});
  };
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const tr = (o: any, key = 'title') =>
    o?.[`${key}${lang === 'ar' ? 'Ar' : 'En'}`] || o?.[lang] || '';
  return (
    <Context.Provider
      value={{ data, setData, lang, setLang, theme, setTheme, t, tr, refresh, api, notify, error }}
    >
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((v) => (
          <div className={`toast ${v.kind}`} key={v.id}>
            <span className="toast-dot" />
            {v.text}
            <button
              aria-label={t('Dismiss', 'إغلاق')}
              onClick={() => setToasts((x) => x.filter((z) => z.id !== v.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </Context.Provider>
  );
}
export function useApp(): {
  data: AppData | null;
  setData: any;
  lang: Lang;
  setLang: (v: Lang) => void;
  theme: string;
  setTheme: (v: string) => void;
  t: (en: string, ar: string) => string;
  tr: (o: any, key?: string) => string;
  refresh: () => Promise<any>;
  api: (p: string, o?: RequestInit) => Promise<any>;
  notify: (text: string, kind?: string) => void;
  error: string;
} {
  return useContext(Context);
}
