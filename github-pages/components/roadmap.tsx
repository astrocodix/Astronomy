'use client';

import { Route } from 'lucide-react';
import { curriculum } from '../../src/content/curriculum';
import { PreviewNotice, StageCard } from './common';
import { usePages } from './provider';

export function Roadmap() {
  const { t } = usePages();
  return (
    <div className="page-enter">
      <div className="gp-page-intro gp-page-intro-spaced">
        <div>
          <div className="eyebrow gp-eyebrow">
            <Route size={14} />
            {t('A MAP FOR THE CURIOUS', 'خريطة للفضوليين')}
          </div>
          <h1>{t('A universe of things to learn.', 'كون من الأشياء لتعلّمها.')}</h1>
          <p>
            {t(
              'Twelve stages, from your first look up to research-level questions.',
              'اثنتا عشرة مرحلة من نظرتك الأولى إلى أسئلة البحث العلمي.',
            )}
          </p>
        </div>
      </div>
      <PreviewNotice />
      <div className="gp-roadmap-note">
        <strong>{t('Start with stage one.', 'ابدأ بالمرحلة الأولى.')}</strong>{' '}
        {t(
          'The first stage contains 16 pilot lessons. Stages 2–12 are outlines for future development, not finished courses.',
          'تضم المرحلة الأولى ١٦ درسًا تجريبيًا. المراحل ٢–١٢ خطط للتطوير مستقبلًا وليست دورات مكتملة.',
        )}
      </div>
      <div className="gp-stage-grid gp-roadmap-grid">
        {curriculum.map((stage, index) => (
          <StageCard stage={stage} index={index} key={index} />
        ))}
      </div>
    </div>
  );
}
