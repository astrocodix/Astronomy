'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Layers3,
  Orbit,
  Route,
  Sparkles,
  Telescope,
} from 'lucide-react';
import { curriculum } from '../../src/content/curriculum';
import type { Localized } from '../../src/content/curriculum';
import { publicAsset } from '../../src/lib/public-asset';
import { PreviewNotice, StageCard } from './common';
import { usePages } from './provider';

type LessonLink = { id: string; title: Localized };
export function Home({ lessons }: { lessons: LessonLink[] }) {
  const { t, lang, readLessons, storageAvailable } = usePages();
  const readCount = lessons.filter((lesson) => readLessons.includes(lesson.id)).length;
  const next = lessons.find((lesson) => !readLessons.includes(lesson.id)) || lessons[0];
  const totalModules = curriculum.reduce((total, stage) => total + stage.modules.length, 0);
  return (
    <div className="gp-home page-enter">
      <div className="gp-page-intro">
        <div>
          <div className="eyebrow gp-eyebrow">
            <Sparkles size={14} />
            {t('A LITTLE CURIOSITY. LIMITLESS POSSIBILITY.', 'فضول صغير. وإمكانات بلا حدود.')}
          </div>
          <h1>{t('Welcome to your universe.', 'مرحبًا بك في كونك.')}</h1>
          <p>
            {t(
              'Big questions. Small steps. An extraordinary journey.',
              'أسئلة كبيرة. خطوات صغيرة. ورحلة استثنائية.',
            )}
          </p>
        </div>
        <span className="gp-edition-label">
          <span />
          {t('PUBLIC PREVIEW', 'معاينة عامة')}
        </span>
      </div>
      <PreviewNotice />
      <div className="gp-hero-grid">
        <section className="gp-hero">
          <img src={publicAsset('/images/carina.webp')} alt="" fetchPriority="high" />
          <div className="gp-hero-shade" />
          <div className="gp-hero-copy">
            <div className="gp-hero-kicker">
              <Sparkles size={14} />
              {t('THE UNIVERSE IS YOUR CLASSROOM', 'الكون هو قاعة درسك')}
            </div>
            <h2>
              {t('Start small.', 'ابدأ بخطوة.')}
              <br />
              <span>{t('Think cosmic.', 'وفكّر باتساع الكون.')}</span>
            </h2>
            <p>
              {t(
                'From your first question to your next discovery. Your astronomy journey begins here.',
                'من سؤالك الأول إلى اكتشافك التالي. رحلتك في علم الفلك تبدأ هنا.',
              )}
            </p>
            <Link href={`/lesson/${next.id}`} className="btn btn-primary gp-hero-button">
              {readCount
                ? t('Continue exploring', 'تابع الاستكشاف')
                : t('Begin your journey', 'ابدأ رحلتك')}
              <ArrowRight size={17} className="directional" />
            </Link>
            <div className="gp-hero-features">
              <span>
                <Route size={15} /> {t('12 learning stages', '١٢ مرحلة تعليمية')}
              </span>
              <i />
              <span>
                <Sparkles size={15} /> {t('Infinite curiosity', 'فضول بلا حدود')}
              </span>
            </div>
          </div>
          <a
            className="gp-hero-credit"
            href="https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/"
            target="_blank"
            rel="noreferrer"
          >
            NGC 3324 · NASA, ESA, CSA, STScI <ArrowUpRight size={12} />
          </a>
        </section>
        <aside className="gp-orbit-card">
          <div className="gp-orbit-heading">
            <Orbit size={18} />
            <strong>{t('Your reading orbit', 'مدار قراءتك')}</strong>
            <ArrowUpRight size={15} />
          </div>
          <div
            className="gp-orbit-ring"
            style={
              { '--progress': `${(readCount / lessons.length) * 100}%` } as React.CSSProperties
            }
          >
            <div>
              <small>{t('PILOT LESSONS', 'الدروس التجريبية')}</small>
              <strong>
                {String(readCount).padStart(2, '0')} <span>/ {lessons.length}</span>
              </strong>
              <small>{t('marked as read', 'تمت قراءتها')}</small>
            </div>
          </div>
          <p>
            {storageAvailable
              ? t(
                  'Reading marks stay in this browser and are not assessments.',
                  'علامات القراءة تبقى في هذا المتصفح وليست تقييمًا.',
                )
              : t(
                  'Browser storage is unavailable. Reading marks last only for this visit.',
                  'تخزين المتصفح غير متاح؛ تبقى علامات القراءة لهذه الزيارة فقط.',
                )}
          </p>
          <Link href={`/lesson/${next.id}`} className="gp-next-lesson">
            <span>
              <small>{t('YOUR NEXT DESTINATION', 'وجهتك التالية')}</small>
              <strong>{next.title[lang]}</strong>
            </span>
            <ArrowRight size={16} className="directional" />
          </Link>
        </aside>
      </div>
      <div className="gp-metrics">
        <div>
          <span>
            <Layers3 size={16} />
            {t('Learning stages', 'مراحل التعلم')}
          </span>
          <strong>{curriculum.length}</strong>
          <small>{t('A map of the universe', 'خريطة للكون')}</small>
        </div>
        <div>
          <span>
            <Route size={16} />
            {t('Mapped modules', 'الوحدات المخططة')}
          </span>
          <strong>{totalModules}</strong>
          <small>{t('Across the full roadmap', 'عبر مسار التعلم الكامل')}</small>
        </div>
        <div>
          <span>
            <BookOpen size={16} />
            {t('Pilot lessons', 'الدروس التجريبية')}
          </span>
          <strong>{lessons.length}</strong>
          <small>{t('In the first stage', 'في المرحلة الأولى')}</small>
        </div>
        <div>
          <span>
            <Compass size={16} />
            {t('Your reading', 'قراءتك')}
          </span>
          <strong>
            {readCount}
            <em> / {lessons.length}</em>
          </strong>
          <small>
            {storageAvailable
              ? t('Saved on this browser', 'محفوظة في هذا المتصفح')
              : t('For this visit only', 'لهذه الزيارة فقط')}
          </small>
        </div>
      </div>
      <section className="gp-section">
        <div className="gp-section-heading">
          <div>
            <h2>{t('Your learning journey', 'رحلتك التعليمية')}</h2>
            <p>
              {t(
                'One stage at a time. A whole universe ahead.',
                'مرحلة بعد أخرى. وكون كامل أمامك.',
              )}
            </p>
          </div>
          <Link href="/roadmap">
            {t('View roadmap', 'عرض المسار')} <ArrowRight size={15} className="directional" />
          </Link>
        </div>
        <div className="gp-stage-grid">
          {[0, 1, 3].map((index) => (
            <StageCard key={index} stage={curriculum[index]} index={index} />
          ))}
        </div>
      </section>
      <section className="gp-section">
        <div className="gp-section-heading">
          <div>
            <h2>{t('Stay curious', 'أبقِ فضولك حيًا')}</h2>
            <p>
              {t(
                'More ways to explore, at your own pace.',
                'طرق أخرى للاستكشاف على وتيرتك الخاصة.',
              )}
            </p>
          </div>
        </div>
        <div className="gp-explore-grid">
          <Link href="/observatory" className="gp-explore-card">
            <span className="gp-icon-tile">
              <Telescope size={22} />
            </span>
            <div>
              <h3>{t('Step into the observatory', 'ادخل المرصد')}</h3>
              <p>
                {t(
                  'Explore planets, lunar phases, cosmic scale, and more with interactive models.',
                  'استكشف الكواكب وأطوار القمر والمقاييس الكونية بنماذج تفاعلية.',
                )}
              </p>
              <span>
                {t('Explore the observatory', 'استكشف المرصد')}{' '}
                <ArrowRight size={14} className="directional" />
              </span>
            </div>
          </Link>
          <Link href="/library" className="gp-explore-card">
            <span className="gp-icon-tile teal">
              <BookOpen size={22} />
            </span>
            <div>
              <h3>{t('Look closer at the cosmos', 'ألقِ نظرة أقرب على الكون')}</h3>
              <p>
                {t(
                  'See attributed scientific imagery and follow the sources behind the lessons.',
                  'شاهد صورًا علمية موثقة وتتبّع مصادر الدروس.',
                )}
              </p>
              <span>
                {t('Images & sources', 'الصور والمصادر')}{' '}
                <ArrowRight size={14} className="directional" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
