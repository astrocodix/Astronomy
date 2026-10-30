'use client';
import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowRight,
  Orbit,
  Lightbulb,
  FlaskConical,
  ClipboardCheck,
  RefreshCw,
  ChevronRight,
  Info,
  Sun,
  Star,
} from 'lucide-react';
import { useApp } from './context';
const starPoints = [
  [35, 43],
  [70, 107],
  [129, 33],
  [171, 78],
  [232, 25],
  [278, 99],
  [326, 46],
  [370, 116],
  [418, 23],
  [467, 64],
  [526, 39],
  [563, 119],
  [87, 211],
  [147, 248],
  [257, 224],
  [389, 244],
  [498, 213],
  [550, 259],
];
function Stars() {
  return (
    <g fill="#b8c6eb">
      {starPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 1.7 : 0.8} opacity={0.3 + (i % 3) * 0.15} />
      ))}
    </g>
  );
}
export function ConceptDiagram({ type = 'scale' }: { type?: string }) {
  const { t, lang } = useApp();
  const [v, setV] = useState(
    type === 'spectrum'
      ? 550
      : type === 'parallax'
        ? 10
        : type === 'lighttravel'
          ? 20
          : type === 'expansion'
            ? 1.5
            : 2,
  );
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState(false);
  let title = '',
    content: React.ReactNode,
    control: React.ReactNode;
  if (type === 'parallax') {
    title = t('A moving viewpoint. A measurable angle.', 'موضع رؤية متغير وزاوية قابلة للقياس.');
    content = (
      <>
        <svg viewBox="0 0 600 280" role="img" aria-label={title}>
          <Stars />
          <ellipse
            cx="115"
            cy="145"
            rx="54"
            ry="83"
            stroke="#7883a5"
            fill="none"
            strokeDasharray="4 5"
          />
          <line x1="115" y1="62" x2={360 + v * 3} y2="145" stroke="#a99aef" />
          <line x1="115" y1="228" x2={360 + v * 3} y2="145" stroke="#6ecad4" />
          <line
            x1="115"
            y1="145"
            x2={360 + v * 3}
            y2="145"
            stroke="#6a7694"
            strokeDasharray="3 4"
          />
          <circle cx="115" cy="145" r="13" fill="#efbc6e" />
          <circle cx="115" cy="62" r="8" fill="#8da7ff" />
          <circle cx="115" cy="228" r="8" fill="#8da7ff" />
          <circle cx={360 + v * 3} cy="145" r="7" fill="#fff1c7" />
          <text x="35" y="45" fill="#b4bdd6" fontSize="12">
            {t('Earth, 6 months apart', 'الأرض بفارق 6 أشهر')}
          </text>
          <text x="115" y="178" textAnchor="middle" fill="#c6cde0" fontSize="12">
            {t('Sun', 'الشمس')}
          </text>
          <text x={360 + v * 3} y="180" textAnchor="middle" fill="#e0e4f2" fontSize="13">
            {t('Nearby star', 'نجم قريب')}
          </text>
          <text x="285" y="130" fill="#b7a7ff" fontSize="14">
            p = {(1 / v).toFixed(3)}″
          </text>
        </svg>
        <div className="diagram-equation" dir="ltr">
          d = 1 / p = <strong>{v} pc</strong>
        </div>
      </>
    );
    control = (
      <>
        <label>
          {t('Stellar distance', 'المسافة النجمية')} <strong>{v} pc</strong>
          <input type="range" min="1" max="50" value={v} onChange={(e) => setV(+e.target.value)} />
        </label>
        <p>
          {t(
            'The annual parallax angle decreases as distance increases. Angles are exaggerated; the reference baseline is 1 AU.',
            'تصغر الزاوية بزيادة المسافة. الزوايا مبالغ فيها، وخط القاعدة المرجعي وحدة فلكية واحدة.',
          )}
        </p>
      </>
    );
  } else if (type === 'spectrum') {
    title = t('The language of light', 'لغة الضوء');
    content = (
      <>
        <svg viewBox="0 0 600 230" role="img" aria-label={title}>
          <defs>
            <linearGradient id="spectrum-gradient">
              <stop stopColor="#8b5de9" />
              <stop offset=".2" stopColor="#3561e8" />
              <stop offset=".4" stopColor="#4bc5bc" />
              <stop offset=".55" stopColor="#93d269" />
              <stop offset=".7" stopColor="#f4dd70" />
              <stop offset=".85" stopColor="#ef9856" />
              <stop offset="1" stopColor="#e85b69" />
            </linearGradient>
          </defs>
          <Stars />
          <rect x="40" y="90" width="520" height="55" rx="7" fill="url(#spectrum-gradient)" />
          {[92, 171, 274, 399, 460].map((x, i) => (
            <rect
              key={i}
              x={x}
              y="90"
              width={3 + (i % 3)}
              height="55"
              fill="#0b1020"
              opacity=".8"
            />
          ))}
          <line
            x1={40 + ((v - 380) / 370) * 520}
            y1="64"
            x2={40 + ((v - 380) / 370) * 520}
            y2="166"
            stroke="white"
            strokeWidth="2"
          />
          <text x="40" y="188" fill="#bac6df" fontSize="12">
            380 nm
          </text>
          <text x="560" y="188" textAnchor="end" fill="#bac6df" fontSize="12">
            750 nm
          </text>
          <text x="300" y="43" textAnchor="middle" fill="#e3e5f4" fontSize="15">
            {t('An illustrative absorption spectrum', 'طيف امتصاص توضيحي')}
          </text>
        </svg>
        <div className="diagram-equation" dir="ltr">
          λ = <strong>{v} nm</strong>
          <span>·</span>E ≈ <strong>{(1240 / v).toFixed(2)} eV</strong>
        </div>
      </>
    );
    control = (
      <label>
        {t('Explore wavelength', 'استكشف الطول الموجي')}
        <input type="range" min="380" max="750" value={v} onChange={(e) => setV(+e.target.value)} />
        <small>
          {t(
            'Shorter wavelength means greater photon energy. The lines shown are illustrative, not measured atomic lines.',
            'الموجة الأقصر تعني طاقة فوتون أكبر. الخطوط توضيحية وليست قياسات لخطوط ذرية.',
          )}
        </small>
      </label>
    );
  } else if (type === 'method' || type === 'timeline') {
    const isMethod = type === 'method';
    const steps = isMethod
      ? [
          t('Observe', 'ارصد'),
          t('Hypothesize', 'افترض'),
          t('Predict', 'تنبأ'),
          t('Test', 'اختبر'),
          t('Revise', 'راجع'),
        ]
      : [
          t('Ancient records', 'سجلات قديمة'),
          t('Al-Sufi · 964', 'الصوفي · 964'),
          t('Copernicus · 1543', 'كوبرنيكوس · 1543'),
          t('Kepler · 1609', 'كبلر · 1609'),
          t('Newton · 1687', 'نيوتن · 1687'),
        ];
    const detail = isMethod
      ? [
          t(
            'Record what is measured, with time, units, and uncertainty.',
            'سجّل القياسات مع الزمن والوحدات وعدم اليقين.',
          ),
          t(
            'Propose an explanation that could be challenged by evidence.',
            'اقترح تفسيرًا يمكن أن تتحداه الأدلة.',
          ),
          t(
            'Describe a result that should follow if the hypothesis is useful.',
            'صف نتيجة متوقعة إذا كانت الفرضية مفيدة.',
          ),
          t(
            'Compare new observations and rule out alternative explanations.',
            'قارن أرصادًا جديدة واستبعد تفسيرات بديلة.',
          ),
          t(
            'Refine the model. A surprising result may require checking the instrument first.',
            'حسّن النموذج. قد تتطلب المفاجأة فحص الجهاز أولًا.',
          ),
        ]
      : [
          t(
            'Many cultures developed calendars, records, and geometrical models.',
            'طورت ثقافات عديدة التقاويم والسجلات والنماذج الهندسية.',
          ),
          t(
            'The Book of the Fixed Stars combined catalog traditions with observation.',
            'جمع كتاب صور الكواكب الثابتة تقاليد الفهارس مع الرصد.',
          ),
          t(
            'A heliocentric model placed Earth among the planets orbiting the Sun.',
            'وضع نموذج مركزية الشمس الأرض بين الكواكب المدارية.',
          ),
          t(
            'The first two orbital laws described ellipses and equal areas in equal times.',
            'وصف القانونان المداريان الأولان القطوع الناقصة والمساحات المتساوية بأزمنة متساوية.',
          ),
          t(
            'Universal gravitation connected terrestrial and celestial mechanics.',
            'ربطت الجاذبية العامة الميكانيكا الأرضية والسماوية.',
          ),
        ];
    title = isMethod
      ? t('Science is a conversation with evidence', 'العلم حوار مع الأدلة')
      : t('A few milestones in a shared history', 'محطات في تاريخ مشترك');
    content = (
      <div className="method-steps">
        <div className="method-track">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} className={step === i ? 'active' : ''}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{s}</strong>
            </button>
          ))}
        </div>
        <div className="method-detail">
          <span className="large-star">✦</span>
          <h3>{steps[step]}</h3>
          <p>{detail[step]}</p>
        </div>
      </div>
    );
    control = (
      <p>
        {t(
          'Select a step to explore. Scientific work is iterative, and this simplified sequence is not the entire history or process.',
          'اختر خطوة لاستكشافها. العمل العلمي تكراري، وهذا التسلسل المبسط ليس كل التاريخ أو المنهج.',
        )}
      </p>
    );
  } else if (type === 'orbit') {
    title = t('A larger orbit. A longer year.', 'مدار أكبر. وسنة أطول.');
    const eccentricity = 0.35;
    const mean = (step / 100) * Math.PI * 2;
    let eccentric = mean;
    for (let i = 0; i < 8; i++)
      eccentric -=
        (eccentric - eccentricity * Math.sin(eccentric) - mean) /
        (1 - eccentricity * Math.cos(eccentric));
    const x = 300 + 180 * Math.cos(eccentric),
      y = 140 + 100 * Math.sin(eccentric);
    content = (
      <>
        <svg viewBox="0 0 600 280" role="img" aria-label={title}>
          <Stars />
          <ellipse
            cx="300"
            cy="140"
            rx="180"
            ry="100"
            fill="none"
            stroke="#7771a8"
            strokeDasharray="4 5"
          />
          <line x1="120" y1="140" x2="480" y2="140" stroke="#475577" strokeDasharray="3 5" />
          <line x1="363" y1="140" x2={x} y2={y} stroke="#a991e8" opacity=".65" />
          <circle cx="363" cy="140" r="17" fill="#f3c17d" />
          <circle cx={x} cy={y} r="9" fill="#97b4ef" />
          <text x="363" y="178" textAnchor="middle" fill="#e8d2b7" fontSize="12">
            {t('Sun · focus', 'الشمس · البؤرة')}
          </text>
          <text x="300" y="27" textAnchor="middle" fill="#b6bedb" fontSize="12">
            {t('Schematic orbit · perspective compressed', 'مدار توضيحي · منظور مضغوط')}
          </text>
          <text x="300" y="265" textAnchor="middle" fill="#a7b3cd" fontSize="12">
            {t(
              'Equal time steps move faster near the Sun',
              'خطوات زمنية متساوية تتحرك أسرع قرب الشمس',
            )}
          </text>
        </svg>
        <div className="diagram-equation" dir="ltr">
          P² = a³ · a = <strong>{v.toFixed(1)} AU</strong> · P ≈{' '}
          <strong>
            {Math.pow(v, 1.5).toFixed(2)} {t('years', 'سنة')}
          </strong>
        </div>
      </>
    );
    control = (
      <>
        <label>
          {t('Semi-major axis', 'نصف المحور الأكبر')}
          <input
            type="range"
            min=".5"
            max="15"
            step=".5"
            value={v}
            onChange={(e) => setV(+e.target.value)}
          />
        </label>
        <label>
          {t('Fraction of an orbital period', 'جزء من الدورة المدارية')}
          <strong>{step}%</strong>
          <input
            type="range"
            min="0"
            max="100"
            value={step}
            onChange={(e) => setStep(+e.target.value)}
          />
        </label>
        <p>
          {t(
            'For a low-mass object orbiting a one-solar-mass star, with years and AU. Position follows Kepler’s equation at e = 0.35; the orbit is compressed vertically and resized to fit, not drawn to physical scale.',
            'لجسم صغير يدور حول نجم كتلته شمسية، بالسنوات والوحدات الفلكية. يتبع الموضع معادلة كبلر عند لامركزية 0.35. ضغط الرسم رأسيًا ليلائم الشاشة وليس بمقياس فيزيائي.',
          )}
        </p>
      </>
    );
  } else if (type === 'lifecycle') {
    title = t('A star’s mass shapes its story', 'كتلة النجم تشكّل قصته');
    const nodes = branch
      ? [
          t('Massive star', 'نجم ضخم'),
          t('Supergiant', 'عملاق فائق'),
          t('Core collapse', 'انهيار النواة'),
          t('Neutron star / black hole', 'نجم نيوتروني / ثقب أسود'),
        ]
      : [
          t('Sun-like star', 'نجم شبيه بالشمس'),
          t('Red giant', 'عملاق أحمر'),
          t('Ejected outer gas', 'غاز خارجي مطرود'),
          t('White dwarf', 'قزم أبيض'),
        ];
    content = (
      <div className="lifecycle-track">
        {nodes.map((n, i) => (
          <React.Fragment key={n}>
            <div>
              <span className={`stellar-orb star-${i} ${branch ? 'massive' : ''}`} />
              <strong>{n}</strong>
            </div>
            {i < 3 && <ArrowRight size={18} className="directional" />}
          </React.Fragment>
        ))}
      </div>
    );
    control = (
      <>
        <div className="segmented">
          <button onClick={() => setBranch(false)} className={!branch ? 'active' : ''}>
            {t('Sun-like path', 'مسار شبيه بالشمس')}
          </button>
          <button onClick={() => setBranch(true)} className={branch ? 'active' : ''}>
            {t('Massive-star path', 'مسار نجم ضخم')}
          </button>
        </div>
        <p>
          {t(
            'Simplified evolutionary routes, not scaled sizes or durations. Mass loss, composition, rotation, and companions affect the outcome.',
            'مسارات مبسطة لا أحجام أو أزمنة حقيقية. يؤثر فقد الكتلة والتركيب والدوران والرفاق في النتيجة.',
          )}
        </p>
      </>
    );
  } else if (type === 'expansion') {
    title = t('Expansion changes separation', 'يغير التمدد الفواصل');
    content = (
      <>
        <svg viewBox="0 0 600 280" role="img" aria-label={title}>
          <defs>
            <pattern id="exp-grid" width={35 * v} height={35 * v} patternUnits="userSpaceOnUse">
              <path
                d={`M ${35 * v} 0 L 0 0 0 ${35 * v}`}
                fill="none"
                stroke="#5f578b"
                strokeWidth=".6"
              />
            </pattern>
          </defs>
          <rect x="20" y="20" width="560" height="240" rx="12" fill="url(#exp-grid)" />
          {[
            [-65, -45],
            [55, -35],
            [-30, 50],
            [80, 40],
            [0, 0],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${300 + x * v},${140 + y * v})`}>
              <ellipse
                rx="14"
                ry="6"
                transform="rotate(-30)"
                fill={i === 4 ? '#e9bc7f' : '#a89bf7'}
              />
              <circle r="3" fill="#f7f0ff" />
            </g>
          ))}
          <line
            x1="300"
            y1="140"
            x2={300 + 55 * v}
            y2={140 - 35 * v}
            stroke="#f5ce9e"
            strokeDasharray="4 3"
          />
        </svg>
        <div className="diagram-equation" dir="ltr">
          a(now) / a(then) = <strong>{v.toFixed(1)}</strong>
          <span>·</span>z = <strong>{(v - 1).toFixed(1)}</strong>
        </div>
      </>
    );
    control = (
      <label>
        {t('Relative expansion factor', 'معامل التمدد النسبي')}
        <input
          type="range"
          min="1"
          max="3"
          step=".1"
          value={v}
          onChange={(e) => setV(+e.target.value)}
        />
        <small>
          {t(
            'A schematic for large-scale expansion. No galaxy is a universal center. Bound galaxies do not expand like the gaps shown.',
            'رسم للتمدد واسع النطاق. لا مجرة مركزًا للكون. لا تتمدد المجرات المرتبطة كالفواصل المرسومة.',
          )}
        </small>
      </label>
    );
  } else if (type === 'lighttravel') {
    title = t('Distance is also a delay', 'المسافة تأخر أيضًا');
    content = (
      <>
        <svg viewBox="0 0 600 250" role="img" aria-label={title}>
          <Stars />
          <circle cx="75" cy="125" r="24" fill="#8fa9e8" />
          <circle cx="515" cy="125" r="32" fill="#edbd7b" />
          <line
            x1="111"
            y1="125"
            x2="468"
            y2="125"
            stroke="#a89ae8"
            strokeDasharray="4 6"
            strokeWidth="2"
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${155 + i * 50} 118 l-7 7 7 7`} stroke="#d9cffc" fill="none" />
          ))}
          <text x="75" y="181" textAnchor="middle" fontSize="14" fill="#cbd3e8">
            {t('You, now', 'أنت الآن')}
          </text>
          <text x="515" y="181" textAnchor="middle" fontSize="14" fill="#cbd3e8">
            {t('Then', 'حينها')}
          </text>
          <text x="300" y="88" textAnchor="middle" fill="#c4b7ff" fontSize="23">
            {v} {t('light-years', 'سنة ضوئية')}
          </text>
        </svg>
        <div className="diagram-equation">
          {t('This light left', 'غادر هذا الضوء قبل')}{' '}
          <strong>
            {v} {t('years ago', 'سنة')}
          </strong>
        </div>
      </>
    );
    control = (
      <label>
        {t('Distance to the star', 'المسافة إلى النجم')}
        <input type="range" min="1" max="100" value={v} onChange={(e) => setV(+e.target.value)} />
        <small>
          {t(
            'Nearby, stationary approximation. At cosmological distances, expansion must be included.',
            'تقريب قريب ساكن. يجب تضمين التمدد على المسافات الكونية.',
          )}
        </small>
      </label>
    );
  } else if (type === 'sky') {
    title = t('Apparent motion across your sky', 'الحركة الظاهرية عبر السماء');
    content = (
      <svg viewBox="0 0 600 280" role="img" aria-label={title}>
        <path d="M60 235 A240 210 0 0 1 540 235" fill="#151e35" stroke="#4f6182" />
        <g transform={`rotate(${v * 10 - 20} 300 235)`}>
          {[
            [100, 200],
            [180, 130],
            [240, 100],
            [340, 80],
            [410, 120],
            [470, 175],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={(i % 2) + 2} fill="#d2d9f4" />
          ))}
        </g>
        <line x1="40" y1="235" x2="560" y2="235" stroke="#7585a7" />
        <circle cx="300" cy="235" r="5" fill="#bb9af4" />
        <text x="60" y="258" fill="#aab8d6" fontSize="13">
          {t('East', 'شرق')}
        </text>
        <text x="540" y="258" fill="#aab8d6" fontSize="13" textAnchor="end">
          {t('West', 'غرب')}
        </text>
        <text x="300" y="40" fill="#cad5f1" textAnchor="middle" fontSize="14">
          {t('Illustrative sky dome', 'قبة سماوية توضيحية')}
        </text>
      </svg>
    );
    control = (
      <label>
        {t('Change the observing time', 'غيّر وقت الرصد')}
        <input
          type="range"
          min="0"
          max="5"
          step=".1"
          value={v}
          onChange={(e) => setV(+e.target.value)}
        />
        <small>
          {t(
            'Schematic only—not a sky chart for your location. Earth’s rotation drives the daily apparent motion.',
            'رسم توضيحي لا خريطة لموقعك. يسبب دوران الأرض الحركة اليومية الظاهرية.',
          )}
        </small>
      </label>
    );
  } else {
    const points = [
      { en: 'Earth diameter', ar: 'قطر الأرض', distance: '12,742 km', r: 12 },
      { en: 'Earth–Moon distance', ar: 'المسافة إلى القمر', distance: '384,400 km (mean)', r: 20 },
      {
        en: 'Earth–Sun distance',
        ar: 'المسافة إلى الشمس',
        distance: '1 AU ≈ 149.6 million km',
        r: 32,
      },
      { en: 'One light-year', ar: 'سنة ضوئية واحدة', distance: '9.4607 × 10¹² km', r: 48 },
      {
        en: 'Nearest star beyond the Sun',
        ar: 'أقرب نجم بعد الشمس',
        distance: 'Proxima Centauri ≈ 4.25 ly',
        r: 64,
      },
      {
        en: 'Milky Way stellar disk',
        ar: 'قرص درب التبانة النجمي',
        distance: '~100,000 ly (approximate)',
        r: 85,
      },
    ];
    const index = Math.max(0, Math.min(5, Math.round(v)));
    const item = points[index];
    title = t('Zoom out. Change your perspective.', 'ابتعد قليلًا. غيّر منظورك.');
    content = (
      <>
        <svg viewBox="0 0 600 260" role="img" aria-label={title}>
          <Stars />
          {[30, 60, 90, 120].map((r) => (
            <circle
              key={r}
              cx="300"
              cy="130"
              r={r}
              stroke="#574c7e"
              strokeWidth="1"
              strokeDasharray={r === 120 ? '3 6' : undefined}
              fill="none"
              opacity=".65"
            />
          ))}
          <circle cx="300" cy="130" r={item.r} fill="#b09bf2" opacity=".13" />
          <circle cx="300" cy="130" r={item.r / 2} fill="#9986da" opacity=".3" />
          <circle cx="300" cy="130" r="8" fill="#d5c9ff" />
          <path d="M300 130 H480" stroke="#ad9ae8" strokeDasharray="4 4" />
          <circle cx="480" cy="130" r="4" fill="#b7a2ff" />
        </svg>
        <div className="diagram-equation">
          <strong>{lang === 'ar' ? item.ar : item.en}</strong>
          <span dir="ltr">{item.distance}</span>
        </div>
      </>
    );
    control = (
      <label>
        {t('Explore a different scale', 'استكشف مقياسًا مختلفًا')}
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={index}
          onChange={(e) => setV(+e.target.value)}
        />
        <small>
          {t(
            'Nested symbols are illustrative, not proportional distances. Values are rounded and refer to different kinds of length.',
            'الرموز المتداخلة توضيحية وليست مسافات متناسبة. القيم مقربة وتشير إلى أنواع أطوال مختلفة.',
          )}
        </small>
      </label>
    );
  }
  return (
    <section className="concept-diagram">
      <div className="diagram-top">
        <span>
          <SlidersHorizontal size={15} />
          {t('INTERACTIVE EXPLORATION', 'استكشاف تفاعلي')}
        </span>
        <span className="diagram-model-label">{t('Educational model', 'نموذج تعليمي')}</span>
      </div>
      <h3>{title}</h3>
      <div className="diagram-visual" dir="ltr">
        {content}
      </div>
      <div className="diagram-controls">{control}</div>
    </section>
  );
}
