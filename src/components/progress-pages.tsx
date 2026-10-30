'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Target,
  BookOpen,
  Clock,
  Flame,
  Sparkles,
  Orbit,
  Star,
  Telescope,
  Award,
  GraduationCap,
  Lock,
  Download,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Route,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { useApp } from './context';
import {
  PageHeader,
  Button,
  Arrow,
  Pill,
  SectionHeading,
  EmptyState,
  ProgressBar,
  Ring,
  Loading,
  Banner,
} from './ui';
const chartTooltip = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: 12,
};
export function ProgressPage() {
  const { data, t, tr, lang } = useApp();
  if (!data) return null;
  const p = data.progress,
    s = p.stats;
  const date = (v: any) =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(v));
  const examinations = [...p.exams]
    .reverse()
    .map((e: any) => ({ date: date(e.submittedAt), score: e.score }));
  const sorted = p.lessons
    .filter((l: any) => l.completedAt)
    .sort(
      (a: any, b: any) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );
  const milestones = sorted.map((l: any, i: number) => ({
    date: date(l.completedAt),
    lessons: i + 1,
  }));
  const assessed = p.mastery.filter((m: any) => m.checks > 0);
  const strongest = [...assessed].sort((a: any, b: any) => b.score - a.score)[0],
    weakest = [...assessed].sort((a: any, b: any) => a.score - b.score)[0];
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={t('SEE HOW FAR CURIOSITY TAKES YOU', 'اكتشف إلى أين يقودك الفضول')}
        title={t('Your progress, in perspective.', 'تقدمك في منظور واضح.')}
        description={t(
          'Real learning. Honest numbers. A clearer direction for your next step.',
          'تعلم حقيقي وأرقام صادقة واتجاه أوضح لخطوتك التالية.',
        )}
        action={
          <Button href="/exams" variant="secondary">
            <Target size={16} />
            {t('Check my understanding', 'تحقق من فهمي')}
          </Button>
        }
      />
      <div className="progress-overview">
        <section className="mastery-overview panel">
          <Ring value={s.overallMastery || 0} size={160}>
            <strong>
              {s.overallMastery === null ? '—' : s.overallMastery}
              <span>{s.overallMastery === null ? '' : '%'}</span>
            </strong>
            <small>{t('ASSESSED MASTERY', 'الإتقان المقيم')}</small>
          </Ring>
          <div>
            <Pill tone="purple">
              {t('UNDERSTANDING, NOT JUST COMPLETION', 'الفهم لا مجرد الإكمال')}
            </Pill>
            <h2>
              {s.overallMastery === null
                ? t('Your story is just beginning.', 'قصتك بدأت لتوها.')
                : t('Knowledge you can build on.', 'معرفة يمكنك البناء عليها.')}
            </h2>
            <p>
              {t(
                'Mastery uses your latest answers across distinct concepts, with conservative confidence. Repeating the same question cannot inflate it.',
                'يستخدم الإتقان أحدث إجاباتك عبر مفاهيم متميزة مع تقدير ثقة متحفظ. لا يرفعه تكرار السؤال نفسه.',
              )}
            </p>
            <div className="progress-mini-metrics">
              <span>
                <strong>
                  {s.completedLessons}/{data.counts.lessons}
                </strong>
                {t('lessons passed', 'دروس مجتازة')}
              </span>
              <span>
                <strong>{s.examAverage === null ? '—' : `${s.examAverage}%`}</strong>
                {t('exam average', 'متوسط الاختبارات')}
              </span>
              <span>
                <strong>{(s.totalSeconds / 3600).toFixed(1)} h</strong>
                {t('active study', 'دراسة فعلية')}
              </span>
              <span>
                <strong>{s.streak}</strong>
                {t('day streak', 'أيام متتالية')}
              </span>
            </div>
          </div>
        </section>
      </div>
      <div className="analytics-grid">
        <section className="chart-panel panel">
          <div className="card-topline">
            <div>
              <h3>{t('Understanding over time', 'الفهم عبر الزمن')}</h3>
              <p>{t('Your submitted examination scores', 'درجات الاختبارات المسلمة')}</p>
            </div>
            <Target size={18} />
          </div>
          {examinations.length ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={examinations}
                  margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltip}
                    formatter={(v: any) => [`${v}%`, t('Score', 'الدرجة')]}
                  />
                  <Line
                    dataKey="score"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'var(--accent)' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Target}
              title={t('A first score, a starting point.', 'درجة أولى ونقطة بداية.')}
              description={t(
                'Complete an assessment to begin your performance chart.',
                'أكمل تقييمًا لبدء مخطط أدائك.',
              )}
            />
          )}
        </section>
        <section className="chart-panel panel">
          <div className="card-topline">
            <div>
              <h3>{t('Your learning milestones', 'محطات تعلمك')}</h3>
              <p>
                {t('Cumulative assessed lesson completions', 'الإكمال التراكمي للدروس المقيمة')}
              </p>
            </div>
            <TrendingUp size={18} />
          </div>
          {milestones.length ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={milestones} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#9c8ce9" stopOpacity={0.3} />
                      <stop offset="1" stopColor="#9c8ce9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltip}
                    formatter={(v: any) => [v, t('Completed lessons', 'الدروس المكتملة')]}
                  />
                  <Area
                    dataKey="lessons"
                    stroke="var(--accent)"
                    fill="url(#progressFill)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title={t('Small steps will add up.', 'ستتراكم الخطوات الصغيرة.')}
              description={t(
                'Passed lesson quizzes become real milestones here.',
                'تصبح اختبارات الدروس المجتازة محطات حقيقية هنا.',
              )}
            />
          )}
        </section>
        <section className="topic-mastery-panel panel">
          <div className="card-topline">
            <div>
              <h3>{t('Your knowledge, topic by topic', 'معرفتك موضوعًا بموضوع')}</h3>
              <p>{t('No assessment means no mastery estimate.', 'لا تقدير للإتقان دون تقييم.')}</p>
            </div>
            <LayersIcon />
          </div>
          <div className="topic-mastery-list">
            {data.stages[0].modules.map((m) => {
              const mastery = p.mastery.find((x: any) => x.moduleId === m.id);
              return (
                <Link key={m.id} href={`/questions?module=${m.id}`}>
                  <span>
                    <strong>{tr(m)}</strong>
                    <small>
                      {mastery?.checks
                        ? `${mastery.checks} ${t('distinct concepts checked', 'مفهومًا متميزًا مقيّمًا')}`
                        : t('Not yet assessed', 'لم يُقيّم بعد')}
                    </small>
                  </span>
                  <ProgressBar value={mastery?.score || 0} />
                  <b>{mastery?.checks ? `${mastery.score}%` : '—'}</b>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="chart-panel panel">
          <div className="card-topline">
            <div>
              <h3>{t('Time for the universe', 'وقت للكون')}</h3>
              <p>
                {t(
                  'Actual active study minutes · last 7 days',
                  'دقائق الدراسة الفعلية · آخر 7 أيام',
                )}
              </p>
            </div>
            <CalendarDays size={18} />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={p.weekly.map((w: any) => ({
                  ...w,
                  day: new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en', {
                    weekday: 'short',
                  }).format(new Date(w.date + 'T12:00:00')),
                }))}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 'auto']}
                  allowDecimals={false}
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={chartTooltip}
                  formatter={(v: any) => [v, t('Minutes', 'دقائق')]}
                />
                <Bar dataKey="minutes" fill="var(--accent)" radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-footnote">
            {t(
              'The clock runs only while a lesson is open and the tab is visible.',
              'يعمل التسجيل فقط أثناء فتح الدرس وظهور علامة التبويب.',
            )}
          </p>
        </section>
      </div>
      <div className="strengths-grid">
        <div className="panel strength-card">
          <span className="icon-tile teal">
            <Star size={21} />
          </span>
          <div>
            <span className="eyebrow">{t('STRONGEST SO FAR', 'أقوى موضوع حتى الآن')}</span>
            <h3>
              {strongest
                ? tr(strongest.module)
                : t('Waiting for your first assessment', 'بانتظار تقييمك الأول')}
            </h3>
            <p>
              {strongest
                ? `${strongest.score}% ${t('estimated mastery', 'إتقان تقديري')}`
                : t('Let your results reveal your strengths.', 'دع نتائجك تكشف نقاط قوتك.')}
            </p>
          </div>
        </div>
        <div className="panel strength-card">
          <span className="icon-tile orange">
            <Target size={21} />
          </span>
          <div>
            <span className="eyebrow">
              {t('A LITTLE MORE ATTENTION', 'قليل من الاهتمام الإضافي')}
            </span>
            <h3>
              {weakest ? tr(weakest.module) : t('No weak topic assumed', 'لا نفترض نقطة ضعف')}
            </h3>
            <p>
              {weakest
                ? `${weakest.score}% ${t('estimated mastery', 'إتقان تقديري')}`
                : t('Recommendations begin with evidence.', 'تبدأ التوصيات بالأدلة.')}
            </p>
            {weakest && (
              <Link href={`/questions?module=${weakest.moduleId}`} className="text-link">
                {t('Targeted practice', 'تدريب موجه')}
                <Arrow size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function LayersIcon() {
  return <BookOpen size={18} />;
}
const badgeIcons: Record<string, any> = {
  sparkles: Sparkles,
  target: Target,
  orbit: Orbit,
  planet: Orbit,
  star: Star,
  galaxy: Sparkles,
  telescope: Telescope,
  award: GraduationCap,
};
export function Achievements() {
  const { data, t, tr, api } = useApp();
  const [badges, setBadges] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    api('achievements').then(setBadges);
  }, [api]);
  if (!data) return null;
  const stats = data.progress.stats;
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={t('EARNED THROUGH UNDERSTANDING', 'تُكتسب بالفهم')}
        title={t('Milestones in your cosmic story.', 'محطات في قصتك الكونية.')}
        description={t(
          'A little recognition for genuine learning. These are earned, never handed out for clicks.',
          'تقدير صغير للتعلم الحقيقي. تُكتسب هذه الإنجازات ولا تُمنح للنقرات.',
        )}
      />
      <section className="achievement-hero panel">
        <div className="achievement-emblem">
          <Award size={57} strokeWidth={1.2} />
          <span>✦</span>
        </div>
        <div>
          <Pill tone="purple">
            {t('EXPLORER LEVEL', 'مستوى المستكشف')} {stats.level}
          </Pill>
          <h2>{t('Every discovery counts.', 'كل اكتشاف مهم.')}</h2>
          <p>
            {data.progress.earned.length} / {badges.length}{' '}
            {t('achievements earned', 'إنجازًا مكتسبًا')}
          </p>
          <div className="xp-progress">
            <ProgressBar value={((stats.xp % 500) / 500) * 100} />
            <span>{stats.xp.toLocaleString()} XP</span>
          </div>
          <small>
            {500 - (stats.xp % 500)} XP {t('to your next level', 'للمستوى التالي')}
          </small>
        </div>
      </section>
      <div className="filter-tabs">
        {[
          ['all', 'All milestones', 'كل الإنجازات'],
          ['earned', 'Earned', 'مكتسبة'],
          ['locked', 'Ahead of you', 'أمامك'],
        ].map(([key, en, ar]) => (
          <button
            className={filter === key ? 'active' : ''}
            key={key}
            onClick={() => setFilter(key)}
          >
            {t(en, ar)}
          </button>
        ))}
      </div>
      <div className="achievement-grid">
        {badges
          .filter(
            (b) => filter === 'all' || (filter === 'earned' ? b.users.length : !b.users.length),
          )
          .map((b, i) => {
            const earned = b.users.length > 0;
            const Icon = badgeIcons[b.icon] || Award;
            return (
              <article
                className={`achievement-card panel ${earned ? 'earned' : 'locked'}`}
                key={b.id}
              >
                <span className="badge-corner">
                  {earned ? <CheckCircle2 size={16} /> : <Lock size={14} />}
                </span>
                <div className={`achievement-medallion badge-${i % 4}`}>
                  <Icon size={36} strokeWidth={1.25} />
                  <span>✦</span>
                </div>
                <h3>{tr(b)}</h3>
                <p>{tr(b, 'description')}</p>
                <Pill tone={earned ? 'purple' : 'muted'}>+{b.xp} XP</Pill>
                <small>
                  {earned
                    ? new Date(b.users[0].earnedAt).toLocaleDateString()
                    : t('Not yet earned', 'لم يُكتسب بعد')}
                </small>
              </article>
            );
          })}
      </div>
      {filter === 'earned' && !data.progress.earned.length && (
        <EmptyState
          icon={Award}
          title={t('First Light is just one quiz away.', 'الضوء الأول على بُعد اختبار.')}
          description={t(
            'Read your first lesson and pass its assessment to earn your first badge.',
            'اقرأ الدرس الأول واجتز تقييمه لاكتساب شارتك الأولى.',
          )}
          action={
            <Button href="/lesson/l-1-1">
              {t('Begin your journey', 'ابدأ رحلتك')}
              <Arrow />
            </Button>
          }
        />
      )}
      <Banner>
        {t(
          'XP rewards assessed lessons, distinct correctly answered questions, and earned milestones. XP is not an academic mastery score. Later-stage badges remain locked while their curriculum is unpublished.',
          'تكافئ النقاط الدروس المقيمة والأسئلة الصحيحة المتميزة والإنجازات. ليست النقاط درجة إتقان أكاديمي. تبقى شارات المراحل اللاحقة مغلقة حتى نشر محتواها.',
        )}
      </Banner>
    </div>
  );
}
export function Certificates() {
  const { data, t, tr } = useApp();
  if (!data) return null;
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={t('A RECORD OF REAL UNDERSTANDING', 'سجل لفهم حقيقي')}
        title={t('Your knowledge, recognized.', 'معرفتك تستحق التقدير.')}
        description={t(
          'Earn a certificate by completing a stage’s prerequisites and passing its final examination.',
          'احصل على شهادة بإكمال متطلبات المرحلة واجتياز اختبارها النهائي.',
        )}
      />
      {data.progress.certificates.length ? (
        <div className="certificate-grid">
          {data.progress.certificates.map((c: any) => (
            <article className="certificate-card panel" key={c.id}>
              <div className="certificate-preview">
                <span>ASTROVERSE ACADEMY</span>
                <GraduationCap size={40} />
                <h3>{t('Certificate of Completion', 'شهادة إتمام')}</h3>
                <strong>{data.user.name}</strong>
                <p>{tr(c.stage)}</p>
                <small>{new Date(c.issuedAt).toLocaleDateString()}</small>
              </div>
              <div className="certificate-info">
                <h3>{tr(c.stage)}</h3>
                <p>
                  {c.score}% {t('stage final score', 'درجة الاختبار النهائي')}
                </p>
                <a className="btn btn-primary" href={`/api/certificates/${c.id}`} download>
                  <Download size={16} />
                  {t('Download certificate', 'تنزيل الشهادة')}
                </a>
                <small>{c.id}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="certificate-empty panel">
          <div className="empty-certificate-art">
            <div>
              <GraduationCap size={40} />
              <span />
              <i />
              <i />
              <b>✦</b>
            </div>
          </div>
          <h2>
            {t(
              'Your first certificate starts with a first step.',
              'تبدأ شهادتك الأولى بخطوة أولى.',
            )}
          </h2>
          <p>
            {t(
              'No sample credentials or pretend achievements. Your earned certificate will appear here after you pass the stage final.',
              'لا شهادات وهمية أو إنجازات مصطنعة. ستظهر شهادتك المكتسبة بعد اجتياز الاختبار النهائي.',
            )}
          </p>
          <div className="certificate-steps">
            <span>
              <BookOpen size={18} />
              {t('Complete the lessons', 'أكمل الدروس')}
            </span>
            <ChevronIcon />
            <span>
              <Target size={18} />
              {t('Pass module exams', 'اجتز اختبارات الوحدات')}
            </span>
            <ChevronIcon />
            <span>
              <GraduationCap size={18} />
              {t('Pass the stage final', 'اجتز اختبار المرحلة')}
            </span>
          </div>
          <Button href="/stages/s-1">
            {t('Begin your first stage', 'ابدأ مرحلتك الأولى')}
            <Arrow />
          </Button>
        </div>
      )}
      <p className="certificate-disclosure">
        {t(
          'Astroverse certificates document completion within this academy. They are not university degrees, externally accredited qualifications, or professional licenses.',
          'توثق شهادات أستروفرس الإتمام داخل هذه الأكاديمية. ليست درجات جامعية أو مؤهلات معتمدة خارجيًا أو تراخيص مهنية.',
        )}
      </p>
    </div>
  );
}
function ChevronIcon() {
  return <ArrowRight size={15} className="directional muted" />;
}
