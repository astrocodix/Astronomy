import { createHash } from 'node:crypto';
import { concepts } from './concepts';
import { L, type Localized } from './curriculum';
export type SeedQuestion = {
  id: string;
  moduleId: string;
  lessonId: string;
  concept: string;
  type: string;
  difficulty: string;
  promptEn: string;
  promptAr: string;
  explanationEn: string;
  explanationAr: string;
  answer: any;
  data: any;
  options: { id: string; textEn: string; textAr: string; order: number }[];
};
const optionId = (questionId: string, index: number) =>
  'o-' + createHash('sha256').update(`${questionId}:option:${index}:v2`).digest('hex').slice(0, 20);
const level = (n: number) => (n % 10 < 3 ? 'BEGINNER' : n % 10 < 7 ? 'INTERMEDIATE' : 'ADVANCED');
function base(m: number, index: number, type: string, p: Localized, e: Localized): SeedQuestion {
  const id = `q-${m}-${type.toLowerCase()}-${index}`;
  return {
    id,
    moduleId: `m-1-${m}`,
    lessonId: `l-${m}-${index < 12 ? 1 : 2}`,
    concept: `concept-${m}-${index}`,
    type,
    difficulty: level(index),
    promptEn: p.en,
    promptAr: p.ar,
    explanationEn: e.en,
    explanationAr: e.ar,
    answer: {},
    data: {},
    options: [],
  };
}
function choices(q: SeedQuestion, labels: Localized[], correct: number) {
  q.options = labels.map((x, i) => ({
    id: optionId(q.id, i),
    textEn: x.en,
    textAr: x.ar,
    order: i,
  }));
  q.answer = { kind: 'choice', correct: q.options[correct].id };
  return q;
}
export function buildQuestions(): SeedQuestion[] {
  const result: SeedQuestion[] = [];
  for (const [mk, terms] of Object.entries(concepts)) {
    const m = Number(mk);
    for (let i = 0; i < terms.length; i++) {
      const t = terms[i];
      const lower = i < 12 ? 0 : 12;
      const group = terms.slice(lower, i < 12 ? 12 : 25);
      const ix = i - lower;
      const e = L(
        `${t.term.en}: ${t.definition.en} Review the explanation and glossary in the linked lesson.`,
        `${t.term.ar}: ${t.definition.ar} راجع الشرح والمصطلحات في الدرس المرتبط.`,
      );
      const alternatives = [t, ...[3, 5, 7].map((n) => group[(ix + n) % group.length])];
      result.push(
        choices(
          base(
            m,
            i,
            'MCQ',
            L(
              `Which concept best matches this definition?\n${t.definition.en}`,
              `ما المفهوم الذي يطابق هذا التعريف؟\n${t.definition.ar}`,
            ),
            e,
          ),
          alternatives.map((x) => x.term),
          0,
        ),
      );
      const truth = i % 2 === 0;
      const def = truth ? t.definition : group[(ix + 1) % group.length].definition;
      result.push(
        choices(
          base(
            m,
            i,
            'TRUE_FALSE',
            L(
              `Evaluate this statement: “${t.term.en}” means: ${def.en}`,
              `قيّم العبارة: «${t.term.ar}» تعني: ${def.ar}`,
            ),
            e,
          ),
          [L('True', 'صحيح'), L('False', 'خطأ')],
          truth ? 0 : 1,
        ),
      );
      const fill = base(
        m,
        i,
        'FILL',
        L(
          `Supply the scientific term (English or Arabic):\n${t.definition.en}`,
          `اكتب المصطلح العلمي بالعربية أو الإنجليزية:\n${t.definition.ar}`,
        ),
        e,
      );
      fill.answer = { kind: 'text', accepted: [t.term.en, t.term.ar] };
      result.push(fill);
      const match = base(
        m,
        i,
        'MATCH',
        L('Match each concept to its correct definition.', 'صِل كل مفهوم بتعريفه الصحيح.'),
        e,
      );
      const mt = [t, group[(ix + 3) % group.length], group[(ix + 6) % group.length]];
      match.options = mt.map((x, j) => ({
        id: optionId(match.id, j),
        textEn: x.definition.en,
        textAr: x.definition.ar,
        order: j,
      }));
      match.data = { rows: mt.map((x, j) => ({ id: `r${j}`, en: x.term.en, ar: x.term.ar })) };
      match.answer = {
        kind: 'match',
        correct: Object.fromEntries(mt.map((_, j) => [`r${j}`, optionId(match.id, j)])),
      };
      match.explanationEn = mt.map((x) => `${x.term.en}: ${x.definition.en}`).join('\n\n');
      match.explanationAr = mt.map((x) => `${x.term.ar}: ${x.definition.ar}`).join('\n\n');
      result.push(match);
    }
    result.push(...applied(m));
  }
  return result;
}
const situations: Record<
  number,
  {
    prompt: Localized;
    options: Localized[];
    explanation: Localized;
    number: [Localized, number, number, Localized];
    advanced: [Localized, number, number, Localized];
    order: Localized[];
    multi: Localized[];
    reason: [Localized, string[][], Localized];
  }
> = {
  1: {
    prompt: L(
      'Two points in a constellation look close together. What can you conclude from this alone?',
      'تبدو نقطتان في كوكبة متقاربتين. ماذا تستنتج من ذلك وحده؟',
    ),
    options: [
      L(
        'Their angular separation is small; their physical separation is unknown.',
        'فصلهما الزاوي صغير، ولا نعرف فصلهما الحقيقي.',
      ),
      L('They are gravitationally bound.', 'إنهما مرتبطان بالجاذبية.'),
      L('They are at the same distance.', 'إنهما على المسافة نفسها.'),
      L('They have identical luminosity.', 'لهما الضياء نفسه.'),
    ],
    explanation: L(
      'Projection on the sky does not give depth. Distance measurements are needed to infer physical separation.',
      'لا يعطي الإسقاط على السماء العمق. نحتاج إلى قياس المسافة لاستنتاج الفصل الحقيقي.',
    ),
    number: [
      L(
        'How many arcminutes are in 2 degrees? Enter the number in arcminutes.',
        'كم دقيقة قوسية في درجتين؟ اكتب العدد بالدقائق القوسية.',
      ),
      120,
      0,
      L(
        'Each degree contains 60 arcminutes: 2 × 60 = 120.',
        'تضم الدرجة 60 دقيقة قوسية: 2 × 60 = 120.',
      ),
    ],
    advanced: [
      L(
        'For a small angle θ = 0.002 rad and distance d = 5,000 km, estimate D = dθ. Answer in km.',
        'لزاوية صغيرة 0.002 راديان ومسافة 5000 كم، قدّر D = dθ بالكيلومتر.',
      ),
      10,
      0.01,
      L(
        '5,000 km × 0.002 = 10 km. This uses the small-angle approximation.',
        '5000 كم × 0.002 = 10 كم بتقريب الزاوية الصغيرة.',
      ),
    ],
    order: [
      L('Earth', 'الأرض'),
      L('Solar system', 'النظام الشمسي'),
      L('Milky Way', 'درب التبانة'),
      L('Local Group', 'المجموعة المحلية'),
    ],
    multi: [
      L('Astronomy compares explanations with evidence.', 'يقارن علم الفلك التفسيرات بالأدلة.'),
      L('A solar system is smaller than its host galaxy.', 'النظام الشمسي أصغر من مجرته المضيفة.'),
      L('Every bright point is a nearby planet.', 'كل نقطة ساطعة كوكب قريب.'),
      L('A constellation must be physically bound.', 'يجب أن تكون الكوكبة مرتبطة فيزيائيًا.'),
    ],
    reason: [
      L(
        'Why does a small apparent separation not establish a small physical separation? Mention distance or depth.',
        'لماذا لا يثبت الفصل الظاهري الصغير فصلًا حقيقيًا صغيرًا؟ اذكر المسافة أو العمق.',
      ),
      [['distance', 'depth', 'مساف', 'عمق']],
      L(
        'The sky projects three-dimensional space onto angular directions. Depth or distance must be measured separately.',
        'تسقط السماء الفضاء ثلاثي الأبعاد على اتجاهات زاوية. يجب قياس العمق أو المسافة منفصلًا.',
      ),
    ],
  },
  2: {
    prompt: L(
      'A star looks red in a photograph. Which conclusion is justified?',
      'يبدو نجم أحمر في صورة. أي استنتاج مبرر؟',
    ),
    options: [
      L(
        'Temperature, dust, and image processing must be checked before inferring motion.',
        'يجب فحص الحرارة والغبار ومعالجة الصورة قبل استنتاج الحركة.',
      ),
      L('It must be moving away at high speed.', 'لا بد أنه يبتعد بسرعة عالية.'),
      L('It contains only hydrogen.', 'يحتوي الهيدروجين فقط.'),
      L('It is necessarily farther than every blue star.', 'هو بالضرورة أبعد من كل نجم أزرق.'),
    ],
    explanation: L(
      'Redshift is a measured spectral-line displacement, not simply a red appearance.',
      'الانزياح الأحمر إزاحة مقاسة لخطوط طيفية، لا مجرد مظهر أحمر.',
    ),
    number: [
      L(
        'A spectral line moves from 600.0 nm to 600.6 nm. Find z = Δλ/λ₀ as a decimal.',
        'انتقل خط من 600.0 إلى 600.6 نانومتر. احسب z = Δλ/λ₀ كعدد عشري.',
      ),
      0.001,
      0.00001,
      L(
        'Δλ = 0.6 nm. z = 0.6/600 = 0.001. The ratio has no units.',
        'Δλ = 0.6 نانومتر. z = 0.6/600 = 0.001 بلا وحدة.',
      ),
    ],
    advanced: [
      L(
        'Using z = 0.002 and c = 300,000 km/s, estimate radial speed in the small-speed Doppler approximation. Enter km/s.',
        'باستخدام z = 0.002 وc = 300000 كم/ث، قدّر السرعة الشعاعية بتقريب دوبلر البطيء. اكتب كم/ث.',
      ),
      600,
      1,
      L('v ≈ zc = 0.002 × 300,000 = 600 km/s.', 'v ≈ zc = 0.002 × 300000 = 600 كم/ث.'),
    ],
    order: [
      L('Radio: longest wavelengths here', 'الراديو: أطول الموجات هنا'),
      L('Infrared', 'تحت الحمراء'),
      L('Visible', 'المرئي'),
      L('X-ray: shortest wavelengths here', 'السينية: أقصر الموجات هنا'),
    ],
    multi: [
      L('Spectral lines can constrain composition.', 'يمكن للخطوط الطيفية تقييد التركيب.'),
      L('A light curve records brightness over time.', 'يسجل المنحنى الضوئي السطوع مع الزمن.'),
      L(
        'All displayed image colors are natural eye colors.',
        'كل ألوان الصور كما تراها العين طبيعيًا.',
      ),
      L('Flux and luminosity are identical quantities.', 'التدفق والضياء كميتان متطابقتان.'),
    ],
    reason: [
      L(
        'Why is a single brightness measurement insufficient to determine distance? Mention luminosity or dust.',
        'لماذا لا يكفي قياس سطوع واحد لتحديد المسافة؟ اذكر الضياء أو الغبار.',
      ),
      [['luminosity', 'dust', 'intrinsic', 'ضياء', 'غبار', 'ذاتي']],
      L(
        'Observed flux depends on intrinsic luminosity, distance, and possible extinction.',
        'يعتمد التدفق على الضياء الذاتي والمسافة والإخماد المحتمل.',
      ),
    ],
  },
  3: {
    prompt: L(
      'Why did Jupiter’s moons matter for early telescopic astronomy?',
      'لماذا كانت أقمار المشتري مهمة للفلك التلسكوبي المبكر؟',
    ),
    options: [
      L(
        'They demonstrated that some celestial bodies orbit a center other than Earth.',
        'أظهرت أن بعض الأجرام تدور حول مركز غير الأرض.',
      ),
      L('They proved that galaxies do not exist.', 'أثبتت عدم وجود المجرات.'),
      L('They established the exact age of the universe.', 'حددت عمر الكون بدقة.'),
      L('They showed gravity is absent near Jupiter.', 'أظهرت غياب الجاذبية قرب المشتري.'),
    ],
    explanation: L(
      'The satellites provided a direct counterexample to the claim that every celestial body circles Earth.',
      'قدمت الأقمار مثالًا مضادًا مباشرًا لادعاء أن كل جرم سماوي يدور حول الأرض.',
    ),
    number: [
      L(
        'For a low-mass body orbiting the Sun, P² = a³ in years and AU. What is P at a = 9 AU? Answer in years.',
        'لجسم صغير يدور حول الشمس P² = a³ بالسنوات والوحدات الفلكية. ما P عند a = 9؟ اكتب السنوات.',
      ),
      27,
      0.01,
      L('a³ = 729, so P = √729 = 27 years.', 'a³ = 729، لذا P = √729 = 27 سنة.'),
    ],
    advanced: [
      L(
        'For two fixed masses, what fraction of the original Newtonian gravitational force remains if separation triples? Enter a decimal.',
        'لكتلتين ثابتتين، ما كسر قوة نيوتن الأصلية إذا تضاعفت المسافة ثلاث مرات؟ اكتب عددًا عشريًا.',
      ),
      1 / 9,
      0.002,
      L(
        'F ∝ 1/r², so the force becomes 1/3² = 1/9 ≈ 0.111.',
        'F ∝ 1/r²، فتصبح 1/3² = 1/9 ≈ 0.111.',
      ),
    ],
    order: [
      L('Al-Sufi’s tenth-century star book', 'كتاب الصوفي في القرن العاشر'),
      L('Copernicus’s sixteenth-century model', 'نموذج كوبرنيكوس في القرن السادس عشر'),
      L('Kepler’s early seventeenth-century laws', 'قوانين كبلر في أوائل القرن السابع عشر'),
      L('Newton’s seventeenth-century gravitation', 'جاذبية نيوتن في القرن السابع عشر'),
    ],
    multi: [
      L(
        'Many cultures contributed to astronomical knowledge.',
        'أسهمت ثقافات عديدة في المعرفة الفلكية.',
      ),
      L(
        'Historical observations require source criticism.',
        'تحتاج الأرصاد التاريخية إلى نقد المصادر.',
      ),
      L(
        'A useful prediction always proves a model’s physical truth.',
        'يثبت التنبؤ المفيد دائمًا صحة النموذج الفيزيائية.',
      ),
      L('Newtonian gravity is exact in every regime.', 'جاذبية نيوتن دقيقة في كل الظروف.'),
    ],
    reason: [
      L(
        'Why can Newtonian gravity remain useful after general relativity? Mention approximation or weak fields.',
        'لماذا تبقى جاذبية نيوتن مفيدة بعد النسبية العامة؟ اذكر التقريب أو الحقول الضعيفة.',
      ),
      [['approx', 'weak', 'low speed', 'تقريب', 'ضعيف', 'بطي']],
      L(
        'It is an accurate approximation for weak fields and speeds small compared with c.',
        'إنها تقريب دقيق للحقول الضعيفة والسرعات الصغيرة مقارنة بسرعة الضوء.',
      ),
    ],
  },
  4: {
    prompt: L(
      'The observable radius exceeds 13.8 billion light-years. Why is this not a local violation of c?',
      'يتجاوز نصف قطر الكون المرصود 13.8 مليار سنة ضوئية. لماذا لا يخالف ذلك سرعة الضوء محليًا؟',
    ),
    options: [
      L('Space expanded while the light traveled.', 'تمدد الفضاء أثناء انتقال الضوء.'),
      L('Photons accelerate above c in vacuum.', 'تتسارع الفوتونات فوق c في الفراغ.'),
      L('The universe has no age.', 'ليس للكون عمر.'),
      L('The horizon is a solid wall.', 'الأفق جدار صلب.'),
    ],
    explanation: L(
      'Present separation differs from light-travel time multiplied by c in an expanding cosmology.',
      'تختلف المسافة الحالية عن حاصل زمن الانتقال في c في كون متمدد.',
    ),
    number: [
      L(
        'Ignoring motion and expansion nearby, how long is a round-trip radio exchange with a star 12 light-years away? Enter years.',
        'بإهمال الحركة والتمدد القريب، كم يستغرق تبادل راديوي ذهابًا وإيابًا مع نجم على بعد 12 سنة ضوئية؟ اكتب السنوات.',
      ),
      24,
      0,
      L(
        '12 years outward plus 12 years back equals 24 years.',
        '12 سنة للذهاب و12 للإياب تساوي 24 سنة.',
      ),
    ],
    advanced: [
      L(
        'If the cosmic scale factor has grown by a factor of 4 since emission, find z using 1 + z = a(now)/a(emission).',
        'إذا نما عامل القياس بمعامل 4 منذ الإصدار، احسب z من 1 + z = a(الآن)/a(الإصدار).',
      ),
      3,
      0.001,
      L('1 + z = 4, therefore z = 3.', '1 + z = 4، لذا z = 3.'),
    ],
    order: [
      L('Hot early nuclear reactions', 'التفاعلات النووية المبكرة الساخنة'),
      L('Recombination and CMB release', 'إعادة الاتحاد وتحرر الخلفية الميكروية'),
      L('First generations of stars', 'الأجيال الأولى للنجوم'),
      L('Formation of our solar system', 'تكوّن نظامنا الشمسي'),
    ],
    multi: [
      L('The microwave background is observed.', 'الخلفية الميكروية مرصودة.'),
      L(
        'Primordial light-element abundances test early-universe models.',
        'تختبر وفرة العناصر الخفيفة البدائية نماذج الكون المبكر.',
      ),
      L('A multiverse has been directly photographed.', 'صُورت أكوان متعددة مباشرة.'),
      L('Dark matter and dark energy are the same thing.', 'المادة والطاقة المظلمتان شيء واحد.'),
    ],
    reason: [
      L(
        'Why must we distinguish the observable universe from the whole universe? Mention signals, horizon, or limits.',
        'لماذا نميز الكون المرصود عن الكون كله؟ اذكر الإشارات أو الأفق أو الحدود.',
      ),
      [['signal', 'horizon', 'limit', 'إشار', 'أفق', 'حدود', 'محدود']],
      L(
        'Our observations are limited by which signals could reach us; the total extent is not measured.',
        'تحد أرصادنا الإشارات التي أمكنها الوصول، ولم يُقَس الامتداد الكلي.',
      ),
    ],
  },
  5: {
    prompt: L(
      'An object produces a bright streak while entering Earth’s atmosphere. What is the luminous phenomenon called?',
      'ينتج جرم خطًا ساطعًا عند دخول الغلاف الجوي. ما اسم الظاهرة الضوئية؟',
    ),
    options: [
      L('Meteor', 'الشهاب'),
      L('White dwarf', 'القزم الأبيض'),
      L('Meteorite', 'النيزك'),
      L('Galaxy', 'المجرة'),
    ],
    explanation: L(
      'The visible atmospheric event is a meteor; surviving material on the ground is a meteorite.',
      'الظاهرة الجوية شهاب، أما المادة الباقية على الأرض فنيزك.',
    ),
    number: [
      L(
        'How many planets are recognized in our solar system under the current IAU classification?',
        'كم كوكبًا معترفًا به في نظامنا الشمسي وفق تصنيف الاتحاد الفلكي الدولي الحالي؟',
      ),
      8,
      0,
      L(
        'There are eight planets; dwarf planets form a separate category.',
        'توجد ثمانية كواكب، وتعد الكواكب القزمة فئة منفصلة.',
      ),
    ],
    advanced: [
      L(
        'For a simplified spherical object, doubling its radius at fixed mean density multiplies its mass by what factor?',
        'لجرم كروي مبسط، بأي عامل تتضاعف كتلته عند مضاعفة نصف قطره مع ثبات متوسط الكثافة؟',
      ),
      8,
      0.01,
      L(
        'Volume scales as r³, and mass is density × volume, so the factor is 2³ = 8.',
        'يتناسب الحجم مع r³ والكتلة مع الكثافة في الحجم، فالعامل 2³ = 8.',
      ),
    ],
    order: [
      L('Gas cloud collapses', 'تنهار سحابة غاز'),
      L('Protostar forms', 'يتشكل نجم أولي'),
      L('Main-sequence hydrogen fusion', 'اندماج الهيدروجين بالنسق الأساسي'),
      L('A later stellar remnant', 'بقية نجمية لاحقة'),
    ],
    multi: [
      L('Nebulae contain gas and dust.', 'تحتوي السدم الغاز والغبار.'),
      L(
        'The Sun will not end as a core-collapse black hole.',
        'لن تنتهي الشمس ثقبًا أسود بانهيار النواة.',
      ),
      L('Planetary nebulae are made of planets.', 'تتكون السدم الكوكبية من كواكب.'),
      L(
        'Black holes pull harder at any distance than any equal mass.',
        'تجذب الثقوب السوداء أقوى من أي كتلة مساوية في كل مسافة.',
      ),
    ],
    reason: [
      L(
        'Why can a planet be bright without stellar fusion? Mention reflected light.',
        'لماذا قد يسطع الكوكب دون اندماج نجمي؟ اذكر الضوء المنعكس.',
      ),
      [['reflect', 'انعك', 'منعكس', 'يعكس']],
      L(
        'It reflects starlight and also emits thermal radiation, without being a main-sequence star.',
        'يعكس ضوء النجم ويصدر إشعاعًا حراريًا دون أن يكون نجم نسق أساسي.',
      ),
    ],
  },
  6: {
    prompt: L(
      'A target and all comparison stars dim at the same time. What should be checked first?',
      'يخفت الهدف وكل نجوم المقارنة معًا. ماذا يجب فحصه أولًا؟',
    ),
    options: [
      L('Clouds or a common instrumental effect.', 'السحب أو تأثير مشترك للجهاز.'),
      L('A planet orbiting every star simultaneously.', 'كوكب يدور حول كل النجوم معًا.'),
      L('The exact age of all stars.', 'العمر الدقيق لكل النجوم.'),
      L('Whether the universe stopped expanding.', 'هل توقف تمدد الكون.'),
    ],
    explanation: L(
      'A common trend suggests a shared observing effect; investigate calibration and conditions before a new astrophysical claim.',
      'يشير الاتجاه المشترك إلى أثر رصدي مشترك؛ افحص المعايرة والظروف قبل ادعاء فيزيائي جديد.',
    ),
    number: [
      L(
        'Independent random uncertainty is 6 units. With nine times as many same-quality measurements, estimate the uncertainty of the mean.',
        'عدم اليقين العشوائي المستقل 6 وحدات. مع تسعة أمثال القياسات بالجودة نفسها، قدّر عدم يقين المتوسط.',
      ),
      2,
      0.01,
      L(
        '6/√9 = 2. This does not remove systematic bias.',
        '6/√9 = 2. لا يزيل ذلك الانحياز المنهجي.',
      ),
    ],
    advanced: [
      L(
        'Four measurements are 8, 10, 12, 10. Calculate the arithmetic mean.',
        'أربع قياسات هي 8 و10 و12 و10. احسب المتوسط الحسابي.',
      ),
      10,
      0.01,
      L('(8 + 10 + 12 + 10)/4 = 10.', '(8 + 10 + 12 + 10)/4 = 10.'),
    ],
    order: [
      L('Form a testable hypothesis', 'صغ فرضية قابلة للاختبار'),
      L('Derive a prediction', 'استنبط تنبؤًا'),
      L('Collect relevant data', 'اجمع بيانات ملائمة'),
      L('Compare and revise', 'قارن وراجع'),
    ],
    multi: [
      L('A precise instrument may still be biased.', 'قد يكون الجهاز المحكم منحازًا.'),
      L('Independent replication can strengthen a result.', 'قد يقوي التكرار المستقل النتيجة.'),
      L('Correlation alone establishes causation.', 'يثبت الارتباط وحده السببية.'),
      L('Peer review guarantees every conclusion.', 'تضمن مراجعة الأقران كل استنتاج.'),
    ],
    reason: [
      L(
        'Why does repeating a measurement not automatically fix systematic error? Mention calibration or shared bias.',
        'لماذا لا تصلح الإعادة الخطأ المنهجي تلقائيًا؟ اذكر المعايرة أو الانحياز المشترك.',
      ),
      [['calibr', 'bias', 'shared', 'معاير', 'انحياز', 'مشترك']],
      L(
        'A shared calibration offset remains in every repetition and must be independently corrected.',
        'يبقى انحراف المعايرة المشترك في كل تكرار ويحتاج إلى تصحيح مستقل.',
      ),
    ],
  },
  7: {
    prompt: L(
      'A star has p = 50 milliarcseconds. Which preparation is needed before using d = 1/p in parsecs?',
      'لنجم اختلاف منظر 50 ملي ثانية قوسية. ماذا تفعل قبل استخدام d = 1/p بالفرسخ؟',
    ),
    options: [
      L('Convert p to 0.050 arcsecond.', 'حوّل p إلى 0.050 ثانية قوسية.'),
      L('Use 50 without checking units.', 'استخدم 50 دون فحص الوحدات.'),
      L('Multiply p by the age of the universe.', 'اضرب p في عمر الكون.'),
      L('Replace p with brightness.', 'استبدل p بالسطوع.'),
    ],
    explanation: L(
      'The reciprocal relation requires arcseconds: 1/0.050 = 20 pc.',
      'تتطلب علاقة المقلوب الثانية القوسية: 1/0.050 = 20 فرسخًا.',
    ),
    number: [
      L(
        'Convert 3 AU to million km using 1 AU ≈ 149.6 million km.',
        'حوّل 3 وحدات فلكية إلى ملايين الكيلومترات باستخدام 149.6 مليون كم لكل وحدة.',
      ),
      448.8,
      0.2,
      L('3 × 149.6 = 448.8 million km.', '3 × 149.6 = 448.8 مليون كم.'),
    ],
    advanced: [
      L(
        'A well-measured stellar parallax is 0.025 arcsecond. Find the distance in parsecs.',
        'اختلاف منظر نجمي مقاس جيدًا 0.025 ثانية قوسية. احسب المسافة بالفرسخ.',
      ),
      40,
      0.01,
      L('d = 1/0.025 = 40 pc.', 'd = 1/0.025 = 40 فرسخًا.'),
    ],
    order: [
      L('1 kilometer', 'كيلومتر واحد'),
      L('1 astronomical unit', 'وحدة فلكية واحدة'),
      L('1 light-year', 'سنة ضوئية واحدة'),
      L('1 parsec', 'فرسخ فلكي واحد'),
    ],
    multi: [
      L('A light-year measures distance.', 'تقيس السنة الضوئية مسافة.'),
      L('The AU has an exact definition in meters.', 'للوحدة الفلكية تعريف دقيق بالمتر.'),
      L('Larger parallax means greater distance.', 'يعني اختلاف المنظر الأكبر مسافة أكبر.'),
      L(
        'An exact unit definition removes observational uncertainty.',
        'يزيل تعريف الوحدة الدقيق عدم اليقين الرصدي.',
      ),
    ],
    reason: [
      L(
        'Why is it dangerous to invert a very uncertain parallax directly? Mention uncertainty or bias.',
        'لماذا يخطر أخذ مقلوب اختلاف منظر شديد عدم اليقين مباشرة؟ اذكر عدم اليقين أو الانحياز.',
      ),
      [['uncert', 'bias', 'unstable', 'يقين', 'انحياز', 'منحاز', 'مستقر']],
      L(
        'The nonlinear inverse can yield unstable or biased estimates at low signal-to-noise.',
        'قد يعطي المقلوب غير الخطي تقديرات غير مستقرة أو منحازة عند ضعف الإشارة.',
      ),
    ],
  },
  8: {
    prompt: L(
      'A planet diagram uses large icons and compressed orbital spacing. What must its caption say?',
      'يستخدم مخطط كواكب رموزًا كبيرة وفواصل مضغوطة. ماذا يجب أن يذكر الوصف؟',
    ),
    options: [
      L(
        'Sizes and orbital distances are not to scale.',
        'الأحجام والمسافات المدارية ليست بمقياس حقيقي.',
      ),
      L('This is a direct telescope observation.', 'هذا رصد تلسكوبي مباشر.'),
      L('All planets have equal size.', 'كل الكواكب متساوية الحجم.'),
      L('There is no empty space between planets.', 'لا فراغ بين الكواكب.'),
    ],
    explanation: L(
      'Educational simplification is valid when the distortion is disclosed.',
      'يصح التبسيط التعليمي عند التصريح بالتشويه.',
    ),
    number: [
      L(
        'If 1 AU is shown as 2 cm, what model distance represents 30 AU? Enter cm.',
        'إذا مثّلت 2 سم وحدة فلكية، ما مسافة النموذج التي تمثل 30 وحدة؟ اكتب السم.',
      ),
      60,
      0.01,
      L('30 × 2 cm = 60 cm.', '30 × 2 سم = 60 سم.'),
    ],
    advanced: [
      L(
        'Two sources have equal luminosity and no extinction. One is 9 times fainter. How many times farther away is it in the Euclidean inverse-square approximation?',
        'مصدران متساويا الضياء بلا إخماد. أحدهما أخفت 9 مرات. بكم مرة يكون أبعد بتقريب التربيع العكسي الإقليدي؟',
      ),
      3,
      0.01,
      L('The distance ratio is √9 = 3.', 'نسبة المسافتين √9 = 3.'),
    ],
    order: [
      L('Radar ranging within the solar system', 'قياس المدى الراداري بالنظام الشمسي'),
      L('Parallax of nearby stars', 'اختلاف منظر النجوم القريبة'),
      L('Cepheid calibration in nearby galaxies', 'معايرة القيفاويات بمجرات قريبة'),
      L('Standardized supernovae in remote galaxies', 'مستعرات مقيسة في مجرات بعيدة'),
    ],
    multi: [
      L(
        'A log axis uses equal intervals for equal ratios.',
        'يعطي المحور اللوغاريتمي فواصل متساوية للنسب المتساوية.',
      ),
      L('Standard candles need calibration.', 'تحتاج الشموع المعيارية إلى معايرة.'),
      L(
        'A diagram’s pixel gap always gives actual distance.',
        'تعطي فجوة البكسل دائمًا المسافة الفعلية.',
      ),
      L('All Type Ia supernovae are exactly identical.', 'كل مستعرات النوع Ia متطابقة تمامًا.'),
    ],
    reason: [
      L(
        'Why do errors in a shared distance calibration not vanish by averaging many galaxies? Mention correlated or shared errors.',
        'لماذا لا تزول أخطاء معايرة المسافة المشتركة بمتوسط مجرات كثيرة؟ اذكر الأخطاء المشتركة أو المترابطة.',
      ),
      [['correlat', 'shared', 'systematic', 'مشترك', 'مترابط', 'منهجي']],
      L(
        'The error is shared across estimates rather than being independent random noise.',
        'الخطأ مشترك بين التقديرات وليس ضجيجًا عشوائيًا مستقلًا.',
      ),
    ],
  },
};
function applied(m: number) {
  const s = situations[m];
  const out: SeedQuestion[] = [];
  const mk = (idx: number, type: string, p: Localized, e: Localized) => {
    const q = base(m, 30 + idx, type, p, e);
    q.lessonId = `l-${m}-${idx < 4 ? 1 : 2}`;
    q.concept = `applied-${m}-${type}`;
    q.difficulty = idx % 3 === 0 ? 'BEGINNER' : idx % 3 === 1 ? 'INTERMEDIATE' : 'ADVANCED';
    return q;
  };
  const multi = mk(
    0,
    'MULTI_SELECT',
    L('Select all scientifically supported statements.', 'اختر جميع العبارات المدعومة علميًا.'),
    L(
      `Supported statements: ${s.multi[0].en} ${s.multi[1].en} The remaining statements overstate or contradict these principles.`,
      `العبارتان المدعومتان: ${s.multi[0].ar} ${s.multi[1].ar} تتجاوز العبارات الأخرى هذه المبادئ أو تناقضها.`,
    ),
  );
  choices(multi, s.multi, 0);
  multi.answer = { kind: 'set', correct: multi.options.slice(0, 2).map((x) => x.id) };
  out.push(multi);
  const order = mk(
    1,
    'ORDER',
    L(
      'Arrange these items in their logical, chronological, or increasing-scale sequence.',
      'رتب العناصر في تسلسلها المنطقي أو الزمني أو تصاعديًا في المقياس.',
    ),
    L(s.order.map((x) => x.en).join(' → '), s.order.map((x) => x.ar).join(' ← ')),
  );
  choices(order, s.order, 0);
  order.answer = { kind: 'order', correct: order.options.map((x) => x.id) };
  out.push(order);
  for (const [idx, type, tuple] of [
    [2, 'NUMERIC', s.number],
    [7, 'ADVANCED', s.advanced],
  ] as const) {
    const q = mk(idx, type, tuple[0], tuple[3]);
    q.answer = { kind: 'number', correct: tuple[1], tolerance: tuple[2] };
    out.push(q);
  }
  const reason = mk(3, 'REASONING', s.reason[0], s.reason[2]);
  reason.answer = { kind: 'rubric', groups: s.reason[1] };
  reason.data = { practiceOnly: true, rubricNotice: true };
  out.push(reason);
  const image = mk(
    4,
    'IMAGE',
    L(
      'This is Webb’s Cosmic Cliffs image. Which statement correctly interprets the displayed colors?',
      'هذه صورة ويب للجروف الكونية. أي عبارة تفسر الألوان المعروضة بدقة؟',
    ),
    L(
      'The image is based on real infrared observations, with visible colors assigned to instrument filters. Credit: NASA, ESA, CSA, STScI.',
      'تستند الصورة إلى أرصاد تحت حمراء حقيقية مع تعيين ألوان مرئية للمرشحات. الحقوق: NASA وESA وCSA وSTScI.',
    ),
  );
  choices(
    image,
    [
      L(
        'Visible colors represent different infrared filters.',
        'تمثل الألوان المرئية مرشحات مختلفة تحت حمراء.',
      ),
      L('The image is an unprocessed naked-eye view.', 'الصورة رؤية عين مجردة بلا معالجة.'),
      L(
        'The scene is an AI-generated telescope observation.',
        'المشهد رصد تلسكوبي مولد بالذكاء الاصطناعي.',
      ),
      L('All orange regions are solid mountains.', 'كل المناطق البرتقالية جبال صلبة.'),
    ],
    0,
  );
  image.data = {
    image: '/images/carina.webp',
    credit: 'NASA, ESA, CSA, STScI',
    source: 'https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/',
    alt: L(
      'Stars above illuminated gas and dust in NGC 3324.',
      'نجوم فوق غاز وغبار مضاء في NGC 3324.',
    ),
  };
  out.push(image);
  const diagram = mk(
    5,
    'DIAGRAM',
    L(
      'In this illustrative light curve, at which time is the measured flux lowest? Enter the time in hours.',
      'في هذا المنحنى التعليمي، عند أي وقت يكون التدفق المقاس أدنى؟ اكتب الوقت بالساعات.',
    ),
    L(
      'Read the plotted minimum, not the slope: the lowest value is at 3 hours. This is synthetic teaching data, not an observation.',
      'اقرأ موضع الحد الأدنى لا الميل: أدنى قيمة عند 3 ساعات. البيانات تعليمية اصطناعية وليست رصدًا.',
    ),
  );
  diagram.data = {
    chart: [
      { x: 0, y: 100 },
      { x: 1, y: 100 },
      { x: 2, y: 95 },
      { x: 3, y: 80 },
      { x: 4, y: 95 },
      { x: 5, y: 100 },
    ],
    illustrative: true,
  };
  diagram.answer = { kind: 'number', correct: 3, tolerance: 0 };
  out.push(diagram);
  out.push(choices(mk(6, 'SCENARIO', s.prompt, s.explanation), s.options, 0));
  return out;
}
