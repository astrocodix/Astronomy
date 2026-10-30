'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Database, Globe, ShieldAlert } from 'lucide-react';
import { PreviewNotice } from './common';
import { usePages } from './provider';

const repository =
  process.env.NEXT_PUBLIC_REPOSITORY_URL || 'https://github.com/astrocodix/Astronomy';
export function About() {
  const { t, storageAvailable } = usePages();
  return (
    <div className="page-enter gp-about">
      <div className="gp-page-intro gp-page-intro-spaced">
        <div>
          <div className="eyebrow gp-eyebrow">
            <Globe size={14} />
            {t('A DIFFERENT WAY TO EXPLORE', 'طريقة أخرى للاستكشاف')}
          </div>
          <h1>{t('About this edition.', 'عن هذه النسخة.')}</h1>
          <p>
            {t(
              'A lightweight, public preview of Astroverse Academy for GitHub Pages.',
              'معاينة عامة وخفيفة لأكاديمية أستروفيرس على صفحات جيت هاب.',
            )}
          </p>
        </div>
      </div>
      <PreviewNotice />
      <div className="gp-about-grid">
        <section>
          <span className="gp-icon-tile">
            <BookOpen size={22} />
          </span>
          <h2>{t('What you can explore', 'ما يمكنك استكشافه')}</h2>
          <p>
            {t(
              'Browse all 12 curriculum outlines, read the 16 bilingual stage-one pilot lessons, explore interactive observatory models, and follow the scientific image credits and references.',
              'تصفّح خطط المراحل الاثنتي عشرة واقرأ الدروس التجريبية الستة عشر بالعربية والإنجليزية، واستكشف نماذج المرصد ومصادر الصور والمراجع العلمية.',
            )}
          </p>
        </section>
        <section>
          <span className="gp-icon-tile teal">
            <Globe size={22} />
          </span>
          <h2>{t('Reading marks stay here', 'علامات القراءة تبقى هنا')}</h2>
          <p>
            {t(
              'You can mark lessons as read. Marks, language, and theme are stored in this browser when storage is available; they do not sync across devices. Clearing site data removes them. A reading mark is not an assessment or a certificate.',
              'يمكنك تحديد الدروس كمقروءة. تحفظ العلامات واللغة والمظهر في هذا المتصفح عند توفر التخزين ولا تتزامن بين الأجهزة. مسح بيانات الموقع يزيلها. علامة القراءة ليست تقييمًا أو شهادة.',
            )}
          </p>
          {!storageAvailable && (
            <p className="gp-storage-warning">
              {t(
                'Browser storage is unavailable. Your choices will last only for this visit.',
                'تخزين المتصفح غير متاح. ستبقى اختياراتك لهذه الزيارة فقط.',
              )}
            </p>
          )}
        </section>
        <section>
          <span className="gp-icon-tile orange">
            <Database size={22} />
          </span>
          <h2>{t('What needs the full app', 'ما يحتاج إلى التطبيق الكامل')}</h2>
          <p>
            {t(
              'GitHub Pages serves static files and cannot run the academy’s database or API. Accounts, synced progress, assessments, certificates, the AI tutor, uploads, and the content studio are not available in this edition.',
              'تقدّم صفحات جيت هاب ملفات ثابتة ولا تستطيع تشغيل قاعدة البيانات أو واجهة التطبيق. الحسابات والتقدم المتزامن والاختبارات والشهادات والمعلّم الذكي والرفع واستوديو المحتوى غير متاحة في هذه النسخة.',
            )}
          </p>
        </section>
        <section>
          <span className="gp-icon-tile">
            <ShieldAlert size={22} />
          </span>
          <h2>{t('A pilot, not a finished degree', 'برنامج تجريبي لا شهادة مكتملة')}</h2>
          <p>
            {t(
              'Only stage one contains authored lessons. Stages 2–12 are future outlines. Pilot teaching still requires independent scientific, Arabic, and media-rights review before a reviewed public launch. Observatory models are educational illustrations, not live sky data.',
              'المرحلة الأولى وحدها تضم دروسًا مؤلفة، والمراحل ٢–١٢ خطط مستقبلية. تحتاج المواد التجريبية إلى مراجعة علمية وعربية وحقوق وسائط مستقلة قبل الإطلاق المعتمد. نماذج المرصد تعليمية وليست بيانات حية للسماء.',
            )}
          </p>
        </section>
      </div>
      <div className="gp-about-source">
        <Code2 size={23} />
        <div>
          <h2>{t('Looking for the full academy?', 'تبحث عن الأكاديمية الكاملة؟')}</h2>
          <p>
            {t(
              'The original server-backed app remains in the repository. Run it on a Node.js host with a database to use its additional features. The static site uses the authored source snapshot, not changes made in a live content studio.',
              'يبقى التطبيق الأصلي المدعوم بالخادم في المستودع. شغّله على استضافة Node.js مع قاعدة بيانات لاستخدام ميزاته الإضافية. يستخدم الموقع الثابت نسخة المحتوى المؤلف في المصدر، لا التغييرات المباشرة في استوديو المحتوى.',
            )}
          </p>
          <div>
            <a className="btn btn-secondary" href={repository} target="_blank" rel="noreferrer">
              {t('View the repository', 'عرض المستودع')}{' '}
              <ArrowRight size={15} className="directional" />
            </a>
            <Link className="gp-text-link" href="/roadmap">
              {t('Explore the roadmap', 'استكشف المسار')}{' '}
              <ArrowRight size={15} className="directional" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
