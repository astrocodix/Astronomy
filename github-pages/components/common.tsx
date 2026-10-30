'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Info } from 'lucide-react';
import mediaRegistry from '../../public/images/attributions.json';
import type { curriculum } from '../../src/content/curriculum';
import { publicAsset } from '../../src/lib/public-asset';
import { usePages } from './provider';

type Stage = (typeof curriculum)[number];
export const media = mediaRegistry as Record<
  string,
  {
    titleEn: string;
    titleAr: string;
    captionEn: string;
    captionAr: string;
    altEn: string;
    altAr: string;
    credit: string;
    source: string;
    kind: string;
  }
>;

export function PreviewNotice() {
  const { t } = usePages();
  return (
    <div className="gp-notice" role="note">
      <Info size={17} />
      <span>
        <strong>{t('Pilot preview:', 'معاينة تجريبية:')}</strong>{' '}
        {t(
          'Lessons are awaiting independent scientific and Arabic editorial review.',
          'الدروس بانتظار مراجعة علمية وتحريرية عربية مستقلة.',
        )}{' '}
        <Link href="/about">
          {t('About this edition', 'عن هذه النسخة')} <ArrowUpRight size={12} />
        </Link>
      </span>
    </div>
  );
}

export function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const { lang, t, readLessons } = usePages();
  const available = index === 0;
  const image = media[stage.image];
  const readCount = readLessons.filter((id) => /^l-[1-8]-[12]$/.test(id)).length;
  return (
    <article className="gp-stage-card">
      <Link
        className="gp-stage-image"
        href={`/stages/s-${index + 1}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <img src={publicAsset(`/images/${stage.image}.webp`)} alt="" loading="lazy" />
        <span className="gp-stage-number">
          {t('STAGE', 'المرحلة')} {String(index + 1).padStart(2, '0')}
        </span>
        <span className={`gp-stage-status ${available ? 'available' : ''}`}>
          <span />
          {available ? t('Pilot lessons', 'دروس تجريبية') : t('Planned', 'مخططة')}
        </span>
        <span className="gp-image-credit">{image.credit}</span>
      </Link>
      <div className="gp-stage-body">
        <h3>
          <Link href={`/stages/s-${index + 1}`}>{stage.title[lang]}</Link>
        </h3>
        <p>{stage.description[lang]}</p>
        <div className="gp-stage-meta">
          <BookOpen size={14} /> {stage.modules.length} {t('modules', 'وحدات')} <span>·</span>{' '}
          {available
            ? `${readCount}/16 ${t('marked read', 'مقروء')}`
            : t('Curriculum outline', 'خطة المنهج')}
        </div>
        <Link className="gp-card-link" href={`/stages/s-${index + 1}`}>
          {available
            ? t('Explore lessons', 'استكشف الدروس')
            : t('View stage outline', 'عرض خطة المرحلة')}
          <ArrowRight size={16} className="directional" />
        </Link>
      </div>
    </article>
  );
}
