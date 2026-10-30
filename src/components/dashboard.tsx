'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Target,
  Flame,
  ArrowUpRight,
  ArrowRight,
  Orbit,
  Route,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Check,
  Lock,
  Star,
  Telescope,
  Plus,
  ExternalLink,
  GraduationCap,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { useApp, type Stage } from './context';
import { Button, Arrow, Pill, Ring, ProgressBar, SectionHeading, Modal, Field, Banner } from './ui';
export function StageCard({ stage }: { stage: Stage }) {
  const { t, tr, data } = useApp();
  const available = stage.status === 'AVAILABLE';
  const ls = stage.modules.flatMap((m) => m.lessons);
  const count =
    data?.progress.lessons.filter((p: any) => p.completed && ls.some((l) => l.id === p.lessonId))
      .length || 0;
  const pct = ls.length ? Math.round((count / ls.length) * 100) : 0;
  return (
    <article className="stage-card">
      <Link
        href={`/stages/${stage.id}`}
        className={`stage-card-image image-${stage.id}`}
        aria-label={tr(stage)}
      >
        <img
          src={stage.image}
          alt={t(
            `Astronomical observation illustrating ${stage.titleEn}`,
            `رصد فلكي يوضح ${stage.titleAr}`,
          )}
          loading="lazy"
        />
        <div className="stage-image-shade" />
        <span className="stage-number">
          {t('STAGE', 'المرحلة')} {String(stage.order).padStart(2, '0')}
        </span>
        <span className={`image-pill ${available ? 'ready' : ''}`}>
          {available ? (
            <>
              <span />
              {t('Ready to explore', 'جاهزة للاستكشاف')}
            </>
          ) : (
            <>
              <Lock size={10} />
              {t('In development', 'قيد التطوير')}
            </>
          )}
        </span>
      </Link>
      <div className="stage-card-content">
        <h3>
          <Link href={`/stages/${stage.id}`}>{tr(stage)}</Link>
        </h3>
        <div className="stage-meta">
          <span>
            <BookOpen size={13} />
            {stage.modules.length} {t('modules', 'وحدات')}
          </span>
          <i />{' '}
          <span>
            {available
              ? `${ls.length} ${t('lessons', 'درسًا')}`
              : t('Curriculum preview', 'معاينة المنهج')}
          </span>
        </div>
        {available ? (
          <div className="course-progress">
            <ProgressBar value={pct} />
            <span>
              {count} / {ls.length} {t('completed', 'مكتمل')}
            </span>
          </div>
        ) : (
          <div className="course-planned">
            <span className="tiny-dot" />
            {t('The next frontier in your journey', 'المحطة التالية في رحلتك')}
          </div>
        )}
        <Link
          href={`/stages/${stage.id}`}
          className={`course-action ${available ? 'accent-text' : ''}`}
        >
          {available
            ? t(
                count ? 'Continue exploring' : 'Start learning',
                count ? 'تابع الاستكشاف' : 'ابدأ التعلم',
              )
            : t('Explore curriculum', 'استكشف المنهج')}
          <Arrow size={15} />
        </Link>
      </div>
    </article>
  );
}
export function Dashboard() {
  const { data, t, tr, lang, api, refresh, notify } = useApp();
  const [tab, setTab] = useState('overview');
  const [planModal, setPlanModal] = useState(false);
  const [minutes, setMinutes] = useState(data?.user.profile?.dailyGoal || 20);
  const [saving, setSaving] = useState(false);
  const [wonder, setWonder] = useState(false);
  if (!data) return null;
  const p = data.progress,
    s = p.stats;
  const completed = new Set(p.lessons.filter((l: any) => l.completed).map((l: any) => l.lessonId));
  const all = data.stages[0].modules.flatMap((m) => m.lessons);
  const next = all.find((l) => !completed.has(l.id)) || all[0];
  const currentModule = data.stages[0].modules.find((m) => m.lessons.some((l) => l.id === next.id));
  const moduleAvailable =
    !data.settings.enforcePrerequisites ||
    currentModule?.order === 1 ||
    p.modules.some((m: any) => m.moduleId === `m-1-${(currentModule?.order || 1) - 1}` && m.passed);
  const nextHref = moduleAvailable
    ? `/lesson/${next.id}`
    : `/exams?module=m-1-${(currentModule?.order || 2) - 1}`;
  const savePlan = async () => {
    setSaving(true);
    try {
      await api('plan', {
        method: 'POST',
        body: JSON.stringify({ dailyMinutes: Number(minutes) }),
      });
      await refresh();
      setPlanModal(false);
      setTab('plan');
      notify(t('Your personal study plan is ready.', 'خطتك الدراسية الشخصية جاهزة.'));
    } catch (e) {
      notify((e as Error).message, 'error');
    }
    setSaving(false);
  };
  const metrics = [
    {
      icon: BookOpen,
      label: t('Lessons completed', 'الدروس المكتملة'),
      value: s.completedLessons,
      unit: `/ ${data.counts.lessons}`,
      hint: t('Every lesson, a new perspective', 'كل درس منظور جديد'),
      tone: 'purple',
    },
    {
      icon: Clock,
      label: t('Time well explored', 'وقت في الاستكشاف'),
      value: (s.totalSeconds / 3600).toFixed(1),
      unit: t('hrs', 'ساعة'),
      hint: t('A little learning goes a long way', 'القليل من التعلم يصنع الكثير'),
      tone: 'blue',
    },
    {
      icon: Target,
      label: t('Exam average', 'متوسط الاختبارات'),
      value: s.examAverage === null ? '—' : s.examAverage,
      unit: s.examAverage === null ? '' : '%',
      hint:
        s.examAverage === null
          ? t('Your first challenge awaits', 'تحديك الأول ينتظرك')
          : `${s.examsTaken} ${t('assessments completed', 'تقييمات مكتملة')}`,
      tone: 'teal',
    },
    {
      icon: Flame,
      label: t('Learning streak', 'سلسلة التعلم'),
      value: s.streak,
      unit: t(s.streak === 1 ? 'day' : 'days', 'أيام'),
      hint: t('Make curiosity a daily habit', 'اجعل الفضول عادة يومية'),
      tone: 'orange',
    },
  ];
  return (
    <div className="dashboard page-enter">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow greeting-eyebrow">
            <span className="tiny-star">✦</span>
            {t('A LITTLE CURIOSITY. LIMITLESS POSSIBILITY.', 'القليل من الفضول. إمكانات بلا حدود.')}
          </div>
          <h1>
            {t(
              s.completedLessons
                ? `Welcome back, ${data.user.isGuest ? 'explorer' : data.user.name.split(' ')[0]}.`
                : 'Welcome to your universe.',
              s.completedLessons ? 'مرحبًا بعودتك أيها المستكشف.' : 'مرحبًا بك في كونك.',
            )}
            <span className="heading-sparkle">✧</span>
          </h1>
          <p>
            {t(
              'Big questions. Small steps. An extraordinary journey.',
              'أسئلة كبيرة. خطوات صغيرة. رحلة استثنائية.',
            )}
          </p>
        </div>
        <div className="dashboard-date">
          <CalendarDays size={15} />
          <span>
            {new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date())}
          </span>
        </div>
      </div>
      <div className="dashboard-tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          {t('Overview', 'نظرة عامة')}
        </button>
        <Link href="/courses">{t('My learning', 'تعلّمي')}</Link>
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>
          {t('Study plan', 'خطة الدراسة')}
          <span className="new-dot" />
        </button>
        <span className="tabs-spacer" />
        <span className="your-pace">
          <span />
          {t('Your universe. Your pace.', 'كونك. بإيقاعك.')}
        </span>
      </div>
      {tab === 'plan' ? (
        <div className="study-plan-page">
          <SectionHeading
            title={t('A little progress, every day', 'تقدم صغير كل يوم')}
            sub={t(
              'An adaptive, rule-based plan built from your actual learning progress.',
              'خطة تكيفية مبنية على تقدمك الفعلي، وليست ناتج ذكاء اصطناعي.',
            )}
          />
          <Banner>
            {t(
              'Lessons unlock after their prerequisites. Study time is a goal, not a record of activity.',
              'تُفتح الدروس بعد متطلباتها. وقت الدراسة هدف وليس سجل نشاط.',
            )}
          </Banner>
          {p.plan ? (
            <>
              <div className="plan-week">
                {p.plan.days.map((day: any) => (
                  <Link href={`/lesson/${day.lessonId}`} key={day.day} className="plan-day">
                    <span className="plan-day-number">
                      {t('DAY', 'اليوم')} {String(day.day).padStart(2, '0')}
                    </span>
                    <span className={`icon-tile ${day.review ? 'orange' : 'purple'}`}>
                      {day.review ? <Target size={20} /> : <BookOpen size={20} />}
                    </span>
                    <h3>{tr(day)}</h3>
                    <span className="muted">
                      <Clock size={13} />
                      {day.minutes} {t('min', 'دقيقة')}
                    </span>
                    {day.review && (
                      <Pill tone="orange">{t('Targeted revision', 'مراجعة موجهة')}</Pill>
                    )}
                    <Arrow />
                  </Link>
                ))}
              </div>
              <Button onClick={() => setPlanModal(true)} variant="secondary">
                {t('Adjust my schedule', 'عدّل جدولي')}
                <CalendarDays size={16} />
              </Button>
            </>
          ) : (
            <div className="plan-empty panel">
              <span className="empty-icon">
                <CalendarDays size={30} />
              </span>
              <h2>{t('Find your learning rhythm.', 'اعثر على إيقاع تعلمك.')}</h2>
              <p>
                {t(
                  'Give us a daily time goal. We’ll organize your next lessons and prioritize topics that need another look.',
                  'حدّد وقتًا يوميًا لننظم دروسك المقبلة ونقدّم الموضوعات التي تحتاج إلى مراجعة.',
                )}
              </p>
              <Button onClick={() => setPlanModal(true)}>
                <Plus size={16} />
                {t('Create my study plan', 'أنشئ خطتي الدراسية')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="dashboard-hero-grid">
            <section className="cosmic-hero">
              <img
                className="hero-nebula"
                src="/images/carina.webp"
                alt={t(
                  'Webb’s Cosmic Cliffs: stars above golden clouds of gas and dust',
                  'الجروف الكونية من ويب: نجوم فوق سحب ذهبية من الغاز والغبار',
                )}
                fetchPriority="high"
              />
              <div className="cosmic-hero-overlay" />
              <div className="hero-copy">
                <span className="hero-eyebrow">
                  <span className="hero-star">✦</span>
                  {t('THE UNIVERSE IS YOUR CLASSROOM', 'الكون هو قاعتك الدراسية')}
                </span>
                <h2>
                  {t(
                    s.completedLessons ? 'Stay curious.' : 'Start small.',
                    s.completedLessons ? 'ابقَ فضوليًا.' : 'ابدأ بخطوة.',
                  )}
                  <br />
                  <span>
                    {t(
                      s.completedLessons ? 'Go further.' : 'Think cosmic.',
                      s.completedLessons ? 'واكتشف أبعد.' : 'وفكّر كونيًا.',
                    )}
                  </span>
                </h2>
                <p>
                  {t(
                    'From your first question to your next discovery.\nYour personal astronomy journey begins here.',
                    'من سؤالك الأول إلى اكتشافك التالي.\nتبدأ رحلتك الشخصية في علم الفلك هنا.',
                  )}
                </p>
                <Button href={nextHref}>
                  {t(
                    s.completedLessons ? 'Continue my journey' : 'Begin your journey',
                    s.completedLessons ? 'أكمل رحلتي' : 'ابدأ رحلتك',
                  )}
                  <Arrow size={17} />
                </Button>
                <div className="hero-features">
                  <span>
                    <Route size={13} />
                    {t('12 learning stages', '12 مرحلة تعليمية')}
                  </span>
                  <span className="feature-divider" />
                  <span>
                    <Sparkles size={13} />
                    {t('Infinite curiosity', 'فضول بلا حدود')}
                  </span>
                </div>
              </div>
              <button className="hero-credit" onClick={() => setWonder(true)}>
                <span className="image-credit-dot" />
                NGC 3324 <span>·</span> JAMES WEBB
                <ArrowUpRight size={11} />
              </button>
            </section>
            <section className="orbit-card panel">
              <div className="card-topline">
                <h3>
                  <Orbit size={17} />
                  {t('Your learning orbit', 'مدارك التعليمي')}
                </h3>
                <Link
                  className="icon-btn"
                  href="/progress"
                  aria-label={t('View all progress', 'عرض كل التقدم')}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="orbit-ring">
                <Ring value={(s.completedStages / 12) * 100} size={146}>
                  <span className="ring-caption">{t('YOUR JOURNEY', 'رحلتك')}</span>
                  <strong>
                    {String(s.completedStages).padStart(2, '0')}
                    <span>/ 12</span>
                  </strong>
                  <small>{t('stages completed', 'مراحل مكتملة')}</small>
                </Ring>
                <span className="orbit-dot dot-a" />
                <span className="orbit-dot dot-b" />
              </div>
              <p className="orbit-encouragement">
                {t('Every expert was once a beginner.', 'كل خبير كان يومًا مبتدئًا.')}
              </p>
              <Link href="/stages/s-1" className="orbit-next">
                <span className="orbit-next-icon">
                  <Route size={18} />
                </span>
                <span>
                  <small>{t('YOUR NEXT DESTINATION', 'وجهتك التالية')}</small>
                  <strong>{t('The fundamentals', 'الأساسيات')}</strong>
                </span>
                <ChevronRight size={17} className="directional" />
              </Link>
            </section>
          </div>
          <div className="metric-grid">
            {metrics.map(({ icon: Icon, ...m }, i) => (
              <Link
                href={['/progress', '/progress', '/exams', '/progress'][i]}
                className="metric-card panel"
                key={i}
              >
                <div className="metric-label">
                  <span>{m.label}</span>
                  <span className={`metric-icon ${m.tone}`}>
                    <Icon size={17} strokeWidth={1.7} />
                  </span>
                </div>
                <div className="metric-value">
                  {m.value}
                  <span>{m.unit}</span>
                </div>
                <p>{m.hint}</p>
              </Link>
            ))}
          </div>
          <div className="dashboard-lower-grid">
            <div className="journey-column">
              <SectionHeading
                title={t('Your learning journey', 'رحلتك التعليمية')}
                sub={t(
                  'One stage at a time. A whole universe ahead.',
                  'مرحلة تلو الأخرى. وكون كامل أمامك.',
                )}
                link={t('View roadmap', 'عرض المسار')}
                href="/roadmap"
              />
              <div className="featured-stage-grid">
                {[data.stages[0], data.stages[1], data.stages[3]].map((stage) => (
                  <StageCard key={stage.id} stage={stage} />
                ))}
              </div>
              <section className="activity-panel panel">
                <div className="card-topline">
                  <div>
                    <h3>{t('A little learning, every day', 'القليل من التعلم، كل يوم')}</h3>
                    <p>
                      {t('Your study activity over the last 7 days', 'نشاط دراستك خلال آخر 7 أيام')}
                    </p>
                  </div>
                  <button
                    className="subtle-button"
                    onClick={() => {
                      setPlanModal(true);
                    }}
                  >
                    <span className="tiny-dot accent" />
                    {data.user.profile.dailyGoal} {t('min daily goal', 'دقيقة يوميًا')}
                    <ChevronDown size={12} />
                  </button>
                </div>
                <div className="activity-chart">
                  <div className="activity-axis">
                    <span>
                      {Math.max(30, ...p.weekly.map((w: any) => w.minutes))} {t('min', 'د')}
                    </span>
                    <span>0</span>
                  </div>
                  <div className="activity-bars">
                    {p.weekly.map((w: any, i: number) => (
                      <div className="activity-day" key={w.date}>
                        <div className="activity-bar-wrap">
                          <div
                            className={`activity-bar ${i === 6 ? 'today' : ''}`}
                            style={{
                              height: `${Math.max(2, (w.minutes / Math.max(30, ...p.weekly.map((x: any) => x.minutes))) * 100)}%`,
                            }}
                            title={`${w.minutes} ${t('minutes', 'دقيقة')}`}
                          >
                            <span className="bar-tooltip">
                              {w.minutes} {t('min', 'د')}
                            </span>
                          </div>
                        </div>
                        <span className={i === 6 ? 'today-label' : ''}>
                          {new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en', {
                            weekday: 'short',
                          }).format(new Date(`${w.date}T12:00:00`))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="activity-footer">
                  <span>
                    <span className="tiny-dot accent" />
                    {t('Active study time', 'وقت الدراسة الفعلي')}
                  </span>
                  <span>
                    {s.totalSeconds === 0
                      ? t('Your first session will appear here.', 'ستظهر جلستك الأولى هنا.')
                      : t(
                          'Time is recorded while a lesson is visible.',
                          'يُسجل الوقت أثناء ظهور الدرس.',
                        )}
                  </span>
                </div>
              </section>
            </div>
            <div className="discovery-column">
              <section className="tutor-promo">
                <div className="tutor-promo-brand">
                  <Sparkles size={17} />
                  <strong>ASTRO AI</strong>
                  <span>{t('YOUR CO-PILOT', 'رفيقك')}</span>
                </div>
                <div className="tutor-art" aria-hidden="true">
                  <span>✦</span>
                  <i>✧</i>
                  <b>·</b>
                  <em>✦</em>
                </div>
                <h2>{t('A big universe.\nAn even bigger curiosity.', 'كون كبير.\nوفضول أكبر.')}</h2>
                <p>
                  {t(
                    'Ask a question. Follow a thought.\nMake the complex feel simple.',
                    'اطرح سؤالًا. تتبّع فكرة.\nواجعل المعقد بسيطًا.',
                  )}
                </p>
                <Link className="tutor-prompt" href="/tutor?q=Why%20do%20stars%20shine%3F">
                  <span>{t('Why do stars shine?', 'لماذا تضيء النجوم؟')}</span>
                  <ArrowUpRight size={16} />
                </Link>
                <Link href="/tutor" className="tutor-promo-link">
                  {t('Meet your astronomy guide', 'تعرّف إلى دليلك الفلكي')}
                  <Arrow size={14} />
                </Link>
                <div className="provider-note">
                  <span />
                  {data.tutor.configured
                    ? t('AI provider connected', 'مزود AI مهيأ')
                    : t('Reference mode · AI connection optional', 'وضع المراجع · ربط AI اختياري')}
                </div>
              </section>
              <button className="wonder-card panel" onClick={() => setWonder(true)}>
                <div className="wonder-top">
                  <span className="eyebrow">{t('A MOMENT OF WONDER', 'لحظة من الدهشة')}</span>
                  <ArrowUpRight size={15} />
                </div>
                <div className="wonder-image">
                  <img
                    src="/images/carina.webp"
                    alt={t('A detail of the Cosmic Cliffs', 'تفصيل من الجروف الكونية')}
                    loading="lazy"
                  />
                  <span>NASA · ESA · CSA</span>
                </div>
                <h3>{t('Where stars are born.', 'حيث تولد النجوم.')}</h3>
                <p>
                  {t(
                    'A window into the Cosmic Cliffs, through Webb’s eyes.',
                    'نافذة على الجروف الكونية بعيني تلسكوب ويب.',
                  )}
                </p>
                <span className="text-link">
                  {t('Look a little closer', 'انظر عن قرب')}
                  <Arrow size={13} />
                </span>
              </button>
            </div>
          </div>
          <div className="dashboard-bottom-banner">
            <div className="milestone-art">
              <GraduationCap size={26} />
            </div>
            <div>
              <h3>
                {t('The first milestone is closer than you think.', 'إنجازك الأول أقرب مما تظن.')}
              </h3>
              <p>
                {t(
                  'Finish your first lesson and pass its quiz to earn the First Light achievement.',
                  'أكمل درسك الأول واجتز اختباره لتحصل على إنجاز الضوء الأول.',
                )}
              </p>
            </div>
            <Button variant="secondary" href="/achievements">
              {t('Explore achievements', 'استكشف الإنجازات')}
              <Arrow size={15} />
            </Button>
          </div>
        </>
      )}
      {planModal && (
        <Modal
          title={t('Make room for discovery', 'خصّص وقتًا للاكتشاف')}
          onClose={() => setPlanModal(false)}
        >
          <p className="muted">
            {t(
              'Choose a realistic daily goal. Your plan puts weak topics first, then the next lessons in your curriculum.',
              'اختر هدفًا يوميًا واقعيًا. تعطي الخطة الأولوية لنقاط الضعف ثم الدروس التالية.',
            )}
          </p>
          <Field label={t('Daily learning time', 'وقت التعلم اليومي')}>
            <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {[10, 15, 20, 30, 45, 60, 90, 120].map((v) => (
                <option key={v} value={v}>
                  {v} {t('minutes', 'دقيقة')}
                </option>
              ))}
            </select>
          </Field>
          <Button onClick={savePlan} loading={saving} className="full-width">
            <CalendarDays size={17} />
            {t('Build my 7-day plan', 'ابنِ خطتي لسبعة أيام')}
          </Button>
        </Modal>
      )}
      {wonder && (
        <Modal
          title={t('The Cosmic Cliffs · NGC 3324', 'الجروف الكونية · NGC 3324')}
          onClose={() => setWonder(false)}
          wide
        >
          <figure className="science-figure">
            <img
              src="/images/carina.webp"
              alt={t(
                'Bright stars and the sculpted edge of a gas-and-dust cloud in NGC 3324',
                'نجوم ساطعة وحافة منحوتة لسحابة غاز وغبار في NGC 3324',
              )}
            />
            <figcaption>
              {t(
                'A young star-forming region about 7,600 light-years away. This is a real Webb NIRCam observation. Visible colors were assigned to infrared filters; the “cliffs” are gas and dust, not mountains.',
                'منطقة فتية لتشكل النجوم على بعد نحو 7600 سنة ضوئية. هذا رصد حقيقي من ويب NIRCam. عُينت ألوان مرئية لمرشحات تحت حمراء؛ الجروف غاز وغبار لا جبال.',
              )}
              <br />
              {t('Image credit: NASA, ESA, CSA, STScI', 'حقوق الصورة: NASA وESA وCSA وSTScI')}
            </figcaption>
          </figure>
          <a
            className="text-link"
            href="https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/"
            target="_blank"
            rel="noreferrer"
          >
            {t('Read the scientific image notes', 'اقرأ الوصف العلمي للصورة')}
            <ExternalLink size={15} />
          </a>
        </Modal>
      )}
    </div>
  );
}
