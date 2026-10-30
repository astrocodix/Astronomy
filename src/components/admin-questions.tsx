'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import { useApp } from './context';
import { Button, Field, Modal, Banner, Pill, Loading, Markdown } from './ui';
import { questionTypes } from '../lib/question-schema';
const labels: Record<string, [string, string]> = {
  MCQ: ['Multiple choice', 'اختيار من متعدد'],
  TRUE_FALSE: ['True / false', 'صحيح / خطأ'],
  MULTI_SELECT: ['Multiple select', 'اختيارات متعددة'],
  FILL: ['Scientific term', 'مصطلح علمي'],
  MATCH: ['Matching', 'مطابقة'],
  ORDER: ['Ordering', 'ترتيب'],
  NUMERIC: ['Numerical', 'عددي'],
  REASONING: ['Reasoning (practice only)', 'استدلال (تدريب فقط)'],
  IMAGE: ['Image interpretation', 'تفسير صورة'],
  DIAGRAM: ['Chart interpretation', 'تفسير رسم'],
  SCENARIO: ['Scenario', 'سيناريو'],
  ADVANCED: ['Advanced problem', 'مسألة متقدمة'],
};
function defaults(type: string) {
  let options: any[] = [
    'MCQ',
    'SCENARIO',
    'IMAGE',
    'MULTI_SELECT',
    'ORDER',
    'MATCH',
    'TRUE_FALSE',
  ].includes(type)
    ? Array.from({ length: type === 'TRUE_FALSE' ? 2 : type === 'MATCH' ? 3 : 4 }, (_, i) => ({
        id: `option-${i + 1}`,
        textEn: '',
        textAr: '',
      }))
    : [];
  if (type === 'TRUE_FALSE')
    options = [
      { id: 'option-1', textEn: 'True', textAr: 'صحيح' },
      { id: 'option-2', textEn: 'False', textAr: 'خطأ' },
    ];
  let answer: any = { kind: 'choice', correct: 'option-1' },
    data: any = {};
  if (type === 'MULTI_SELECT') answer = { kind: 'set', correct: ['option-1', 'option-2'] };
  if (type === 'ORDER') answer = { kind: 'order', correct: options.map((o) => o.id) };
  if (type === 'FILL') answer = { kind: 'text', accepted: ['English term', 'المصطلح العربي'] };
  if (['NUMERIC', 'DIAGRAM', 'ADVANCED'].includes(type))
    answer = { kind: 'number', correct: 0, tolerance: 0 };
  if (type === 'MATCH') {
    data.rows = [1, 2, 3].map((i) => ({ id: `row-${i}`, en: `Concept ${i}`, ar: `المفهوم ${i}` }));
    answer = {
      kind: 'match',
      correct: Object.fromEntries([1, 2, 3].map((i) => [`row-${i}`, `option-${i}`])),
    };
  }
  if (type === 'REASONING') {
    answer = { kind: 'rubric', groups: [['evidence', 'دليل']] };
    data = { practiceOnly: true, rubricNotice: true };
  }
  if (type === 'IMAGE')
    data = {
      image: '/images/carina.webp',
      alt: { en: 'Describe the visible evidence', ar: 'صف الأدلة المرئية' },
      credit: '',
      source: 'https://',
    };
  if (type === 'DIAGRAM')
    data = {
      chart: [
        { x: 0, y: 100 },
        { x: 1, y: 80 },
        { x: 2, y: 100 },
      ],
      illustrative: true,
    };
  return { type, options, answer, data };
}
export function QuestionStudio({ lessons, onChange }: { lessons: any[]; onChange: () => void }) {
  const { t, tr, api, notify } = useApp();
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [lesson, setLesson] = useState(''),
    [reviewStatus, setReviewStatus] = useState('PENDING');
  const [queue, setQueue] = useState<any>(null),
    [error, setError] = useState(''),
    [editor, setEditor] = useState<any>(null),
    [review, setReview] = useState<any>(null);
  const [answerJson, setAnswerJson] = useState(''),
    [dataJson, setDataJson] = useState(''),
    [busy, setBusy] = useState(false),
    [notes, setNotes] = useState(''),
    [human, setHuman] = useState(false),
    [formError, setFormError] = useState('');
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const result = await api(
        `admin/questions?${new URLSearchParams({ page: String(page), q: search, lesson, review: reviewStatus })}`,
        { signal },
      );
      setQueue(result);
      setError('');
    },
    [api, page, search, lesson, reviewStatus],
  );
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        load(controller.signal).catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        }),
      180,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load]);
  const openEditor = (q?: any, duplicate = false) => {
    const draft = q
      ? JSON.parse(JSON.stringify(q))
      : {
          lessonId: lessons[0]?.id || '',
          difficulty: 'BEGINNER',
          promptEn: '',
          promptAr: '',
          explanationEn: '',
          explanationAr: '',
          ...defaults('MCQ'),
        };
    if (duplicate) {
      delete draft.id;
      delete draft.concept;
    }
    setEditor(draft);
    setAnswerJson(JSON.stringify(draft.answer, null, 2));
    setDataJson(JSON.stringify(draft.data, null, 2));
    setFormError('');
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const answer = JSON.parse(answerJson),
        data = JSON.parse(dataJson);
      await api(`admin/questions${editor.id ? `/${editor.id}` : ''}`, {
        method: editor.id ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...editor, answer, data }),
      });
      setEditor(null);
      await load();
      onChange();
      notify(
        t(
          'Draft saved. A separate human review is required.',
          'حُفظت المسودة. يلزم قرار مراجعة بشرية منفصل.',
        ),
      );
    } catch (e) {
      setFormError(
        e instanceof SyntaxError
          ? t(
              'The answer or metadata JSON is invalid. Check quotes and commas.',
              'JSON الإجابة أو البيانات غير صالح. راجع علامات الاقتباس والفواصل.',
            )
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  };
  const decide = async (decision: string) => {
    setBusy(true);
    try {
      await api(`admin/review/${review.id}`, {
        method: 'POST',
        body: JSON.stringify({ type: 'QUESTION', decision, notes, humanReviewed: human }),
      });
      setReview(null);
      await load();
      onChange();
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel admin-table">
      <div className="admin-table-top">
        <div>
          <h2>{t('Question review & editing', 'مراجعة الأسئلة وتحريرها')}</h2>
          <p className="muted">
            {t(
              'All 12 formats. Assessed items are immutable: create a new version instead.',
              'الصيغ الاثنتا عشرة. لا تُغيّر الأسئلة ذات سجل التقييم؛ أنشئ نسخة جديدة.',
            )}
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus size={15} />
          {t('Draft a question', 'صغ سؤالًا')}
        </Button>
      </div>
      <div className="admin-question-filters">
        <Field label={t('Search prompt or ID', 'ابحث بالنص أو المعرّف')}>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label={t('Lesson', 'الدرس')}>
          <select
            value={lesson}
            onChange={(e) => {
              setLesson(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('All lessons', 'كل الدروس')}</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {tr(l)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('Review status', 'حالة المراجعة')}>
          <select
            value={reviewStatus}
            onChange={(e) => {
              setReviewStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">{t('All statuses', 'كل الحالات')}</option>
            <option value="PENDING">{t('Pending review', 'بانتظار المراجعة')}</option>
            <option value="APPROVED">{t('Approved', 'معتمد')}</option>
            <option value="REJECTED">{t('Needs revision', 'يحتاج مراجعة')}</option>
          </select>
        </Field>
      </div>
      {error && <Banner tone="warning">{error}</Banner>}
      {!queue ? (
        <Loading small />
      ) : (
        <>
          <div className="question-review-queue">
            {queue.items.map((q: any) => (
              <article key={q.id}>
                <div className="button-row">
                  <Pill tone={q.reviewStatus === 'APPROVED' ? 'teal' : 'orange'}>
                    {q.reviewStatus === 'APPROVED'
                      ? t('Approved', 'معتمد')
                      : q.reviewStatus === 'REJECTED'
                        ? t('Needs revision', 'يحتاج مراجعة')
                        : t('Pending', 'قيد المراجعة')}
                  </Pill>
                  <span className="muted">
                    {t(...labels[q.type])} · {q.id}
                  </span>
                </div>
                <h3>{tr(q, 'prompt')}</h3>
                <p>{tr(q, 'explanation')}</p>
                <div className="button-row">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReview(q);
                      setNotes('');
                      setHuman(false);
                    }}
                  >
                    <ClipboardCheck size={15} />
                    {t('Review & decide', 'راجع وقرر')}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={q._count.studentAnswers > 0 || q._count.examQuestions > 0}
                    onClick={() => openEditor(q)}
                  >
                    <Edit3 size={14} />
                    {t('Edit', 'تحرير')}
                  </Button>
                  <Button variant="ghost" onClick={() => openEditor(q, true)}>
                    <Copy size={14} />
                    {t('New version', 'نسخة جديدة')}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!queue.total && (
            <p className="muted">
              {t('No questions match these filters.', 'لا أسئلة تطابق عوامل التصفية.')}
            </p>
          )}
          <div className="admin-pagination">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ArrowLeft size={15} />
              {t('Previous', 'السابق')}
            </Button>
            <span>
              {page} / {Math.max(1, queue.pages)} · {queue.total} {t('items', 'سؤالًا')}
            </span>
            <Button
              variant="secondary"
              disabled={page >= queue.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('Next', 'التالي')}
              <ArrowRight size={15} />
            </Button>
          </div>
        </>
      )}
      {editor && (
        <Modal
          wide
          title={t('Bilingual question editor', 'محرر الأسئلة ثنائي اللغة')}
          onClose={() => {
            if (!busy) setEditor(null);
          }}
        >
          <form onSubmit={save}>
            <Banner tone="warning">
              {t(
                'Save creates a draft. Editing an existing item also returns its lesson to draft for review. Never change the meaning of an assessed item.',
                'ينشئ الحفظ مسودة. يعيد تعديل سؤال موجود درسه إلى المسودة للمراجعة. لا تغيّر معنى سؤال سبق تقييمه.',
              )}
            </Banner>
            <div className="form-grid">
              <Field label={t('Lesson', 'الدرس')}>
                <select
                  disabled={!!editor.id}
                  value={editor.lessonId}
                  onChange={(e) => setEditor((v: any) => ({ ...v, lessonId: e.target.value }))}
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {tr(l)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('Format', 'الصيغة')}>
                <select
                  value={editor.type}
                  onChange={(e) => {
                    const next = defaults(e.target.value);
                    setEditor((v: any) => ({ ...v, ...next }));
                    setAnswerJson(JSON.stringify(next.answer, null, 2));
                    setDataJson(JSON.stringify(next.data, null, 2));
                  }}
                >
                  {questionTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(...labels[type])}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('Difficulty', 'الصعوبة')}>
                <select
                  value={editor.difficulty}
                  onChange={(e) => setEditor((v: any) => ({ ...v, difficulty: e.target.value }))}
                >
                  <option value="BEGINNER">{t('Beginner', 'مبتدئ')}</option>
                  <option value="INTERMEDIATE">{t('Intermediate', 'متوسط')}</option>
                  <option value="ADVANCED">{t('Advanced', 'متقدم')}</option>
                </select>
              </Field>
              <Field
                label={t(
                  'Concept key (optional, stable across variants)',
                  'مفتاح المفهوم (اختياري وثابت بين الصيغ)',
                )}
              >
                <input
                  value={editor.concept || ''}
                  maxLength={160}
                  pattern="[A-Za-z0-9_-]+"
                  onChange={(e) =>
                    setEditor((v: any) => ({ ...v, concept: e.target.value || undefined }))
                  }
                />
              </Field>
              {[
                ['promptEn', 'English question'],
                ['promptAr', 'السؤال العربي'],
                ['explanationEn', 'English explanation'],
                ['explanationAr', 'التفسير العربي'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <textarea
                    rows={4}
                    minLength={10}
                    required
                    value={editor[key]}
                    dir={key.endsWith('Ar') ? 'rtl' : 'ltr'}
                    onChange={(e) => setEditor((v: any) => ({ ...v, [key]: e.target.value }))}
                  />
                </Field>
              ))}
            </div>
            {editor.options.length > 0 && (
              <h3>
                {t(
                  'Options — IDs are used in the answer key below',
                  'الخيارات — تستخدم المعرّفات في مفتاح الإجابة أدناه',
                )}
              </h3>
            )}
            {editor.options.map((o: any, i: number) => (
              <div className="editor-option" key={o.id}>
                <code dir="ltr">{o.id}</code>
                <div className="form-grid">
                  {['textEn', 'textAr'].map((key) => (
                    <Field
                      key={key}
                      label={key === 'textEn' ? `Option ${i + 1}` : `الخيار ${i + 1}`}
                    >
                      <textarea
                        rows={2}
                        required
                        value={o[key]}
                        dir={key === 'textAr' ? 'rtl' : 'ltr'}
                        onChange={(e) =>
                          setEditor((v: any) => ({
                            ...v,
                            options: v.options.map((x: any, j: number) =>
                              j === i ? { ...x, [key]: e.target.value } : x,
                            ),
                          }))
                        }
                      />
                    </Field>
                  ))}
                </div>
              </div>
            ))}
            <div className="form-grid">
              <Field label={t('Answer key (validated JSON)', 'مفتاح الإجابة (JSON متحقق)')}>
                <textarea
                  className="code-editor"
                  dir="ltr"
                  rows={9}
                  required
                  value={answerJson}
                  onChange={(e) => setAnswerJson(e.target.value)}
                />
              </Field>
              <Field
                label={t(
                  'Rows, chart or image metadata (JSON)',
                  'صفوف المطابقة أو الرسم أو الصورة (JSON)',
                )}
              >
                <textarea
                  className="code-editor"
                  dir="ltr"
                  rows={9}
                  required
                  value={dataJson}
                  onChange={(e) => setDataJson(e.target.value)}
                />
              </Field>
            </div>
            <p className="muted">
              {t(
                'Numeric keys use correct and tolerance in the prompt’s units. Text keys accept English/Arabic synonyms. Matching keys map each row ID to an option ID. Image metadata must include local path, bilingual alt, credit, and HTTPS source.',
                'يستخدم المفتاح العددي correct وtolerance بوحدات السؤال. يقبل النص مرادفات عربية وإنجليزية. تربط المطابقة معرّف كل صف بمعرّف خيار. تتطلب الصورة مسارًا محليًا ونصًا بديلًا باللغتين وحقوقًا ومصدر HTTPS.',
              )}
            </p>
            {formError && <Banner tone="warning">{formError}</Banner>}
            <Button type="submit" loading={busy}>
              {t('Save draft for review', 'احفظ المسودة للمراجعة')}
            </Button>
          </form>
        </Modal>
      )}
      {review && (
        <Modal
          wide
          title={t('Scientific and bilingual review', 'المراجعة العلمية واللغوية')}
          onClose={() => {
            if (!busy) setReview(null);
          }}
        >
          <div className="form-grid">
            <section lang="en" dir="ltr">
              <h3>{review.promptEn}</h3>
              <Markdown text={review.explanationEn} />
              {review.options.map((o: any) => (
                <p key={o.id}>
                  <code>{o.id}</code> — {o.textEn}
                </p>
              ))}
            </section>
            <section lang="ar" dir="rtl">
              <h3>{review.promptAr}</h3>
              <Markdown text={review.explanationAr} />
              {review.options.map((o: any) => (
                <p key={o.id}>
                  <code dir="ltr">{o.id}</code> — {o.textAr}
                </p>
              ))}
            </section>
          </div>
          <details className="editor-section">
            <summary>
              {t(
                'Answer key and media / diagram metadata',
                'مفتاح الإجابة وبيانات الصورة أو الرسم',
              )}
            </summary>
            <pre dir="ltr" className="json-preview">
              {JSON.stringify({ answer: review.answer, data: review.data }, null, 2)}
            </pre>
          </details>
          <Field label={t('Review notes', 'ملاحظات المراجعة')}>
            <textarea
              rows={3}
              minLength={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <label className="checkbox-field">
            <input type="checkbox" checked={human} onChange={(e) => setHuman(e.target.checked)} />
            {t(
              'I personally checked both languages, answer key, units, explanations, and scientific sources.',
              'راجعت شخصيًا اللغتين ومفتاح الإجابة والوحدات والتفسيرات والمصادر العلمية.',
            )}
          </label>
          <div className="button-row">
            <Button
              disabled={!human || notes.length < 5}
              loading={busy}
              onClick={() => decide('APPROVE')}
            >
              <Check size={15} />
              {t('Approve & publish', 'اعتمد وانشر')}
            </Button>
            <Button
              variant="secondary"
              disabled={notes.length < 5 || busy}
              onClick={() => decide('REJECT')}
            >
              {t('Return for revision', 'أعد للمراجعة')}
            </Button>
            <Button
              variant="ghost"
              disabled={notes.length < 5 || busy}
              onClick={() => decide('UNPUBLISH')}
            >
              {t('Unpublish', 'إلغاء النشر')}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
