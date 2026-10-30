'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Route,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  Telescope,
  Library,
  ChartNoAxesCombined,
  Award,
  GraduationCap,
  Settings,
  Search,
  Sun,
  Moon,
  Bell,
  Globe,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
  Command,
  Plus,
  HelpCircle,
  Orbit,
  Star,
} from 'lucide-react';
import { useApp } from './context';
import { Brand, Button, Modal, Arrow, EmptyState } from './ui';
const groups = [
  {
    label: ['WORKSPACE', 'مساحة التعلم'],
    items: [
      ['/', 'Overview', 'نظرة عامة', LayoutDashboard],
      ['/roadmap', 'Learning roadmap', 'مسار التعلم', Route],
      ['/courses', 'My courses', 'دوراتي', BookOpen],
      ['/tutor', 'Astro AI', 'أسترو AI', Sparkles],
      ['/exams', 'Practice & exams', 'التدريب والاختبارات', ClipboardCheck],
    ],
  },
  {
    label: ['EXPLORE', 'استكشف'],
    items: [
      ['/observatory', 'Observatory', 'المرصد الفلكي', Telescope],
      ['/library', 'Scientific library', 'المكتبة العلمية', Library],
    ],
  },
  {
    label: ['YOUR JOURNEY', 'رحلتك'],
    items: [
      ['/progress', 'My progress', 'تقدمي', ChartNoAxesCombined],
      ['/achievements', 'Achievements', 'الإنجازات', Award],
      ['/certificates', 'Certificates', 'الشهادات', GraduationCap],
    ],
  },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const { data, t, tr, lang, setLang, theme, setTheme, api, refresh, notify } = useApp();
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [profile, setProfile] = useState(false);
  const closeSearch = useCallback(() => setSearch(false), []);
  const [smallScreen, setSmallScreen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const mq = matchMedia('(max-width:760px)');
    const apply = () => {
      setSmallScreen(mq.matches);
      if (!mq.matches) setMobile(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  useEffect(() => {
    if (!mobile || !smallScreen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const items = () =>
      Array.from(
        navRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') || [],
      ).filter((el) => el.getClientRects().length > 0);
    items()[0]?.focus();
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobile(false);
      if (e.key === 'Tab') {
        const list = items(),
          first = list[0],
          last = list.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
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
    setNotifications(false);
    setProfile(false);
  }, [path]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  const current = groups
    .flatMap((g) => g.items)
    .find((i) => path === i[0] || (i[0] !== '/' && path.startsWith(String(i[0]))));
  const results =
    data?.stages
      .flatMap((s) => [
        {
          id: s.id,
          title: tr(s),
          href: `/stages/${s.id}`,
          type: t('Learning stage', 'مرحلة تعليمية'),
        },
        ...s.modules.flatMap((m) =>
          m.lessons.map((l) => ({
            id: l.id,
            title: tr(l),
            href: `/lesson/${l.id}`,
            type: t('Lesson', 'درس'),
          })),
        ),
      ])
      .filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 12) || [];
  const unread = data?.progress.notifications.filter((n: any) => !n.read).length || 0;
  const toggleTheme = () => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  };
  return (
    <div className="app-shell">
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
        <Link href="/" className="logo-link" aria-label="Astroverse Academy">
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
          {groups.map((group, i) => (
            <div className="nav-group" key={i}>
              <div className="nav-label">{t(group.label[0], group.label[1])}</div>
              {group.items.map(([href, en, ar, Icon]: any) => {
                const active =
                  href === '/'
                    ? path === '/'
                    : path.startsWith(href) ||
                      (href === '/courses' &&
                        (path.startsWith('/lesson') || path.startsWith('/stages'))) ||
                      (href === '/exams' && (path.startsWith('/exam/') || path === '/questions'));
                return (
                  <Link
                    href={href}
                    key={href}
                    className={`nav-item ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={18} strokeWidth={1.7} />
                    <span>{t(en, ar)}</span>
                    {href === '/tutor' && <span className="ai-nav-badge">AI</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/welcome" className="sidebar-invitation">
            <div className="mini-stars">
              <Sparkles size={17} />
              <span>✦</span>
              <span>·</span>
            </div>
            <strong>{t('A universe of possibility.', 'كون من الإمكانات.')}</strong>
            <p>{t('One curious question at a time.', 'سؤال فضولي واحد في كل مرة.')}</p>
            <span>
              {t('Discover the academy', 'اكتشف الأكاديمية')}
              <ArrowUpRight size={14} />
            </span>
          </Link>
          <Link href="/settings" className={`nav-item ${path === '/settings' ? 'active' : ''}`}>
            <Settings size={18} />
            <span>{t('Settings', 'الإعدادات')}</span>
          </Link>
          {['ADMIN', 'INSTRUCTOR'].includes(data?.user.role) && (
            <Link href="/admin" className="nav-item">
              <ShieldCheck size={18} />
              {t('Content studio', 'استوديو المحتوى')}
            </Link>
          )}
          <Link href={data?.user.isGuest ? '/register' : '/profile'} className="sidebar-user">
            <span className="avatar">
              {data?.user.isGuest ? <Orbit size={20} /> : data?.user.name.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>
                {data?.user.isGuest ? t('Guest explorer', 'مستكشف زائر') : data?.user.name}
              </strong>
              <small>
                {data?.user.isGuest
                  ? t('Save your journey', 'احفظ رحلتك')
                  : t('Astronomy learner', 'متعلم علم الفلك')}
              </small>
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
              <span>{t('My workspace', 'مساحة التعلم')}</span>
              <ChevronRight size={13} className="directional" />
              <strong>
                {current
                  ? t(String(current[1]), String(current[2]))
                  : path.startsWith('/lesson')
                    ? t('Learning space', 'مساحة الدرس')
                    : path.startsWith('/admin')
                      ? t('Content studio', 'استوديو المحتوى')
                      : t('Your academy', 'أكاديميتك')}
              </strong>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search"
              aria-label={t('Search the universe', 'ابحث في الكون')}
              onClick={() => setSearch(true)}
            >
              <Search size={16} />
              <span>{t('Search the universe…', 'ابحث في الكون…')}</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="topbar-divider" />
            <button
              className="language-button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              aria-label={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <Globe size={17} />
              <span>{lang === 'en' ? 'EN' : 'AR'}</span>
              <ChevronDown size={11} />
            </button>
            <button
              className="icon-btn theme-toggle"
              onClick={toggleTheme}
              aria-label={t('Switch light or dark theme', 'تغيير المظهر الفاتح أو الداكن')}
              title={t('Change theme', 'تغيير المظهر')}
            >
              <Sun size={18} className="sun-icon" />
              <Moon size={18} className="moon-icon" />
            </button>
            <div className="popover-anchor">
              <button
                className="icon-btn notification-toggle"
                aria-label={t('Notifications', 'الإشعارات')}
                onClick={() => {
                  setNotifications((v) => !v);
                  setProfile(false);
                }}
              >
                <Bell size={18} />
                {unread > 0 && <span className="notification-dot" />}
              </button>
              {notifications && (
                <div className="header-popover">
                  <div className="popover-heading">
                    <strong>{t('Your updates', 'تحديثاتك')}</strong>
                    <button
                      className="text-link"
                      onClick={async () => {
                        await api('notifications', { method: 'POST' });
                        await refresh();
                      }}
                    >
                      {t('Mark all read', 'قراءة الكل')}
                    </button>
                  </div>
                  {data?.progress.notifications.length ? (
                    data.progress.notifications.map((n: any) => (
                      <Link
                        href={n.href}
                        className={`notification-item ${n.read ? 'read' : ''}`}
                        key={n.id}
                      >
                        <Sparkles size={17} />
                        <span>
                          <strong>{tr(n)}</strong>
                          <small>{tr(n, 'body')}</small>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="muted">{t('You’re all caught up.', 'أنت على اطلاع بكل جديد.')}</p>
                  )}
                </div>
              )}
            </div>
            <div className="popover-anchor">
              <button
                className="avatar avatar-button"
                onClick={() => {
                  setProfile((v) => !v);
                  setNotifications(false);
                }}
                aria-label={t('Account menu', 'قائمة الحساب')}
              >
                {data?.user.isGuest ? <Orbit size={19} /> : data?.user.name[0]}
              </button>
              {profile && (
                <div className="header-popover profile-popover">
                  <strong>
                    {data?.user.isGuest
                      ? t('Welcome, explorer', 'مرحبًا أيها المستكشف')
                      : data?.user.name}
                  </strong>
                  <p>
                    {data?.user.isGuest
                      ? t(
                          'Create an account to keep your discoveries.',
                          'أنشئ حسابًا للاحتفاظ باكتشافاتك.',
                        )
                      : data?.user.email}
                  </p>
                  <Link href={data?.user.isGuest ? '/register' : '/profile'}>
                    {t(
                      data?.user.isGuest ? 'Create account' : 'My profile',
                      data?.user.isGuest ? 'إنشاء حساب' : 'ملفي الشخصي',
                    )}
                    <Arrow />
                  </Link>
                  <Link href="/settings">
                    {t('Preferences', 'التفضيلات')}
                    <Settings size={15} />
                  </Link>
                  {!data?.user.isGuest && (
                    <button
                      onClick={async () => {
                        await api('auth/logout', { method: 'POST' });
                        await refresh();
                        setProfile(false);
                        router.push('/');
                        notify(t('You have signed out.', 'تم تسجيل الخروج.'));
                      }}
                    >
                      {t('Sign out', 'تسجيل الخروج')}
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>
            <span className="footer-star">✦</span>
            {t(
              'Made for curious minds. Built on real science.',
              'للعقول الفضولية. مبنية على علم حقيقي.',
            )}
          </span>
          <div>
            <Link href="/welcome#faq">{t('Need a little guidance?', 'تحتاج إلى إرشاد؟')}</Link>
            <span>ASTROVERSE © {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
      {search && (
        <Modal title={t('What will you discover?', 'ماذا ستكتشف؟')} onClose={closeSearch}>
          <div className="search-input-wrap">
            <Search size={20} />
            <input
              autoFocus
              placeholder={t('Search stages and lessons…', 'ابحث في المراحل والدروس…')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="search-results">
            {results.map((r) => (
              <Link href={r.href} key={r.id} onClick={closeSearch}>
                <span className="search-result-icon">
                  <BookOpen size={18} />
                </span>
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.type}</small>
                </span>
                <Arrow />
              </Link>
            ))}
            {!results.length && (
              <EmptyState
                icon={Search}
                title={t('No results in this orbit', 'لا نتائج في هذا المدار')}
                description={t(
                  'Try a topic such as stars, light, or astronomy.',
                  'جرّب النجوم أو الضوء أو علم الفلك.',
                )}
              />
            )}
          </div>
          <div className="search-hint">
            <kbd>esc</kbd> {t('to close', 'للإغلاق')}
          </div>
        </Modal>
      )}
    </div>
  );
}
