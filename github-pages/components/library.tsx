'use client';

import React from 'react';
import { ExternalLink, Images } from 'lucide-react';
import { refs } from '../../src/content/references';
import { publicAsset } from '../../src/lib/public-asset';
import { media, PreviewNotice } from './common';
import { usePages } from './provider';

export function Library() {
  const { t } = usePages();
  return (
    <div className="page-enter">
      <div className="gp-page-intro gp-page-intro-spaced">
        <div>
          <div className="eyebrow gp-eyebrow">
            <Images size={14} />
            {t('KNOWLEDGE, WITHOUT THE NOISE', 'معرفة بلا تشويش')}
          </div>
          <h1>{t('A closer look at the cosmos.', 'نظرة أقرب إلى الكون.')}</h1>
          <p>
            {t(
              'Discover scientific imagery and follow the sources behind the pilot lessons.',
              'استكشف صورًا علمية وتتبّع مصادر الدروس التجريبية.',
            )}
          </p>
        </div>
      </div>
      <PreviewNotice />
      <div className="gp-section-heading">
        <div>
          <h2>{t('A moment of wonder', 'لحظة من الدهشة')}</h2>
          <p>
            {t(
              'Five locally cached, attributed image products. Open the source for the original context.',
              'خمسة منتجات صور محفوظة مع نسبها. افتح المصدر للاطلاع على سياقها الأصلي.',
            )}
          </p>
        </div>
      </div>
      <div className="gp-gallery">
        {Object.entries(media).map(([key, image]) => (
          <figure className="gp-gallery-card" key={key}>
            <img
              src={publicAsset(`/images/${key}.webp`)}
              alt={t(image.altEn, image.altAr)}
              loading="lazy"
            />
            <figcaption>
              <span>
                {image.kind === 'ILLUSTRATION'
                  ? t('SCIENTIFIC VISUALIZATION', 'تصوير علمي')
                  : t('OBSERVATION', 'رصد')}
              </span>
              <h3>{t(image.titleEn, image.titleAr)}</h3>
              <p>{t(image.captionEn, image.captionAr)}</p>
              <small>{image.credit}</small>
              <a href={image.source} target="_blank" rel="noreferrer">
                {t('View image source', 'عرض مصدر الصورة')} <ExternalLink size={13} />
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
      <section className="gp-section gp-sources">
        <div className="gp-section-heading">
          <div>
            <h2>{t('Good science leaves a trail.', 'يترك العلم الجيد أثرًا موثقًا.')}</h2>
            <p>
              {t(
                'Explore the NASA and OpenStax references used in the pilot lessons. Linking a source does not imply endorsement.',
                'استكشف مراجع ناسا وOpenStax المستخدمة في الدروس التجريبية. الرابط لا يعني المصادقة.',
              )}
            </p>
          </div>
        </div>
        <div className="gp-source-grid">
          {refs.map((ref) => (
            <a href={ref.url} target="_blank" rel="noreferrer" key={ref.id}>
              <span>
                <strong>{ref.title}</strong>
                <small>{ref.publisher}</small>
              </span>
              <ExternalLink size={15} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
