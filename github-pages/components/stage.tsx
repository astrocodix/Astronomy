'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock, Layers3 } from 'lucide-react';
import type { curriculum, Localized } from '../../src/content/curriculum';
import { publicAsset } from '../../src/lib/public-asset';
import { media, PreviewNotice } from './common';
import { usePages } from './provider';

type Stage = (typeof curriculum)[number];
type Lesson = {
  id: string;
  module: number;
  order: number;
  title: Localized;
  summary: Localized;
  duration: number;
};
export function StageView({
  stage,
  index,
  lessons,
}: {
  stage: Stage;
  index: number;
  lessons: Lesson[];
}) {
  const { t, lang, readLessons } = usePages();
  const available = index === 0;
  const image = media[stage.image];
  return (
    <div className="page-enter">
      <div className="lesson-breadcrumb">
        <Link href="/roadmap">{t('Learning roadmap', 'مسار التعلم')}</Link>
        <ChevronRight size={12} className="directional" />
        <span>
          {t('Stage', 'المرحلة')} {index + 1}
        </span>
      </div>
      <PreviewNotice />
      <section className="gp-stage-hero">
        <img src={publicAsset(`/images/${stage.image}.webp`)} alt="" />
        <div className="gp-stage-hero-shade" />
        <div className="gp-stage-hero-copy">
          <span className="gp-hero-kicker">
            {t('STAGE', 'المرحلة')} {String(index + 1).padStart(2, '0')} ·{' '}
            {available ? t('PILOT LESSONS', 'دروس تجريبية') : t('CURRICULUM OUTLINE', 'خطة المنهج')}
          </span>
          <h1>{stage.title[lang]}</h1>
          <p>{stage.description[lang]}</p>
          <div>
            <span>
              <Layers3 size={15} /> {stage.modules.length} {t('modules', 'وحدات')}
            </span>
            {available && (
              <span>
                <BookOpen size={15} /> {lessons.length} {t('pilot lessons', 'درسًا تجريبيًا')}
              </span>
            )}
          </div>
        </div>
        <a href={image.source} target="_blank" rel="noreferrer" className="gp-hero-credit">
          {image.credit} ↗
        </a>
      </section>
      <div className="gp-stage-intro">
        <div>
          <span className="eyebrow">
            {available
              ? t('YOUR STARTING POINT', 'نقطة البداية')
              : t('LOOKING AHEAD', 'نظرة إلى المستقبل')}
          </span>
          <h2>
            {available
              ? t('Start with the fundamentals.', 'ابدأ بالأساسيات.')
              : t('A future frontier.', 'آفاق مستقبلية.')}
          </h2>
          <p>
            {available
              ? t(
                  'Explore the eight modules and sixteen pilot lessons below. Reading marks are stored only on this device.',
                  'استكشف الوحدات الثماني والدروس التجريبية الستة عشر أدناه. تحفظ علامات القراءة على هذا الجهاز فقط.',
                )
              : t(
                  'These modules are mapped for future development; lessons for this stage have not been authored yet.',
                  'هذه الوحدات مخططة للتطوير مستقبلًا؛ لم تُؤلّف دروس هذه المرحلة بعد.',
                )}
          </p>
        </div>
      </div>
      <div className="gp-module-list">
        {stage.modules.map((module, moduleIndex) => {
          const moduleLessons = lessons.filter((lesson) => lesson.module === moduleIndex + 1);
          return (
            <section className="gp-module" key={moduleIndex}>
              <div className="gp-module-heading">
                <span className="gp-module-number">{String(moduleIndex + 1).padStart(2, '0')}</span>
                <div>
                  <small>
                    {t('MODULE', 'الوحدة')} {moduleIndex + 1}
                  </small>
                  <h2>{module[lang]}</h2>
                </div>
                <span className={`gp-module-status ${available ? 'available' : ''}`}>
                  {available
                    ? `${moduleLessons.length} ${t('lessons', 'دروس')}`
                    : t('Planned', 'مخططة')}
                </span>
              </div>
              {moduleLessons.length > 0 && (
                <div className="gp-lesson-list">
                  {moduleLessons.map((lesson) => (
                    <Link href={`/lesson/${lesson.id}`} className="gp-lesson-row" key={lesson.id}>
                      <span className="gp-lesson-icon">
                        {readLessons.includes(lesson.id) ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          <BookOpen size={19} />
                        )}
                      </span>
                      <span className="gp-lesson-row-text">
                        <strong>{lesson.title[lang]}</strong>
                        <small>{lesson.summary[lang]}</small>
                      </span>
                      <span className="gp-lesson-duration">
                        <Clock size={13} />
                        {lesson.duration} {t('min', 'دقيقة')}
                      </span>
                      <ArrowRight size={16} className="directional" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className="gp-stage-back">
        <Link href="/roadmap" className="btn btn-secondary">
          {t('Back to the roadmap', 'العودة إلى المسار')}{' '}
          <ArrowRight size={16} className="directional" />
        </Link>
      </div>
    </div>
  );
}
