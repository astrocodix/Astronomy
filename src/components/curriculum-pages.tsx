'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Route,
  BookOpen,
  Lock,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
  Orbit,
  Target,
  ArrowUpRight,
  GraduationCap,
  Telescope,
  Layers,
  CheckCircle2,
  Play,
  Map,
} from 'lucide-react';
import { useApp, type Stage, type Module } from './context';
import {
  PageHeader,
  Button,
  Arrow,
  Pill,
  ProgressBar,
  EmptyState,
  SectionHeading,
  Banner,
} from './ui';
import { StageCard } from './dashboard';
export function Roadmap() {
  const { data, t, tr } = useApp();
  const [filter, setFilter] = useState('all');
  if (!data) return null;
  const stages = data.stages.filter(
    (s) =>
      filter === 'all' ||
      (filter === 'available' ? s.status === 'AVAILABLE' : s.status !== 'AVAILABLE'),
  );
  const p = data.progress;
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={t('A BIG PICTURE FOR BIG DREAMS', 'صورة كبيرة لأحلام كبيرة')}
        title={t('Your map to the universe.', 'خريطتك إلى الكون.')}
        description={t(
          'From your first look up to your first research question. Twelve stages, one extraordinary journey.',
          'من نظرتك الأولى إلى السماء إلى سؤالك البحثي الأول. اثنتا عشرة مرحلة ورحلة استثنائية.',
        )}
        action={
          <Button href="/lesson/l-1-1">
            <BookOpen size={16} />
            {t('Start exploring', 'ابدأ الاستكشاف')}
          </Button>
        }
      />
      <div className="roadmap-summary panel">
        <div>
          <Route size={22} />
          <strong>12</strong>
          <span>{t('learning stages', 'مرحلة تعليمية')}</span>
        </div>
        <div>
          <Layers size={22} />
          <strong>{data.counts.modules}</strong>
          <span>{t('mapped modules', 'وحدة في المسار')}</span>
        </div>
        <div>
          <BookOpen size={22} />
          <strong>{data.counts.lessons}</strong>
          <span>{t('pilot lessons', 'درسًا تجريبيًا')}</span>
        </div>
        <div>
          <Target size={22} />
          <strong>{data.counts.questions}</strong>
          <span>{t('practice questions', 'سؤال تدريب')}</span>
        </div>
      </div>
      <div className="filter-tabs">
        {[
          ['all', 'Complete roadmap', 'المسار الكامل'],
          ['available', 'Ready to learn', 'جاهز للتعلم'],
          ['planned', 'On the horizon', 'في الأفق'],
        ].map(([key, en, ar]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={filter === key ? 'active' : ''}
          >
            {t(en, ar)}
            {key === 'available' && <span className="tiny-dot teal" />}
          </button>
        ))}
      </div>
      <div className="roadmap-layout">
        <div className="roadmap-timeline">
          {stages.map((stage) => {
            const completed = p.stages.some((s: any) => s.stageId === stage.id && s.passed);
            const ready = stage.status === 'AVAILABLE';
            return (
              <article className={`roadmap-step ${ready ? 'available' : ''}`} key={stage.id}>
                <div className="roadmap-node">
                  {completed ? <Check size={19} /> : String(stage.order).padStart(2, '0')}
                </div>
                <Link href={`/stages/${stage.id}`} className="roadmap-stage panel">
                  <div className="roadmap-stage-art">
                    <img src={stage.image} alt={tr(stage)} loading="lazy" />
                  </div>
                  <div className="roadmap-stage-info">
                    <div className="roadmap-stage-kicker">
                      <span>
                        {t('STAGE', 'المرحلة')} {String(stage.order).padStart(2, '0')}
                      </span>
                      <Pill
                        tone={ready ? 'teal' : 'muted'}
                        icon={ready ? <span className="tiny-dot" /> : <Lock size={10} />}
                      >
                        {completed
                          ? t('Completed', 'مكتملة')
                          : ready
                            ? t('Pilot available', 'المحتوى التجريبي متاح')
                            : t('In development', 'قيد التطوير')}
                      </Pill>
                    </div>
                    <h2>{tr(stage)}</h2>
                    <p>{tr(stage, 'description')}</p>
                    <div className="roadmap-stage-meta">
                      <span>
                        <Layers size={14} />
                        {stage.modules.length} {t('modules', 'وحدات')}
                      </span>
                      {ready && (
                        <span>
                          <BookOpen size={14} />
                          {stage.modules.flatMap((m) => m.lessons).length} {t('lessons', 'درسًا')}
                        </span>
                      )}
                      <span>
                        {stage.order <= 3
                          ? t('Foundation', 'تأسيسي')
                          : stage.order <= 8
                            ? t('Intermediate', 'متوسط')
                            : t('Advanced', 'متقدم')}
                      </span>
                    </div>
                  </div>
                  <span className="round-arrow">
                    <Arrow size={19} />
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
        <aside className="roadmap-aside">
          <section className="panel roadmap-guide">
            <span className="icon-tile purple">
              <Sparkles size={22} />
            </span>
            <h3>{t('A path, not a race.', 'مسار لا سباق.')}</h3>
            <p>
              {t(
                'Build understanding before moving forward. Complete a lesson quiz, pass a module exam, then take your stage final.',
                'ابنِ فهمك قبل التقدم. أكمل اختبار الدرس ثم اختبار الوحدة فالاختبار النهائي.',
              )}
            </p>
            <div className="guide-step">
              <span>1</span>
              <div>
                <strong>{t('Learn & explore', 'تعلّم واستكشف')}</strong>
                <small>
                  {t('Real explanations. Real observations.', 'شروحات حقيقية وأرصاد موثقة.')}
                </small>
              </div>
            </div>
            <div className="guide-step">
              <span>2</span>
              <div>
                <strong>{t('Check your understanding', 'تحقق من فهمك')}</strong>
                <small>
                  {t(
                    '10, 20, or 30-question lesson tests.',
                    'اختبارات درس من 10 أو 20 أو 30 سؤالًا.',
                  )}
                </small>
              </div>
            </div>
            <div className="guide-step">
              <span>3</span>
              <div>
                <strong>{t('Earn the next step', 'استحق الخطوة التالية')}</strong>
                <small>
                  {data.settings.passingScore}%{' '}
                  {t('passing score. Genuine mastery.', 'درجة النجاح. إتقان حقيقي.')}
                </small>
              </div>
            </div>
            <Link href="/tutor" className="text-link">
              {t('Let Astro guide you', 'دع أسترو يرشدك')}
              <Arrow />
            </Link>
          </section>
          <div className="curriculum-note">
            <BookOpen size={18} />
            <p>
              {t(
                'Stage 1 is a complete pilot. Stages 2–12 are mapped, not yet authored or published. New material follows an editorial review workflow.',
                'المرحلة الأولى برنامج تجريبي كامل. المراحل 2–12 مخططة ولم تُؤلّف أو تُنشر بعد. تخضع المواد الجديدة للمراجعة التحريرية.',
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
export function Courses() {
  const { data, t, tr } = useApp();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  if (!data) return null;
  const selected = data.stages.filter(
    (s) =>
      (tr(s).toLowerCase().includes(q.toLowerCase()) ||
        s.modules.some((m) => tr(m).toLowerCase().includes(q.toLowerCase()))) &&
      (filter === 'all' || s.status === 'AVAILABLE'),
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow={t('THE COMPLETE ASTRONOMY JOURNEY', 'رحلة علم الفلك الكاملة')}
        title={t('Curiosity is a great beginning.', 'الفضول بداية رائعة.')}
        description={t(
          'One connected course, organized into twelve progressive learning stages.',
          'دورة مترابطة واحدة منظمة في اثنتي عشرة مرحلة متدرجة.',
        )}
      />
      <div className="course-collection-banner">
        <div>
          <Pill tone="purple">{t('YOUR PERSONAL ACADEMY', 'أكاديميتك الشخصية')}</Pill>
          <h2>{t('Learn the Universe.\nUnderstand Everything.', 'تعلّم الكون.\nوافهم كل شيء.')}</h2>
          <p>
            {t(
              'A structured path from absolute beginner to research-ready thinking.',
              'مسار من المبتدئ تمامًا إلى التفكير المؤهل للبحث.',
            )}
          </p>
        </div>
        <div className="collection-orbits" aria-hidden="true">
          <Orbit size={180} strokeWidth={0.55} />
          <Sparkles size={38} />
        </div>
      </div>
      <div className="collection-controls">
        <div className="filter-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            {t('All stages', 'كل المراحل')}
            <span>12</span>
          </button>
          <button
            className={filter === 'available' ? 'active' : ''}
            onClick={() => setFilter('available')}
          >
            {t('Available now', 'المتاح الآن')}
            <span>1</span>
          </button>
        </div>
        <label className="search-box">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('Find your next discovery…', 'اعثر على اكتشافك التالي…')}
            aria-label={t('Search courses', 'البحث في الدورات')}
          />
        </label>
      </div>
      <div className="courses-grid">
        {selected.map((stage) => (
          <StageCard key={stage.id} stage={stage} />
        ))}
      </div>
      {!selected.length && (
        <EmptyState
          icon={Search}
          title={t('No stages found', 'لم يُعثر على مراحل')}
          description={t(
            'Try another topic or remove the filter.',
            'جرّب موضوعًا آخر أو أزل المرشح.',
          )}
        />
      )}
    </div>
  );
}
export function StagePage({ id, initialModule }: { id: string; initialModule?: string }) {
  const { data, t, tr } = useApp();
  const [expanded, setExpanded] = useState(initialModule || '');
  if (!data) return null;
  const stage = data.stages.find((s) => s.id === id);
  if (!stage)
    return (
      <EmptyState
        title={t('Stage not found', 'المرحلة غير موجودة')}
        description={t(
          'Explore the complete learning roadmap instead.',
          'استكشف مسار التعلم الكامل.',
        )}
        action={<Button href="/roadmap">{t('View roadmap', 'عرض المسار')}</Button>}
      />
    );
  const ready = stage.status === 'AVAILABLE';
  const open = expanded || stage.modules[0]?.id;
  const p = data.progress;
  const completed = new Set(p.lessons.filter((l: any) => l.completed).map((l: any) => l.lessonId));
  const lessonCount = stage.modules.reduce((v, m) => v + m.lessons.length, 0);
  const count = stage.modules.flatMap((m) => m.lessons).filter((l) => completed.has(l.id)).length;
  return (
    <div className="stage-detail page-enter">
      <Link className="back-link" href="/roadmap">
        <Arrow size={14} />
        {t('Back to your roadmap', 'العودة إلى مسارك')}
      </Link>
      <section className="stage-detail-hero">
        <img src={stage.image} alt={tr(stage)} />
        <div className="stage-detail-shade" />
        <div className="stage-detail-copy">
          <div className="eyebrow">
            {t('STAGE', 'المرحلة')} {String(stage.order).padStart(2, '0')} <span> / 12</span>
          </div>
          <h1>{tr(stage)}</h1>
          <p>{tr(stage, 'description')}</p>
          <div className="detail-hero-meta">
            <span>
              <Layers size={16} />
              {stage.modules.length} {t('modules', 'وحدات')}
            </span>
            {ready ? (
              <span>
                <BookOpen size={16} />
                {lessonCount} {t('lessons', 'درسًا')}
              </span>
            ) : (
              <span>
                <Lock size={15} />
                {t('Curriculum in development', 'منهج قيد التطوير')}
              </span>
            )}
            <span>
              <GraduationCap size={17} />
              {t('Stage certificate', 'شهادة مرحلة')}
            </span>
          </div>
        </div>
      </section>
      <div className="stage-detail-layout">
        <div>
          <div className="section-heading">
            <div>
              <h2>{t('Your syllabus', 'منهجك')}</h2>
              <p>
                {ready
                  ? t(
                      'Understand each idea. Put it into practice. Build on it.',
                      'افهم كل فكرة وطبّقها وابنِ عليها.',
                    )
                  : t(
                      'Explore what this stage will cover. Lessons are not yet published.',
                      'استكشف موضوعات هذه المرحلة. لم تُنشر الدروس بعد.',
                    )}
              </p>
            </div>
            <Pill tone={ready ? 'teal' : 'muted'}>
              {ready ? t('Foundations', 'الأساسيات') : t('Planned', 'مخطط')}
            </Pill>
          </div>
          <div className="module-list">
            {stage.modules.map((m) => {
              const passed = p.modules.some((x: any) => x.moduleId === m.id && x.passed);
              const unlocked =
                ready &&
                (!data.settings.enforcePrerequisites ||
                  m.order === 1 ||
                  p.modules.some(
                    (x: any) => x.moduleId === `m-${stage.order}-${m.order - 1}` && x.passed,
                  ));
              return (
                <section
                  key={m.id}
                  className={`module-accordion panel ${open === m.id ? 'expanded' : ''}`}
                >
                  <button
                    className="module-heading"
                    onClick={() => setExpanded(open === m.id ? 'none' : m.id)}
                    aria-expanded={open === m.id}
                  >
                    <span className={`module-number ${passed ? 'passed' : ''}`}>
                      {passed ? <Check size={17} /> : String(m.order).padStart(2, '0')}
                    </span>
                    <span className="module-title">
                      <small>
                        {t('MODULE', 'الوحدة')} {String(m.order).padStart(2, '0')}
                      </small>
                      <strong>{tr(m)}</strong>
                      <span>
                        {ready
                          ? `${m.lessons.length} ${t('lessons', 'درسًا')} · ${m._count.questions} ${t('questions', 'سؤالًا')}`
                          : t('Syllabus outlined · not published', 'منهج مخطط · غير منشور')}
                      </span>
                    </span>
                    {!unlocked && <Lock size={15} className="muted" />}
                    <ChevronDown size={18} className="accordion-chevron" />
                  </button>
                  {open === m.id && (
                    <div className="module-body">
                      {ready ? (
                        <>
                          {m.lessons.map((l, i) => {
                            const done = completed.has(l.id);
                            const accessible =
                              unlocked &&
                              (!data.settings.enforcePrerequisites ||
                                i === 0 ||
                                completed.has(m.lessons[i - 1].id));
                            return (
                              <Link
                                href={`/lesson/${l.id}`}
                                key={l.id}
                                className={`lesson-list-row ${accessible ? '' : 'locked'}`}
                              >
                                <span className={`lesson-row-icon ${done ? 'complete' : ''}`}>
                                  {done ? (
                                    <Check size={15} />
                                  ) : accessible ? (
                                    <Play size={13} />
                                  ) : (
                                    <Lock size={13} />
                                  )}
                                </span>
                                <span>
                                  <strong>{tr(l)}</strong>
                                  <small>{tr(l, 'summary')}</small>
                                </span>
                                <span className="lesson-row-duration">
                                  <Clock size={12} />
                                  {l.duration} {t('min', 'د')}
                                </span>
                                <ChevronRight size={15} className="directional" />
                              </Link>
                            );
                          })}
                          <Link href={`/exams?module=${m.id}`} className="module-exam-row">
                            <Target size={18} />
                            <span>
                              <strong>{t('Module examination', 'اختبار الوحدة')}</strong>
                              <small>
                                {t('50 questions · 60 minutes', '50 سؤالًا · 60 دقيقة')}
                              </small>
                            </span>
                            <Pill tone={passed ? 'teal' : ''}>
                              {passed ? t('Passed', 'ناجح') : t('Assessment', 'تقييم')}
                            </Pill>
                            <Arrow size={15} />
                          </Link>
                          {!unlocked && (
                            <p className="prerequisite-note">
                              <Lock size={12} />
                              {t(
                                'Pass the previous module examination to unlock these lessons.',
                                'اجتز اختبار الوحدة السابقة لفتح هذه الدروس.',
                              )}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="planned-module-message">
                          <BookOpen size={25} />
                          <div>
                            <h4>
                              {t(
                                'The next chapter is being prepared.',
                                'الفصل القادم قيد الإعداد.',
                              )}
                            </h4>
                            <p>
                              {t(
                                'This topic is mapped in the curriculum. No lesson or assessment is published yet. Explore the library while the course is developed and reviewed.',
                                'هذا الموضوع مخطط في المنهج. لا دروس أو تقييمات منشورة بعد. استكشف المكتبة أثناء إعداد المحتوى ومراجعته.',
                              )}
                            </p>
                            <Link href="/library" className="text-link">
                              {t('Browse the scientific library', 'تصفّح المكتبة العلمية')}
                              <Arrow size={13} />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
        <aside>
          <section className="stage-summary-card panel">
            <span className="icon-tile purple">
              <Route size={22} />
            </span>
            <h3>
              {ready
                ? t('Your first cosmic chapter', 'فصلك الكوني الأول')
                : t('On your horizon', 'في أفقك')}
            </h3>
            <p>
              {ready
                ? t(
                    'Build a solid foundation before your journey into the solar system.',
                    'ابنِ أساسًا متينًا قبل رحلتك في النظام الشمسي.',
                  )
                : t(
                    'This stage is part of your complete roadmap. We will not disguise unfinished content as a complete course.',
                    'هذه المرحلة جزء من المسار الكامل. لا نعرض المحتوى غير المكتمل كدورة كاملة.',
                  )}
            </p>
            {ready && (
              <>
                <div className="progress-label">
                  <span>{t('Lesson progress', 'تقدم الدروس')}</span>
                  <strong>
                    {count} / {lessonCount}
                  </strong>
                </div>
                <ProgressBar value={lessonCount ? (count / lessonCount) * 100 : 0} />
                <Button
                  href={`/lesson/${stage.modules.flatMap((m) => m.lessons).find((l) => !completed.has(l.id))?.id || 'l-1-1'}`}
                  className="full-width"
                >
                  {t(
                    count ? 'Continue learning' : 'Start this stage',
                    count ? 'أكمل التعلم' : 'ابدأ هذه المرحلة',
                  )}
                  <Arrow />
                </Button>
              </>
            )}
            <div className="stage-requirements">
              <div>
                <CheckCircle2 size={16} />
                <span>{t('Progressive explanations', 'شروحات متدرجة')}</span>
              </div>
              <div>
                <Target size={16} />
                <span>{t('Assessment-based mastery', 'إتقان قائم على التقييم')}</span>
              </div>
              <div>
                <Telescope size={16} />
                <span>{t('Attributed scientific imagery', 'صور علمية موثقة')}</span>
              </div>
              <div>
                <GraduationCap size={16} />
                <span>{t('100-question stage final', 'اختبار نهائي من 100 سؤال')}</span>
              </div>
            </div>
            {ready && (
              <Link href={`/exams?stage=${stage.id}`} className="text-link">
                {t('View stage final', 'عرض الاختبار النهائي')}
                <Arrow size={14} />
              </Link>
            )}
          </section>
          <div className="curriculum-note">
            <Sparkles size={17} />
            <p>
              {t(
                'Readiness comes from assessment performance—not simply opening lessons.',
                'تأتي الجاهزية من أداء التقييم، لا من مجرد فتح الدروس.',
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
