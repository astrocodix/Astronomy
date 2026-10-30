'use client';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Target,
  Users,
  Settings,
  Plus,
  Search,
  Check,
  CheckCircle2,
  X,
  Edit3,
  ExternalLink,
  Upload,
  FileText,
  Layers,
  Lock,
  Sparkles,
  Save,
  ClipboardCheck,
} from 'lucide-react';
import { useApp } from './context';
import { QuestionStudio } from './admin-questions';
import { MediaEditor } from './admin-media';
import {
  PageHeader,
  Button,
  Arrow,
  Pill,
  Loading,
  EmptyState,
  Field,
  Modal,
  Banner,
  SectionHeading,
} from './ui';
export function AdminStudio() {
  const { data, t, tr, api, refresh, notify } = useApp();
  const [studio, setStudio] = useState<any>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('lessons');
  const [q, setQ] = useState('');
  const [editor, setEditor] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [human, setHuman] = useState(false);
  const [creating, setCreating] = useState('');
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [structure, setStructure] = useState<any>(null);
  const load = async () => {
    try {
      const s = await api('admin');
      setStudio(s);
      setConfig(s.settings);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    if (data && ['ADMIN', 'INSTRUCTOR'].includes(data.user.role)) load();
  }, [api, data?.user.role]);
  if (!data) return null;
  const isStaff = ['ADMIN', 'INSTRUCTOR'].includes(data.user.role);
  if (!isStaff)
    return (
      <div className="page-enter">
        <PageHeader
          eyebrow={t('THE INSTRUCTOR’S WORKSPACE', 'مساحة عمل المدرّس')}
          title={t('Good content starts with good review.', 'يبدأ المحتوى الجيد بمراجعة جيدة.')}
        />
        <div className="panel">
          <EmptyState
            icon={ShieldCheck}
            title={t('A protected space for educators.', 'مساحة محمية للمعلمين.')}
            description={t(
              'The content studio requires an instructor or administrator account. Student progress and published content cannot be edited by a guest.',
              'يتطلب الاستوديو حساب مدرّس أو مسؤول. لا يستطيع الزائر تعديل تقدم الطلاب أو المحتوى المنشور.',
            )}
            action={
              <Button href="/login">
                <Lock size={16} />
                {t('Sign in as an educator', 'سجّل الدخول كمعلم')}
              </Button>
            }
          />
        </div>
      </div>
    );
  if (error)
    return (
      <EmptyState
        title={t('The studio could not be loaded', 'تعذر تحميل الاستوديو')}
        description={error}
        action={<Button onClick={load}>{t('Retry', 'أعد المحاولة')}</Button>}
      />
    );
  if (!studio) return <Loading />;
  const mutate = async (path: string, method: string, payload: any, after?: () => void) => {
    setBusy(true);
    try {
      const result = await api(path, { method, body: JSON.stringify(payload) });
      await load();
      await refresh();
      notify(t('Changes saved to the academy.', 'حُفظت التغييرات في الأكاديمية.'));
      after?.();
      return result;
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const doReview = async (decision: string) => {
    if (
      await mutate(`admin/review/${review.id}`, 'POST', {
        type: review.type,
        decision,
        notes,
        humanReviewed: human,
      })
    )
      setReview(null);
  };
  const openReview = (id: string, type: string) => {
    setReview({ id, type });
    setNotes('');
    setHuman(false);
  };
  return (
    <div className="admin-page page-enter">
      <PageHeader
        eyebrow={t('EDITORIAL CARE. SCIENTIFIC INTEGRITY.', 'عناية تحريرية ونزاهة علمية.')}
        title={t('The content studio.', 'استوديو المحتوى.')}
        description={t(
          'Create carefully. Review independently. Publish with confidence.',
          'ألّف بعناية وراجع باستقلالية وانشر بثقة.',
        )}
        action={
          <Pill tone="purple" icon={<ShieldCheck size={13} />}>
            {data.user.role}
          </Pill>
        }
      />
      <div className="admin-metrics">
        {[
          [BookOpen, studio.lessons.length, t('authored lessons', 'دروس مؤلفة')],
          [Target, studio.stats.questions, t('assessment items', 'أسئلة تقييم')],
          [Users, studio.stats.learners, t('registered learners', 'متعلمون مسجلون')],
          [ClipboardCheck, studio.stats.exams, t('submitted exams', 'اختبارات مسلمة')],
        ].map(([Icon, value, label]: any, i) => (
          <div className="panel" key={i}>
            <Icon size={21} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <Banner>
        {t(
          'Pilot seed content is available for evaluation only. Publishing through this studio requires an explicit human review, a bilingual lesson, objectives, references, images, and at least 20 questions.',
          'المحتوى الأولي التجريبي متاح للتقييم فقط. يتطلب النشر مراجعة بشرية صريحة ودرسًا ثنائي اللغة وأهدافًا ومراجع وصورًا و20 سؤالًا على الأقل.',
        )}
      </Banner>
      <div className="admin-tabs filter-tabs">
        {[
          ['lessons', 'Lessons & translations', 'الدروس والترجمات'],
          ['questions', 'Question review', 'مراجعة الأسئلة'],
          ['users', 'Learners', 'المتعلمون'],
          ['structure', 'Curriculum', 'المنهج'],
          ['sources', 'References & media', 'المراجع والوسائط'],
          ['config', 'Academy settings', 'إعدادات الأكاديمية'],
        ].map(([key, en, ar]) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? 'active' : ''}>
            {t(en, ar)}
          </button>
        ))}
      </div>
      {tab === 'lessons' && (
        <section className="panel admin-table">
          <div className="admin-table-top">
            <label className="search-box">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('Find a lesson…', 'ابحث عن درس…')}
              />
            </label>
            <Button onClick={() => setCreating('lesson')}>
              <Plus size={15} />
              {t('New draft lesson', 'مسودة درس جديد')}
            </Button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t('Lesson', 'الدرس')}</th>
                  <th>{t('Module', 'الوحدة')}</th>
                  <th>{t('Questions', 'الأسئلة')}</th>
                  <th>{t('Publication / review', 'النشر والمراجعة')}</th>
                  <th>{t('Actions', 'الإجراءات')}</th>
                </tr>
              </thead>
              <tbody>
                {studio.lessons
                  .filter((l: any) =>
                    `${l.titleEn} ${l.titleAr}`.toLowerCase().includes(q.toLowerCase()),
                  )
                  .map((l: any) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{tr(l)}</strong>
                        <small>{l.id}</small>
                      </td>
                      <td>{tr(l.module)}</td>
                      <td>{l._count.questions}</td>
                      <td>
                        <Pill tone={l.reviewStatus === 'APPROVED' ? 'teal' : 'orange'}>
                          {l.status} · {l.reviewStatus}
                        </Pill>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-btn"
                            onClick={() => setEditor(JSON.parse(JSON.stringify(l)))}
                            aria-label={t('Edit lesson', 'تعديل الدرس')}
                          >
                            <Edit3 size={16} />
                          </button>
                          <Button variant="ghost" onClick={() => openReview(l.id, 'LESSON')}>
                            {t('Review', 'مراجعة')}
                            <CheckCircle2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === 'questions' && (
        <QuestionStudio
          lessons={studio.lessons}
          onChange={() => {
            load();
            refresh();
          }}
        />
      )}
      {tab === 'users' && (
        <section className="panel admin-table">
          <div className="admin-table-top">
            <h2>{t('Real learners. Real progress.', 'متعلمون حقيقيون وتقدم حقيقي.')}</h2>
            <Pill>
              {studio.stats.guests} {t('guest sessions', 'جلسات زائر')}
            </Pill>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t('Learner', 'المتعلم')}</th>
                  <th>{t('Role', 'الدور')}</th>
                  <th>{t('Opened lessons', 'دروس مفتوحة')}</th>
                  <th>{t('Exam attempts', 'محاولات اختبار')}</th>
                </tr>
              </thead>
              <tbody>
                {studio.users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.profile?.name}</strong>
                      <small>{u.email}</small>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        disabled={studio.role !== 'ADMIN' || u.id === data.user.id}
                        aria-label={t('User role', 'دور المستخدم')}
                        onChange={(e) =>
                          mutate(`admin/users/${u.id}`, 'PATCH', { role: e.target.value })
                        }
                      >
                        {['STUDENT', 'INSTRUCTOR', 'ADMIN'].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td>{u._count.lessons}</td>
                    <td>{u._count.examAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === 'structure' && (
        <section className="panel admin-structure">
          <div className="section-heading">
            <div>
              <h2>{t('A curriculum built to grow', 'منهج قابل للنمو')}</h2>
              <p>
                {t(
                  'Planned stages are not presented as complete learning content.',
                  'لا تُعرض المراحل المخططة كمحتوى مكتمل.',
                )}
              </p>
            </div>
            {studio.role === 'ADMIN' && (
              <Button onClick={() => setCreating('structure')}>
                <Plus size={15} />
                {t('Add stage or module', 'إضافة مرحلة أو وحدة')}
              </Button>
            )}
          </div>
          {data.stages.map((s) => (
            <details key={s.id} className="admin-structure-stage">
              <summary>
                <span>{String(s.order).padStart(2, '0')}</span>
                <strong>{tr(s)}</strong>
                <Pill>
                  {s.modules.length} {t('modules', 'وحدات')}
                </Pill>
              </summary>
              <Button
                variant="ghost"
                onClick={() => setStructure({ ...s, type: 'STAGE' })}
                disabled={studio.role !== 'ADMIN'}
              >
                <Edit3 size={14} />
                {t('Edit stage title & order', 'عدّل عنوان المرحلة وترتيبها')}
              </Button>
              {s.modules.map((m) => (
                <div className="structure-module" key={m.id}>
                  <span>
                    {m.order}. {tr(m)}
                  </span>
                  <button
                    className="icon-btn"
                    disabled={studio.role !== 'ADMIN'}
                    onClick={() => setStructure({ ...m, type: 'MODULE' })}
                    aria-label={t('Edit module', 'تعديل الوحدة')}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              ))}
            </details>
          ))}
        </section>
      )}
      {tab === 'sources' && (
        <div className="admin-source-layout">
          <section className="panel admin-references">
            <div className="section-heading">
              <h2>{t('Scientific references', 'المراجع العلمية')}</h2>
              <Button variant="secondary" onClick={() => setCreating('reference')}>
                <Plus size={14} />
                {t('Add reference', 'أضف مرجعًا')}
              </Button>
            </div>
            {studio.references.map((r: any) => (
              <a href={r.url} key={r.id} target="_blank" rel="noreferrer">
                <BookOpen size={17} />
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.publisher}</small>
                </span>
                <ExternalLink size={14} />
              </a>
            ))}
          </section>
          <section className="panel admin-upload">
            <h2>
              <Upload size={20} />
              {t('Upload a scientific image', 'رفع صورة علمية')}
            </h2>
            <p>
              {t(
                'Images are re-encoded and limited to 5 MB. Every image needs bilingual captions, credit, and a source.',
                'تُعاد معالجة الصور وتُحد بـ5 ميغابايت. يلزم وصف باللغتين وحقوق ومصدر.',
              )}
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const form = e.currentTarget;
                try {
                  await api('admin/image', { method: 'POST', body: new FormData(form) });
                  notify(
                    t(
                      'Image uploaded and associated with the lesson.',
                      'رُفعت الصورة وربطت بالدرس.',
                    ),
                  );
                  form.reset();
                  load();
                } catch (e) {
                  notify((e as Error).message, 'error');
                }
                setBusy(false);
              }}
            >
              <Field label={t('Lesson', 'الدرس')}>
                <select name="lessonId">
                  {studio.lessons.map((l: any) => (
                    <option value={l.id} key={l.id}>
                      {tr(l)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('Image file', 'ملف الصورة')}>
                <input type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
              </Field>
              <div className="form-grid">
                <Field label="English title">
                  <input name="titleEn" minLength={3} required />
                </Field>
                <Field label="العنوان العربي">
                  <input name="titleAr" minLength={3} dir="rtl" required />
                </Field>
                <Field label="English caption">
                  <textarea name="captionEn" minLength={15} required />
                </Field>
                <Field label="الوصف العربي">
                  <textarea name="captionAr" minLength={15} dir="rtl" required />
                </Field>
                <Field label="English alternative text">
                  <input name="altEn" minLength={5} required />
                </Field>
                <Field label="النص البديل العربي">
                  <input name="altAr" minLength={5} required dir="rtl" />
                </Field>
              </div>
              <Field label={t('Credit', 'حقوق الصورة')}>
                <input name="credit" minLength={3} required />
              </Field>
              <Field label={t('Source URL (HTTPS)', 'رابط المصدر HTTPS')}>
                <input name="sourceUrl" type="url" required />
              </Field>
              <Field label={t('Scientific image type', 'نوع الصورة العلمي')}>
                <select name="kind">
                  <option value="OBSERVATION">{t('Real observation', 'رصد حقيقي')}</option>
                  <option value="ILLUSTRATION">
                    {t('Clearly labeled illustration', 'رسم توضيحي موسوم بوضوح')}
                  </option>
                </select>
              </Field>
              <Button type="submit" loading={busy}>
                <Upload size={15} />
                {t('Upload & associate', 'ارفع واربط')}
              </Button>
            </form>
          </section>
        </div>
      )}
      {tab === 'sources' && (
        <MediaEditor
          lessons={studio.lessons}
          references={studio.references}
          onChange={() => {
            load();
            refresh();
          }}
        />
      )}
      {tab === 'config' && (
        <section className="panel admin-config">
          <div className="section-heading">
            <h2>{t('Academy controls', 'ضوابط الأكاديمية')}</h2>
            <Pill tone="purple">{t('Administrator only', 'للمسؤول فقط')}</Pill>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate('admin/settings', 'PATCH', config);
            }}
          >
            <div className="form-grid">
              <Field label={t('Passing score (%)', 'درجة النجاح (%)')}>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={config.passingScore}
                  disabled={studio.role !== 'ADMIN'}
                  onChange={(e) => setConfig((c: any) => ({ ...c, passingScore: +e.target.value }))}
                />
              </Field>
              <Field label={t('Daily AI messages per user', 'رسائل AI اليومية لكل مستخدم')}>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={config.aiDailyLimit}
                  disabled={studio.role !== 'ADMIN'}
                  onChange={(e) => setConfig((c: any) => ({ ...c, aiDailyLimit: +e.target.value }))}
                />
              </Field>
              <Field label={t('Server-side AI model', 'نموذج AI على الخادم')}>
                <input
                  value={config.aiModel}
                  disabled={studio.role !== 'ADMIN'}
                  onChange={(e) => setConfig((c: any) => ({ ...c, aiModel: e.target.value }))}
                />
              </Field>
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={config.enforcePrerequisites}
                disabled={studio.role !== 'ADMIN'}
                onChange={(e) =>
                  setConfig((c: any) => ({ ...c, enforcePrerequisites: e.target.checked }))
                }
              />
              <span>
                {t(
                  'Enforce lesson, module, and stage prerequisites on the server',
                  'فرض متطلبات الدرس والوحدة والمرحلة على الخادم',
                )}
              </span>
            </label>
            <Banner>
              {t(
                'API keys and provider URLs are configured only in server environment variables. Never paste a secret into a model name or lesson. Passing-score changes apply to new examinations; existing attempts retain their original threshold.',
                'تُهيأ المفاتيح وروابط المزود في متغيرات الخادم فقط. لا تلصق سرًا في اسم نموذج أو درس. تسري درجة النجاح الجديدة على الاختبارات الجديدة وتحفظ المحاولات القائمة حدها الأصلي.',
              )}
            </Banner>
            <Button type="submit" disabled={studio.role !== 'ADMIN'} loading={busy}>
              <Save size={16} />
              {t('Save configuration', 'احفظ الإعدادات')}
            </Button>
          </form>
          <h3>{t('AI usage ledger', 'سجل استخدام AI')}</h3>
          {studio.usage.length ? (
            <div className="usage-ledger">
              {studio.usage.map((u: any) => (
                <div key={u.status}>
                  <Pill>{u.status}</Pill>
                  <span>
                    {u._count} {t('requests', 'طلبات')}
                  </span>
                  <span>{u._sum.tokens || 0} tokens</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">
              {t(
                'No provider requests have been made. Reference mode does not use the LLM.',
                'لم تُرسل طلبات للمزود. لا يستخدم وضع المراجع نموذج لغة.',
              )}
            </p>
          )}
        </section>
      )}
      {editor && (
        <Modal
          title={t('Bilingual lesson editor', 'محرر الدروس ثنائي اللغة')}
          onClose={() => setEditor(null)}
          wide
        >
          <form
            className="lesson-editor"
            onSubmit={(e) => {
              e.preventDefault();
              mutate(`admin/lessons/${editor.id}`, 'PATCH', editor, () => setEditor(null));
            }}
          >
            <Banner tone="warning">
              {t(
                'Saving changes returns this lesson to draft and requires a new editorial approval.',
                'يعيد الحفظ الدرس إلى المسودة ويتطلب اعتمادًا تحريريًا جديدًا.',
              )}
            </Banner>
            <div className="form-grid">
              {[
                ['titleEn', 'English title'],
                ['titleAr', 'العنوان العربي'],
                ['summaryEn', 'English summary'],
                ['summaryAr', 'الملخص العربي'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    required
                    minLength={key.includes('summary') ? 10 : 3}
                    value={editor[key]}
                    onChange={(e) => setEditor((v: any) => ({ ...v, [key]: e.target.value }))}
                    dir={key.endsWith('Ar') ? 'rtl' : 'ltr'}
                  />
                </Field>
              ))}
              <Field
                label={t(
                  'Learning time: reading + activities (minutes)',
                  'زمن التعلم: قراءة وأنشطة (دقائق)',
                )}
              >
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={editor.duration}
                  onChange={(e) => setEditor((v: any) => ({ ...v, duration: +e.target.value }))}
                />
              </Field>
            </div>
            <h3>{t('Learning objectives', 'أهداف التعلم')}</h3>
            {(editor.objectives?.length
              ? editor.objectives
              : [
                  { en: '', ar: '' },
                  { en: '', ar: '' },
                ]
            ).map((o: any, i: number) => (
              <div className="form-grid" key={i}>
                {['en', 'ar'].map((k) => (
                  <Field label={k === 'en' ? `Objective ${i + 1}` : `الهدف ${i + 1}`} key={k}>
                    <input
                      minLength={5}
                      required
                      value={o[k]}
                      dir={k === 'ar' ? 'rtl' : 'ltr'}
                      onChange={(e) =>
                        setEditor((v: any) => {
                          const arr = v.objectives.length
                            ? [...v.objectives]
                            : [
                                { en: '', ar: '' },
                                { en: '', ar: '' },
                              ];
                          arr[i] = { ...arr[i], [k]: e.target.value };
                          return { ...v, objectives: arr };
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
            ))}
            <h3>{t('Lesson sections', 'أقسام الدرس')}</h3>
            {editor.sections.map((s: any, i: number) => (
              <details className="editor-section" key={i} open={i === 0}>
                <summary>
                  {i + 1}. {s.titleEn} / {s.titleAr}
                </summary>
                <div className="form-grid">
                  {['titleEn', 'titleAr', 'contentEn', 'contentAr'].map((k) => (
                    <Field key={k} label={k}>
                      <textarea
                        rows={k.startsWith('content') ? 7 : 1}
                        minLength={k.startsWith('content') ? 20 : 1}
                        required
                        value={s[k]}
                        dir={k.endsWith('Ar') ? 'rtl' : 'ltr'}
                        onChange={(e) =>
                          setEditor((v: any) => ({
                            ...v,
                            sections: v.sections.map((x: any, j: number) =>
                              j === i ? { ...x, [k]: e.target.value } : x,
                            ),
                          }))
                        }
                      />
                    </Field>
                  ))}
                </div>
              </details>
            ))}
            <Button
              variant="secondary"
              onClick={() =>
                setEditor((v: any) => ({
                  ...v,
                  sections: [
                    ...v.sections,
                    {
                      order: v.sections.length,
                      type: 'CORE',
                      titleEn: '',
                      titleAr: '',
                      contentEn: '',
                      contentAr: '',
                    },
                  ],
                }))
              }
            >
              <Plus size={14} />
              {t('Add section', 'أضف قسمًا')}
            </Button>
            <div className="modal-sticky-footer">
              <Button type="submit" loading={busy}>
                <Save size={15} />
                {t('Save bilingual draft', 'احفظ المسودة الثنائية')}
              </Button>
              <Button variant="secondary" onClick={() => setEditor(null)}>
                {t('Cancel', 'إلغاء')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {review && (
        <Modal
          title={t('Scientific & translation review', 'المراجعة العلمية واللغوية')}
          onClose={() => setReview(null)}
        >
          <p>
            {t(
              'Check explanations, numerical values, units, both translations, and source attribution. A record of this decision is saved to the audit trail.',
              'افحص الشرح والأرقام والوحدات والترجمتين والمصادر. تُحفظ هذه المراجعة في سجل التدقيق.',
            )}
          </p>
          <Field label={t('Review notes', 'ملاحظات المراجعة')}>
            <textarea
              value={notes}
              minLength={5}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={t(
                'Document your review and any changes required…',
                'وثّق مراجعتك والتغييرات المطلوبة…',
              )}
            />
          </Field>
          <label className="checkbox-field">
            <input type="checkbox" checked={human} onChange={(e) => setHuman(e.target.checked)} />
            {t(
              'I have personally reviewed this content for scientific and bilingual accuracy.',
              'راجعت هذا المحتوى شخصيًا للتحقق من الدقة العلمية واللغوية.',
            )}
          </label>
          <div className="button-row">
            <Button
              disabled={!human || notes.length < 5}
              loading={busy}
              onClick={() => doReview('APPROVE')}
            >
              <Check size={15} />
              {t('Approve & publish', 'اعتمد وانشر')}
            </Button>
            <Button
              variant="secondary"
              disabled={notes.length < 5 || busy}
              onClick={() => doReview('REJECT')}
            >
              {t('Return to draft', 'أعد إلى المسودة')}
            </Button>
            <Button
              variant="ghost"
              disabled={notes.length < 5 || busy}
              onClick={() => doReview('UNPUBLISH')}
            >
              {t('Unpublish', 'إلغاء النشر')}
            </Button>
          </div>
        </Modal>
      )}
      {creating && (
        <Modal
          title={t(
            creating === 'lesson'
              ? 'Create a lesson draft'
              : creating === 'reference'
                ? 'Add a scientific reference'
                : 'Expand the curriculum',
            creating === 'lesson'
              ? 'أنشئ مسودة درس'
              : creating === 'reference'
                ? 'أضف مرجعًا علميًا'
                : 'وسّع المنهج',
          )}
          onClose={() => setCreating('')}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const v = Object.fromEntries(fd.entries()) as any;
              if (creating === 'structure') v.order = Number(v.order);
              const r = await mutate(
                `admin/${creating === 'lesson' ? 'lessons' : creating === 'reference' ? 'references' : 'structure'}`,
                'POST',
                v,
              );
              if (r) setCreating('');
            }}
          >
            {creating === 'reference' ? (
              <>
                <Field label={t('Title', 'العنوان')}>
                  <input name="title" minLength={3} required />
                </Field>
                <Field label={t('Publisher', 'الناشر')}>
                  <input name="publisher" minLength={2} required />
                </Field>
                <Field label="HTTPS URL">
                  <input name="url" type="url" required />
                </Field>
                <Field label={t('Associate with lesson', 'اربط بالدرس')}>
                  <select name="lessonId">
                    {studio.lessons.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {tr(l)}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="English title">
                  <input name="titleEn" minLength={3} required />
                </Field>
                <Field label="العنوان العربي">
                  <input name="titleAr" minLength={3} required dir="rtl" />
                </Field>
                {creating === 'lesson' ? (
                  <>
                    <Field label={t('Parent module', 'الوحدة الأصل')}>
                      <select name="moduleId">
                        {data.stages
                          .flatMap((s) => s.modules)
                          .map((m) => (
                            <option value={m.id} key={m.id}>
                              {tr(m)}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label="English summary">
                      <textarea name="summaryEn" required minLength={10} />
                    </Field>
                    <Field label="الملخص العربي">
                      <textarea name="summaryAr" required minLength={10} dir="rtl" />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label={t('Type', 'النوع')}>
                      <select name="type">
                        <option value="MODULE">{t('Module', 'وحدة')}</option>
                        <option value="STAGE">{t('Stage', 'مرحلة')}</option>
                      </select>
                    </Field>
                    <Field
                      label={t(
                        'Parent stage (module) or course (stage)',
                        'المرحلة الأصل للوحدة أو الدورة للمرحلة',
                      )}
                    >
                      <select name="parentId">
                        <option value="astronomy">
                          {t('Astronomy course (for a new stage)', 'دورة الفلك لمرحلة جديدة')}
                        </option>
                        {data.stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {tr(s)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('Order (must be unused)', 'الترتيب ويجب أن يكون غير مستخدم')}>
                      <input name="order" type="number" min="1" max="200" required />
                    </Field>
                  </>
                )}
              </>
            )}
            <Button type="submit" loading={busy}>
              <Plus size={15} />
              {t('Create draft', 'أنشئ المسودة')}
            </Button>
          </form>
        </Modal>
      )}
      {structure && (
        <Modal
          title={t('Edit curriculum structure', 'تحرير بنية المنهج')}
          onClose={() => setStructure(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate(
                `admin/structure/${structure.id}`,
                'PATCH',
                {
                  ...structure,
                  status:
                    structure.status ===
                    data.stages.flatMap((s) => [s, ...s.modules]).find((x) => x.id === structure.id)
                      ?.status
                      ? undefined
                      : structure.status,
                },
                () => setStructure(null),
              );
            }}
          >
            {['titleEn', 'titleAr'].map((k) => (
              <Field label={k} key={k}>
                <input
                  value={structure[k]}
                  required
                  minLength={3}
                  onChange={(e) => setStructure((v: any) => ({ ...v, [k]: e.target.value }))}
                />
              </Field>
            ))}
            <Field label={t('Order', 'الترتيب')}>
              <input
                type="number"
                min="1"
                max="200"
                required
                value={structure.order}
                onChange={(e) => setStructure((v: any) => ({ ...v, order: +e.target.value }))}
              />
            </Field>
            <Field label={t('Availability', 'الإتاحة')}>
              <select
                value={structure.status}
                onChange={(e) => setStructure((v: any) => ({ ...v, status: e.target.value }))}
              >
                <option value="PLANNED">{t('Planned / unavailable', 'مخطط / غير متاح')}</option>
                <option value="AVAILABLE">
                  {t('Available (review required)', 'متاح (يتطلب المراجعة)')}
                </option>
              </select>
            </Field>
            <Banner tone="warning">
              {t(
                'Order changes affect prerequisites. Use an unused position and review the roadmap afterward.',
                'تؤثر تغييرات الترتيب في المتطلبات. استخدم موضعًا غير مشغول وراجع المسار بعدها.',
              )}
            </Banner>
            <Button type="submit" loading={busy}>
              {t('Save structure', 'احفظ البنية')}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
