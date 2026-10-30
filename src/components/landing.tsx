'use client';
import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Sparkles,
  Star,
  BookOpen,
  Target,
  Telescope,
  Route,
  Globe,
  Sun,
  Moon,
  GraduationCap,
  Check,
  Plus,
  ArrowRight,
  Orbit,
  ShieldCheck,
  ChartNoAxesCombined,
} from 'lucide-react';
import { useApp } from './context';
import { Brand, Button, Arrow, Pill } from './ui';
export function Landing() {
  const { data, t, tr, lang, setLang, setTheme } = useApp();
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/">
          <Brand />
        </Link>
        <nav>
          <a href="#curriculum">{t('The curriculum', 'المنهج')}</a>
          <a href="#approach">{t('Our approach', 'نهجنا')}</a>
          <Link href="/observatory">{t('Observatory', 'المرصد')}</Link>
          <a href="#faq">{t('Questions?', 'لديك أسئلة؟')}</a>
        </nav>
        <div>
          <button className="language-button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            <Globe size={16} />
            {lang === 'en' ? 'العربية' : 'EN'}
          </button>
          <button
            className="icon-btn theme-toggle"
            aria-label={t('Change theme', 'تغيير المظهر')}
            onClick={() =>
              setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
            }
          >
            <Sun size={18} />
          </button>
          <Button variant="secondary" href="/login">
            {t('Sign in', 'دخول')}
          </Button>
        </div>
      </header>
      <section className="landing-hero">
        <img
          src="/images/carina.webp"
          alt={t('Webb’s view of the Cosmic Cliffs', 'الجروف الكونية كما رآها ويب')}
          fetchPriority="high"
        />
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            <Sparkles size={15} />
            {t('A PERSONAL ACADEMY. A UNIVERSAL CURIOSITY.', 'أكاديمية شخصية. وفضول كوني.')}
          </span>
          <h1>
            {t('Explore the Universe.', 'اكتشف أسرار الكون')}
            <br />
            <span>{t('Master Astronomy.', 'وابدأ رحلتك نحو احتراف علم الفلك.')}</span>
          </h1>
          <p>
            {t(
              'An AI-powered astronomy academy that takes you from zero knowledge to advanced scientific understanding.',
              'أكاديمية فلك مدعومة بالذكاء الاصطناعي تأخذك من الصفر إلى الفهم العلمي المتقدم.',
            )}
          </p>
          <div className="landing-hero-buttons">
            <Button href="/register">
              {t('Start learning', 'ابدأ التعلم')}
              <Arrow size={18} />
            </Button>
            <Button href="/roadmap" variant="glass">
              {t('Explore curriculum', 'استكشف المنهج')}
              <Route size={17} />
            </Button>
          </div>
          <Link className="landing-tutor-link" href="/tutor">
            <Sparkles size={15} />
            {t('Meet your astronomy tutor', 'تعرّف إلى معلّمك الفلكي')}
            <ArrowUpRight size={15} />
          </Link>
          <div className="landing-hero-details">
            <span>
              <Check size={13} />
              {t('Beginner to advanced', 'من المبتدئ إلى المتقدم')}
            </span>
            <span>
              <Check size={13} />
              {t('Arabic & English', 'العربية والإنجليزية')}
            </span>
            <span>
              <Check size={13} />
              {t('Science, not shortcuts', 'علم لا اختصارات')}
            </span>
          </div>
        </div>
        <a
          className="landing-image-credit"
          href="https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/"
          target="_blank"
          rel="noreferrer"
        >
          {t('A REAL WINDOW INTO STAR BIRTH', 'نافذة حقيقية على ميلاد النجوم')}
          <strong>NGC 3324 · JAMES WEBB</strong>
          <span>
            NASA · ESA · CSA · STScI <ArrowUpRight size={12} />
          </span>
        </a>
        <div className="landing-scroll">
          <span />
          {t('THERE’S MORE TO DISCOVER', 'المزيد بانتظارك')}
        </div>
      </section>
      <section className="landing-facts">
        <div>
          <strong>12</strong>
          <span>{t('stages of discovery', 'مرحلة اكتشاف')}</span>
        </div>
        <div>
          <strong>{data?.counts.modules || 146}</strong>
          <span>{t('mapped learning modules', 'وحدة تعليمية مخططة')}</span>
        </div>
        <div>
          <strong>{data?.counts.lessons || 16}</strong>
          <span>{t('complete pilot lessons', 'درسًا تجريبيًا كاملًا')}</span>
        </div>
        <div>
          <strong>{data?.counts.questions || 864}</strong>
          <span>{t('assessment items', 'سؤال تقييم')}</span>
        </div>
      </section>
      <section id="approach" className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">
            {t('MORE THAN FACTS ABOUT SPACE', 'أكثر من معلومات عن الفضاء')}
          </span>
          <h2>{t('Learn to see the universe differently.', 'تعلّم رؤية الكون بطريقة مختلفة.')}</h2>
          <p>
            {t(
              'Build understanding that lasts, one thoughtful question at a time.',
              'ابنِ فهمًا يدوم بسؤال متأنٍ تلو الآخر.',
            )}
          </p>
        </div>
        <div className="landing-feature-grid">
          {[
            {
              icon: Route,
              en: 'A journey with direction',
              ar: 'رحلة باتجاه واضح',
              descEn:
                'A progressive curriculum connects the fundamentals to astrophysics, cosmology, and research. Nothing important is left to chance.',
              descAr:
                'يربط منهج متدرج الأساسيات بالفيزياء الفلكية والكونيات والبحث. لا يُترك المهم للصدفة.',
              href: '/roadmap',
            },
            {
              icon: Target,
              en: 'Understanding, not guesswork',
              ar: 'فهم لا تخمين',
              descEn:
                'Balanced exams, clear answer explanations, and concept-level mastery help you see what to revisit—and why.',
              descAr:
                'تكشف الاختبارات المتوازنة والتفسيرات والإتقان المفاهيمي ما تحتاج إلى مراجعته ولماذا.',
              href: '/exams',
            },
            {
              icon: ShieldCheck,
              en: 'A beautiful respect for evidence',
              ar: 'احترام عميق للأدلة',
              descEn:
                'Explore attributed NASA imagery and source-grounded lessons that separate observation, theory, and speculation.',
              descAr: 'استكشف صور ناسا الموثقة ودروسًا تميز الرصد والنظرية والتكهن.',
              href: '/library',
            },
          ].map(({ icon: Icon, ...f }, i) => (
            <Link href={f.href} key={i} className="landing-feature panel">
              <span className="icon-tile purple">
                <Icon size={25} />
              </span>
              <h3>{t(f.en, f.ar)}</h3>
              <p>{t(f.descEn, f.descAr)}</p>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="landing-discovery-section">
        <div>
          <span className="eyebrow">
            {t('CURIOSITY IS BETTER HANDS-ON', 'الفضول أجمل بالتجربة')}
          </span>
          <h2>
            {t('Don’t just read about it.\nExplore it.', 'لا تكتفِ بالقراءة.\nاستكشف بنفسك.')}
          </h2>
          <p>
            {t(
              'Watch the planets move. Explore lunar phases. Stretch a cosmic ruler. Our observatory makes big ideas tangible—with every scientific simplification clearly labeled.',
              'شاهد حركة الكواكب واستكشف أطوار القمر وجرّب مسطرة كونية. يحوّل مرصدنا الأفكار الكبرى إلى تجربة مع توضيح كل تبسيط علمي.',
            )}
          </p>
          <Button href="/observatory">
            <Telescope size={17} />
            {t('Enter the observatory', 'ادخل المرصد')}
            <Arrow />
          </Button>
        </div>
        <Link href="/observatory" className="landing-saturn">
          <img
            src="/images/saturn.webp"
            alt={t(
              'Saturn and its rings in Cassini’s natural-color mosaic',
              'زحل وحلقاته في فسيفساء كاسيني الطبيعية',
            )}
          />
          <span className="landing-saturn-label">
            <span className="tiny-dot" />
            {t('SATURN · A WORLD BEYOND THE ORDINARY', 'زحل · عالم غير عادي')}
            <ArrowUpRight size={17} />
          </span>
          <small>NASA/JPL-Caltech/Space Science Institute</small>
        </Link>
      </section>
      <section id="curriculum" className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">
            {t(
              'FROM YOUR FIRST QUESTION TO YOUR NEXT FRONTIER',
              'من سؤالك الأول إلى آفاقك التالية',
            )}
          </span>
          <h2>
            {t('Twelve stages. One incredible perspective.', 'اثنتا عشرة مرحلة ومنظور مذهل.')}
          </h2>
          <p>
            {t(
              'Stage 1 is ready as a pilot. The remaining eleven stages are transparently mapped for future development.',
              'المرحلة الأولى جاهزة كبرنامج تجريبي. المراحل الإحدى عشرة المتبقية مخططة بوضوح للتطوير.',
            )}
          </p>
        </div>
        <div className="landing-roadmap">
          {data?.stages.map((s) => (
            <Link href={`/stages/${s.id}`} key={s.id}>
              <span>{String(s.order).padStart(2, '0')}</span>
              <strong>{tr(s)}</strong>
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
        <div className="center-action">
          <Button href="/roadmap" variant="secondary">
            {t('See the complete learning roadmap', 'عرض مسار التعلم الكامل')}
            <Arrow />
          </Button>
        </div>
      </section>
      <section className="landing-ai-section">
        <div className="landing-ai-star" aria-hidden="true">
          ✦<span>✧</span>
        </div>
        <div>
          <Pill tone="purple">ASTRO AI · {t('YOUR COSMIC CO-PILOT', 'رفيقك الكوني')}</Pill>
          <h2>{t('A question is never too small.', 'لا يوجد سؤال أصغر من أن يُطرح.')}</h2>
          <p>
            {t(
              'A configurable AI tutor can explain concepts, unpack equations, and use your learning context. Until a provider is connected, the reference guide retrieves real academy lesson excerpts—honestly labeled, never presented as live AI.',
              'يمكن لمعلّم AI القابل للتهيئة شرح المفاهيم والمعادلات باستخدام سياق تعلمك. حتى ربط المزود، يسترجع دليل المراجع مقتطفات حقيقية موسومة بوضوح، لا يدعي أنها AI حي.',
            )}
          </p>
          <div className="landing-ai-modes">
            {[
              t('Beginner', 'مبتدئ'),
              t('Academic', 'أكاديمي'),
              t('Advanced', 'متقدم'),
              t('Research', 'بحثي'),
              t('Exam preparation', 'تحضير اختبار'),
            ].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
          <Button href="/tutor">
            {t('Meet your astronomy guide', 'تعرّف إلى دليلك الفلكي')}
            <Sparkles size={17} />
          </Button>
        </div>
      </section>
      <section className="landing-section landing-achievement-section">
        <div>
          <span className="eyebrow">{t('MILESTONES THAT MEAN SOMETHING', 'إنجازات ذات معنى')}</span>
          <h2>{t('Earn your next horizon.', 'استحق أفقك التالي.')}</h2>
          <p>
            {t(
              'Pass assessments, build durable understanding, and earn a record of your journey. Badges celebrate learning; certificates require demonstrated achievement.',
              'اجتز التقييمات وابنِ فهمًا متينًا وسجلًا لرحلتك. تحتفي الشارات بالتعلم وتتطلب الشهادات إنجازًا مثبتًا.',
            )}
          </p>
          <Link href="/achievements" className="text-link">
            {t('Explore the milestones', 'استكشف الإنجازات')}
            <Arrow />
          </Link>
        </div>
        <div className="landing-badges">
          {[Star, Orbit, GraduationCap].map((Icon, i) => (
            <div key={i} className={`landing-badge badge-${i}`}>
              <Icon size={45} strokeWidth={1.2} />
              <span>
                {t(
                  ['First Light', 'Cosmic Foundations', 'Stage Graduate'][i],
                  ['الضوء الأول', 'الأسس الكونية', 'خريج المرحلة'][i],
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="landing-section faq-section" id="faq">
        <div>
          <span className="eyebrow">{t('BEFORE YOU LIFT OFF', 'قبل الانطلاق')}</span>
          <h2>{t('A little clarity\nbefore the cosmos.', 'بعض الوضوح\nقبل الكون.')}</h2>
          <p>{t('Good questions make great beginnings.', 'الأسئلة الجيدة تصنع بدايات رائعة.')}</p>
        </div>
        <div className="faq-list">
          {[
            [
              t('Do I need any astronomy knowledge?', 'هل أحتاج معرفة مسبقة بالفلك؟'),
              t(
                'Not at all. Stage 1 starts with what astronomy is, your place in the universe, scientific reasoning, and the units that make cosmic distances understandable.',
                'لا إطلاقًا. تبدأ المرحلة الأولى بتعريف الفلك وموقعك في الكون والاستدلال العلمي ووحدات المسافات.',
              ),
            ],
            [
              t('Is the entire curriculum complete?', 'هل المنهج كله مكتمل؟'),
              t(
                'No. All twelve stages and 146 modules are mapped. The functional pilot includes sixteen bilingual lessons and 864 assessment items in the first stage. Later stages are labeled in development. Seed content needs independent editorial review before a public launch.',
                'لا. خُططت 12 مرحلة و146 وحدة. يشمل البرنامج التجريبي 16 درسًا ثنائي اللغة و864 سؤالًا في المرحلة الأولى. توسم المراحل التالية بأنها قيد التطوير، ويحتاج المحتوى الأولي إلى مراجعة مستقلة قبل الإطلاق.',
              ),
            ],
            [
              t('Is the AI tutor connected?', 'هل المعلّم الذكي متصل؟'),
              t(
                'The application includes a server-side provider integration. Its status is visible in the tutor. Without a provider key, it offers clearly labeled reference excerpts rather than pretending to generate AI answers.',
                'يتضمن التطبيق تكامل مزود على الخادم وتظهر حالته. دون مفتاح مزود، يقدم مقتطفات مرجعية واضحة لا يدعي أنها إجابات AI.',
              ),
            ],
            [
              t(
                'Can I switch between Arabic and English?',
                'هل أستطيع التبديل بين العربية والإنجليزية؟',
              ),
              t(
                'Yes. Lessons, questions, the interface, and tutor requests support both languages. Arabic uses a right-to-left layout. Changing language never resets your progress.',
                'نعم. تدعم الدروس والأسئلة والواجهة وطلبات المعلم اللغتين، وتستخدم العربية اتجاه اليمين لليسار. لا يعيد التبديل تقدمك إلى الصفر.',
              ),
            ],
            [
              t('How are mastery and certificates earned?', 'كيف أحقق الإتقان والشهادات؟'),
              t(
                'Mastery is calculated from assessed concepts, not lesson completion alone. Certificates require the stage final and its prerequisites. They document academy completion and are not accredited university degrees.',
                'يُحسب الإتقان من المفاهيم المقيمة لا إكمال الدروس وحده. تتطلب الشهادات اختبار المرحلة ومتطلباته، وهي توثق إتمام الأكاديمية وليست درجات جامعية معتمدة.',
              ),
            ],
          ].map(([q, a], i) => (
            <details key={i}>
              <summary>
                {q}
                <Plus size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="landing-final">
        <span>✦</span>
        <h2>
          {t(
            'The universe is waiting.\nWhere will your curiosity take you?',
            'الكون ينتظرك.\nإلى أين سيأخذك فضولك؟',
          )}
        </h2>
        <Button href="/register">
          {t('Start learning today', 'ابدأ التعلم اليوم')}
          <Arrow />
        </Button>
        <Link href="/">
          {t('Or take a look around first', 'أو ألقِ نظرة أولًا')}
          <ArrowUpRight size={14} />
        </Link>
      </section>
      <footer className="landing-footer">
        <Link href="/">
          <Brand />
        </Link>
        <span>{t('Learn the Universe. Understand Everything.', 'تعلّم الكون. وافهم كل شيء.')}</span>
        <div>
          <Link href="/settings">{t('Privacy & preferences', 'الخصوصية والتفضيلات')}</Link>
          <Link href="/admin">{t('Instructor studio', 'استوديو المدرّس')}</Link>
          <span>© {new Date().getFullYear()} ASTROVERSE</span>
        </div>
      </footer>
    </div>
  );
}
