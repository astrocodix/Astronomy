'use client';
import mediaRegistry from '../../public/images/attributions.json';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Maximize,
  ArrowUpRight,
  ExternalLink,
  Sun,
  Moon,
  Telescope,
  Star,
  Image,
  Scale,
  Info,
  ArrowRight,
  Globe,
  ChevronRight,
  SlidersHorizontal,
  ZoomIn,
  Search,
} from 'lucide-react';
import { useApp } from './context';
import {
  PageHeader,
  Button,
  Arrow,
  Pill,
  Field,
  Modal,
  Banner,
  SourceLinks,
  SectionHeading,
} from './ui';
import { ConceptDiagram } from './diagrams';
import { planets } from '@/content/planets';
const tabs = [
  ['solar', 'Solar system', 'النظام الشمسي', Orbit],
  ['compare', 'Compare planets', 'قارن الكواكب', Scale],
  ['moon', 'Moon phases', 'أطوار القمر', Moon],
  ['stars', 'Stars & constellations', 'النجوم والكوكبات', Star],
  ['galaxies', 'Galaxies', 'المجرات', Globe],
  ['scale', 'Cosmic scale', 'المقياس الكوني', ZoomIn],
  ['gravity', 'Extreme gravity', 'الجاذبية القصوى', Orbit],
  ['gallery', 'Image archive', 'أرشيف الصور', Image],
] as const;
export function Observatory() {
  const { t, lang } = useApp();
  const [tab, setTab] = useState('solar');
  return (
    <div className="observatory-page page-enter">
      <PageHeader
        eyebrow={t('LESS SCROLLING. MORE STAR-GAZING.', 'تصفح أقل. تأمل أكثر.')}
        title={t('A front-row seat to the cosmos.', 'مقعد أمامي لمشاهدة الكون.')}
        description={t(
          'Move a planet. Follow a phase. Change your perspective. The universe is yours to explore.',
          'حرّك كوكبًا وتتبع طورًا وغيّر منظورك. الكون بانتظار استكشافك.',
        )}
        action={
          <Pill tone="teal" icon={<Telescope size={13} />}>
            {t('INTERACTIVE OBSERVATORY', 'مرصد تفاعلي')}
          </Pill>
        }
      />
      <div className="observatory-tabs">
        {tabs.map(([key, en, ar, Icon]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            <Icon size={16} />
            {t(en, ar)}
          </button>
        ))}
      </div>
      {tab === 'solar' ? (
        <SolarSystem />
      ) : tab === 'compare' ? (
        <PlanetComparison />
      ) : tab === 'moon' ? (
        <MoonPhases />
      ) : tab === 'stars' ? (
        <Constellations />
      ) : tab === 'scale' ? (
        <div className="observatory-tool-grid">
          <ConceptDiagram type="scale" />
          <ConceptDiagram type="parallax" />
        </div>
      ) : tab === 'galaxies' ? (
        <GalaxyExplorer />
      ) : tab === 'gravity' ? (
        <GravityLab />
      ) : (
        <ImageGallery />
      )}
      <div className="observatory-disclaimer">
        <Info size={16} />
        <p>
          {t(
            'The interactive models are educational illustrations, not live ephemerides or telescope observations. Sizes, distances, and time may be deliberately rescaled. Source notes accompany each tool.',
            'النماذج التفاعلية رسوم تعليمية وليست جداول مواقع حية أو أرصادًا تلسكوبية. قد تُعاد مقاييس الحجم والمسافة والزمن عمدًا. ترافق كل أداة معلومات مصدرها.',
          )}
        </p>
      </div>
    </div>
  );
}
function SolarSystem() {
  const { t, lang } = useApp();
  const [selected, setSelected] = useState(5);
  const [playing, setPlaying] = useState(false);
  const [days, setDays] = useState(0);
  const [speed, setSpeed] = useState(30);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now(),
      frame: number;
    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      setDays((d) => d + elapsed * speed);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);
  const planet = planets[selected];
  return (
    <>
      <div className="solar-layout">
        <section className="solar-canvas">
          <div className="solar-canvas-head">
            <div>
              <span className="eyebrow">{t('OUR CELESTIAL NEIGHBORHOOD', 'جوارنا السماوي')}</span>
              <h2>{t('Eight worlds. One star.', 'ثمانية عوالم. نجم واحد.')}</h2>
            </div>
            <span className="simulation-badge">
              <span />
              {t('EDUCATIONAL MODEL', 'نموذج تعليمي')}
            </span>
          </div>
          <svg
            viewBox="0 0 760 480"
            role="group"
            aria-label={t(
              'Interactive schematic of the eight planets. Select a planet to view its data.',
              'مخطط تفاعلي للكواكب الثمانية. اختر كوكبًا لعرض بياناته.',
            )}
            className="solar-svg"
          >
            <defs>
              <radialGradient id="sun-glow">
                <stop stopColor="#ffbc66" stopOpacity=".5" />
                <stop offset="1" stopColor="#f8a449" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="sun-core" cx="35%" cy="30%">
                <stop stopColor="#fff0b7" />
                <stop offset=".45" stopColor="#f8be67" />
                <stop offset="1" stopColor="#d77c38" />
              </radialGradient>
              {planets.map((p) => (
                <radialGradient key={p.id} id={`planet-${p.id}`} cx="30%" cy="25%">
                  <stop stopColor={p.color} />
                  <stop offset=".6" stopColor={p.color} />
                  <stop offset="1" stopColor="#182031" />
                </radialGradient>
              ))}
            </defs>
            {Array.from({ length: 80 }, (_, i) => (
              <circle
                key={i}
                cx={(i * 127 + 31) % 760}
                cy={(i * 91 + 17) % 480}
                r={i % 6 === 0 ? 1.2 : 0.55}
                fill="#d6e2f5"
                opacity={0.15 + (i % 4) * 0.12}
              />
            ))}
            {planets.map((p, i) => (
              <ellipse
                key={p.id}
                cx="380"
                cy="240"
                rx={48 + i * 39}
                ry={(48 + i * 39) * 0.55}
                fill="none"
                stroke={selected === i ? '#8a7db5' : '#39405a'}
                strokeWidth={selected === i ? 1.1 : 0.65}
                opacity={selected === i ? 0.8 : 0.6}
              />
            ))}
            <circle cx="380" cy="240" r="72" fill="url(#sun-glow)" />
            <circle cx="380" cy="240" r="22" fill="url(#sun-core)" />
            <text x="380" y="280" fill="#dfbd8e" fontSize="11" textAnchor="middle">
              {t('SUN', 'الشمس')}
            </text>
            {planets.map((p, i) => {
              const angle = i * 1.9 + 0.25 + (days / p.period) * Math.PI * 2;
              const r = 48 + i * 39;
              const x = 380 + Math.cos(angle) * r,
                y = 240 + Math.sin(angle) * r * 0.55;
              const radius = [5, 7, 7.5, 6, 15, 13, 10, 10][i];
              return (
                <g
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p[lang]} ${t('planet profile', 'ملف الكوكب')}`}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(i);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={x} cy={y} r={radius + 13} fill="transparent" />
                  {selected === i && (
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 7}
                      stroke="#c6b7ff"
                      fill="none"
                      strokeWidth="1"
                    />
                  )}
                  {i === 5 && (
                    <ellipse
                      cx={x}
                      cy={y}
                      rx="24"
                      ry="7"
                      transform={`rotate(-25 ${x} ${y})`}
                      stroke="#d9c7a6"
                      fill="none"
                      strokeWidth="4"
                      opacity=".7"
                    />
                  )}
                  <circle cx={x} cy={y} r={radius} fill={`url(#planet-${p.id})`} />
                  <text
                    x={x}
                    y={y + radius + 23}
                    textAnchor="middle"
                    fill={selected === i ? '#ece5ff' : '#a8b2ca'}
                    fontSize="11"
                  >
                    {p[lang]}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="solar-controls">
            <button
              className="simulation-play"
              onClick={() => setPlaying((v) => !v)}
              aria-label={t(
                playing ? 'Pause orbital simulation' : 'Play orbital simulation',
                playing ? 'أوقف محاكاة المدارات' : 'شغّل محاكاة المدارات',
              )}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                setDays(0);
                setPlaying(false);
              }}
              aria-label={t('Reset simulation', 'إعادة ضبط المحاكاة')}
            >
              <RotateCcw size={16} />
            </button>
            <label>
              {t('Time speed', 'سرعة الزمن')}
              <select value={speed} onChange={(e) => setSpeed(+e.target.value)}>
                {[1, 10, 30, 100, 365].map((v) => (
                  <option key={v} value={v}>
                    {v} {t('days / sec', 'يوم / ث')}
                  </option>
                ))}
              </select>
            </label>
            <span className="sim-elapsed">
              + {Math.floor(days).toLocaleString()} {t('simulated days', 'يوم محاكاة')}
            </span>
          </div>
          <p className="solar-scale-note">
            {t(
              'Circular coplanar orbits · arbitrary initial phases · sizes and distances not to scale · relative orbital periods preserved',
              'مدارات دائرية في مستوى واحد · أطوار ابتدائية اعتباطية · الأحجام والمسافات غير حقيقية · الفترات المدارية النسبية محفوظة',
            )}
          </p>
        </section>
        <aside className="planet-profile panel">
          <div className="planet-profile-image">
            {selected === 5 ? (
              <img
                src="/images/saturn.webp"
                alt={t('Natural-color Cassini image of Saturn', 'صورة كاسيني الطبيعية لزحل')}
              />
            ) : (
              <div
                className="illustrative-planet"
                style={{ '--planet-color': planet.color } as React.CSSProperties}
              />
            )}
            <span>
              {selected === 5
                ? mediaRegistry.saturn.credit
                : t('ILLUSTRATIVE MODEL', 'نموذج توضيحي')}
            </span>
          </div>
          <div className="planet-profile-body">
            <span className="eyebrow">{planet.type[lang]}</span>
            <h2>{planet[lang]}</h2>
            <p>{planet.atmosphere[lang]}</p>
            <div className="planet-facts">
              <div>
                <span>{t('Mean radius', 'متوسط نصف القطر')}</span>
                <strong dir="ltr">{planet.radius.toLocaleString()} km</strong>
              </div>
              <div>
                <span>{t('Sidereal orbital period', 'الدورة المدارية النجمية')}</span>
                <strong dir="ltr">{planet.period.toLocaleString()} d</strong>
              </div>
              <div>
                <span>{t('Orbital distance', 'المسافة المدارية')}</span>
                <strong dir="ltr">{planet.au} AU</strong>
              </div>
              <div>
                <span>{t('Gravity', 'الجاذبية')}</span>
                <strong dir="ltr">{planet.gravity} m/s²</strong>
              </div>
            </div>
            <a
              href={`https://nssdc.gsfc.nasa.gov/planetary/factsheet/${planet.id}fact.html`}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {t('Explore the NASA facts', 'استكشف حقائق ناسا')}
              <ExternalLink size={13} />
            </a>
            <p className="data-note">
              {t(
                'Rounded reference values. Gravity includes rotation at the equator; giant-planet values refer to the 1-bar level.',
                'قيم مرجعية مقربة. تشمل الجاذبية الدوران عند الاستواء؛ وقيم العمالقة عند مستوى 1 بار.',
              )}
            </p>
          </div>
        </aside>
      </div>
      <div className="planet-selector">
        {planets.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setSelected(i)}
            className={selected === i ? 'active' : ''}
          >
            <span style={{ background: p.color }} />
            {p[lang]}
          </button>
        ))}
      </div>
    </>
  );
}
function PlanetComparison() {
  const { t, lang } = useApp();
  const [first, setFirst] = useState(2),
    [second, setSecond] = useState(5);
  const a = planets[first],
    b = planets[second];
  const rows = [
    ['Mean radius', 'متوسط نصف القطر', 'radius', 'km'],
    ['Mass', 'الكتلة', 'mass', '× 10²⁴ kg'],
    ['Reference gravity', 'الجاذبية المرجعية', 'gravity', 'm/s²'],
    ['Reference temperature', 'الحرارة المرجعية', 'temperature', '°C'],
    ['Sidereal rotation', 'الدوران النجمي', 'rotation', 'h'],
    ['Sidereal orbital period', 'الدورة المدارية النجمية', 'period', 'd'],
    ['Semimajor axis (approx.)', 'نصف المحور الأكبر تقريبيًا', 'au', 'AU'],
  ];
  return (
    <section className="planet-comparison panel">
      <SectionHeading
        title={t('Different worlds. One clear comparison.', 'عوالم مختلفة ومقارنة واضحة.')}
        sub={t(
          'Select any two planets and compare their physical properties.',
          'اختر كوكبين وقارن خصائصهما الفيزيائية.',
        )}
      />
      <div className="comparison-selects">
        {[
          [first, setFirst],
          [second, setSecond],
        ].map(([v, set]: any, i) => (
          <label key={i}>
            <span>
              {t(i ? 'SECOND WORLD' : 'FIRST WORLD', i ? 'العالم الثاني' : 'العالم الأول')}
            </span>
            <select value={v} onChange={(e) => set(+e.target.value)}>
              {planets.map((p, j) => (
                <option key={p.id} value={j}>
                  {p[lang]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="comparison-worlds">
        {[a, b].map((p, i) => (
          <div key={i}>
            <div
              className="illustrative-planet"
              style={
                {
                  '--planet-color': p.color,
                  width: 100 + Math.log10(p.radius / 2440) * 45,
                  height: 100 + Math.log10(p.radius / 2440) * 45,
                } as React.CSSProperties
              }
            />
            <h2>{p[lang]}</h2>
            <p>{p.type[lang]}</p>
          </div>
        ))}
      </div>
      <div className="comparison-table">
        {rows.map(([en, ar, key, unit]) => (
          <div key={key}>
            <strong dir="ltr">
              {String((a as any)[key])} <span>{unit}</span>
            </strong>
            <span>{t(en, ar)}</span>
            <strong dir="ltr">
              {String((b as any)[key])} <span>{unit}</span>
            </strong>
          </div>
        ))}
        <div>
          <strong>{a.atmosphere[lang]}</strong>
          <span>{t('Atmosphere', 'الغلاف الجوي')}</span>
          <strong>{b.atmosphere[lang]}</strong>
        </div>
      </div>
      <Banner>
        {t(
          'Values are rounded; orbital periods are sidereal. Negative rotation denotes retrograde rotation. Gravity is equatorial effective acceleration, including rotation. Giant-planet rotation is reference-dependent. Giant-planet temperatures are at a pressure near 1 bar, not a solid surface. Planet symbols are not to scale.',
          'القيم مقربة والفترات المدارية نجمية. الجاذبية تسارع فعّال عند الاستواء يشمل الدوران. يشير الدوران السالب إلى التراجع. يعتمد دوران العملاق على المرجع، وتقاس حرارته قرب ضغط بار واحد لا على سطح صلب. الرموز ليست بمقياس حقيقي.',
        )}
      </Banner>
      <div className="source-inline">
        <a
          href={`https://nssdc.gsfc.nasa.gov/planetary/factsheet/${a.id}fact.html`}
          target="_blank"
          rel="noreferrer"
        >
          NASA · {a.en}
          <ExternalLink size={12} />
        </a>
        <a
          href={`https://nssdc.gsfc.nasa.gov/planetary/factsheet/${b.id}fact.html`}
          target="_blank"
          rel="noreferrer"
        >
          NASA · {b.en}
          <ExternalLink size={12} />
        </a>
        <a
          href="https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/"
          target="_blank"
          rel="noreferrer"
        >
          [2] {t('NASA temperature reference', 'مرجع الحرارة من ناسا')}
          <ExternalLink size={12} />
        </a>
      </div>
    </section>
  );
}
function MoonPhases() {
  const { t } = useApp();
  const [day, setDay] = useState(8);
  const fraction = day / 29.53059;
  const angle = 2 * Math.PI * fraction;
  const illuminated = (1 - Math.cos(angle)) / 2;
  const names = [
    t('New Moon', 'المحاق'),
    t('Waxing crescent', 'الهلال المتزايد'),
    t('First quarter', 'التربيع الأول'),
    t('Waxing gibbous', 'الأحدب المتزايد'),
    t('Full Moon', 'البدر'),
    t('Waning gibbous', 'الأحدب المتناقص'),
    t('Last quarter', 'التربيع الأخير'),
    t('Waning crescent', 'الهلال المتناقص'),
  ];
  const phase = Math.round(fraction * 8) % 8;
  const r = 100,
    cx = 160,
    cy = 145;
  const terminator = Math.abs(Math.cos(angle)) * r;
  const waxing = fraction < 0.5;
  const gibbous = illuminated >= 0.5;
  const right = waxing;
  const d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${right ? 1 : 0} ${cx} ${cy + r} A ${terminator} ${r} 0 0 ${right ? (gibbous ? 1 : 0) : gibbous ? 0 : 1} ${cx} ${cy - r} Z`;
  return (
    <div className="moon-lab panel">
      <div className="moon-display">
        <svg
          viewBox="0 0 320 310"
          role="img"
          aria-label={`${names[phase]} · ${Math.round(illuminated * 100)}%`}
        >
          <defs>
            <clipPath id="moon-disc">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
            <clipPath id="moon-lit">
              <path d={d} />
            </clipPath>
          </defs>
          <circle cx={cx} cy={cy} r={r + 12} stroke="#37354d" fill="none" />
          <image
            href="/images/moon.webp"
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            clipPath="url(#moon-disc)"
            opacity=".14"
          />
          {illuminated > 0.001 && (
            <image
              href="/images/moon.webp"
              x={cx - r}
              y={cy - r}
              width={r * 2}
              height={r * 2}
              clipPath="url(#moon-lit)"
            />
          )}
          <text x="160" y="285" fill="#a69abf" fontSize="12" textAnchor="middle">
            {t('EDUCATIONAL PHASE MODEL', 'نموذج تعليمي للأطوار')}
          </text>
        </svg>
      </div>
      <div className="moon-controls">
        <span className="eyebrow">{t('FOLLOW THE LIGHT', 'تتبّع الضوء')}</span>
        <h2>{names[phase]}</h2>
        <p>
          {t(
            'The Sun always illuminates approximately half the Moon. The phase describes how much of that illuminated half we see from Earth.',
            'تضيء الشمس نصف القمر تقريبًا دائمًا. يصف الطور مقدار ما نراه من هذا النصف المضاء من الأرض.',
          )}
        </p>
        <div className="moon-stats">
          <div>
            <strong>
              {Math.round(illuminated * 100)}
              <span>%</span>
            </strong>
            <small>{t('illuminated fraction', 'الجزء المضاء المرئي')}</small>
          </div>
          <div>
            <strong>
              {day.toFixed(1)}
              <span>{t('d', 'يوم')}</span>
            </strong>
            <small>{t('since model new moon', 'من محاق النموذج')}</small>
          </div>
        </div>
        <label className="range-label">
          {t('Move through a lunar month', 'تحرك عبر الشهر القمري')}
          <input
            type="range"
            min="0"
            max="29.53"
            step=".1"
            value={day}
            onChange={(e) => setDay(+e.target.value)}
          />
        </label>
        <p className="data-note">
          {t(
            'Approximate synodic period: 29.53 days. This interactive cycle is not today’s phase prediction. Orientation is simplified; location and libration are not modeled.',
            'الدورة الاقترانية التقريبية 29.53 يومًا. ليست المحاكاة تنبؤًا بطور اليوم. الاتجاه مبسط ولا يُنمذج الموقع أو الترنح.',
          )}
        </p>
        <a
          className="text-link"
          href="https://science.nasa.gov/moon/moon-phases/"
          target="_blank"
          rel="noreferrer"
        >
          {t('NASA · Moon phases', 'ناسا · أطوار القمر')}
          <ExternalLink size={13} />
        </a>
        <p className="data-note">
          {mediaRegistry.moon.credit} ·{' '}
          <a href={mediaRegistry.moon.source} target="_blank" rel="noreferrer">
            {t(
              'Terrain-based visualization, not a current photograph',
              'تصور قائم على التضاريس لا صورة فوتوغرافية حالية',
            )}
          </a>
        </p>
      </div>
    </div>
  );
}
function Constellations() {
  const { t } = useApp();
  const [selected, setSelected] = useState('orion');
  const [lines, setLines] = useState(true);
  const [filter, setFilter] = useState('');
  const orion = [
    [180, 70],
    [380, 80],
    [245, 155],
    [285, 165],
    [325, 175],
    [220, 265],
    [390, 280],
    [290, 210],
  ];
  const dipper = [
    [110, 120],
    [170, 150],
    [240, 155],
    [310, 180],
    [390, 140],
    [450, 200],
    [350, 245],
  ];
  const points = selected === 'orion' ? orion : dipper;
  const edges =
    selected === 'orion'
      ? [
          [0, 1],
          [0, 2],
          [1, 4],
          [2, 3],
          [3, 4],
          [2, 5],
          [4, 6],
          [5, 6],
          [3, 7],
        ]
      : [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 3],
        ];
  const stars = [
    ['Sirius', 'الشعرى اليمانية', 'Canis Major', 'الكلب الأكبر', '−1.46', '8.6'],
    ['Proxima Centauri', 'بروكسيما قنطورس', 'Centaurus', 'قنطورس', '11.1', '4.25'],
    ['Vega', 'النسر الواقع', 'Lyra', 'القيثارة', '0.03', '25'],
    ['Altair', 'النسر الطائر', 'Aquila', 'العقاب', '0.77', '16.7'],
    [
      'Betelgeuse',
      'منكب الجوزاء',
      'Orion',
      'الجبار',
      t('Variable', 'متغير'),
      t('Uncertain; several hundred', 'غير يقيني؛ مئات'),
    ],
  ];
  return (
    <>
      <div className="constellation-layout">
        <section className="constellation-map">
          <div className="card-topline">
            <h2>
              {selected === 'orion'
                ? t('Orion', 'الجبار')
                : t('The Big Dipper asterism', 'مجموعة الدب الأكبر النجمية')}
            </h2>
            <button className="subtle-button" onClick={() => setLines((v) => !v)}>
              {t(
                lines ? 'Hide connections' : 'Show connections',
                lines ? 'إخفاء الخطوط' : 'إظهار الخطوط',
              )}
            </button>
          </div>
          <svg
            viewBox="0 0 600 340"
            role="img"
            aria-label={
              selected === 'orion'
                ? t('Illustrative Orion pattern', 'نمط الجبار التوضيحي')
                : t('Illustrative Big Dipper pattern', 'نمط الدب الأكبر التوضيحي')
            }
          >
            {Array.from({ length: 90 }, (_, i) => (
              <circle
                key={i}
                cx={(i * 79 + 12) % 600}
                cy={(i * 43 + 7) % 340}
                r={0.6}
                fill="#a9b9df"
                opacity=".4"
              />
            ))}
            {lines &&
              edges.map(([a, b], i) => (
                <line
                  key={i}
                  x1={points[a][0]}
                  y1={points[a][1]}
                  x2={points[b][0]}
                  y2={points[b][1]}
                  stroke="#9281ce"
                  opacity=".65"
                />
              ))}
            {points.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="12" fill="#c7b9ff" opacity=".05" />
                <circle
                  cx={x}
                  cy={y}
                  r={i % 3 === 0 ? 4 : 2.5}
                  fill={selected === 'orion' && i === 0 ? '#e9b182' : '#d4ddff'}
                />
                {selected === 'orion' && [0, 6].includes(i) && (
                  <text x={x + 14} y={y - 10} fill="#b9c3dc" fontSize="12">
                    {i === 0 ? t('Betelgeuse', 'منكب الجوزاء') : t('Rigel', 'رجل الجبار')}
                  </text>
                )}
              </g>
            ))}
          </svg>
          <p>
            {t(
              'Schematic pattern; not a position-accurate sky chart. Connected stars need not be physically close.',
              'نمط توضيحي لا خريطة دقيقة المواقع. لا يلزم تقارب النجوم الموصولة فيزيائيًا.',
            )}
          </p>
        </section>
        <aside className="panel constellation-info">
          <Field label={t('Explore a pattern', 'استكشف نمطًا')}>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="orion">{t('Orion constellation', 'كوكبة الجبار')}</option>
              <option value="dipper">{t('Big Dipper asterism', 'مجموعة الدب الأكبر')}</option>
            </select>
          </Field>
          <h3>{t('Patterns are a starting point.', 'الأنماط نقطة بداية.')}</h3>
          <p>
            {t(
              'There are 88 officially defined constellations. An asterism is a familiar pattern, which may form only part of a constellation or cross its boundaries.',
              'توجد 88 كوكبة محددة رسميًا. والمجموعة النجمية نمط مألوف قد يمثل جزءًا من كوكبة أو يعبر حدودها.',
            )}
          </p>
          <p>
            {t(
              'The Big Dipper is an asterism within Ursa Major. Orion is an official constellation with a recognizable belt.',
              'مجموعة المغرفة جزء من كوكبة الدب الأكبر. والجبار كوكبة رسمية ذات حزام واضح.',
            )}
          </p>
          <a
            className="text-link"
            href="https://science.nasa.gov/universe/stars/"
            target="_blank"
            rel="noreferrer"
          >
            NASA · Stars
            <ExternalLink size={13} />
          </a>
        </aside>
      </div>
      <section className="panel star-catalog">
        <div className="section-heading">
          <div>
            <h2>{t('A pocket star catalog', 'فهرس نجمي مصغر')}</h2>
            <p>
              {t(
                'Rounded educational reference values; apparent visual magnitudes may vary.',
                'قيم مرجعية تعليمية مقربة؛ قد تتغير الأقدار البصرية الظاهرية.',
              )}
            </p>
          </div>
          <label className="search-box">
            <Search size={16} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('Find a star…', 'ابحث عن نجم…')}
              aria-label={t('Search star catalog', 'بحث الفهرس النجمي')}
            />
          </label>
        </div>
        <table>
          <thead>
            <tr>
              {[
                t('Star', 'النجم'),
                t('Constellation', 'الكوكبة'),
                t('Visual magnitude', 'القدر البصري'),
                t('Distance (ly)', 'المسافة (سنة ضوئية)'),
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stars
              .filter((s) => s.join(' ').toLowerCase().includes(filter.toLowerCase()))
              .map((s) => (
                <tr key={s[0]}>
                  <td>
                    <Star size={13} />
                    {t(s[0], s[1])}
                  </td>
                  <td>{t(s[2], s[3])}</td>
                  <td>{s[4]}</td>
                  <td>{s[5]}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <a
          className="source-note"
          href="https://openstax.org/books/astronomy-2e/pages/18-1-a-stellar-census"
          target="_blank"
          rel="noreferrer"
        >
          {t(
            'Reference: OpenStax Astronomy 2e · A Stellar Census',
            'المرجع: OpenStax Astronomy 2e · تعداد النجوم',
          )}
          <ExternalLink size={12} />
        </a>
      </section>
    </>
  );
}
function GalaxyExplorer() {
  const { t } = useApp();
  const [type, setType] = useState('spiral');
  return (
    <div className="galaxy-lab panel">
      <div className="galaxy-display">
        <svg
          viewBox="0 0 420 320"
          aria-label={t('Illustrative galaxy morphology', 'توضيح شكل المجرات')}
          role="img"
        >
          <defs>
            <radialGradient id="galaxy-glow">
              <stop stopColor="#f8e4b4" stopOpacity=".95" />
              <stop offset=".18" stopColor="#dfc0d8" stopOpacity=".8" />
              <stop offset=".6" stopColor="#9488be" stopOpacity=".3" />
              <stop offset="1" stopColor="#79679c" stopOpacity="0" />
            </radialGradient>
          </defs>
          {type === 'elliptical' ? (
            <ellipse cx="210" cy="160" rx="160" ry="105" fill="url(#galaxy-glow)" />
          ) : type === 'spiral' ? (
            <g transform="translate(210 160) rotate(-20) scale(1 .65)">
              <circle r="150" fill="url(#galaxy-glow)" />
              {[0, 180].map((rot) => (
                <path
                  key={rot}
                  transform={`rotate(${rot})`}
                  d="M0 0 C70 -70 160 -30 130 75 C90 180 -100 190 -160 30"
                  fill="none"
                  stroke="#b6a7e0"
                  strokeWidth="14"
                  opacity=".4"
                />
              ))}
              <ellipse rx="45" ry="15" fill="#e7c999" opacity=".7" />
            </g>
          ) : (
            <g>
              {Array.from({ length: 60 }, (_, i) => (
                <circle
                  key={i}
                  cx={130 + ((i * 17) % 180)}
                  cy={80 + ((i * 13) % 160)}
                  r={8 + (i % 8)}
                  fill={i % 3 === 0 ? '#c4a5eb' : '#7d91cb'}
                  opacity=".25"
                />
              ))}
            </g>
          )}
        </svg>
        <span>
          {t('ARTISTIC EDUCATIONAL DIAGRAM · NOT AN OBSERVATION', 'رسم تعليمي فني · ليس رصدًا')}
        </span>
      </div>
      <div>
        <span className="eyebrow">{t('ISLANDS OF STARS', 'جزر النجوم')}</span>
        <h2>{t('Every galaxy has a shape—and a story.', 'لكل مجرة شكل وقصة.')}</h2>
        <div className="segmented">
          {[
            ['spiral', 'Spiral', 'حلزونية'],
            ['elliptical', 'Elliptical', 'إهليلجية'],
            ['irregular', 'Irregular', 'غير منتظمة'],
          ].map(([key, en, ar]) => (
            <button className={type === key ? 'active' : ''} key={key} onClick={() => setType(key)}>
              {t(en, ar)}
            </button>
          ))}
        </div>
        <p>
          {type === 'spiral'
            ? t(
                'Spiral galaxies contain a flattened disk, a central bulge, and spiral structure. Many, including the Milky Way, have a central bar. Spiral arms are not rigid spokes rotating as one solid object.',
                'تحتوي المجرات الحلزونية قرصًا مفلطحًا وانتفاخًا مركزيًا وبنية حلزونية. ولكثير منها، مثل درب التبانة، قضيب مركزي. ليست الأذرع قضبانًا صلبة تدور كوحدة واحدة.',
              )
            : type === 'elliptical'
              ? t(
                  'Elliptical galaxies have smooth, roughly ellipsoidal light distributions. Many are dominated by older stellar populations, though real systems are diverse. Their appearance alone does not reveal their complete formation history.',
                  'للمجرات الإهليلجية توزيع ضوء أملس شبه إهليلجي. تهيمن على كثير منها نجوم أقدم، لكن الأنظمة متنوعة. لا يكشف المظهر وحده تاريخ التكوّن الكامل.',
                )
              : t(
                  'Irregular galaxies lack a simple spiral or elliptical form. Interactions, gas, and active star formation can contribute to their asymmetric appearances.',
                  'تفتقر المجرات غير المنتظمة إلى شكل حلزوني أو إهليلجي بسيط. قد تسهم التفاعلات والغاز وتكوّن النجوم في عدم تناظرها.',
                )}
        </p>
        <a
          className="text-link"
          href="https://science.nasa.gov/universe/galaxies/"
          target="_blank"
          rel="noreferrer"
        >
          {t('NASA · Galaxies', 'ناسا · المجرات')}
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
function GravityLab() {
  const { t } = useApp();
  const [mass, setMass] = useState(10);
  return (
    <div className="gravity-lab panel">
      <div
        className="blackhole-illustration"
        role="img"
        aria-label={t(
          'Stylized black hole illustration, not an observation',
          'رسم توضيحي لثقب أسود وليس رصدًا',
        )}
      >
        <div className="blackhole-ring" />
        <div className="blackhole-core" />
        <span>{t('EDUCATIONAL ILLUSTRATION', 'رسم توضيحي تعليمي')}</span>
      </div>
      <div>
        <span className="eyebrow">{t('AT THE EDGE OF ESCAPE', 'على حافة الإفلات')}</span>
        <h2>{t('The event horizon', 'أفق الحدث')}</h2>
        <p>
          {t(
            'For a non-rotating, uncharged black hole, the Schwarzschild radius is rₛ = 2GM/c². It grows in direct proportion to mass. This boundary is not a solid surface.',
            'للثقب غير الدوار وغير المشحون، نصف قطر شفارتزشيلد rₛ = 2GM/c²، ويتناسب طرديًا مع الكتلة. ليس هذا الحد سطحًا صلبًا.',
          )}
        </p>
        <div className="gravity-value">
          <strong>
            {(2.953 * mass).toFixed(1)}
            <span>km</span>
          </strong>
          <small>{t('Schwarzschild radius', 'نصف قطر شفارتزشيلد')}</small>
        </div>
        <label className="range-label">
          {mass} {t('solar masses', 'كتلة شمسية')}
          <input
            type="range"
            min="3"
            max="100"
            value={mass}
            onChange={(e) => setMass(+e.target.value)}
          />
        </label>
        <p className="data-note">
          {t(
            'Idealized model; rotation changes the horizon geometry. Hawking radiation is a theoretical prediction not yet detected from astrophysical black holes.',
            'نموذج مثالي؛ يغير الدوران هندسة الأفق. إشعاع هوكينغ تنبؤ نظري لم يُكتشف من الثقوب السوداء الفلكية.',
          )}
        </p>
        <a
          className="text-link"
          href="https://science.nasa.gov/universe/black-holes/"
          target="_blank"
          rel="noreferrer"
        >
          NASA · Black Holes
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
const gallery = Object.entries(mediaRegistry).map(([image, im]) => ({
  image,
  en: im.titleEn,
  ar: im.titleAr,
  subEn: im.captionEn,
  subAr: im.captionAr,
  credit: im.credit,
  source: im.source,
  kind: im.kind,
  altEn: im.altEn,
  altAr: im.altAr,
}));
function ImageGallery() {
  const { t } = useApp();
  const [selected, setSelected] = useState<(typeof gallery)[number] | null>(null);
  return (
    <>
      <Banner>
        {t(
          'An attributed, locally cached archive of real scientific image products. This is not a live daily-image feed.',
          'أرشيف محلي موثق لمنتجات صور علمية حقيقية، وليس موجز صور يومية حيًا.',
        )}
      </Banner>
      <div className="image-gallery">
        {gallery.map((im) => (
          <button key={im.image} onClick={() => setSelected(im)} className="gallery-card panel">
            <div>
              <img src={`/images/${im.image}.webp`} alt={t(im.altEn, im.altAr)} loading="lazy" />
              <span>
                <Maximize size={18} />
              </span>
            </div>
            <h3>{t(im.en, im.ar)}</h3>
            <Pill tone="muted">
              {im.kind === 'ILLUSTRATION'
                ? t('Data-based visualization', 'تصور مبني على بيانات')
                : t('Scientific observation', 'رصد علمي')}
            </Pill>
            <p>{t(im.subEn, im.subAr)}</p>
            <small>{im.credit}</small>
          </button>
        ))}
      </div>
      {selected && (
        <Modal title={t(selected.en, selected.ar)} onClose={() => setSelected(null)} wide>
          <figure className="science-figure">
            <img src={`/images/${selected.image}.webp`} alt={t(selected.altEn, selected.altAr)} />
            <figcaption>
              <strong>{t(selected.subEn, selected.subAr)}</strong>
              <p>
                {t('Source credit', 'حقوق المصدر')}: {selected.credit}
              </p>
            </figcaption>
          </figure>
          <a className="text-link" href={selected.source} target="_blank" rel="noreferrer">
            {t('View full scientific image notes', 'اعرض وصف الصورة العلمي الكامل')}
            <ExternalLink size={14} />
          </a>
        </Modal>
      )}
    </>
  );
}
