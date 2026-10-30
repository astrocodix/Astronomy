'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Target,
  Clock,
  BookOpen,
  Sparkles,
  Check,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Flag,
  ShieldCheck,
  Shuffle,
  Lock,
  Layers,
  GraduationCap,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Lightbulb,
  Send,
  ChartNoAxesCombined,
  Filter,
  Play,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from './context';
import {
  PageHeader,
  Button,
  Arrow,
  Pill,
  Field,
  Banner,
  Loading,
  ErrorState,
  Ring,
  ProgressBar,
  Modal,
  EmptyState,
  Markdown,
  SectionHeading,
} from './ui';
const difficultyNames: Record<string, [string, string]> = {
  BEGINNER: ['Beginner', 'مبتدئ'],
  INTERMEDIATE: ['Intermediate', 'متوسط'],
  ADVANCED: ['Advanced', 'متقدم'],
  ADAPTIVE: ['Adaptive', 'تكيفي'],
  ALL: ['All difficulties', 'كل المستويات'],
};
const typeNames: Record<string, [string, string]> = {
  MCQ: ['Multiple choice', 'اختيار من متعدد'],
  TRUE_FALSE: ['True or false', 'صحيح أم خطأ'],
  MULTI_SELECT: ['Multiple select', 'اختيارات متعددة'],
  FILL: ['Scientific term', 'مصطلح علمي'],
  MATCH: ['Matching', 'مطابقة'],
  ORDER: ['Ordering', 'ترتيب'],
  NUMERIC: ['Numerical calculation', 'حساب عددي'],
  REASONING: ['Scientific reasoning', 'استدلال علمي'],
  IMAGE: ['Image interpretation', 'تفسير صورة'],
  DIAGRAM: ['Diagram interpretation', 'تفسير رسم'],
  SCENARIO: ['Applied scenario', 'سيناريو تطبيقي'],
  ADVANCED: ['Advanced problem', 'مسألة متقدمة'],
};
const formatTime = (s: number) =>
  `${Math.floor(Math.max(0, s) / 60)
    .toString()
    .padStart(2, '0')}:${(Math.max(0, s) % 60).toString().padStart(2, '0')}`;
function QuestionChart({ points }: { points: { x: number; y: number }[] }) {
  const { t } = useApp();
  const ordered = [...points].sort((a, b) => a.x - b.x);
  const xs = ordered.map((p) => p.x),
    ys = ordered.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const x = (n: number) => 55 + ((n - minX) / (maxX - minX || 1)) * 440;
  const y = (n: number) => 170 - ((n - minY) / (maxY - minY || 1)) * 110;
  return (
    <div className="question-diagram">
      <span>{t('ILLUSTRATIVE DATA · NOT AN OBSERVATION', 'بيانات توضيحية · ليست رصدًا')}</span>
      <svg
        viewBox="0 0 550 235"
        role="img"
        aria-label={`${t('Relative flux versus time in hours. Points:', 'التدفق النسبي مقابل الزمن بالساعات. النقاط:')} ${ordered.map((p) => `${p.x}: ${p.y}`).join('; ')}`}
      >
        <g stroke="var(--border)">
          {[60, 115, 170].map((v) => (
            <line key={v} x1="45" y1={v} x2="510" y2={v} />
          ))}
        </g>
        <polyline
          points={ordered.map((p) => `${x(p.x)},${y(p.y)}`).join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
        />
        {ordered.map((p, i) => (
          <g key={i}>
            <circle cx={x(p.x)} cy={y(p.y)} r="4" fill="var(--accent)" />
            <text x={x(p.x)} y="198" textAnchor="middle" fontSize="12" fill="var(--muted)">
              {p.x}
            </text>
            <text x={x(p.x)} y={y(p.y) - 12} textAnchor="middle" fontSize="11" fill="var(--text)">
              {p.y}
            </text>
          </g>
        ))}
        <text x="275" y="224" textAnchor="middle" fontSize="11" fill="var(--muted)">
          {t(
            'Time (hours) · relative flux labeled at each point',
            'الزمن (ساعة) · التدفق النسبي مكتوب عند كل نقطة',
          )}
        </text>
      </svg>
    </div>
  );
}
export function AnswerInput({
  question: q,
  value,
  onChange,
  disabled = false,
}: {
  question: any;
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}) {
  const { t, tr, lang } = useApp();
  const type = q.type;
  const optionLabel = (o: any) => tr(o, 'text');
  const media = (
    <>
      {q.data?.image && (
        <figure className="question-image">
          <img
            src={q.data.image}
            alt={
              q.data.alt?.[lang] ||
              t('Scientific image for this question', 'الصورة العلمية لهذا السؤال')
            }
          />
          <figcaption>
            {q.data.credit} ·{' '}
            <a href={q.data.source} target="_blank" rel="noreferrer">
              {t('Image metadata', 'بيانات الصورة')}
              <ExternalLink size={11} />
            </a>
          </figcaption>
        </figure>
      )}
      {q.data?.chart && <QuestionChart points={q.data.chart} />}
    </>
  );
  if (['MCQ', 'TRUE_FALSE', 'SCENARIO', 'IMAGE'].includes(type))
    return (
      <>
        {media}
        <div
          className="answer-options"
          role="radiogroup"
          aria-label={t('Choose one answer', 'اختر إجابة واحدة')}
        >
          {q.options.map((o: any, i: number) => (
            <label
              className={`answer-option ${value === o.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              key={o.id}
            >
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={value === o.id}
                onChange={() => onChange(o.id)}
                disabled={disabled}
              />
              <span className="answer-letter">{String.fromCharCode(65 + i)}</span>
              <span>{optionLabel(o)}</span>
              <span className="answer-radio">{value === o.id && <span />}</span>
            </label>
          ))}
        </div>
      </>
    );
  if (type === 'MULTI_SELECT')
    return (
      <>
        <p className="answer-hint">
          {t('Select every correct statement.', 'اختر كل العبارات الصحيحة.')}
        </p>
        <div className="answer-options">
          {q.options.map((o: any, i: number) => {
            const selected = (value || []).includes(o.id);
            return (
              <label key={o.id} className={`answer-option ${selected ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={disabled}
                  onChange={() =>
                    onChange(
                      selected
                        ? (value || []).filter((x: string) => x !== o.id)
                        : [...(value || []), o.id],
                    )
                  }
                />
                <span className="answer-checkbox">{selected && <Check size={14} />}</span>
                <span>{optionLabel(o)}</span>
              </label>
            );
          })}
        </div>
      </>
    );
  if (type === 'MATCH')
    return (
      <div className="match-options">
        {q.data.rows.map((row: any) => (
          <label className="matching-row" key={row.id}>
            <span>{row[lang]}</span>
            <Arrow size={16} />
            <select
              disabled={disabled}
              value={value?.[row.id] || ''}
              onChange={(e) => onChange({ ...value, [row.id]: e.target.value })}
            >
              <option value="">{t('Choose a definition…', 'اختر تعريفًا…')}</option>
              {q.options.map((o: any) => (
                <option value={o.id} key={o.id}>
                  {optionLabel(o)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    );
  if (type === 'ORDER') {
    const order = value || q.options.map((o: any) => o.id);
    const move = (i: number, delta: number) => {
      const updated = [...order];
      [updated[i], updated[i + delta]] = [updated[i + delta], updated[i]];
      onChange(updated);
    };
    return (
      <div className="order-options">
        <p className="answer-hint">
          {t(
            'Use the arrows to arrange the sequence, then confirm your order.',
            'استخدم الأسهم لترتيب التسلسل ثم أكد الترتيب.',
          )}
        </p>
        {order.map((id: string, i: number) => {
          const o = q.options.find((x: any) => x.id === id);
          return (
            <div className="ordering-row" key={id}>
              <span className="order-number">{i + 1}</span>
              <strong>{optionLabel(o)}</strong>
              <button
                className="icon-btn"
                disabled={disabled || i === 0}
                onClick={() => move(i, -1)}
                aria-label={t('Move up', 'تحريك لأعلى')}
              >
                <ArrowUp size={16} />
              </button>
              <button
                className="icon-btn"
                disabled={disabled || i === order.length - 1}
                onClick={() => move(i, 1)}
                aria-label={t('Move down', 'تحريك لأسفل')}
              >
                <ArrowDown size={16} />
              </button>
            </div>
          );
        })}
        <Button variant="secondary" onClick={() => onChange([...order])} disabled={disabled}>
          {value ? <Check size={15} /> : null}
          {t(
            value ? 'Order recorded' : 'Use this order',
            value ? 'سُجل الترتيب' : 'اعتمد هذا الترتيب',
          )}
        </Button>
      </div>
    );
  }
  if (type === 'REASONING')
    return (
      <>
        <Banner>
          {t(
            'Practice-only reflection. Keyword-based feedback is provisional and does not affect mastery or exam scores. Compare your reasoning with the rubric.',
            'تأمل تدريبي فقط. الملاحظات بالكلمات المفتاحية مبدئية ولا تؤثر في الإتقان أو الدرجات. قارن استدلالك بالمعيار.',
          )}
        </Banner>
        <label className="field">
          <span>{t('Your scientific reasoning', 'استدلالك العلمي')}</span>
          <textarea
            disabled={disabled}
            rows={5}
            maxLength={3000}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('Explain your thinking…', 'اشرح تفكيرك…')}
          />
        </label>
      </>
    );
  return (
    <>
      {media}
      <label className="field numerical-answer">
        <span>
          {t(
            type === 'FILL' ? 'Your scientific term' : 'Your numerical answer',
            type === 'FILL' ? 'مصطلحك العلمي' : 'إجابتك العددية',
          )}
        </span>
        <input
          disabled={disabled}
          value={value ?? ''}
          inputMode={type === 'FILL' ? 'text' : 'decimal'}
          maxLength={200}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            type === 'FILL'
              ? t('English or Arabic', 'العربية أو الإنجليزية')
              : t('Number only, in the requested units', 'العدد فقط بالوحدة المطلوبة')
          }
          dir={type === 'FILL' ? undefined : 'ltr'}
        />
        <small>
          {t(
            type === 'FILL'
              ? 'Use the term from the lesson glossary.'
              : 'Use the unit specified in the question. Numerical tolerances are checked on the server.',
            type === 'FILL'
              ? 'استخدم المصطلح الوارد في مفردات الدرس.'
              : 'استخدم الوحدة المذكورة. يتحقق الخادم من السماحية العددية.',
          )}
        </small>
      </label>
    </>
  );
}
function AnswerExplanation({
  question: q,
  correct,
  provisional = false,
}: {
  question: any;
  correct: boolean;
  provisional?: boolean;
}) {
  const { t, tr, lang } = useApp();
  const a = q.answer;
  const label = (id: string) =>
    tr(
      q.options.find((o: any) => o.id === id),
      'text',
    );
  let answer = '';
  if (a?.kind === 'choice') answer = label(a.correct);
  if (['order', 'set'].includes(a?.kind))
    answer = a.correct.map(label).join(a.kind === 'order' ? ' → ' : ' · ');
  if (a?.kind === 'text') answer = a.accepted[lang === 'ar' ? 1 : 0] || a.accepted[0];
  if (a?.kind === 'number') answer = String(a.correct);
  if (a?.kind === 'match')
    answer = (q.data.rows || [])
      .map((row: any) => `${row[lang]}: ${label(a.correct[row.id])}`)
      .join(' · ');
  return (
    <div className={`answer-feedback ${correct ? 'correct' : 'incorrect'}`}>
      <div className="feedback-title">
        {correct ? <CheckCircle2 size={19} /> : <Lightbulb size={19} />}
        <strong>
          {provisional
            ? t('Provisional practice feedback', 'ملاحظات تدريب مبدئية')
            : correct
              ? t('That’s right. Here’s why.', 'صحيح. إليك السبب.')
              : t('A chance to understand more.', 'فرصة لفهم أعمق.')}
        </strong>
      </div>
      {answer && (
        <p>
          <strong>{t('Expected answer:', 'الإجابة المتوقعة:')}</strong> {answer}
        </p>
      )}
      <p>{tr(q, 'explanation')}</p>
      <Link href={`/lesson/${q.lessonId}`} className="text-link">
        {t('Revisit this concept', 'راجع هذا المفهوم')}
        <Arrow size={13} />
      </Link>
    </div>
  );
}
export function ExamsCenter() {
  const { data, t, tr, api, notify, lang } = useApp();
  const router = useRouter();
  const search = useSearchParams();
  const [scope, setScope] = useState(
    search.get('stage') ? 'stage' : search.get('module') ? 'module' : 'lesson',
  );
  const [moduleId, setModuleId] = useState(search.get('module') || 'm-1-1');
  const [lessonId, setLessonId] = useState('l-1-1');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const m = data?.stages.flatMap((s) => s.modules).find((m) => m.id === moduleId);
    if (m && !m.lessons.some((l) => l.id === lessonId)) setLessonId(m.lessons[0]?.id || '');
  }, [moduleId, data, lessonId]);
  if (!data) return null;
  const modules = data.stages[0].modules;
  const module = modules.find((m) => m.id === moduleId) || modules[0];
  const configs =
    scope === 'lesson'
      ? [
          {
            kind: 'QUICK',
            title: t('A quick check-in', 'تحقق سريع'),
            description: t(
              'Bring your new knowledge into focus. A small step with a big impact.',
              'ركّز معرفتك الجديدة. خطوة صغيرة بأثر كبير.',
            ),
            count: 10,
            minutes: 15,
            icon: CheckCircle2,
            tag: t('A GREAT FIRST STEP', 'بداية رائعة'),
          },
          {
            kind: 'STANDARD',
            title: t('Find your understanding', 'اختبر فهمك'),
            description: t(
              'Connect the ideas and put your learning to a balanced test.',
              'اربط الأفكار وضع تعلمك في اختبار متوازن.',
            ),
            count: 20,
            minutes: 30,
            icon: Target,
            tag: t('THE COMPLETE CHECK', 'تقييم متكامل'),
          },
          {
            kind: 'ADVANCED',
            title: t('Reach a little further', 'تقدّم قليلًا'),
            description: t(
              'A longer assessment with more opportunities to apply your knowledge.',
              'تقييم أطول مع فرص أكثر لتطبيق معرفتك.',
            ),
            count: 30,
            minutes: 45,
            icon: Sparkles,
            tag: t('FOR CURIOUS MINDS', 'للعقول الفضولية'),
          },
        ]
      : [
          {
            kind: scope === 'module' ? 'MODULE' : 'STAGE',
            title:
              scope === 'module'
                ? t('Module examination', 'اختبار الوحدة')
                : t('Stage final examination', 'الاختبار النهائي للمرحلة'),
            description:
              scope === 'module'
                ? t(
                    'Complete every lesson assessment first. Pass this exam to unlock the next module.',
                    'أكمل تقييمات الدروس أولًا. اجتز هذا الاختبار لفتح الوحدة التالية.',
                  )
                : t(
                    'Bring all eight modules together. Pass to earn your stage certificate.',
                    'اجمع معارف الوحدات الثماني. اجتز لتحصل على شهادة المرحلة.',
                  ),
            count: scope === 'module' ? 50 : 100,
            minutes: scope === 'module' ? 60 : 120,
            icon: GraduationCap,
            tag: t('YOUR NEXT MILESTONE', 'إنجازك التالي'),
          },
        ];
  const start = async (kind: string) => {
    setBusy(kind);
    setError('');
    try {
      const e = await api('exams/start', {
        method: 'POST',
        body: JSON.stringify({
          kind,
          scopeId: scope === 'lesson' ? lessonId : scope === 'module' ? moduleId : 's-1',
        }),
      });
      router.push(`/exam/${e.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy('');
  };
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={t('KNOW WHAT YOU KNOW', 'اعرف ما تعرفه')}
        title={t('Let your understanding shine.', 'دع فهمك يتألق.')}
        description={t(
          'Not just a score. A clearer picture of what you understand—and what to explore next.',
          'ليست مجرد درجة، بل صورة أوضح لما تفهمه وما يستحق الاستكشاف لاحقًا.',
        )}
        action={
          <Button href={`/questions?module=${moduleId}`} variant="secondary">
            <Shuffle size={16} />
            {t('Practice freely', 'تدرّب بحرية')}
          </Button>
        }
      />
      <div className="exam-info-strip">
        <span>
          <ShieldCheck size={16} />
          {t('Server-scored assessments', 'تقييمات يصححها الخادم')}
        </span>
        <span>
          <Shuffle size={16} />
          {t('Randomized, balanced questions', 'أسئلة عشوائية متوازنة')}
        </span>
        <span>
          <Target size={16} />
          {data.settings.passingScore}% {t('to pass', 'للنجاح')}
        </span>
      </div>
      <section className="exam-setup panel">
        <div className="section-heading">
          <h2>{t('Choose your next challenge', 'اختر تحديك التالي')}</h2>
          <Pill tone="purple">{t('STAGE 01', 'المرحلة 01')}</Pill>
        </div>
        <div className="filter-tabs">
          {[
            ['lesson', 'Lesson assessments', 'تقييمات الدروس'],
            ['module', 'Module exams', 'اختبارات الوحدات'],
            ['stage', 'Stage final', 'الاختبار النهائي'],
          ].map(([key, en, ar]) => (
            <button
              key={key}
              className={scope === key ? 'active' : ''}
              onClick={() => {
                setScope(key);
                setError('');
              }}
            >
              {t(en, ar)}
            </button>
          ))}
        </div>
        <div className="exam-selects">
          <Field label={t('Learning module', 'الوحدة التعليمية')}>
            <select
              value={moduleId}
              disabled={scope === 'stage'}
              onChange={(e) => {
                setModuleId(e.target.value);
                setLessonId(
                  modules.find((m) => m.id === e.target.value)?.lessons[0]?.id || 'l-1-1',
                );
              }}
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {String(m.order).padStart(2, '0')} · {tr(m)}
                </option>
              ))}
            </select>
          </Field>
          {scope === 'lesson' && (
            <Field label={t('Lesson to assess', 'الدرس المراد تقييمه')}>
              <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
                {module.lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {tr(l)}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        {error && <Banner tone="warning">{error}</Banner>}
        <div className={`exam-type-grid ${configs.length === 1 ? 'single' : ''}`}>
          {configs.map(({ icon: Icon, ...c }) => (
            <article key={c.kind} className={`exam-type-card type-${c.kind.toLowerCase()}`}>
              <div className="exam-type-top">
                <span className="icon-tile purple">
                  <Icon size={24} />
                </span>
                <span className="eyebrow">{c.tag}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <div className="exam-counts">
                <span>
                  <ClipboardCheck size={15} />
                  {c.count} {t('questions', 'سؤالًا')}
                </span>
                <span>
                  <Clock size={15} />
                  {c.minutes} {t('minutes', 'دقيقة')}
                </span>
              </div>
              <Button
                onClick={() => start(c.kind)}
                loading={busy === c.kind}
                disabled={!!busy}
                variant={c.kind === 'QUICK' ? 'primary' : 'secondary'}
              >
                {t('Begin assessment', 'ابدأ التقييم')}
                <Arrow size={15} />
              </Button>
            </article>
          ))}
        </div>
      </section>
      <section className="practice-banner">
        <span className="practice-orbit">
          <OrbitIcon />
        </span>
        <div>
          <h3>{t('Room to make mistakes. Space to grow.', 'مساحة للخطأ. وفرصة للنمو.')}</h3>
          <p>
            {data.counts.questions}{' '}
            {t(
              'questions across 12 formats. Practice without a timer and learn from every answer.',
              'سؤالًا بـ12 صيغة. تدرّب دون مؤقت وتعلّم من كل إجابة.',
            )}
          </p>
        </div>
        <Button href="/questions" variant="secondary">
          {t('Open question bank', 'افتح بنك الأسئلة')}
          <Arrow />
        </Button>
      </section>
      {data.progress.activeExams?.length > 0 && (
        <section className="panel active-exams">
          <h3>{t('Continue an assessment', 'تابع تقييمًا')}</h3>
          {data.progress.activeExams.map((e: any) => (
            <Link href={`/exam/${e.id}`} key={e.id}>
              <Clock size={16} />
              <span>
                {lang === 'ar' ? e.titleAr || e.title : e.title}
                <small>
                  {new Date(e.expiresAt) > new Date()
                    ? t(
                        'Your saved answers are waiting. The timer keeps running.',
                        'إجاباتك محفوظة. يستمر المؤقت في العمل.',
                      )
                    : t(
                        'Time ended. Review your saved answers.',
                        'انتهى الوقت. راجع إجاباتك المحفوظة.',
                      )}
                </small>
              </span>
              <Arrow size={15} />
            </Link>
          ))}
        </section>
      )}
      <SectionHeading
        title={t('Your recent assessments', 'تقييماتك الأخيرة')}
        sub={t(
          'Only completed, submitted examinations appear here.',
          'تظهر الاختبارات المكتملة والمسلّمة فقط.',
        )}
      />
      {data.progress.exams.length ? (
        <div className="exam-history panel">
          <table>
            <thead>
              <tr>
                <th>{t('Assessment', 'التقييم')}</th>
                <th>{t('Score', 'الدرجة')}</th>
                <th>{t('Time spent', 'الوقت')}</th>
                <th>{t('Result', 'النتيجة')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.progress.exams.slice(0, 10).map((e: any) => (
                <tr key={e.id}>
                  <td>
                    <strong>{lang === 'ar' ? e.titleAr || e.title : e.title}</strong>
                    <small>{e.kind}</small>
                  </td>
                  <td>{e.score}%</td>
                  <td>{formatTime(e.duration)}</td>
                  <td>
                    <Pill tone={e.score >= e.passingScore ? 'teal' : 'orange'}>
                      {e.score >= e.passingScore
                        ? t('Passed', 'ناجح')
                        : t('Keep exploring', 'تابع التعلم')}
                    </Pill>
                  </td>
                  <td>
                    <Link className="text-link" href={`/exam/${e.id}`}>
                      {t('Review', 'مراجعة')}
                      <Arrow size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            icon={Target}
            title={t('Your first milestone is waiting.', 'إنجازك الأول ينتظر.')}
            description={t(
              'Take an assessment and your real results will appear here.',
              'خض تقييمًا لتظهر نتائجك الحقيقية هنا.',
            )}
          />
        </div>
      )}
    </div>
  );
}
function OrbitIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="15" stroke="currentColor" />
      <ellipse
        cx="32"
        cy="32"
        rx="30"
        ry="10"
        transform="rotate(-35 32 32)"
        stroke="currentColor"
      />
      <circle cx="51" cy="13" r="3" fill="currentColor" />
    </svg>
  );
}
export function ExamAttemptPage({ id }: { id: string }) {
  const { t, tr, api, refresh, notify, lang } = useApp();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(true);
  const [flags, setFlags] = useState<string[]>([]);
  const autoSubmitted = useRef(false);
  const revision = useRef(0);
  const saveQueue = useRef<Promise<any>>(Promise.resolve());
  const [saveError, setSaveError] = useState('');
  const clockOffset = useRef(0);
  const initialized = useRef(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  useEffect(() => {
    let live = true;
    api(`exams/${id}`)
      .then((e) => {
        if (!live) return;
        setExam(e);
        revision.current = e.draftRevision || 0;
        clockOffset.current = Date.now() - new Date(e.serverNow).getTime();
        setResponses(e.draftAnswers || {});
        setSeconds(
          Math.max(
            0,
            Math.ceil((new Date(e.expiresAt).getTime() - Date.now() + clockOffset.current) / 1000),
          ),
        );
        initialized.current = true;
      })
      .catch((e) => setError(e.message));
    return () => {
      live = false;
    };
  }, [id, api]);
  useEffect(() => {
    if (!exam || exam.status !== 'IN_PROGRESS') return;
    const timer = setInterval(
      () =>
        setSeconds(
          Math.max(
            0,
            Math.ceil(
              (new Date(exam.expiresAt).getTime() - Date.now() + clockOffset.current) / 1000,
            ),
          ),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [exam]);
  useEffect(() => {
    if (!initialized.current || !exam || exam.status !== 'IN_PROGRESS') return;
    setSaved(false);
    let live = true;
    const timer = setTimeout(() => {
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(async () => {
          if (!live) return;
          try {
            const result = await api(`exams/${id}/save`, {
              method: 'POST',
              body: JSON.stringify({ responses, revision: revision.current }),
            });
            revision.current = result.revision;
            if (live) {
              setSaved(true);
              setSaveError('');
            }
          } catch (e) {
            if (live) {
              setSaved(false);
              setSaveError((e as Error).message);
            }
          }
        });
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [responses, exam, id, api]);
  const submit = useCallback(async () => {
    setBusy(true);
    try {
      await saveQueue.current.catch(() => {});
      const e = await api(`exams/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ responses }),
      });
      setExam(e);
      setConfirm(false);
      await refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      notify((e as Error).message, 'error');
    }
    setBusy(false);
  }, [api, id, responses, refresh, notify]);
  useEffect(() => {
    if (
      exam?.status === 'IN_PROGRESS' &&
      seconds === 0 &&
      initialized.current &&
      !autoSubmitted.current
    ) {
      autoSubmitted.current = true;
      submit();
    }
  }, [seconds, exam, submit]);
  if (error) return <ErrorState message={error} />;
  if (!exam) return <Loading />;
  if (exam.status === 'EXPIRED')
    return (
      <ErrorState
        message={t(
          'This attempt expired. Start a new assessment from the exams center.',
          'انتهت هذه المحاولة. ابدأ تقييمًا جديدًا من مركز الاختبارات.',
        )}
      />
    );
  if (exam.status === 'SUBMITTED') {
    const correct = exam.answers.filter((a: any) => a.correct).length;
    const passed = exam.score >= exam.passingScore;
    const missed = exam.questions.filter(
      (q: any) => !exam.answers.find((a: any) => a.questionId === q.id)?.correct,
    );
    const revise = [...new Set<string>(missed.map((q: any) => q.lessonId))];
    const topics = Object.values(
      exam.questions.reduce((acc: any, q: any) => {
        if (!acc[q.moduleId]) acc[q.moduleId] = { id: q.moduleId, total: 0, correct: 0 };
        acc[q.moduleId].total++;
        if (exam.answers.find((a: any) => a.questionId === q.id)?.correct)
          acc[q.moduleId].correct++;
        return acc;
      }, {}),
    );
    return (
      <div className="page-enter exam-results">
        <PageHeader
          eyebrow={t('EVERY ANSWER IS A STEP FORWARD', 'كل إجابة خطوة للأمام')}
          title={
            passed
              ? t('A new perspective, earned.', 'منظور جديد، استحققته.')
              : t('Every explorer takes another look.', 'كل مستكشف ينظر مرة أخرى.')
          }
          description={t(
            'Your result is saved. Let’s understand what it means.',
            'حُفظت نتيجتك. لنفهم معناها.',
          )}
        />
        <div className={`result-hero panel ${passed ? 'passed' : 'revise'}`}>
          <Ring value={exam.score} size={160}>
            <strong>
              {exam.score}
              <span>%</span>
            </strong>
            <small>{t('FINAL SCORE', 'الدرجة النهائية')}</small>
          </Ring>
          <div>
            <Pill
              tone={passed ? 'teal' : 'orange'}
              icon={passed ? <CheckCircle2 size={13} /> : <Target size={13} />}
            >
              {passed
                ? t('Assessment passed', 'اجتزت التقييم')
                : t('Revision recommended', 'نوصي بالمراجعة')}
            </Pill>
            <h2>{lang === 'ar' ? exam.titleAr || exam.title : exam.title}</h2>
            <div className="result-metrics">
              <span>
                <CheckCircle2 size={17} />
                <strong>{correct}</strong>
                {t('correct', 'صحيحة')}
              </span>
              <span>
                <XCircle size={17} />
                <strong>{exam.questions.length - correct}</strong>
                {t('incorrect / unanswered', 'خاطئة أو بلا إجابة')}
              </span>
              <span>
                <Clock size={17} />
                <strong>{formatTime(exam.duration)}</strong>
                {t('time spent', 'الوقت')}
              </span>
            </div>
            <p>
              {t(
                `Pass threshold: ${exam.passingScore}%. Your mastery is based on assessed concepts, not page visits.`,
                `حد النجاح ${exam.passingScore}%. يعتمد إتقانك على المفاهيم المقيمة لا زيارات الصفحات.`,
              )}
            </p>
          </div>
        </div>
        <div className="result-actions">
          <Button href="/roadmap">
            {passed
              ? t('Continue your journey', 'تابع رحلتك')
              : t('Revisit your learning path', 'راجع مسارك')}
            <Arrow />
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                const e = await api('exams/start', {
                  method: 'POST',
                  body: JSON.stringify({ kind: exam.kind, scopeId: exam.scopeId }),
                });
                router.push(`/exam/${e.id}`);
              } catch (e) {
                notify((e as Error).message, 'error');
              }
            }}
          >
            <RotateCcw size={15} />
            {t('Try a fresh assessment', 'جرّب تقييمًا جديدًا')}
          </Button>
          <Button
            variant="ghost"
            href={`/tutor?q=${encodeURIComponent(t(`Help me improve after scoring ${exam.score}% in ${exam.title}.`, `ساعدني على التحسن بعد حصولي على ${exam.score}% في ${exam.titleAr || exam.title}.`))}`}
          >
            <Sparkles size={15} />
            {t('Discuss with Astro', 'ناقش مع أسترو')}
          </Button>
        </div>
        <div className="result-plan panel">
          <div className="card-topline">
            <h3>
              <Target size={18} />
              {t('Your next best steps', 'أفضل خطواتك التالية')}
            </h3>
            <Pill>{t('Rule-based revision plan', 'خطة مراجعة قائمة على قواعد')}</Pill>
          </div>
          {revise.length ? (
            <ol>
              {revise.map((lessonId, i) => (
                <li key={lessonId}>
                  <span>{i + 1}</span>
                  <div>
                    <strong>
                      {t('Revisit the concepts you missed.', 'راجع المفاهيم التي أخطأت فيها.')}
                    </strong>
                    <p>
                      {t(
                        'Read the answer explanations below, revisit the lesson, then attempt a fresh quiz. Space your next check across another day.',
                        'اقرأ التفسيرات أدناه وراجع الدرس ثم خض اختبارًا جديدًا. وزّع التقييم التالي على يوم آخر.',
                      )}
                    </p>
                  </div>
                  <Link href={`/lesson/${lessonId}`} className="text-link">
                    {t('Review lesson', 'راجع الدرس')}
                    <Arrow size={13} />
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p>
              {t(
                'Great work. Recheck these ideas on another day to build durable mastery, then explore your next module.',
                'عمل رائع. أعد تقييم الأفكار في يوم آخر لتثبيت الإتقان ثم استكشف وحدتك التالية.',
              )}
            </p>
          )}
          <div className="topic-result-bars">
            {topics.map((topic: any) => (
              <div key={topic.id}>
                <span>
                  {t('Module', 'الوحدة')} {topic.id.split('-').at(-1)}
                </span>
                <ProgressBar value={(topic.correct / topic.total) * 100} />
                <strong>{Math.round((topic.correct / topic.total) * 100)}%</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="section-heading">
          <h2>{t('Every answer, explained', 'كل إجابة مع تفسيرها')}</h2>
          <div className="segmented">
            <button
              className={reviewFilter === 'all' ? 'active' : ''}
              onClick={() => setReviewFilter('all')}
            >
              {t('All answers', 'كل الإجابات')}
            </button>
            <button
              className={reviewFilter === 'missed' ? 'active' : ''}
              onClick={() => setReviewFilter('missed')}
            >
              {t('To revisit', 'للمراجعة')} ({missed.length})
            </button>
          </div>
        </div>
        <div className="answer-review-list">
          {exam.questions
            .filter(
              (q: any) =>
                reviewFilter === 'all' ||
                !exam.answers.find((a: any) => a.questionId === q.id)?.correct,
            )
            .map((q: any, i: number) => {
              const a = exam.answers.find((x: any) => x.questionId === q.id);
              return (
                <details className="review-question panel" key={q.id} open={i === 0}>
                  <summary>
                    {a?.correct ? (
                      <CheckCircle2 size={20} className="success-text" />
                    ) : (
                      <XCircle size={20} className="warning-text" />
                    )}
                    <span>{tr(q, 'prompt')}</span>
                    <ChevronRight size={16} />
                  </summary>
                  <div className="review-question-body">
                    <p className="your-response">
                      <strong>{t('Your response:', 'إجابتك:')}</strong>{' '}
                      {a?.response === null
                        ? t('Not answered', 'بلا إجابة')
                        : typeof a.response === 'string'
                          ? tr(
                              q.options.find((o: any) => o.id === a.response),
                              'text',
                            ) || a.response
                          : Array.isArray(a.response)
                            ? a.response
                                .map(
                                  (id: string) =>
                                    tr(
                                      q.options.find((o: any) => o.id === id),
                                      'text',
                                    ) || id,
                                )
                                .join(' · ')
                            : q.type === 'MATCH'
                              ? (q.data.rows || [])
                                  .map(
                                    (row: any) =>
                                      `${row[lang]}: ${
                                        tr(
                                          q.options.find(
                                            (o: any) => o.id === a?.response?.[row.id],
                                          ),
                                          'text',
                                        ) || t('Not answered', 'بلا إجابة')
                                      }`,
                                  )
                                  .join(' · ')
                              : String(a?.response ?? '')}
                    </p>
                    <AnswerExplanation question={q} correct={!!a?.correct} />
                  </div>
                </details>
              );
            })}
        </div>
      </div>
    );
  }
  const question = exam.questions[index];
  const answered = Object.keys(responses).filter(
    (k) =>
      responses[k] !== '' &&
      responses[k] !== null &&
      (!Array.isArray(responses[k]) || responses[k].length),
  ).length;
  const update = (value: any) => setResponses((v) => ({ ...v, [question.id]: value }));
  return (
    <div className="exam-session page-enter">
      <div className="exam-session-top">
        <Link className="back-link" href="/exams">
          <Arrow size={14} />
          {t('Exam center', 'مركز الاختبارات')}
        </Link>
        <Pill icon={<ShieldCheck size={12} />}>
          {t('Answers stay hidden until submission', 'تظل الإجابات مخفية حتى التسليم')}
        </Pill>
      </div>
      <div className="exam-session-heading">
        <div>
          <div className="eyebrow">{t('YOUR FOCUS SPACE', 'مساحة تركيزك')}</div>
          <h1>{lang === 'ar' ? exam.titleAr || exam.title : exam.title}</h1>
        </div>
        <div className={`exam-timer ${seconds < 120 ? 'urgent' : ''}`}>
          <Clock size={19} />
          <strong dir="ltr">{formatTime(seconds)}</strong>
          <span>{t('remaining', 'متبقية')}</span>
        </div>
      </div>
      <div className="exam-progress">
        <ProgressBar value={(answered / exam.questions.length) * 100} />
        <span>
          {answered} / {exam.questions.length} {t('answered', 'مُجاب')}
        </span>
      </div>
      {saveError && (
        <Banner tone="warning">
          {saveError}{' '}
          <button className="text-link" onClick={() => setResponses((v) => ({ ...v }))}>
            {t('Retry saving', 'أعد محاولة الحفظ')}
          </button>
        </Banner>
      )}
      <div className="exam-workspace">
        <section className="exam-question panel">
          <div className="question-topline">
            <span className="question-counter">
              {t('QUESTION', 'السؤال')} {String(index + 1).padStart(2, '0')}{' '}
              <span>/ {exam.questions.length}</span>
            </span>
            <Pill tone={question.difficulty === 'ADVANCED' ? 'orange' : 'purple'}>
              {t(...difficultyNames[question.difficulty])}
            </Pill>
            <button
              className={`flag-button ${flags.includes(question.id) ? 'flagged' : ''}`}
              onClick={() =>
                setFlags((v) =>
                  v.includes(question.id)
                    ? v.filter((x) => x !== question.id)
                    : [...v, question.id],
                )
              }
            >
              <Flag size={15} />
              {t('Review later', 'راجع لاحقًا')}
            </button>
          </div>
          <span className="question-type">{t(...typeNames[question.type])}</span>
          <h2>{tr(question, 'prompt')}</h2>
          <AnswerInput question={question} value={responses[question.id]} onChange={update} />
          <div className="question-navigation">
            <Button
              variant="secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              <ArrowLeft size={16} className="directional" />
              {t('Previous', 'السابق')}
            </Button>
            <span className="save-status">
              {saved ? <Check size={12} /> : <span className="tiny-dot" />}
              {saved
                ? t('Progress saved', 'حُفظ التقدم')
                : saveError
                  ? t('Not saved', 'غير محفوظ')
                  : t('Saving…', 'جارٍ الحفظ…')}
            </span>
            {index < exam.questions.length - 1 ? (
              <Button onClick={() => setIndex((i) => i + 1)}>
                {t('Next question', 'السؤال التالي')}
                <Arrow />
              </Button>
            ) : (
              <Button onClick={() => setConfirm(true)}>
                {t('Finish assessment', 'إنهاء التقييم')}
                <Check size={16} />
              </Button>
            )}
          </div>
        </section>
        <aside className="exam-nav-panel panel">
          <h3>{t('Your question map', 'خريطة أسئلتك')}</h3>
          <p>{t('Move freely between questions.', 'تنقّل بحرية بين الأسئلة.')}</p>
          <div className="question-map">
            {exam.questions.map((q: any, i: number) => (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                className={`${i === index ? 'current' : ''} ${responses[q.id] !== undefined ? 'answered' : ''} ${flags.includes(q.id) ? 'flagged' : ''}`}
                aria-label={`${t('Question', 'السؤال')} ${i + 1}`}
                aria-current={i === index ? 'step' : undefined}
              >
                {i + 1}
                {flags.includes(q.id) && <span />}
              </button>
            ))}
          </div>
          <div className="map-legend">
            <span>
              <i className="answered" />
              {t('Answered', 'مُجاب')}
            </span>
            <span>
              <i className="flagged" />
              {t('Flagged', 'للمراجعة')}
            </span>
          </div>
          <div className="exam-navigation-note">
            <Lightbulb size={17} />
            <p>
              {t(
                'Take your time. You can change any response before submitting.',
                'خذ وقتك. يمكنك تعديل أي إجابة قبل التسليم.',
              )}
            </p>
          </div>
          <Button variant="secondary" className="full-width" onClick={() => setConfirm(true)}>
            <Send size={15} />
            {t('Submit assessment', 'سلّم التقييم')}
          </Button>
        </aside>
      </div>
      {confirm && (
        <Modal
          title={t('Ready to see what you’ve learned?', 'مستعد لرؤية ما تعلمته؟')}
          onClose={() => setConfirm(false)}
        >
          <p>
            {t(
              `You’ve answered ${answered} of ${exam.questions.length} questions. After submission, answers cannot be changed.`,
              `أجبت عن ${answered} من ${exam.questions.length} سؤالًا. لا يمكن تعديل الإجابات بعد التسليم.`,
            )}
          </p>
          {answered < exam.questions.length && (
            <Banner tone="warning">
              {t(
                'Unanswered questions are scored as incorrect.',
                'تُحسب الأسئلة بلا إجابة على أنها خاطئة.',
              )}
            </Banner>
          )}
          <div className="button-row">
            <Button onClick={submit} loading={busy}>
              <CheckCircle2 size={16} />
              {t('Submit & see results', 'سلّم واعرض النتائج')}
            </Button>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              {t('Keep reviewing', 'تابع المراجعة')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
export function QuestionBank() {
  const { data, t, tr, api, refresh, notify } = useApp();
  const params = useSearchParams();
  const [moduleId, setModuleId] = useState(params.get('module') || 'm-1-1');
  const [difficulty, setDifficulty] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [bank, setBank] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState<any>();
  const [feedback, setFeedback] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    setBank(null);
    setFeedback(null);
    setValue(undefined);
    setIndex(0);
    try {
      setBank(await api(`questions?module=${moduleId}&difficulty=${difficulty}&type=${type}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api, moduleId, difficulty, type]);
  useEffect(() => {
    load();
  }, [load]);
  if (!data) return null;
  const q = bank?.questions[index];
  const check = async () => {
    if (value === undefined || value === '') return;
    setBusy(true);
    try {
      const r = await api(`questions/${q.id}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ response: value }),
      });
      setFeedback(r);
      await refresh();
    } catch (e) {
      notify((e as Error).message, 'error');
    }
    setBusy(false);
  };
  return (
    <div className="page-enter question-bank">
      <PageHeader
        eyebrow={t('PRACTICE MAKES PERSPECTIVE', 'التدريب يصنع منظورًا')}
        title={t('A safe space for big questions.', 'مساحة آمنة لأسئلة كبيرة.')}
        description={t(
          'No timer. No pressure. Just you, a question, and a chance to understand a little more.',
          'بلا مؤقت ولا ضغط. أنت وسؤال وفرصة لفهم أعمق.',
        )}
        action={
          <Pill tone="purple">
            {data.counts.questions} {t('questions to explore', 'سؤالًا للاستكشاف')}
          </Pill>
        }
      />
      <div className="bank-filters panel">
        <Field label={t('Topic', 'الموضوع')}>
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            {data.stages[0].modules.map((m) => (
              <option value={m.id} key={m.id}>
                {tr(m)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('Difficulty', 'الصعوبة')}>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {Object.entries(difficultyNames).map(([key, labels]) => (
              <option value={key} key={key}>
                {t(...labels)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('Question format', 'صيغة السؤال')}>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ALL">{t('All formats', 'كل الصيغ')}</option>
            {Object.entries(typeNames).map(([key, labels]) => (
              <option value={key} key={key}>
                {t(...labels)}
              </option>
            ))}
          </select>
        </Field>
        <button
          className="icon-btn"
          onClick={load}
          aria-label={t('Shuffle questions', 'إعادة ترتيب الأسئلة')}
        >
          <Shuffle size={19} />
        </button>
      </div>
      {error ? (
        <ErrorState message={error} />
      ) : !bank ? (
        <Loading small />
      ) : !q ? (
        <EmptyState
          icon={SearchIcon}
          title={t('No questions match this selection', 'لا أسئلة مطابقة لهذا الاختيار')}
          description={t('Try another format or difficulty.', 'جرّب صيغة أو مستوى آخر.')}
        />
      ) : (
        <div className="practice-layout">
          <section className="practice-question panel">
            <div className="question-topline">
              <span className="question-counter">
                {t('PRACTICE', 'تدريب')} {String(index + 1).padStart(2, '0')}
              </span>
              <Pill tone="purple">{t(...difficultyNames[q.difficulty])}</Pill>
              <span className="practice-mode-label">
                <span />
                {t('LEARNING MODE', 'وضع التعلم')}
              </span>
            </div>
            <span className="question-type">{t(...typeNames[q.type])}</span>
            <h2>{tr(q, 'prompt')}</h2>
            <AnswerInput question={q} value={value} onChange={setValue} disabled={!!feedback} />
            {feedback && (
              <AnswerExplanation
                question={feedback.question}
                correct={feedback.correct}
                provisional={feedback.provisional}
              />
            )}
            <div className="question-navigation">
              <span className="muted">
                {bank.total} {t('matching questions', 'سؤالًا مطابقًا')}
              </span>
              {feedback ? (
                <Button
                  onClick={() => {
                    if (index + 1 >= bank.questions.length) load();
                    else {
                      setIndex((i) => i + 1);
                      setValue(undefined);
                      setFeedback(null);
                    }
                  }}
                >
                  {t('Explore another question', 'استكشف سؤالًا آخر')}
                  <Arrow />
                </Button>
              ) : (
                <Button
                  loading={busy}
                  disabled={value === undefined || value === ''}
                  onClick={check}
                >
                  {t('Check my understanding', 'تحقق من فهمي')}
                  <Check size={16} />
                </Button>
              )}
            </div>
          </section>
          <aside className="practice-coach panel">
            <span className="icon-tile purple">
              <Lightbulb size={22} />
            </span>
            <h3>{t('A mistake is a new starting point.', 'الخطأ نقطة بداية جديدة.')}</h3>
            <p>
              {t(
                'After each answer, you’ll see the scientific explanation and a link back to the lesson. Previously unseen questions come first.',
                'بعد كل إجابة سترى التفسير العلمي ورابط الدرس. تُقدّم الأسئلة التي لم تراها أولًا.',
              )}
            </p>
            <div className="guide-step">
              <CheckCircle2 size={17} />
              <span>{t('Real, server-checked answers', 'إجابات يتحقق منها الخادم')}</span>
            </div>
            <div className="guide-step">
              <Target size={17} />
              <span>{t('Mastery based on distinct concepts', 'إتقان قائم على مفاهيم متميزة')}</span>
            </div>
            <div className="guide-step">
              <Shuffle size={17} />
              <span>{t('Adaptive difficulty available', 'مستوى تكيفي متاح')}</span>
            </div>
            <Link className="text-link" href={`/tutor?q=${encodeURIComponent(tr(q, 'prompt'))}`}>
              {t('Bring a question to Astro', 'ناقش سؤالًا مع أسترو')}
              <Arrow />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
function SearchIcon(props: any) {
  return <Target {...props} />;
}
