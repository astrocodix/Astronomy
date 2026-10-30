'use client';
import mediaRegistry from '../../public/images/attributions.json';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Library as LibraryIcon,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useApp } from './context';
import {
  PageHeader,
  Button,
  Arrow,
  Pill,
  Loading,
  EmptyState,
  Modal,
  Markdown,
  SourceLinks,
  SectionHeading,
} from './ui';
const credits: Record<string, any> = mediaRegistry;
const categories: Record<string, string> = {
  'All topics': 'كل الموضوعات',
  Astronomy: 'علم الفلك',
  Astrophysics: 'الفيزياء الفلكية',
  Cosmology: 'علم الكونيات',
  Stars: 'النجوم',
  History: 'التاريخ',
  Research: 'البحث العلمي',
  Mathematics: 'الرياضيات',
  'Observational Astronomy': 'الرصد الفلكي',
};
export function ScientificLibrary() {
  const { data, t, tr, lang, api, refresh, notify } = useApp();
  const [articles, setArticles] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All topics');
  const [onlySaved, setOnlySaved] = useState(false);
  const [open, setOpen] = useState<any>(null);
  useEffect(() => {
    api('library')
      .then(setArticles)
      .catch((e) => setError(e.message));
  }, [api]);
  if (!data) return null;
  const isSaved = (id: string) => data.progress.bookmarks.some((b: any) => b.articleId === id);
  const filtered =
    articles?.filter(
      (a) =>
        (category === 'All topics' || a.category === category) &&
        (!onlySaved || isSaved(a.id)) &&
        `${tr(a)} ${tr(a, 'summary')} ${tr(a, 'content')}`.toLowerCase().includes(q.toLowerCase()),
    ) || [];
  const save = async (id: string) => {
    try {
      const r = await api('bookmarks', { method: 'POST', body: JSON.stringify({ articleId: id }) });
      await refresh();
      notify(
        r.saved
          ? t('Saved to your personal library.', 'حُفظ في مكتبتك الشخصية.')
          : t('Removed from saved articles.', 'أُزيل من المقالات المحفوظة.'),
      );
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  };
  return (
    <div className="library-page page-enter">
      <PageHeader
        eyebrow={t('KNOWLEDGE, WITHOUT THE NOISE', 'معرفة بلا تشويش')}
        title={t('Ideas worth looking into.', 'أفكار تستحق التأمل.')}
        description={t(
          'A source-grounded reading room for your most cosmic questions.',
          'قاعة قراءة موثقة لأسئلتك الأكثر كونية.',
        )}
        action={
          <Button
            variant={onlySaved ? 'primary' : 'secondary'}
            onClick={() => setOnlySaved((v) => !v)}
          >
            <Bookmark size={16} />
            {t('My saved articles', 'مقالاتي المحفوظة')}
          </Button>
        }
      />
      <div className="library-search">
        <Search size={22} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('What would you like to understand?', 'ماذا تود أن تفهم؟')}
          aria-label={t('Search scientific library', 'ابحث في المكتبة العلمية')}
        />
        <span>
          {articles?.length || 0} {t('pilot articles', 'مقالات تجريبية')}
        </span>
      </div>
      <div className="library-topics">
        {Object.entries(categories).map(([en, ar]) => (
          <button
            className={category === en ? 'active' : ''}
            key={en}
            onClick={() => setCategory(en)}
          >
            {t(en, ar)}
          </button>
        ))}
      </div>
      {error ? (
        <EmptyState
          title={t('Could not load the library', 'تعذر تحميل المكتبة')}
          description={error}
        />
      ) : !articles ? (
        <Loading />
      ) : filtered.length ? (
        <div className="library-grid">
          {filtered.map((a) => {
            const key = a.image.split('/').pop().replace('.webp', '');
            const credit = credits[key];
            return (
              <article className="article-card panel" key={a.id}>
                <button onClick={() => setOpen(a)} className="article-cover">
                  <img src={a.image} alt={tr(credit, 'alt') || tr(a)} loading="lazy" />
                  <span className="article-category">
                    {t(a.category, categories[a.category] || a.category)}
                  </span>
                  <span className="article-credit">{credit?.credit}</span>
                </button>
                <div className="article-body">
                  <div className="article-meta">
                    <span>
                      <Clock size={12} />
                      {a.readMinutes} {t('min read', 'دقائق قراءة')}
                    </span>
                    <button
                      className={`icon-btn ${isSaved(a.id) ? 'accent-text' : ''}`}
                      onClick={() => save(a.id)}
                      aria-label={t(
                        isSaved(a.id) ? 'Remove saved article' : 'Save article',
                        isSaved(a.id) ? 'إزالة المقال المحفوظ' : 'حفظ المقال',
                      )}
                    >
                      {isSaved(a.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>
                  <button className="article-title" onClick={() => setOpen(a)}>
                    <h2>{tr(a)}</h2>
                  </button>
                  <p>{tr(a, 'summary')}</p>
                  <button className="text-link" onClick={() => setOpen(a)}>
                    {t('Follow your curiosity', 'اتبع فضولك')}
                    <Arrow size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={onlySaved ? Bookmark : Search}
          title={t(
            onlySaved ? 'Your personal reading room starts here.' : 'No articles in this orbit.',
            onlySaved ? 'تبدأ قاعة قراءتك الشخصية هنا.' : 'لا مقالات في هذا المدار.',
          )}
          description={t(
            onlySaved
              ? 'Save any article using the bookmark icon to find it here later.'
              : 'Try a different topic or search term.',
            onlySaved
              ? 'احفظ مقالًا برمز الإشارة المرجعية لتجده هنا لاحقًا.'
              : 'جرّب موضوعًا أو مصطلحًا مختلفًا.',
          )}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setOnlySaved(false);
                setCategory('All topics');
                setQ('');
              }}
            >
              {t('Browse all articles', 'تصفّح كل المقالات')}
            </Button>
          }
        />
      )}
      <section className="library-source-banner">
        <BookOpen size={24} />
        <div>
          <h3>{t('Good science leaves a trail.', 'يترك العلم الجيد أثرًا موثقًا.')}</h3>
          <p>
            {t(
              'Our reading material links back to NASA and OpenStax. Open a source, question an explanation, and build your own understanding.',
              'تعود موادنا إلى ناسا وOpenStax. افتح المصدر وناقش التفسير وابنِ فهمك بنفسك.',
            )}
          </p>
        </div>
        <Link href="/tutor">
          {t('Ask Astro', 'اسأل أسترو')}
          <ArrowUpRight size={17} />
        </Link>
      </section>
      {open && (
        <Modal title={tr(open)} onClose={() => setOpen(null)} wide>
          <div className="article-reader">
            <Pill tone="purple">
              {t(open.category, categories[open.category] || open.category)}
            </Pill>
            <p className="article-lede">{tr(open, 'summary')}</p>
            <figure className="science-figure">
              <img
                src={open.image}
                alt={
                  tr(credits[open.image.split('/').pop().replace('.webp', '')], 'alt') || tr(open)
                }
              />
              <figcaption>
                {tr(credits[open.image.split('/').pop().replace('.webp', '')], 'caption')}
                <br />
                {credits[open.image.split('/').pop().replace('.webp', '')]?.credit}
                <a
                  className="text-link"
                  href={credits[open.image.split('/').pop().replace('.webp', '')]?.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('Image source', 'مصدر الصورة')}
                  <ExternalLink size={12} />
                </a>
              </figcaption>
            </figure>
            <Markdown text={tr(open, 'content')} />
            <SourceLinks references={open.references} />
            <div className="button-row">
              <Button href={`/lesson/${open.lessonId}`}>
                <BookOpen size={16} />
                {t('Explore the related lesson', 'استكشف الدرس المرتبط')}
              </Button>
              <Button
                variant="secondary"
                href={`/questions?module=m-1-${open.id.split('-').pop()}`}
              >
                <Sparkles size={16} />
                {t('Try related questions', 'جرّب أسئلة مرتبطة')}
              </Button>
              <Button variant="ghost" onClick={() => save(open.id)}>
                {isSaved(open.id) ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {t(
                  isSaved(open.id) ? 'Saved' : 'Save article',
                  isSaved(open.id) ? 'محفوظ' : 'احفظ المقال',
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
