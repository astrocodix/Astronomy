import { L, type Localized } from './curriculum';
export type Concept = { term: Localized; definition: Localized };
const C = (s: string): Concept[] =>
  s
    .trim()
    .split('\n')
    .map((line) => {
      const [en, ar, de, da] = line.split('|');
      return { term: L(en, ar), definition: L(de, da) };
    });
export const concepts: Record<number, Concept[]> = {
  1: C(`Astronomy|علم الفلك|The evidence-based study of celestial objects and phenomena.|الدراسة القائمة على الأدلة للأجرام والظواهر السماوية.
Solar system|النظام الشمسي|The Sun and the bodies gravitationally associated with it, including eight planets.|الشمس والأجرام المرتبطة بها جاذبيًا، ومنها ثمانية كواكب.
Milky Way|درب التبانة|The barred spiral galaxy that contains the Sun.|المجرة الحلزونية القضيبية التي تضم الشمس.
Local Group|المجموعة المحلية|The galaxy group that includes the Milky Way and Andromeda.|مجموعة المجرات التي تشمل درب التبانة وأندروميدا.
Observation|الرصد|A recorded measurement or description of a phenomenon.|قياس مسجل أو وصف لظاهرة.
Interpretation|التفسير|An explanation proposed to connect observations to a model.|شرح مقترح يربط الأرصاد بنموذج.
Plasma|البلازما|An ionized state of matter containing free charged particles.|حالة متأينة للمادة تحتوي جسيمات مشحونة حرة.
Nuclear fusion|الاندماج النووي|A process combining light atomic nuclei into heavier nuclei.|عملية تجمع نوى ذرية خفيفة في نوى أثقل.
Electromagnetic radiation|الإشعاع الكهرومغناطيسي|Radiation that includes radio waves, visible light, and X-rays.|إشعاع يشمل موجات الراديو والضوء المرئي والأشعة السينية.
Gravitational wave|موجة الجاذبية|A propagating disturbance in spacetime that offers a messenger beyond light.|اضطراب ينتشر في الزمكان ويوفر رسولًا للمعلومات غير الضوء.
Inverse problem|المسألة العكسية|Inferring physical conditions from measurements they produced.|استنتاج الظروف الفيزيائية من القياسات التي أنتجتها.
Astrology|التنجيم|A belief system linking celestial arrangements to personal fate without reliable controlled predictive support.|نظام اعتقاد يربط أوضاع الأجرام بالمصير الشخصي دون دعم تنبؤي مضبوط موثوق.
Rotation|الدوران المحوري|The spinning of a body around its own axis.|دوران جسم حول محوره.
Revolution|الدوران المداري|The motion of a body around another body or a shared center of mass.|حركة جسم حول آخر أو حول مركز كتلة مشترك.
Constellation|الكوكبة|An officially defined region of the celestial sphere.|منطقة محددة رسميًا من الكرة السماوية.
Altitude|الارتفاع الزاوي|The angle of an object above the observer’s local horizon.|زاوية جرم فوق الأفق المحلي للراصد.
Azimuth|السمت|An angular direction measured around the local horizon.|اتجاه زاوي يقاس حول الأفق المحلي.
Right ascension|المطلع المستقيم|The longitude-like coordinate in the equatorial sky grid.|الإحداثي الشبيه بخط الطول في الشبكة السماوية الاستوائية.
Declination|الميل|The angular coordinate north or south of the celestial equator.|الإحداثي الزاوي شمال خط الاستواء السماوي أو جنوبه.
Apparent brightness|السطوع الظاهري|How much light from an object reaches an observer per collecting area.|مقدار الضوء الواصل من جرم إلى الراصد لكل مساحة تجميع.
Luminosity|الضياء|The total power emitted by an astronomical source.|القدرة الكلية التي يصدرها مصدر فلكي.
Angular separation|الفصل الزاوي|The angle between two lines of sight on the sky.|الزاوية بين خطي نظر في السماء.
Arcminute|الدقيقة القوسية|An angular unit equal to one sixtieth of a degree.|وحدة زاوية تساوي واحدًا من ستين من الدرجة.
Lunar phase|الطور القمري|The changing fraction of the Moon’s sunlit half visible from Earth.|الجزء المتغير المرئي من الأرض من نصف القمر المضاء بالشمس.
Light curve|المنحنى الضوئي|A record of an object’s brightness as a function of time.|سجل سطوع جرم بوصفه دالة في الزمن.`),
  2: C(`Astrophysics|الفيزياء الفلكية|Explaining cosmic phenomena using physical laws and models.|تفسير الظواهر الكونية باستخدام القوانين والنماذج الفيزيائية.
Imaging|التصوير|Recording the spatial distribution of light across a field.|تسجيل التوزيع المكاني للضوء عبر مجال الرصد.
Photometry|القياس الضوئي|Quantitatively measuring the brightness of a source.|قياس سطوع مصدر قياسًا كميًا.
Spectroscopy|التحليل الطيفي|Separating and studying radiation as a function of wavelength.|فصل الإشعاع ودراسته بدلالة الطول الموجي.
Transit|العبور|The passage of a smaller foreground object across a larger source’s visible disk.|مرور جرم أمامي أصغر عبر القرص المرئي لمصدر أكبر.
Wavelength|الطول الموجي|The spatial distance between successive corresponding phases of a wave.|المسافة المكانية بين طورين متماثلين متتاليين لموجة.
Frequency|التردد|The number of wave cycles passing a point per unit time.|عدد دورات الموجة التي تمر بنقطة في وحدة الزمن.
Photon|الفوتون|A quantum of electromagnetic radiation with energy proportional to frequency.|كمّ من الإشعاع الكهرومغناطيسي طاقته متناسبة مع التردد.
Blackbody|الجسم الأسود|An ideal absorber whose thermal emission depends only on temperature.|ماص مثالي يعتمد إصداره الحراري على درجة حرارته فقط.
Infrared|الأشعة تحت الحمراء|Radiation with wavelengths longer than visible red light and shorter than microwaves.|إشعاع أطول موجة من الضوء الأحمر المرئي وأقصر من الموجات الميكروية.
Assigned color|اللون المعيّن|A visible display color used to represent a measured wavelength band.|لون عرض مرئي يمثل نطاقًا موجيًا مقاسًا.
Residual|الباقي|The difference between a model prediction and a corresponding measurement.|الفرق بين تنبؤ النموذج والقياس المقابل.
Energy level|مستوى الطاقة|An allowed energy state of an atom or other quantum system.|حالة طاقة مسموحة لذرة أو نظام كمي آخر.
Absorption line|خط الامتصاص|A reduced-intensity spectral feature caused by selective removal of photons.|معلم طيفي منخفض الشدة ناتج عن إزالة انتقائية للفوتونات.
Emission line|خط الانبعاث|An enhanced-intensity spectral feature at characteristic wavelengths.|معلم طيفي مرتفع الشدة عند أطوال موجية مميزة.
Ionization|التأين|The process that changes an atom’s charge by removing or adding electrons.|عملية تغير شحنة الذرة بإزالة إلكترونات أو إضافتها.
Rest wavelength|الطول الموجي الساكن|The wavelength of a spectral feature measured without relative source motion in the relevant frame.|طول معلم طيفي مقاس دون حركة نسبية للمصدر في الإطار المعني.
Doppler effect|تأثير دوبلر|A frequency or wavelength change associated with relative source–observer motion.|تغير التردد أو الطول الموجي المرتبط بالحركة النسبية بين المصدر والراصد.
Redshift|الانزياح الأحمر|A displacement of identifiable spectral features toward longer wavelengths.|إزاحة معالم طيفية معروفة نحو أطوال موجية أطول.
Blueshift|الانزياح الأزرق|A displacement of identifiable spectral features toward shorter wavelengths.|إزاحة معالم طيفية معروفة نحو أطوال موجية أقصر.
Radial velocity|السرعة الشعاعية|The component of velocity along the observer’s line of sight.|مركبة السرعة على امتداد خط نظر الراصد.
Flux|التدفق|Power received per unit area, often measured in watts per square meter.|القدرة المستقبلة لكل وحدة مساحة، وتقاس غالبًا بالواط لكل متر مربع.
Inverse-square law|قانون التربيع العكسي|The relationship in which flux from an ideal isotropic source decreases as one over distance squared.|العلاقة التي ينخفض فيها تدفق مصدر مثالي متساوي الإشعاع مع مقلوب مربع المسافة.
Extinction|الإخماد|The dimming of light by absorption and scattering along its path.|خفت الضوء بفعل الامتصاص والتشتت على مساره.
Continuum|الطيف المتصل|A smooth spectral distribution extending over a range rather than isolated lines.|توزيع طيفي ممتد عبر نطاق بدل اقتصاره على خطوط منفصلة.`),
  3: C(`Calendar|التقويم|A system for organizing dates often based historically on celestial cycles.|نظام لتنظيم التواريخ استند تاريخيًا كثيرًا إلى الدورات السماوية.
Navigation|الملاحة|Determining position and direction for travel, sometimes using celestial measurements.|تحديد الموقع والاتجاه للسفر باستخدام قياسات سماوية أحيانًا.
Babylonian astronomy|الفلك البابلي|An ancient tradition notable for systematic records of planetary phenomena.|تقليد قديم اشتهر بسجلات منتظمة للظواهر الكوكبية.
Guest star|النجم الضيف|A historical description used for a newly appearing star-like transient.|وصف تاريخي لجرم عابر شبيه بالنجم يظهر حديثًا.
Geocentric model|نموذج مركزية الأرض|A model placing Earth at the center of the modeled celestial arrangement.|نموذج يضع الأرض في مركز الترتيب السماوي الممثل.
Epicycle|فلك التدوير|A smaller circular path whose center moves along another path in classical planetary models.|مسار دائري أصغر يتحرك مركزه على مسار آخر في نماذج كوكبية قديمة.
Star catalog|الفهرس النجمي|An organized listing of stellar positions and often other measured properties.|قائمة منظمة لمواضع النجوم وخصائصها المقاسة الأخرى غالبًا.
Al-Sufi|عبد الرحمن الصوفي|The tenth-century astronomer associated with the Book of the Fixed Stars.|فلكي القرن العاشر المرتبط بكتاب صور الكواكب الثابتة.
Ibn al-Haytham|ابن الهيثم|A scholar known for systematic work on optics and vision.|عالم اشتهر بعمل منهجي في البصريات والإبصار.
Optics|البصريات|The study of light, its propagation, and its interactions.|دراسة الضوء وانتشاره وتفاعلاته.
Historical source criticism|نقد المصادر التاريخية|Evaluating records through context, dating, translation, and independent evidence.|تقييم السجلات بالسياق والتأريخ والترجمة والأدلة المستقلة.
Astronomical table|الجدول الفلكي|A numerical compilation used to calculate or predict celestial positions and events.|تجميع عددي لحساب مواضع الأجرام والأحداث أو التنبؤ بها.
Heliocentric model|نموذج مركزية الشمس|A planetary model in which Earth and other planets orbit the Sun.|نموذج كوكبي تدور فيه الأرض والكواكب الأخرى حول الشمس.
Copernicus|كوبرنيكوس|The scholar associated with the influential sixteenth-century heliocentric planetary model.|العالم المرتبط بنموذج مركزية الشمس المؤثر في القرن السادس عشر.
Galileo|غاليليو|The observer whose telescopic work included Jupiter’s moons and Venus’s phases.|الراصد الذي شمل عمله التلسكوبي أقمار المشتري وأطوار الزهرة.
Tycho Brahe|تيخو براهي|The observer whose precise planetary records helped Kepler develop his laws.|الراصد الذي ساعدت سجلاته الدقيقة للكواكب كبلر على تطوير قوانينه.
Kepler|كبلر|The astronomer who described planetary orbits using three empirical laws.|الفلكي الذي وصف المدارات الكوكبية بثلاثة قوانين تجريبية.
Ellipse|القطع الناقص|A closed curve whose points have a constant sum of distances to two foci.|منحنى مغلق ثابت مجموع المسافتين من كل نقطة عليه إلى بؤرتين.
Focus|البؤرة|One of the two defining points of an ellipse, one of which holds the Sun in an ideal planetary orbit.|إحدى نقطتي تعريف القطع الناقص، وتشغل الشمس إحداهما في مدار كوكبي مثالي.
Semimajor axis|نصف المحور الأكبر|Half the longest diameter of an ellipse.|نصف أطول قطر للقطع الناقص.
Orbital period|الزمن الدوري المداري|The time required to complete one orbit.|الزمن اللازم لإكمال دورة مدارية واحدة.
Universal gravitation|الجاذبية العامة النيوتنية|Newton’s framework relating gravitational attraction to masses and inverse squared separation.|إطار نيوتن الذي يربط التجاذب بالكتل ومقلوب مربع المسافة.
Center of mass|مركز الكتلة|The mass-weighted mean position about which an isolated two-body system orbits.|الموضع المتوسط الموزون بالكتلة الذي يدور حوله نظام ثنائي معزول.
General relativity|النسبية العامة|The theory describing gravity through spacetime geometry.|النظرية التي تصف الجاذبية بهندسة الزمكان.
Domain of validity|مجال الصلاحية|The conditions under which a model’s approximation is reliable.|الظروف التي يكون فيها تقريب النموذج موثوقًا.`),
  4: C(`Light-travel time|زمن انتقال الضوء|The interval taken by light to propagate from emission to reception.|الفترة اللازمة لانتقال الضوء من الإصدار إلى الاستقبال.
Lookback time|زمن النظر إلى الماضي|The elapsed cosmic time between emission of observed light and the present.|الزمن الكوني المنقضي بين إصدار الضوء المرصود والحاضر.
Observable universe|الكون المرصود|The region from which signals could have reached a particular observer over cosmic history.|المنطقة التي أمكن أن تصل منها إشارات إلى راصد محدد عبر التاريخ الكوني.
Cosmic horizon|الأفق الكوني|An information boundary set by causal propagation and the expansion history.|حد للمعلومات يحدده الانتشار السببي وتاريخ التمدد.
Cosmic expansion|التمدد الكوني|The growth of large-scale separations described by the cosmic scale factor.|نمو الفواصل واسعة النطاق الذي يصفه عامل القياس الكوني.
Scale factor|عامل القياس|The function a(t) describing relative expansion in standard cosmology.|الدالة a(t) التي تصف التمدد النسبي في علم الكونيات القياسي.
Comoving distance|المسافة المسايرة|A distance coordinate with the overall cosmic expansion factored out.|إحداثي مسافة أزيل منه عامل التمدد الكوني العام.
Proper distance|المسافة الخاصة|Physical separation evaluated at a specified cosmic time in a cosmological model.|فصل فيزيائي مقيم عند زمن كوني محدد ضمن نموذج.
Luminosity distance|مسافة الضياء|The distance defined from the relation between luminosity and observed flux in cosmology.|المسافة المعرفة بعلاقة الضياء بالتدفق المرصود في علم الكونيات.
Angular-diameter distance|مسافة القطر الزاوي|The distance relating an object’s transverse physical size to its angular size.|المسافة التي تربط الحجم العرضي الحقيقي بالحجم الزاوي.
Cosmological redshift|الانزياح الأحمر الكوني|The stretching of observed wavelengths associated with cosmic expansion.|استطالة الأطوال الموجية المرصودة المرتبطة بالتمدد الكوني.
Age of the universe|عمر الكون|The model-inferred elapsed time since the early hot phase, about 13.8 billion years in the standard model.|الزمن المستنتج منذ الطور الساخن المبكر، ونحو 13.8 مليار سنة في النموذج القياسي.
Hot Big Bang model|نموذج الانفجار العظيم الساخن|The evidence-supported framework describing a hotter and denser early universe.|الإطار المدعوم بالأدلة الذي يصف كونًا مبكرًا أشد حرارة وكثافة.
Cosmic microwave background|الخلفية الكونية الميكروية|Relic radiation from the early transparent universe, observed today near 2.725 K.|إشعاع متبقٍ من الكون المبكر الشفاف، يرصد اليوم عند نحو 2.725 كلفن.
Recombination|إعادة الاتحاد|The early epoch when electrons and nuclei formed neutral atoms and the universe became largely transparent.|الحقبة التي اتحدت فيها الإلكترونات والنوى إلى ذرات متعادلة وأصبح الكون شفافًا بدرجة كبيرة.
Primordial nucleosynthesis|التخليق النووي البدائي|Production of light nuclei during the hot early universe.|إنتاج النوى الخفيفة في الكون المبكر الساخن.
Deuterium|الديوتيريوم|The hydrogen isotope with one proton and one neutron in its nucleus.|نظير الهيدروجين ذو بروتون ونيوترون في نواته.
Dark matter|المادة المظلمة|A gravitating component inferred from multiple observations whose microscopic identity is unresolved.|مكون جذبي مستدل عليه من أرصاد متعددة ولم تحسم هويته المجهرية.
Dark energy|الطاقة المظلمة|The component used in the standard model to describe accelerated cosmic expansion.|المكون المستخدم في النموذج القياسي لوصف تسارع التمدد الكوني.
Cosmological constant|الثابت الكوني|The simplest standard-model description of a constant dark-energy density.|أبسط وصف في النموذج القياسي لكثافة طاقة مظلمة ثابتة.
Cosmic inflation|التضخم الكوني|A family of proposed very early accelerated-expansion mechanisms not yet established in detail.|عائلة آليات تمدد مبكر جدًا متسارع مقترحة ولم تثبت تفاصيلها.
Multiverse hypothesis|فرضية الأكوان المتعددة|A proposal involving other universes that is not an established direct observation.|اقتراح بوجود أكوان أخرى ليس رصدًا مباشرًا مثبتًا.
Hubble constant|ثابت هابل|The present cosmic expansion-rate parameter, with observational uncertainty.|معامل معدل التمدد الكوني الحالي وله عدم يقين رصدي.
Gravitational lensing|عدسة الجاذبية|The deflection and distortion of light paths by gravitational fields.|انحراف مسارات الضوء وتشوه صورها بفعل حقول الجاذبية.
Peculiar velocity|السرعة الخاصة|Motion of an object relative to the smooth cosmic expansion flow.|حركة جرم بالنسبة إلى تدفق التمدد الكوني المنتظم.`),
  5: C(`Main-sequence star|نجم النسق الأساسي|A star whose central energy production is dominated by hydrogen fusion.|نجم يهيمن اندماج الهيدروجين على إنتاج طاقته المركزي.
Planet|الكوكب|A solar-system body orbiting the Sun that is nearly round and dynamically clears its orbital neighborhood.|جرم بالنظام الشمسي يدور حول الشمس وشبه كروي وقد نظف جواره المداري ديناميكيًا.
Dwarf planet|الكوكب القزم|A nearly round nonsatellite orbiting the Sun that has not dynamically cleared its orbital neighborhood.|جرم شبه كروي غير تابع يدور حول الشمس ولم ينظف جواره المداري ديناميكيًا.
Natural satellite|القمر الطبيعي|A naturally occurring companion orbiting a larger planetary or small-body primary.|تابع طبيعي يدور حول جرم كوكبي أو جرم أولي صغير أكبر منه.
Asteroid|الكويكب|A generally rocky or metallic small solar-system body.|جرم صغير في النظام الشمسي صخري أو معدني غالبًا.
Comet|المذنب|An icy small body that may develop a coma and tails when heated.|جرم صغير جليدي قد ينشئ ذؤابة وذيولًا عند التسخين.
Coma|الذؤابة|The diffuse gas-and-dust envelope around an active comet’s nucleus.|غلاف الغاز والغبار المنتشر حول نواة مذنب نشط.
Ion tail|الذيل الأيوني|A cometary tail of charged particles directed generally away from the Sun.|ذيل مذنبي من جسيمات مشحونة يتجه عادة بعيدًا عن الشمس.
Meteoroid|الجسيم النيزكي|A small solid body traveling through space before atmospheric entry.|جسم صلب صغير يسير في الفضاء قبل دخول الغلاف الجوي.
Meteor|الشهاب|The luminous atmospheric phenomenon associated with an entering space particle.|الظاهرة الضوئية الجوية المرتبطة بدخول جسيم فضائي.
Meteorite|النيزك|Extraterrestrial material that survives atmospheric entry and reaches the ground.|مادة خارج أرضية تنجو من دخول الغلاف الجوي وتصل إلى السطح.
Brown dwarf|القزم البني|A substellar object that does not sustain ordinary main-sequence hydrogen fusion.|جرم دون نجمي لا يحافظ على اندماج الهيدروجين المعتاد للنسق الأساسي.
Nebula|السديم|An interstellar cloud of gas and dust.|سحابة بين نجمية من الغاز والغبار.
Emission nebula|سديم الانبعاث|A nebula glowing through radiation emitted by energized gas.|سديم يتوهج بإشعاع غاز مثار.
Reflection nebula|سديم الانعكاس|A nebula visible chiefly by scattering nearby starlight.|سديم يظهر أساسًا بتشتيت ضوء نجوم قريبة.
Dark nebula|السديم المظلم|A dense cloud visible by blocking background light.|سحابة كثيفة تظهر بحجب ضوء الخلفية.
Galaxy|المجرة|A large gravitational system of stars, gas, dust, and usually substantial dark matter.|نظام جذبي كبير من النجوم والغاز والغبار ومادة مظلمة وفيرة عادة.
Star cluster|العنقود النجمي|A grouping of stars within a galaxy.|تجمع نجوم داخل مجرة.
White dwarf|القزم الأبيض|A compact stellar remnant supported largely by electron degeneracy pressure.|بقية نجمية مدمجة يدعمها أساسًا ضغط انحلال الإلكترونات.
Neutron star|النجم النيوتروني|An extremely dense remnant formed in some core-collapse events.|بقية فائقة الكثافة تتكون في بعض أحداث انهيار النواة.
Black hole|الثقب الأسود|A region bounded by an event horizon from which light cannot escape to distant observers.|منطقة يحدها أفق حدث لا يستطيع الضوء منها الإفلات إلى راصد بعيد.
Event horizon|أفق الحدث|The causal boundary separating a black hole’s interior from escaping outward light paths.|الحد السببي الذي يفصل داخل الثقب الأسود عن المسارات الضوئية المفلتة للخارج.
Accretion disk|قرص التراكم|Orbiting material that can heat and radiate as it loses energy and moves inward.|مادة مدارية قد تسخن وتشع عند فقد الطاقة والتحرك للداخل.
Planetary nebula|السديم الكوكبي|Glowing ejected gas around an evolving low- or intermediate-mass star, unrelated to planets.|غاز مطرود متوهج حول نجم متطور منخفض أو متوسط الكتلة، ولا علاقة للاسم بالكواكب.
Supernova|المستعر الأعظم|An energetic stellar explosion with several possible physical channels.|انفجار نجمي عالي الطاقة له مسارات فيزيائية متعددة.`),
  6: C(`Hypothesis|الفرضية|A proposed explanation that can lead to testable predictions.|تفسير مقترح يقود إلى تنبؤات قابلة للاختبار.
Prediction|التنبؤ|An expected result derived from a hypothesis or model.|نتيجة متوقعة مشتقة من فرضية أو نموذج.
Falsifiability|القابلية للدحض|The possibility of observations that would count against a claim.|إمكان وجود أرصاد تعارض الادعاء.
Scientific theory|النظرية العلمية|A broad explanatory framework tested against substantial evidence.|إطار تفسيري واسع مختبر مقابل أدلة وافرة.
Scientific law|القانون العلمي|A concise description of a regular relationship in nature.|وصف موجز لعلاقة منتظمة في الطبيعة.
Peer review|مراجعة الأقران|Critical evaluation of research methods and claims by relevant specialists.|تقييم نقدي لطرق البحث وادعاءاته بواسطة مختصين.
Precision|الإحكام|The closeness of repeated measurements to one another.|تقارب القياسات المتكررة بعضها من بعض.
Accuracy|الصحة|The closeness of a measurement to the true or accepted reference value.|قرب القياس من القيمة الحقيقية أو المرجعية المعتمدة.
Uncertainty|عدم اليقين|A quantified limitation on an estimated measurement or parameter.|حد كمي لدقة قياس أو معامل مقدر.
Calibration|المعايرة|Relating an instrument’s readings to known reference standards.|ربط قراءات الجهاز بمعايير مرجعية معروفة.
Comparison star|نجم المقارنة|A reference star used to check or calibrate changes in a target’s measured brightness.|نجم مرجعي لفحص تغير سطوع الهدف أو معايرته.
Control|الضابط|A comparison condition used to distinguish the tested effect from other influences.|حالة مقارنة تميز الأثر المختبر عن المؤثرات الأخرى.
Correlation|الارتباط|A statistical association in the variation of two quantities.|ارتباط إحصائي في تغير كميتين.
Causation|السببية|A relationship in which one process produces a change in another.|علاقة تسبب فيها عملية تغيرًا في أخرى.
Selection bias|انحياز الانتقاء|A distortion caused by how objects enter the observed sample.|تشوه ناتج عن طريقة دخول الأجرام في العينة المرصودة.
Random error|الخطأ العشوائي|Measurement variation that fluctuates unpredictably between independent trials.|تغير في القياس يتقلب بصورة غير متوقعة بين تجارب مستقلة.
Systematic error|الخطأ المنهجي|A shared or structured measurement bias not removed by simple repetition.|انحياز قياس مشترك أو منتظم لا تزيله الإعادة البسيطة.
Reproducibility|قابلية إعادة الإنتاج|The ability to check a result using sufficiently documented data and methods.|إمكان فحص النتيجة باستخدام بيانات وطرق موثقة بما يكفي.
Independent replication|التكرار المستقل|Testing a conclusion with new data or a separate method.|اختبار استنتاج ببيانات جديدة أو طريقة منفصلة.
Sample|العينة|The subset of objects or measurements included in a study.|مجموعة الأجرام أو القياسات المدرجة في دراسة.
Overfitting|فرط المواءمة|Fitting noise or accidental details rather than a generalizable pattern.|ملاءمة الضجيج أو التفاصيل العارضة بدل نمط قابل للتعميم.
Validation data|بيانات التحقق|Data reserved to test predictions rather than tune a model.|بيانات محفوظة لاختبار التنبؤ بدل ضبط النموذج.
Prior|التوزيع القبلي|The probability description used before incorporating the current data in Bayesian inference.|وصف الاحتمال قبل إدخال البيانات الحالية في الاستدلال البايزي.
Likelihood|دالة الترجيح|How well a parameter choice predicts the observed data under a statistical model.|مدى تنبؤ اختيار معاملات بالبيانات المرصودة وفق نموذج إحصائي.
Confounding variable|المتغير المربك|A third factor that can create or alter an apparent association.|عامل ثالث قد ينشئ ارتباطًا ظاهريًا أو يغيره.`),
  7: C(`Astronomical unit|الوحدة الفلكية|The length defined as exactly 149,597,870,700 meters.|طول معرف بالضبط بأنه 149597870700 متر.
Light-year|السنة الضوئية|The distance light travels in vacuum in one Julian year.|المسافة التي يقطعها الضوء في الفراغ خلال سنة يوليانية واحدة.
Parsec|الفرسخ الفلكي|A distance unit approximately equal to 3.2616 light-years, defined through parallax geometry.|وحدة مسافة تقارب 3.2616 سنة ضوئية ومعرفة بهندسة اختلاف المنظر.
Scientific notation|الترميز العلمي|Writing a number as a coefficient multiplied by a power of ten.|كتابة عدد كمعامل مضروب في قوة للعشرة.
Exponent|الأس|The number specifying the power applied to a base.|العدد المحدد للقوة المطبقة على أساس.
Conversion factor|عامل التحويل|A ratio of equal physical quantities expressed in different units.|نسبة كميتين فيزيائيتين متساويتين معبر عنهما بوحدتين مختلفتين.
Dimensional analysis|تحليل الأبعاد|Checking the physical dimensions and unit consistency of an expression.|فحص الأبعاد الفيزيائية واتساق وحدات تعبير.
Significant figures|الأرقام المعنوية|Digits used to communicate the justified precision of a reported value.|أرقام تستخدم للتعبير عن الدقة المبررة لقيمة معلنة.
Julian year|السنة اليوليانية|A time interval defined as 365.25 days of 86,400 seconds each.|مدة معرفة بأنها 365.25 يومًا، لكل منها 86400 ثانية.
Speed of light|سرعة الضوء|The vacuum speed exactly equal to 299,792,458 meters per second in SI.|السرعة في الفراغ المساوية بالضبط 299792458 مترًا في الثانية بالنظام الدولي.
SI|النظام الدولي للوحدات|The international system of standardized measurement units.|النظام الدولي لوحدات القياس المعيارية.
Order-of-magnitude estimate|تقدير رتبة المقدار|An approximate size estimate focusing on powers of ten.|تقدير تقريبي للحجم يركز على قوى العشرة.
Parallax|اختلاف المنظر|An apparent position change caused by a change in viewing location.|تغير ظاهري في الموقع ناتج عن تغير موقع الرؤية.
Annual stellar parallax|اختلاف المنظر النجمي السنوي|The apparent yearly displacement of a nearby star caused by Earth’s orbital motion.|الإزاحة السنوية الظاهرية لنجم قريب الناتجة عن حركة الأرض المدارية.
Baseline|خط القاعدة|The separation between viewpoints used for a geometric measurement.|الفاصل بين موضعي رصد يستخدمان لقياس هندسي.
Arcsecond|الثانية القوسية|An angular unit equal to one 3,600th of a degree.|وحدة زاوية تساوي واحدًا من 3600 من الدرجة.
Milliarcsecond|الملي ثانية القوسية|An angular unit equal to 0.001 arcsecond.|وحدة زاوية تساوي 0.001 ثانية قوسية.
Proper motion|الحركة الذاتية|A star’s changing angular position due to its actual transverse motion over time.|تغير موضع النجم الزاوي بسبب حركته العرضية الحقيقية مع الزمن.
Astrometry|القياس الفلكي الموضعي|Precise measurement of celestial positions and motions.|القياس الدقيق لمواضع الأجرام السماوية وحركاتها.
Relative uncertainty|عدم اليقين النسبي|Uncertainty divided by the estimated value, often expressed as a percentage.|عدم اليقين مقسومًا على القيمة المقدرة، ويعبر عنه غالبًا بنسبة مئوية.
Signal-to-noise ratio|نسبة الإشارة إلى الضجيج|A comparison between measured signal strength and its noise level.|مقارنة بين قوة الإشارة المقاسة ومستوى ضجيجها.
Reciprocal|المقلوب|The number obtained by dividing one by a nonzero quantity.|العدد الناتج من قسمة واحد على كمية غير صفرية.
Small-angle approximation|تقريب الزاوية الصغيرة|The approximation that an angle in radians nearly equals its sine or tangent for sufficiently small angles.|تقريب تساوي الزاوية بالراديان تقريبًا مع جيبها أو ظلها عند صغرها الكافي.
Radian|الراديان|The angle subtended by an arc equal in length to the circle’s radius.|زاوية يقابلها قوس طوله يساوي نصف قطر الدائرة.
Distance inference|استنتاج المسافة|Estimating distance from observations using a stated geometric or statistical model.|تقدير المسافة من الرصد باستخدام نموذج هندسي أو إحصائي معلن.`),
  8: C(`Scale factor|عامل المقياس|The ratio of a model length to the corresponding real length.|نسبة طول النموذج إلى الطول الحقيقي المقابل.
Linear scale|المقياس الخطي|An axis where equal display intervals represent equal numerical differences.|محور تمثل فيه الفواصل المعروضة المتساوية فروقًا عددية متساوية.
Logarithmic scale|المقياس اللوغاريتمي|An axis where equal display intervals represent equal numerical ratios.|محور تمثل فيه الفواصل المعروضة المتساوية نسبًا عددية متساوية.
Order of magnitude|رتبة المقدار|A factor of ten used to compare scales.|عامل عشرة يستخدم لمقارنة المقاييس.
Ratio|النسبة|A comparison of two quantities by division.|مقارنة كميتين بالقسمة.
Proportion|التناسب|An equality between two ratios.|مساواة بين نسبتين.
Diameter|القطر|The distance across a circle or sphere through its center.|المسافة عبر دائرة أو كرة مرورًا بمركزها.
Radius|نصف القطر|The distance from the center of a circle or sphere to its surface.|المسافة من مركز دائرة أو كرة إلى سطحها.
Mean orbital distance|متوسط المسافة المدارية|A representative orbital separation commonly summarized approximately by the semimajor axis.|فاصل مداري تمثيلي يلخص تقريبًا عادة بنصف المحور الأكبر.
Not to scale|غير مرسوم بمقياس حقيقي|A warning that displayed sizes or distances do not share real proportions.|تحذير من أن الأحجام أو المسافات المعروضة لا تحفظ النسب الحقيقية.
Volume scaling|تحجيم الحجم|The rule that volume changes with the cube of a common linear scale factor.|قاعدة تغير الحجم مع مكعب عامل تحجيم خطي مشترك.
Surface-area scaling|تحجيم مساحة السطح|The rule that area changes with the square of a common linear scale factor.|قاعدة تغير المساحة مع مربع عامل تحجيم خطي مشترك.
Cosmic distance ladder|سلم المسافات الكونية|Overlapping methods that calibrate distance measurements from nearby to remote objects.|طرق متداخلة تعاير قياس المسافات من الأجرام القريبة إلى البعيدة.
Radar ranging|قياس المدى الراداري|Measuring distance from the round-trip travel time of a transmitted radio signal.|قياس المسافة من زمن ذهاب إشارة راديوية مرسلة وإيابها.
Standard candle|الشمعة المعيارية|An object whose intrinsic luminosity can be estimated for distance measurement.|جرم يمكن تقدير ضيائه الذاتي لقياس المسافة.
Cepheid variable|المتغير القيفاوي|A pulsating star with a useful period–luminosity relation.|نجم نابض ذو علاقة مفيدة بين الفترة والضياء.
Period–luminosity relation|علاقة الفترة بالضياء|An empirical connection between pulsation period and intrinsic luminosity in a class of variable stars.|صلة تجريبية بين فترة النبض والضياء الذاتي لفئة من النجوم المتغيرة.
Type Ia supernova|المستعر الأعظم من النوع Ia|A class of stellar explosions whose observed properties can be used to standardize luminosities.|فئة انفجارات نجمية يمكن استخدام خصائصها المرصودة لتقييس ضيائها.
Zero-point calibration|معايرة نقطة الصفر|Setting the reference level shared by a measurement scale.|تحديد المستوى المرجعي المشترك لمقياس القياس.
Correlated uncertainty|عدم اليقين المترابط|Error components shared among measurements that do not average away independently.|مكونات خطأ مشتركة بين قياسات لا تتلاشى بالمتوسط المستقل.
Hubble relation|علاقة هابل|The approximate nearby expansion relation v = H₀d under specified conditions.|علاقة التمدد القريبة التقريبية v = H₀d ضمن شروط محددة.
Megaparsec|الميغافرسخ|A distance unit equal to one million parsecs.|وحدة مسافة تساوي مليون فرسخ فلكي.
Distance modulus|معامل المسافة|The difference between apparent and absolute magnitude used in distance estimates.|الفرق بين القدر الظاهري والمطلق المستخدم في تقدير المسافة.
Extinction correction|تصحيح الإخماد|Adjusting a measurement for estimated dimming by dust or other intervening material.|تعديل قياس لإزالة خفت مقدر بسبب الغبار أو مادة متداخلة.
Independent cross-check|التحقق المستقل المتقاطع|Testing a measurement using a different method with different systematic effects.|اختبار قياس بطريقة مختلفة ذات تأثيرات منهجية مختلفة.`),
};
