'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Target,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronDown,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Layers,
  Lightbulb,
  FlaskConical,
  ChevronRight,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from './context';
import {
  Button,
  Arrow,
  Pill,
  Loading,
  ErrorState,
  ProgressBar,
  Markdown,
  SourceLinks,
  Banner,
} from './ui';
import { ConceptDiagram } from './diagrams';
export function LessonViewer({ id }: { id: string }) {
  const { data, t, tr, lang, api, refresh, notify } = useApp();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('beginner');
  const [deep, setDeep] = useState(false);
  const [busy, setBusy] = useState('');
  const [read, setRead] = useState(0);
  const [font, setFont] = useState(16);
  useEffect(() => {
    let live = true;
    setLesson(null);
    setError('');
    api(`lessons/${id}`)
      .then((d) => {
        if (live) setLesson(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [id, api]);
  useEffect(() => {
    if (!lesson) return;
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible')
        api('progress/heartbeat', { method: 'POST', body: JSON.stringify({ lessonId: id }) }).catch(
          () => {},
        );
    }, 30000);
    const scroll = () => {
      const root = document.documentElement;
      const total = root.scrollHeight - window.innerHeight;
      setRead(total > 0 ? Math.min(100, Math.round((root.scrollTop / total) * 100)) : 100);
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('scroll', scroll);
    };
  }, [lesson, id, api]);
  if (error) return <ErrorState message={error} />;
  if (!lesson) return <Loading />;
  const saved = data?.progress.bookmarks.some((b: any) => b.lessonId === id);
  const complete = data?.progress.lessons.some((p: any) => p.lessonId === id && p.completed);
  const sections = lesson.sections.filter(
    (s: any) => s.type !== 'ADVANCED' && (mode !== 'beginner' || s.type !== 'INTERMEDIATE'),
  );
  const bookmark = async () => {
    try {
      const r = await api('bookmarks', { method: 'POST', body: JSON.stringify({ lessonId: id }) });
      await refresh();
      notify(
        r.saved
          ? t('Lesson added to your bookmarks.', 'أُضيف الدرس إلى محفوظاتك.')
          : t('Bookmark removed.', 'أُزيلت الإشارة المرجعية.'),
      );
    } catch (e) {
      notify((e as Error).message, 'error');
    }
  };
  const start = async (kind: string) => {
    setBusy(kind);
    try {
      const e = await api('exams/start', {
        method: 'POST',
        body: JSON.stringify({ kind, scopeId: id }),
      });
      router.push(`/exam/${e.id}`);
    } catch (e) {
      notify((e as Error).message, 'error');
    }
    setBusy('');
  };
  const advanced = lesson.sections.find((s: any) => s.type === 'ADVANCED');
  return (
    <div className="lesson-page page-enter">
      <div className="lesson-breadcrumb">
        <Link href={`/stages/${lesson.module.stage.id}`}>{tr(lesson.module.stage)}</Link>
        <ChevronRight size={12} className="directional" />
        <span>{tr(lesson.module)}</span>
      </div>
      <div className="lesson-header">
        <div className="lesson-kicker">
          <Pill tone="purple">{t('FOUNDATION', 'تأسيسي')}</Pill>
          <span>
            {t('LESSON', 'الدرس')} {lesson.order} / 2
          </span>
          {complete && (
            <Pill tone="teal" icon={<Check size={12} />}>
              {t('Assessed & completed', 'تم تقييمه وإكماله')}
            </Pill>
          )}
        </div>
        <h1>{tr(lesson)}</h1>
        <p>{tr(lesson, 'summary')}</p>
        <div className="lesson-meta-row">
          <span>
            <Clock size={15} />
            {lesson.duration} {t('min · reading + activities', 'دقيقة · قراءة وأنشطة')}
          </span>
          <span>
            <Target size={15} />
            {lesson._count.questions} {t('assessment questions', 'سؤال تقييم')}
          </span>
          <span>
            <BookOpen size={15} />
            {t('Evidence-led learning', 'تعلم قائم على الأدلة')}
          </span>
          <div className="meta-spacer" />
          <button
            className={`icon-btn ${saved ? 'accent-text' : ''}`}
            onClick={bookmark}
            aria-label={t(
              saved ? 'Remove bookmark' : 'Bookmark lesson',
              saved ? 'إزالة الحفظ' : 'حفظ الدرس',
            )}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <button
            className="icon-btn"
            aria-label={t('Copy lesson link', 'نسخ رابط الدرس')}
            onClick={() =>
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => notify(t('Lesson link copied.', 'نُسخ رابط الدرس.')))
                .catch(() =>
                  notify(t('Copy the link from your address bar.', 'انسخ الرابط من شريط العنوان.')),
                )
            }
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>
      <div className="lesson-layout">
        <article
          className="lesson-article"
          style={{ '--reading-size': `${font}px` } as React.CSSProperties}
        >
          <section className="learning-objectives">
            <span className="icon-tile purple">
              <Target size={21} />
            </span>
            <div>
              <h2>{t('What you’ll understand', 'ما ستفهمه')}</h2>
              <ul>
                {lesson.objectives.map((o: any, i: number) => (
                  <li key={i}>
                    <CheckCircle2 size={15} />
                    {o[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <div className="explanation-controls">
            <span>{t('Your explanation level', 'مستوى الشرح')}</span>
            <div className="segmented">
              {[
                ['beginner', 'Beginner', 'مبتدئ'],
                ['intermediate', 'Academic', 'أكاديمي'],
                ['advanced', 'Advanced', 'متقدم'],
              ].map(([key, en, ar]) => (
                <button
                  key={key}
                  className={mode === key ? 'active' : ''}
                  onClick={() => {
                    setMode(key);
                    if (key === 'advanced') setDeep(true);
                  }}
                >
                  {t(en, ar)}
                </button>
              ))}
            </div>
            <div className="reading-size">
              <button
                onClick={() => setFont(Math.max(14, font - 1))}
                aria-label={t('Reduce reading font', 'تصغير خط القراءة')}
              >
                A−
              </button>
              <button
                onClick={() => setFont(Math.min(21, font + 1))}
                aria-label={t('Enlarge reading font', 'تكبير خط القراءة')}
              >
                A+
              </button>
            </div>
          </div>
          {sections.map((section: any, index: number) => (
            <React.Fragment key={section.id}>
              <section
                id={`section-${section.id}`}
                className={`lesson-section type-${section.type.toLowerCase()}`}
              >
                {section.type === 'WORKSHOP' && (
                  <span className="section-label">
                    <FlaskConical size={15} />
                    {t('GUIDED INVESTIGATION', 'استقصاء موجه')}
                  </span>
                )}
                {section.type === 'CHECKPOINT' && (
                  <span className="section-label">
                    <CheckCircle2 size={15} />
                    {t('CHECK YOUR UNDERSTANDING', 'تحقق من فهمك')}
                  </span>
                )}
                {section.type === 'EXAMPLE' && (
                  <span className="section-label">
                    <FlaskConical size={15} />
                    {t('WORKED EXAMPLE', 'مثال محلول')}
                  </span>
                )}
                {section.type === 'MISCONCEPTION' && (
                  <span className="section-label">
                    <Lightbulb size={15} />
                    {t('A COMMON MISCONCEPTION', 'مفهوم شائع خاطئ')}
                  </span>
                )}
                {section.type === 'APPLICATION' && (
                  <span className="section-label">
                    <Target size={15} />
                    {t('PUT IT INTO PRACTICE', 'طبّقه عمليًا')}
                  </span>
                )}
                <h2>{tr(section)}</h2>
                <Markdown text={tr(section, 'content')} />
              </section>
              {section.type === 'CORE' && (
                <>
                  {lesson.images.map((im: any) => (
                    <figure className="science-figure lesson-science-image" key={im.id}>
                      <img src={im.url} alt={tr(im, 'alt')} loading="lazy" />
                      <figcaption>
                        <strong>{tr(im)}</strong>
                        <Pill tone="muted">
                          {im.kind === 'ILLUSTRATION'
                            ? t('Data-based illustration', 'تصور قائم على بيانات')
                            : t('Scientific observation', 'رصد علمي')}
                        </Pill>
                        <p>{tr(im, 'caption')}</p>
                        <div>
                          <span>{im.credit}</span>
                          <a href={im.sourceUrl} rel="noreferrer" target="_blank">
                            {t('Scientific source', 'المصدر العلمي')}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                  <ConceptDiagram type={lesson.diagram} />
                </>
              )}
            </React.Fragment>
          ))}
          {advanced && (
            <section className={`deep-dive ${deep ? 'open' : ''}`} id="deep-dive">
              <button onClick={() => setDeep((v) => !v)} aria-expanded={deep}>
                <span className="icon-tile purple">
                  <Sparkles size={21} />
                </span>
                <span>
                  <small>{t('FOR THE EXTRA-CURIOUS', 'للمزيد من الفضول')}</small>
                  <strong>{t('Take a deeper dive', 'تعمّق أكثر')}</strong>
                </span>
                <ChevronDown size={20} />
              </button>
              {deep && (
                <div className="deep-dive-content">
                  <h3>{tr(advanced)}</h3>
                  <Markdown text={tr(advanced, 'content')} />
                  <Link
                    className="text-link"
                    href={`/tutor?q=${encodeURIComponent(t(`Explain the advanced ideas in ${lesson.titleEn}`, `اشرح الأفكار المتقدمة في ${lesson.titleAr}`))}`}
                  >
                    {t('Explore this with Astro', 'استكشف ذلك مع أسترو')}
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </section>
          )}
          <section className="lesson-terms" id="terms">
            <div className="section-heading">
              <h2>{t('Your scientific vocabulary', 'مصطلحاتك العلمية')}</h2>
              <span className="muted">
                {lesson.terms.length} {t('key terms', 'مصطلحًا')}
              </span>
            </div>
            <div className="term-grid">
              {lesson.terms.map((term: any, i: number) => (
                <details key={i}>
                  <summary>
                    <span>
                      {term.term[lang]}
                      {lang === 'ar' && <small dir="ltr">{term.term.en}</small>}
                    </span>
                    <Plus size={14} />
                  </summary>
                  <p>{term.definition[lang]}</p>
                </details>
              ))}
            </div>
          </section>
          <SourceLinks references={lesson.references} />
          {data?.pilot && lesson.reviewStatus !== 'APPROVED' && (
            <p className="pilot-disclosure">
              {t(
                'Pilot lesson · Source-grounded seed content awaiting independent human editorial approval before a public launch.',
                'درس تجريبي · محتوى أولي موثق ينتظر اعتمادًا تحريريًا بشريًا مستقلًا قبل الإطلاق العام.',
              )}
            </p>
          )}
          <section className="lesson-assessment" id="assessment">
            <span className="icon-tile purple">
              <GraduationCap size={25} />
            </span>
            <h2>{t('Let’s turn curiosity into understanding.', 'لنحوّل الفضول إلى فهم.')}</h2>
            <p>
              {t(
                `Choose an assessment. Pass with ${data?.settings.passingScore}% to complete this lesson and unlock your next step. Answers are revealed only after submission.`,
                `اختر تقييمًا واجتز بنسبة ${data?.settings.passingScore}% لإكمال الدرس وفتح الخطوة التالية. تظهر الإجابات بعد التسليم فقط.`,
              )}
            </p>
            <div className="assessment-choices">
              {[
                ['QUICK', 'Quick check', 'اختبار سريع', 10, 15],
                ['STANDARD', 'Standard exam', 'اختبار قياسي', 20, 30],
                ['ADVANCED', 'Challenge yourself', 'تحدَّ نفسك', 30, 45],
              ].map(([kind, en, ar, count, time]) => (
                <button disabled={!!busy} key={kind} onClick={() => start(String(kind))}>
                  <span className="assessment-choice-icon">
                    {kind === 'QUICK' ? (
                      <CheckCircle2 size={21} />
                    ) : kind === 'STANDARD' ? (
                      <Target size={21} />
                    ) : (
                      <Sparkles size={21} />
                    )}
                  </span>
                  <strong>{t(String(en), String(ar))}</strong>
                  <span>
                    {count} {t('questions', 'سؤالًا')} · {time} {t('min', 'دقيقة')}
                  </span>
                  <span className="text-link">
                    {busy === kind
                      ? t('Preparing…', 'جارٍ الإعداد…')
                      : t('Start assessment', 'ابدأ التقييم')}
                    <Arrow size={14} />
                  </span>
                </button>
              ))}
            </div>
            <Link href={`/questions?module=${lesson.moduleId}`} className="text-link">
              {t('Prefer some practice first?', 'تفضّل بعض التدريب أولًا؟')}
              <Arrow size={14} />
            </Link>
          </section>
        </article>
        <aside className="lesson-sidebar">
          <div className="lesson-contents panel">
            <div className="card-topline">
              <h3>{t('In this lesson', 'في هذا الدرس')}</h3>
              <BookOpen size={16} />
            </div>
            <div className="reading-progress">
              <div>
                <span>{t('Reading progress', 'تقدم القراءة')}</span>
                <strong>{read}%</strong>
              </div>
              <ProgressBar value={read} />
            </div>
            <nav>
              {sections.map((s: any, i: number) => (
                <a href={`#section-${s.id}`} key={s.id}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {tr(s)}
                </a>
              ))}
              <a href="#terms">
                <span>✦</span>
                {t('Key scientific terms', 'المصطلحات العلمية')}
              </a>
              <a href="#assessment" className="accent-text">
                <Target size={15} />
                {t('Knowledge assessment', 'تقييم المعرفة')}
              </a>
            </nav>
            <p>{t('Reading progress is not a mastery score.', 'تقدم القراءة ليس درجة إتقان.')}</p>
          </div>
          <div className="lesson-tutor-tip">
            <Sparkles size={22} />
            <h3>{t('A question is a great next step.', 'السؤال خطوة تالية رائعة.')}</h3>
            <p>
              {t(
                'Need another perspective? Bring this lesson to your astronomy guide.',
                'تحتاج إلى منظور آخر؟ ناقش هذا الدرس مع دليلك الفلكي.',
              )}
            </p>
            <Button
              variant="secondary"
              href={`/tutor?q=${encodeURIComponent(t(`Help me understand ${lesson.titleEn}`, `ساعدني على فهم ${lesson.titleAr}`))}`}
            >
              {t('Ask Astro', 'اسأل أسترو')}
              <ArrowUpRight size={15} />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
