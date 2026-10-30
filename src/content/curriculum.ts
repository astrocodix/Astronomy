export type Localized = { en: string; ar: string };
export const L = (en: string, ar: string): Localized => ({ en, ar });
const modules = (text: string) =>
  text
    .trim()
    .split('\n')
    .map((line) => {
      const [en, ar] = line.split('|');
      return L(en.trim(), ar.trim());
    });
export const curriculum = [
  {
    title: L('Introduction to Astronomy', 'مقدمة في علم الفلك'),
    description: L(
      'Every great journey begins with looking up. Discover the science, the stories, and the scale of our universe.',
      'تبدأ كل رحلة عظيمة بالنظر إلى السماء. اكتشف علم الكون وتاريخه ومقاييسه.',
    ),
    image: 'earth',
    color: '#a695ef',
    modules: modules(`What is Astronomy?|ما علم الفلك؟
Astronomy vs Astrophysics|علم الفلك والفيزياء الفلكية
History of Astronomy|تاريخ علم الفلك
The Observable Universe|الكون المرصود
Celestial Objects|الأجرام السماوية
Scientific Methods in Astronomy|المنهج العلمي في علم الفلك
Astronomical Units|الوحدات الفلكية
Scale of the Universe|مقاييس الكون`),
  },
  {
    title: L('The Solar System', 'النظام الشمسي'),
    description: L(
      'Meet our celestial neighborhood, from the Sun to the icy worlds beyond Neptune.',
      'تعرّف إلى جوارنا السماوي، من الشمس إلى العوالم الجليدية وراء نبتون.',
    ),
    image: 'saturn',
    color: '#e9b780',
    modules: modules(`Formation of the Solar System|نشأة النظام الشمسي
The Sun|الشمس
Mercury|عطارد
Venus|الزهرة
Earth|الأرض
Mars|المريخ
Jupiter|المشتري
Saturn|زحل
Uranus|أورانوس
Neptune|نبتون
Dwarf Planets|الكواكب القزمة
Moons and Natural Satellites|الأقمار والتوابع الطبيعية
Asteroids|الكويكبات
Comets|المذنبات
Meteorites|النيازك
Orbital Mechanics|ميكانيكا المدارات`),
  },
  {
    title: L('The Earth, Moon & Sun', 'الأرض والقمر والشمس'),
    description: L(
      'Understand the familiar rhythms of days, seasons, phases, and eclipses.',
      'افهم إيقاع الأيام والفصول وأطوار القمر والكسوف والخسوف.',
    ),
    image: 'moon',
    color: '#7da5e9',
    modules: modules(`Earth’s Structure|بنية الأرض
Earth’s Rotation and Revolution|دوران الأرض حول محورها وحول الشمس
Seasons|الفصول
Lunar Phases|أطوار القمر
Solar Eclipses|الكسوف الشمسي
Lunar Eclipses|الخسوف القمري
Tides|المد والجزر
Earth’s Magnetic Field|المجال المغناطيسي للأرض
Earth’s Atmosphere|الغلاف الجوي للأرض
The Sun–Earth Relationship|العلاقة بين الشمس والأرض`),
  },
  {
    title: L('Stars & Stellar Evolution', 'النجوم وتطورها'),
    description: L(
      'Follow the life of a star, from a cloud of gas to a remarkable final act.',
      'تتبّع حياة النجم من سحابة غاز إلى نهايته الاستثنائية.',
    ),
    image: 'carina',
    color: '#de92b3',
    modules: modules(`What Are Stars?|ما النجوم؟
Star Formation|تكوّن النجوم
Molecular Clouds|السحب الجزيئية
Nebulae|السدم
Nuclear Fusion|الاندماج النووي
Stellar Classification|التصنيف النجمي
Hertzsprung–Russell Diagram|مخطط هرتزبرونغ–راسل
Main Sequence Stars|نجوم النسق الأساسي
Red Giants|العمالقة الحمراء
Supergiants|العمالقة الفائقة
White Dwarfs|الأقزام البيضاء
Neutron Stars|النجوم النيوترونية
Supernovae|المستعرات العظمى
Pulsars|النجوم النابضة
Binary Stars|النجوم الثنائية
Variable Stars|النجوم المتغيرة`),
  },
  {
    title: L('Galaxies', 'المجرات'),
    description: L(
      'Explore islands of stars and the immense cosmic web that connects them.',
      'استكشف جزر النجوم والشبكة الكونية الهائلة التي تربطها.',
    ),
    image: 'andromeda',
    color: '#a092f0',
    modules: modules(`What Is a Galaxy?|ما المجرّة؟
Milky Way|درب التبانة
Spiral Galaxies|المجرات الحلزونية
Elliptical Galaxies|المجرات الإهليلجية
Irregular Galaxies|المجرات غير المنتظمة
Galactic Centers|مراكز المجرات
Galactic Collisions|تصادم المجرات
Galaxy Formation|تكوّن المجرات
Galaxy Clusters|عناقيد المجرات
Superclusters|العناقيد الفائقة
Cosmic Web|الشبكة الكونية`),
  },
  {
    title: L('Black Holes & Extreme Objects', 'الثقوب السوداء والأجرام المتطرفة'),
    description: L(
      'Investigate gravity at its limits and the most energetic objects in the cosmos.',
      'ادرس الجاذبية عند حدودها القصوى والأجرام الأعلى طاقة في الكون.',
    ),
    image: 'andromeda',
    color: '#bc85d7',
    modules: modules(`Introduction to Black Holes|مقدمة في الثقوب السوداء
Stellar Black Holes|الثقوب السوداء النجمية
Supermassive Black Holes|الثقوب السوداء فائقة الكتلة
Event Horizon|أفق الحدث
Singularity|التفرّد
Accretion Disks|أقراص التراكم
Gravitational Lensing|عدسة الجاذبية
Hawking Radiation|إشعاع هوكينغ
Neutron Stars|النجوم النيوترونية
Magnetars|النجوم المغناطيسية
Quasars|النجوم الزائفة (الكوازارات)
Gamma-Ray Bursts|انفجارات أشعة غاما`),
  },
  {
    title: L('Physics for Astronomy', 'أساسيات الفيزياء الفلكية'),
    description: L(
      'Build the physical toolkit behind motion, light, matter, and spacetime.',
      'ابنِ أدواتك الفيزيائية لفهم الحركة والضوء والمادة والزمكان.',
    ),
    image: 'earth',
    color: '#6ebbc5',
    modules: modules(`Classical Mechanics|الميكانيكا الكلاسيكية
Newton’s Laws|قوانين نيوتن
Gravity|الجاذبية
Energy and Momentum|الطاقة والزخم
Electromagnetic Radiation|الإشعاع الكهرومغناطيسي
Light and Spectroscopy|الضوء والتحليل الطيفي
Doppler Effect|تأثير دوبلر
Redshift and Blueshift|الانزياح الأحمر والأزرق
Thermodynamics|الديناميكا الحرارية
Atomic Physics|الفيزياء الذرية
Quantum Mechanics Introduction|مقدمة في ميكانيكا الكم
Special Relativity|النسبية الخاصة
General Relativity|النسبية العامة`),
  },
  {
    title: L('Mathematics for Astronomy', 'الرياضيات لعلم الفلك'),
    description: L(
      'Turn curiosity into calculations with guided, step-by-step mathematical reasoning.',
      'حوّل الفضول إلى حسابات باستدلال رياضي موجّه خطوة بخطوة.',
    ),
    image: 'moon',
    color: '#79c4a4',
    modules: modules(`Basic Algebra|أساسيات الجبر
Scientific Notation|الترميز العلمي
Ratios and Proportions|النسب والتناسب
Geometry|الهندسة
Trigonometry|حساب المثلثات
Logarithms|اللوغاريتمات
Vectors|المتجهات
Functions and Graphs|الدوال والرسوم البيانية
Basic Calculus|أساسيات التفاضل والتكامل
Differential Equations Introduction|مقدمة في المعادلات التفاضلية
Statistical Methods|الأساليب الإحصائية
Astronomical Calculations|الحسابات الفلكية`),
  },
  {
    title: L('Cosmology', 'علم الكونيات'),
    description: L(
      'Ask the biggest questions: how did the universe begin, evolve, and expand?',
      'اطرح الأسئلة الكبرى: كيف بدأ الكون وتطور وتمدد؟',
    ),
    image: 'andromeda',
    color: '#9b92e6',
    modules: modules(`What Is Cosmology?|ما علم الكونيات؟
Big Bang Theory|نظرية الانفجار العظيم
Early Universe|الكون المبكر
Cosmic Inflation|التضخم الكوني
Cosmic Microwave Background|إشعاع الخلفية الكونية الميكروي
Expansion of the Universe|تمدد الكون
Hubble’s Law|قانون هابل
Dark Matter|المادة المظلمة
Dark Energy|الطاقة المظلمة
Age of the Universe|عمر الكون
Large-Scale Structure|البنية واسعة النطاق
Fate of the Universe|مصير الكون
Multiverse Hypotheses|فرضيات الأكوان المتعددة`),
  },
  {
    title: L('Observational Astronomy', 'الرصد الفلكي'),
    description: L(
      'Find your way across the night sky and learn to collect your own observations.',
      'تعلّم التنقل في سماء الليل وجمع أرصادك الخاصة.',
    ),
    image: 'moon',
    color: '#d3ae78',
    modules: modules(`Naked-Eye Astronomy|الفلك بالعين المجردة
Constellations|الكوكبات
Celestial Coordinates|الإحداثيات السماوية
Equatorial Coordinate System|نظام الإحداثيات الاستوائي
Telescope Fundamentals|أساسيات التلسكوبات
Refracting Telescopes|التلسكوبات الكاسرة
Reflecting Telescopes|التلسكوبات العاكسة
Radio Telescopes|التلسكوبات الراديوية
Space Telescopes|التلسكوبات الفضائية
Astrophotography|التصوير الفلكي
Image Processing|معالجة الصور
Light Pollution|التلوث الضوئي
Observing Planets|رصد الكواكب
Observing Deep-Sky Objects|رصد أجرام السماء العميقة`),
  },
  {
    title: L('Modern Astronomy & Space Missions', 'الفلك الحديث والبعثات الفضائية'),
    description: L(
      'Discover the instruments and missions that have transformed our understanding.',
      'اكتشف الأجهزة والبعثات التي غيّرت فهمنا للكون.',
    ),
    image: 'carina',
    color: '#7db4dc',
    modules: modules(`Hubble Space Telescope|تلسكوب هابل الفضائي
James Webb Space Telescope|تلسكوب جيمس ويب الفضائي
Chandra X-ray Observatory|مرصد تشاندرا للأشعة السينية
Event Horizon Telescope|تلسكوب أفق الحدث
Voyager Missions|بعثات فوياجر
Mars Exploration|استكشاف المريخ
Exoplanet Discovery|اكتشاف الكواكب الخارجية
Gravitational Waves|موجات الجاذبية
SETI|البحث عن ذكاء خارج الأرض
Future Space Telescopes|التلسكوبات الفضائية المستقبلية
Modern Astronomical Discoveries|الاكتشافات الفلكية الحديثة`),
  },
  {
    title: L('Advanced Astrophysics & Research', 'الفيزياء الفلكية المتقدمة والبحث العلمي'),
    description: L(
      'Work with data, read research, and design an original astronomy capstone project.',
      'حلّل البيانات واقرأ الأبحاث وصمّم مشروعًا ختاميًا أصيلًا في علم الفلك.',
    ),
    image: 'andromeda',
    color: '#bba0e5',
    modules: modules(`Stellar Structure and Evolution|بنية النجوم وتطورها
Advanced Cosmology|علم الكونيات المتقدم
Relativistic Astrophysics|الفيزياء الفلكية النسبية
High-Energy Astrophysics|الفيزياء الفلكية عالية الطاقة
Exoplanet Science|علم الكواكب الخارجية
Computational Astrophysics|الفيزياء الفلكية الحاسوبية
Astronomical Data Analysis|تحليل البيانات الفلكية
Scientific Research Methods|مناهج البحث العلمي
Reading Research Papers|قراءة الأوراق البحثية
Designing an Astronomy Research Project|تصميم مشروع بحث فلكي`),
  },
];
