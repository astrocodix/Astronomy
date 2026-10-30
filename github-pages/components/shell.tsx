'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Globe,
  LayoutDashboard,
  Library,
  Menu,
  Moon,
  Route,
  Search,
  Sparkles,
  Sun,
  Telescope,
  X,
} from 'lucide-react';
import { Brand, Modal } from '../../src/components/ui';
import type { Localized } from '../../src/content/curriculum';
import { usePages } from './provider';

export type SearchEntry = {
  href: string;
  title: Localized;
  description?: Localized;
  kind: 'stage' | 'lesson';
};
const repository =
  process.env.NEXT_PUBLIC_REPOSITORY_URL || 'https://github.com/astrocodix/Astronomy';
const groups = [
  {
    en: 'YOUR WORKSPACE',
    ar: 'مساحة التعلم',
    items: [
      { href: '/', en: 'Overview', ar: 'نظرة عامة', icon: LayoutDashboard },
      { href: '/roadmap', en: 'Learning roadmap', ar: 'مسار التعلم', icon: Route },
      { href: '/stages/s-1', en: 'Pilot lessons', ar: 'الدروس التجريبية', icon: BookOpen },
    ],
  },
  {
    en: 'EXPLORE',
    ar: 'استكشف',
    items: [
      { href: '/observatory', en: 'Observatory', ar: 'المرصد الفلكي', icon: Telescope },
      { href: '/library', en: 'Images & sources', ar: 'الصور والمصادر', icon: Library },
      { href: '/about', en: 'About this edition', ar: 'عن هذه النسخة', icon: CircleHelp },
    ],
  },
];

export function SiteShell({
  children,
  searchIndex,
}: {
  children: React.ReactNode;
  searchIndex: SearchEntry[];
}) {
  const { lang, setLang, theme, setTheme, t } = usePages();
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const [smallScreen, setSmallScreen] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = matchMedia('(max-width:760px)');
    const update = () => {
      setSmallScreen(mq.matches);
      if (!mq.matches) setMobile(false);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!mobile || !smallScreen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () =>
      Array.from(
        navRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') || [],
      ).filter((item) => item.getClientRects().length > 0);
    focusables()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobile(false);
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keyboard);
      menuRef.current?.focus();
    };
  }, [mobile, smallScreen]);
  useEffect(() => {
    setMobile(false);
    setSearch(false);
  }, [path]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearch((open) => !open);
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);

  const activeItem = groups
    .flatMap((group) => group.items)
    .find((item) =>
      item.href === '/' ? path === '/' : path === item.href || path.startsWith(`${item.href}/`),
    );
  const filtered = searchIndex
    .filter((item) => {
      const needle = query.trim().toLocaleLowerCase();
      return (
        !needle ||
        `${item.title.en} ${item.title.ar} ${item.description?.en || ''} ${item.description?.ar || ''}`
          .toLocaleLowerCase()
          .includes(needle)
      );
    })
    .slice(0, 12);

  return (
    <div className="app-shell gp-shell">
      <a href="#main-content" className="skip-link">
        {t('Skip to content', 'انتقل إلى المحتوى')}
      </a>
      {mobile && <div className="sidebar-scrim" onClick={() => setMobile(false)} />}
      <aside
        id="academy-navigation"
        ref={navRef}
        inert={smallScreen && !mobile}
        aria-hidden={smallScreen && !mobile ? true : undefined}
        className={`sidebar ${mobile ? 'open' : ''}`}
        aria-label={t('Main navigation', 'التنقل الرئيسي')}
      >
        <Link href="/" className="logo-link">
          <Brand />
        </Link>
        <button
          className="mobile-close icon-btn"
          onClick={() => setMobile(false)}
          aria-label={t('Close navigation', 'إغلاق القائمة')}
        >
          <X size={20} />
        </button>
        <nav className="side-nav">
          {groups.map((group) => (
            <div className="nav-group" key={group.en}>
              <div className="nav-label">{t(group.en, group.ar)}</div>
              {group.items.map((item) => {
                const active =
                  item.href === '/'
                    ? path === '/'
                    : path === item.href ||
                      path.startsWith(`${item.href}/`) ||
                      (item.href === '/stages/s-1' && path.startsWith('/lesson/'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon size={18} strokeWidth={1.7} />
                    <span>{t(item.en, item.ar)}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/roadmap" className="sidebar-invitation">
            <div className="mini-stars">
              <Sparkles size={17} />
              <span>✦</span>
              <span>·</span>
            </div>
            <strong>{t('A universe of possibility.', 'كون من الإمكانات.')}</strong>
            <p>{t('One curious question at a time.', 'سؤال فضولي واحد في كل مرة.')}</p>
            <span>
              {t('Discover the roadmap', 'اكتشف مسار التعلم')}
              <ArrowUpRight size={14} />
            </span>
          </Link>
          <Link href="/about" className="sidebar-user">
            <span className="avatar">
              <Globe size={18} />
            </span>
            <span>
              <strong>{t('GitHub Pages edition', 'نسخة صفحات جيت هاب')}</strong>
              <small>{t('Public learning preview', 'معاينة تعليمية عامة')}</small>
            </span>
            <ChevronRight size={15} className="directional" />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-leading">
            <button
              ref={menuRef}
              aria-controls="academy-navigation"
              aria-expanded={mobile}
              className="icon-btn menu-button"
              onClick={() => setMobile(true)}
              aria-label={t('Open navigation', 'فتح القائمة')}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>{t('The academy', 'الأكاديمية')}</span>
              <ChevronRight size={13} className="directional" />
              <strong>
                {activeItem
                  ? t(activeItem.en, activeItem.ar)
                  : path.startsWith('/lesson/')
                    ? t('Learning space', 'مساحة الدرس')
                    : t('Learning roadmap', 'مسار التعلم')}
              </strong>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search"
              aria-label={t('Search the universe… ⌘ K', 'ابحث في الكون… ⌘ K')}
              onClick={() => setSearch(true)}
            >
              <Search size={16} />
              <span>{t('Search the universe…', 'ابحث في الكون…')}</span>
              <kbd aria-hidden="true">⌘ K</kbd>
            </button>
            <div className="topbar-divider" />
            <button
              className="language-button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              aria-label={lang === 'en' ? 'EN: Switch to Arabic' : 'AR: التبديل إلى الإنجليزية'}
            >
              <Globe size={17} />
              <span>{lang === 'en' ? 'EN' : 'AR'}</span>
            </button>
            <button
              className="icon-btn theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={t('Change theme', 'تغيير المظهر')}
            >
              <Sun size={18} className="sun-icon" />
              <Moon size={18} className="moon-icon" />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="app-footer gp-footer">
          <span>
            <span className="footer-star">✦</span>
            {t(
              'Made for curious minds. Built on real science.',
              'صُنع للعقول الفضولية وبُني على العلم.',
            )}
          </span>
          <div>
            <Link href="/about">{t('About this preview', 'عن المعاينة')}</Link>
            <a href={repository} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={12} />
            </a>
          </div>
        </footer>
      </div>
      {search && (
        <Modal
          title={t('Search the academy', 'ابحث في الأكاديمية')}
          onClose={() => {
            setSearch(false);
            setQuery('');
          }}
        >
          <div className="search-input-wrap">
            <Search size={19} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('Search lessons and stages…', 'ابحث في الدروس والمراحل…')}
              aria-label={t('Search lessons and stages', 'ابحث في الدروس والمراحل')}
            />
          </div>
          <div className="search-results">
            {filtered.length ? (
              filtered.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setSearch(false);
                    setQuery('');
                  }}
                >
                  <span className="search-result-icon">
                    {item.kind === 'lesson' ? <BookOpen size={16} /> : <Route size={16} />}
                  </span>
                  <span>
                    <strong>{item.title[lang]}</strong>
                    <small>
                      {item.kind === 'lesson'
                        ? t('Pilot lesson', 'درس تجريبي')
                        : t('Learning stage', 'مرحلة تعليمية')}
                    </small>
                  </span>
                  <ChevronRight size={15} className="directional" />
                </Link>
              ))
            ) : (
              <p className="gp-search-empty">
                {t('No results found. Try a different search.', 'لا توجد نتائج. جرّب بحثًا آخر.')}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
