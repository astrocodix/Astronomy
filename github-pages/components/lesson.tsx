'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FlaskConical,
  Lightbulb,
  Target,
} from 'lucide-react';
import { ConceptDiagram } from '../../src/components/diagrams';
import { Markdown, SourceLinks } from '../../src/components/ui';
import type { Concept } from '../../src/content/concepts';
import type { Localized } from '../../src/content/curriculum';
import type { LessonSeed } from '../../src/content/lessons';
import { publicAsset } from '../../src/lib/public-asset';
import { media, PreviewNotice } from './common';
import { usePages } from './provider';

type Neighbor = { id: string; title: Localized } | null;
type Reference = { id: string; title: string; publisher: string; url: string };
const labels: Record<string, [string, string]> = {
  INTERMEDIATE: ['GO A LITTLE DEEPER', 'تعمّق أكثر'],
  ADVANCED: ['ADVANCED PERSPECTIVE', 'منظور متقدم'],
  EXAMPLE: ['WORKED EXAMPLE', 'مثال محلول'],
  MISCONCEPTION: ['A COMMON MISCONCEPTION', 'مفهوم شائع خاطئ'],
  APPLICATION: ['PUT IT INTO PRACTICE', 'طبّقه عمليًا'],
  WORKSHOP: ['GUIDED INVESTIGATION', 'استقصاء موجّه'],
  CHECKPOINT: ['CHECK YOUR UNDERSTANDING', 'تحقق من فهمك'],
};

export function LessonReader({
  lesson,
  id,
  duration,
  moduleTitle,
  terms,
  references,
  previous,
  next,
}: {
  lesson: LessonSeed;
  id: string;
  duration: number;
  moduleTitle: Localized;
  terms: Concept[];
  references: Reference[];
  previous: Neighbor;
  next: Neighbor;
}) {
  const { t, lang, readLessons, toggleRead, storageAvailable } = usePages();
  const read = readLessons.includes(id);
  const image = media[lesson.image];
  return (
    <div className="lesson-page page-enter">
      <div className="lesson-breadcrumb">
        <Link href="/stages/s-1">{t('Introduction to Astronomy', 'مقدمة في علم الفلك')}</Link>
        <ChevronRight size={12} className="directional" />
        <span>{moduleTitle[lang]}</span>
      </div>
      <PreviewNotice />
      <div className="lesson-header gp-lesson-header">
        <div className="lesson-kicker">
          <span className="pill purple">{t('FOUNDATION · PILOT', 'تأسيسي · تجريبي')}</span>
          <span>
            {t('LESSON', 'الدرس')} {lesson.order} / 2
          </span>
          {read && (
            <span className="pill teal">
              <Check size={12} />
              {t('Marked read', 'تمت قراءته')}
            </span>
          )}
        </div>
        <h1>{lesson.title[lang]}</h1>
        <p>{lesson.summary[lang]}</p>
        <div className="lesson-meta-row">
          <span>
            <Clock size={15} />
            {duration} {t('min · reading + activities', 'دقيقة · قراءة وأنشطة')}
          </span>
          <span>
            <BookOpenIcon />
            {t('Evidence-led learning', 'تعلم قائم على الأدلة')}
          </span>
        </div>
      </div>
      <div className="lesson-layout gp-lesson-layout">
        <article className="lesson-article">
          <section className="learning-objectives">
            <span className="icon-tile purple">
              <Target size={21} />
            </span>
            <div>
              <h2>{t('What you’ll understand', 'ما ستفهمه')}</h2>
              <ul>
                {lesson.objectives.map((objective, index) => (
                  <li key={index}>
                    <CheckCircle2 size={15} />
                    {objective[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <div className="gp-reading-intro">
            {t(
              'Take your time. Work through the examples and investigations as you go.',
              'خذ وقتك، وجرّب الأمثلة والاستقصاءات أثناء القراءة.',
            )}
          </div>
          {lesson.sections.map((section, index) => (
            <React.Fragment key={index}>
              <section
                id={`section-${index + 1}`}
                className={`lesson-section type-${section.type.toLowerCase()}`}
              >
                {labels[section.type] && (
                  <span className="section-label">
                    {section.type === 'MISCONCEPTION' ? (
                      <Lightbulb size={15} />
                    ) : (
                      <FlaskConical size={15} />
                    )}
                    {t(...labels[section.type])}
                  </span>
                )}
                <h2>{section.title[lang]}</h2>
                <Markdown text={section.content[lang]} />
              </section>
              {section.type === 'CORE' && (
                <>
                  <figure className="science-figure lesson-science-image">
                    <img
                      src={publicAsset(`/images/${lesson.image}.webp`)}
                      alt={t(image.altEn, image.altAr)}
                      loading="lazy"
                    />
                    <figcaption>
                      <strong>{t(image.titleEn, image.titleAr)}</strong>
                      <p>{t(image.captionEn, image.captionAr)}</p>
                      <div>
                        <span>{image.credit}</span>
                        <a href={image.source} target="_blank" rel="noreferrer">
                          {t('Image source', 'مصدر الصورة')} <ExternalLink size={12} />
                        </a>
                      </div>
                    </figcaption>
                  </figure>
                  <ConceptDiagram type={lesson.diagram} />
                </>
              )}
            </React.Fragment>
          ))}
          <section className="gp-glossary">
            <h2>{t('Your scientific vocabulary', 'مفرداتك العلمية')}</h2>
            <p>{t('Select a term to reveal its meaning.', 'اختر مصطلحًا لعرض معناه.')}</p>
            <div>
              {terms.map((term) => (
                <details key={term.term.en}>
                  <summary>{term.term[lang]}</summary>
                  <p>{term.definition[lang]}</p>
                </details>
              ))}
            </div>
          </section>
          <SourceLinks references={references} />
          <section className="gp-read-box">
            <div>
              <CheckCircle2 size={24} />
              <h2>
                {read
                  ? t('Marked as read.', 'تم وضع علامة القراءة.')
                  : t('A little further into the universe.', 'خطوة أخرى في الكون.')}
              </h2>
              <p>
                {t(
                  'Keep a simple reading mark in this browser. It is not a quiz, assessment, or certificate.',
                  'احفظ علامة قراءة بسيطة في هذا المتصفح. لا تُعد اختبارًا أو تقييمًا أو شهادة.',
                )}
              </p>
              {!storageAvailable && (
                <p>
                  {t(
                    'Browser storage is unavailable; this mark lasts only for this visit.',
                    'تخزين المتصفح غير متاح؛ ستبقى العلامة لهذه الزيارة فقط.',
                  )}
                </p>
              )}
            </div>
            <button
              className={`btn ${read ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => toggleRead(id)}
              aria-pressed={read}
            >
              {read
                ? t('Remove reading mark', 'إزالة علامة القراءة')
                : t('Mark as read', 'تحديد كمقروء')}{' '}
              <Check size={16} />
            </button>
          </section>
          <nav className="gp-lesson-nav" aria-label={t('Lesson navigation', 'التنقل بين الدروس')}>
            {previous ? (
              <Link href={`/lesson/${previous.id}`}>
                <ArrowLeft size={16} className="directional" />
                <span>
                  <small>{t('PREVIOUS LESSON', 'الدرس السابق')}</small>
                  <strong>{previous.title[lang]}</strong>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/lesson/${next.id}`}>
                <span>
                  <small>{t('NEXT LESSON', 'الدرس التالي')}</small>
                  <strong>{next.title[lang]}</strong>
                </span>
                <ArrowRight size={16} className="directional" />
              </Link>
            ) : (
              <Link href="/roadmap">
                <span>
                  <small>{t('KEEP EXPLORING', 'تابع الاستكشاف')}</small>
                  <strong>{t('View the roadmap', 'عرض المسار')}</strong>
                </span>
                <ArrowRight size={16} className="directional" />
              </Link>
            )}
          </nav>
        </article>
        <aside className="lesson-sidebar gp-lesson-sidebar">
          <div className="lesson-contents panel">
            <h2>{t('In this lesson', 'في هذا الدرس')}</h2>
            <ol>
              {lesson.sections.map((section, index) => (
                <li key={index}>
                  <a href={`#section-${index + 1}`}>{section.title[lang]}</a>
                </li>
              ))}
            </ol>
          </div>
          <p>
            {t(
              'Your reading mark is saved in this browser only.',
              'تحفظ علامة القراءة في هذا المتصفح فقط.',
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}

function BookOpenIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h2a5 5 0 0 1 5 4 5 5 0 0 1 5-4h2a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1h-3a5 5 0 0 0-5 2 5 5 0 0 0-5-2H4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}
