import { S, type SectionSeed } from './lessons';
/** Original guided practice. These are teaching exercises, not observations or exam keys. */
export const workshops: Record<string, SectionSeed[]> = {
  'l-1-1': [
    S(
      'WORKSHOP',
      'Build an explanation from a measurement',
      'ابنِ تفسيرًا من قياس',
      `Imagine that a camera records a star at 100 brightness units on Monday, 96 on Tuesday, and 100 on Wednesday. These are invented teaching data. Begin with the narrowest defensible statement: the recorded signal decreased and recovered. Do not begin by announcing a planet. The detector might have changed, a cloud might have crossed the field, or the star itself might have varied.

Next, ask what each explanation predicts. A thin cloud may dim several nearby stars together. A detector problem may affect a particular image region or exposure. An orbiting planet may produce repeated dips at a consistent interval. The predictions are not interchangeable. Recording comparison stars, checking calibration frames, and returning on later nights can distinguish some of them. Even a periodic dip needs further checks because an eclipsing stellar companion can imitate a planetary transit.

This is the central rhythm of astronomy: measure, propose, predict, compare, and revise. A telescope does not hand the observer a label reading “planet.” Instruments supply signals, and people build an inference. Better instruments reduce some uncertainties, but careful reasoning remains necessary. When independent methods support the same conclusion, confidence increases without becoming absolute certainty.

Now revisit your cosmic address. A moon is defined by its orbital relationship; a planet by a classification convention and physical context; a galaxy by its large gravitationally organized population of stars, gas, dust, and dark matter. These are not just three different sizes of the same thing. A galaxy contains many stellar systems, while a constellation is a region on our sky and need not be a bound physical collection.

Practice separating three sentences in your notebook: “I measured…”; “One explanation is…”; “A further test would be…”. The third sentence is especially valuable. It turns a plausible story into a researchable question. You can use the same habit when reading a headline about a new object, even if you have never operated a telescope.`,
      `تخيّل أن كاميرا سجلت نجمًا عند 100 وحدة سطوع يوم الاثنين و96 يوم الثلاثاء و100 يوم الأربعاء. هذه بيانات تعليمية مختلقة لا رصد حقيقي. ابدأ بالعبارة الأضيق التي تدعمها: انخفضت الإشارة المسجلة ثم عادت. لا تعلن اكتشاف كوكب فورًا. ربما تغير الكاشف أو مرت سحابة أو تغير النجم نفسه.

اسأل بعد ذلك عما يتنبأ به كل تفسير. قد تخفّض السحابة الرقيقة سطوع نجوم مجاورة معًا. وقد تؤثر مشكلة الجهاز في منطقة معينة من الصورة. أما كوكب مداري فقد ينتج انخفاضات متكررة بفاصل ثابت. ليست هذه التنبؤات متكافئة. يساعد رصد نجوم مقارنة وفحص صور المعايرة والعودة في ليالٍ لاحقة على التمييز بينها. وحتى الانخفاض الدوري يحتاج إلى اختبارات لأن رفيقًا نجميًا حاجبًا قد يشبه عبور كوكب.

هذه دورة العمل الفلكي: قِس واقترح وتنبأ وقارن وراجع. لا يعطي التلسكوب الراصد بطاقة مكتوبًا عليها «كوكب». تنتج الأجهزة إشارات ويبني العلماء استدلالًا. تقلل الأجهزة الأفضل بعض أوجه عدم اليقين، لكنها لا تلغي التفكير الدقيق. تتعزز الثقة عندما تتفق طرق مستقلة دون أن تصبح يقينًا مطلقًا.

عُد إلى عنوانك الكوني. يُعرّف القمر بعلاقته المدارية، والكوكب باصطلاح تصنيفي وسياق فيزيائي، والمجرة بتجمع كبير تنظمه الجاذبية ويضم نجومًا وغازًا وغبارًا ومادة مظلمة. ليست هذه ثلاثة أحجام لشيء واحد. تحتوي المجرة نظمًا نجمية عديدة، بينما الكوكبة منطقة في سمائنا وليست بالضرورة مجموعة مترابطة.

درّب نفسك على كتابة ثلاث جمل منفصلة: «قستُ…»، و«أحد التفسيرات…»، و«الاختبار الإضافي المناسب…». تحوّل الجملة الثالثة قصة معقولة إلى سؤال قابل للبحث. ويمكن استعمال هذه العادة عند قراءة خبر اكتشاف حتى دون خبرة بتشغيل التلسكوب.`,
    ),
    S(
      'CHECKPOINT',
      'Pause, predict, then explain',
      'توقف وتنبأ ثم اشرح',
      `Before continuing, explain why one photograph cannot establish that two neighboring points are physically close. Your explanation should mention the missing depth information. Then invent an observation that would help: a distance measurement is more useful here than simply a sharper photograph.

Self-check: a large apparent separation can involve nearby objects, while a tiny apparent separation can involve objects at very different distances. “Close on the sky” is an angular statement. “Close in space” is a three-dimensional statement. Keeping those ideas separate is the first step toward reading astronomical evidence accurately.`,
      `قبل المتابعة، اشرح لماذا لا تثبت صورة واحدة أن نقطتين متجاورتين قريبتان في الفضاء. ينبغي أن تشير إلى غياب معلومات العمق. ثم اقترح قياسًا يساعد: قياس المسافة أنسب هنا من مجرد صورة أشد وضوحًا.

تحقق ذاتي: قد يفصل اتجاهان متباعدان جرمَين قريبين منا، وقد يفصل اتجاهان متقاربان جرمَين على مسافتين مختلفتين جدًا. «متقاربان في السماء» عبارة زاوية، و«متقاربان في الفضاء» عبارة ثلاثية الأبعاد. يضعك التمييز بينهما على بداية قراءة الدليل الفلكي بدقة.`,
    ),
  ],
  'l-1-2': [
    S(
      'WORKSHOP',
      'Design a repeatable sky observation',
      'صمّم رصدًا سماويًا قابلًا للتكرار',
      `Choose a safe outdoor location with a clear view and a fixed landmark such as the roofline of a building. Use an ordinary clock and a notebook. You do not need a telescope. Record the date, local time and time zone, approximate location, direction, cloud cover, and any bright nearby lights. A drawing without those details is harder for someone else to interpret or repeat.

Sketch three or four recognizable points relative to the landmark. Return after an hour and make a second sketch from the same position. Compare the pattern internally as well as its location relative to the building. Over one hour the familiar stellar pattern changes little, while its orientation or position against your local horizon changes. Earth's rotation explains most of this daily apparent motion. The exact path depends on latitude and the direction of the stars; the simple sky-dome graphic is not a prediction for your site.

Angular measurement gives language to your sketch. A full turn is 360 degrees. One degree contains 60 arcminutes, and one arcminute contains 60 arcseconds. Therefore a separation of half a degree is 30 arcminutes or 1,800 arcseconds. The word “second” here names an angle, not a time interval. Always include the angular unit when writing a measurement.

Apparent brightness provides a different clue. A nearby small lamp can look brighter than a distant powerful lamp. Likewise, a star's received light depends on luminosity, distance, and intervening material. Do not rank the distances of two stars from brightness alone. Atmospheric turbulence can make a star twinkle, but twinkling is not an infallible identification test for every object or observing condition.

On a later night, repeat the observation at the same clock time. Over many nights, a planet may change position relative to the stellar pattern. Separate this slow relative change from the faster daily movement of the whole sky. Careful repetition reveals which comparison answers which question. Never use this exercise to observe the Sun directly.`,
      `اختر موقعًا خارجيًا آمنًا ومعلمًا ثابتًا مثل حافة مبنى. تحتاج إلى ساعة عادية ودفتر، لا إلى تلسكوب. سجّل التاريخ والوقت المحلي والمنطقة الزمنية والموقع التقريبي والاتجاه والسحب والأضواء القريبة. يصعب تفسير رسم بلا هذه التفاصيل أو تكرار ظروفه.

ارسم ثلاث أو أربع نقاط مميزة بالنسبة إلى المعلم. عُد بعد ساعة وارسم مجددًا من الموضع نفسه. قارن ترتيب النجوم داخل النمط ومكان النمط بالنسبة إلى المبنى. خلال ساعة يبقى النمط النجمي المألوف شبه ثابت، بينما يتغير اتجاهه أو موضعه بالنسبة إلى الأفق المحلي. يفسر دوران الأرض معظم الحركة اليومية الظاهرية. يعتمد المسار الدقيق على خط العرض واتجاه النجوم؛ فالرسم التعليمي ليس توقعًا لموقعك.

يمنح القياس الزاوي رسمك لغة كمية. الدورة الكاملة 360 درجة، والدرجة 60 دقيقة قوسية، والدقيقة 60 ثانية قوسية. لذلك يساوي نصف الدرجة 30 دقيقة قوسية أو 1800 ثانية قوسية. «الثانية» هنا زاوية لا مدة زمنية. اكتب الوحدة دائمًا مع القياس.

يعطي السطوع الظاهري قرينة مختلفة. قد يبدو مصباح صغير قريب أسطع من مصباح قوي بعيد. كذلك يعتمد الضوء المستقبَل من النجم على ضيائه ومسافته والمادة بينه وبيننا. لا ترتب مسافات النجوم من سطوعها وحده. قد يسبب اضطراب الجو تلألؤ النجم، لكنه ليس اختبار تعريف معصومًا لكل الأجرام والظروف.

كرر الرصد في ليلة لاحقة في الوقت نفسه. عبر ليالٍ عديدة قد يتحرك كوكب بالنسبة إلى النمط النجمي. افصل هذا التغير النسبي البطيء عن الحركة اليومية الأسرع للسماء كلها. يبين التكرار الدقيق أي مقارنة تجيب عن أي سؤال. لا تستعمل هذا النشاط للنظر المباشر إلى الشمس.`,
    ),
    S(
      'CHECKPOINT',
      'An angle is not a distance',
      'الزاوية ليست مسافة',
      `For a small angle measured in radians, physical size is approximately D = dθ. Suppose an object is 5,000 km away and spans 0.002 rad: D ≈ 10 km. Check the units: kilometers multiplied by a dimensionless angular ratio leave kilometers. If the assumed distance doubles, the inferred size doubles even though the observed angle is unchanged.

This example explains why a sky map alone cannot tell you the true separation of stars. First measure the direction; then obtain independent distance information; only then construct a physical model. The approximation is for small angles and a simple geometry, not for arbitrarily wide fields.`,
      `للزاوية الصغيرة بالراديان يكون الحجم الفيزيائي تقريبيًا D = dθ. إذا كان الجرم على بعد 5000 كم وامتد 0.002 راديان، كان D نحو 10 كم. تحقق من الوحدات: كيلومترات مضروبة في نسبة زاوية بلا أبعاد تعطي كيلومترات. إذا ضاعفت المسافة المفترضة ضاعفت الحجم المستنتج مع بقاء الزاوية نفسها.

لهذا لا تكفي خريطة السماء لتحديد الفصل الحقيقي للنجوم. قِس الاتجاه أولًا، ثم احصل على معلومات مسافة مستقلة، وبعدها ابنِ النموذج الفيزيائي. يخص التقريب الزوايا الصغيرة والهندسة البسيطة، لا الحقول الواسعة اعتباطيًا.`,
    ),
  ],
  'l-2-1': [
    S(
      'WORKSHOP',
      'Two questions about the same star',
      'سؤالان عن النجم نفسه',
      `An observing team asks, “How does the brightness of this star change?” It takes calibrated exposures, measures the light, and plots brightness against time. Another team asks, “What physical mechanism could produce that change?” It compares pulsation, eclipses, rotation, and instrumental effects. The first question emphasizes measurement; the second emphasizes physical explanation. Modern astronomy and astrophysics share both activities rather than occupying completely separate professions.

Follow the measurement chain. Photons enter an optical system, interact with a detector, and become an electrical signal. The detector also records unwanted contributions such as sky background and electronic noise. A processed measurement subtracts or models these effects and reports uncertainty. A beautifully colored image is useful, but a scientific interpretation must still account for how the image was made.

Different wavelengths reveal different conditions. Visible and infrared data can probe stars and dust in different ways. Radio, X-ray, and other observations can expose additional processes. This does not mean that every wavelength passes through everything or that one instrument is universally superior. Choose an instrument to answer a particular question and state what it cannot measure. A false-color rendering makes otherwise invisible information viewable; it does not make the underlying measurements false.

Consider two proposed explanations for a faint source. Model A says that it is a weak emitter nearby. Model B says that it is a stronger emitter farther away. One brightness value may fit both. A spectrum, parallax measurement, extinction estimate, or variability pattern can provide a new constraint. The purpose of extra observations is not merely to collect more pictures; it is to reduce a specific ambiguity.

A useful reading habit is to identify the noun after “measured” and the noun after “inferred.” A team may measure wavelength shifts and infer radial motion, or measure a light curve and infer a possible orbital period. Treating every inferred quantity as if it came directly from a sensor hides the assumptions that connect evidence to a model.`,
      `يسأل فريق رصد: «كيف يتغير سطوع هذا النجم؟» فيلتقط تعريضات معايرة ويقيس الضوء ويرسمه مع الزمن. ويسأل فريق آخر: «أي آلية فيزيائية تنتج هذا التغير؟» فيقارن النبض والكسوف والدوران وآثار الأجهزة. يركز السؤال الأول على القياس والثاني على التفسير الفيزيائي. يتشارك الفلك والفيزياء الفلكية الحديثان النشاطين بدل أن يكونا مهنتين منفصلتين تمامًا.

تتبع سلسلة القياس. تدخل الفوتونات منظومة بصرية وتتفاعل مع كاشف لتصبح إشارة كهربائية. يسجل الكاشف أيضًا خلفية السماء وضجيجًا إلكترونيًا. تطرح المعالجة هذه المساهمات أو تنمذجها وتقدر عدم اليقين. الصورة الملونة جميلة ومفيدة، لكن تفسيرها العلمي يجب أن يراعي طريقة إنتاجها.

تكشف الأطوال الموجية ظروفًا مختلفة. تساعد البيانات المرئية وتحت الحمراء على دراسة النجوم والغبار بطرق مختلفة، وتضيف الراديوية والسينية عمليات أخرى. لا يعني ذلك أن كل موجة تنفذ عبر كل شيء أو أن جهازًا واحدًا أفضل دائمًا. اختر الجهاز لسؤال محدد واذكر ما يعجز عن قياسه. يجعل التلوين الاصطلاحي المعلومات غير المرئية قابلة للعرض؛ ولا يجعل القياسات الأساسية زائفة.

قارن تفسيرين لمصدر خافت. يقول الأول إنه باعث ضعيف قريب، والثاني إنه باعث قوي بعيد. قد يوافقان قيمة سطوع واحدة. يضيف الطيف أو اختلاف المنظر أو تقدير الإخماد أو نمط التغير قيدًا جديدًا. الغرض من الأرصاد الإضافية ليس زيادة الصور فقط، بل تقليل غموض محدد.

عند القراءة، حدد ما يأتي بعد «قِيس» وما يأتي بعد «استُنتج». قد يقيس الفريق إزاحة طول موجي ويستنتج حركة شعاعية، أو يقيس منحنى ضوئيًا ويستنتج فترة مدارية محتملة. إخفاء هذا الفرق يحجب الافتراضات التي تربط الدليل بالنموذج.`,
    ),
    S(
      'CHECKPOINT',
      'Choose the measurement that tests the claim',
      'اختر القياس الذي يختبر الادعاء',
      `A headline says that a red-looking star must be moving away. A color photograph alone does not establish this. Its appearance may reflect temperature, dust, selected filters, or display processing. A Doppler test requires comparing identifiable spectral features with their reference wavelengths and considering other possible shifts.

For a separate thought experiment, two identical unobscured lamps are observed at distances d and 2d. Light from the second is spread over four times the area, so its received flux is one quarter as large. This is a physical model with explicit assumptions. It explains a trend but does not prove that every faint astronomical source is simply farther away.`,
      `يقول خبر إن النجم الذي يبدو أحمر لا بد أنه يبتعد. لا تثبت صورة ملونة ذلك وحدها. فقد يعكس المظهر الحرارة أو الغبار أو المرشحات أو المعالجة. يتطلب اختبار دوبلر مقارنة خطوط طيفية معروفة بأطوالها المرجعية ومراعاة أسباب أخرى للإزاحة.

في تجربة ذهنية منفصلة، ضع مصباحين متماثلين بلا حجب عند d و2d. ينتشر ضوء الثاني على أربعة أمثال المساحة فيكون تدفقه ربع الأول. هذا نموذج فيزيائي بافتراضات معلنة. يفسر اتجاهًا لكنه لا يثبت أن كل مصدر فلكي خافت أبعد ببساطة.`,
    ),
  ],
  'l-2-2': [
    S(
      'WORKSHOP',
      'Read a spectrum as a measurement',
      'اقرأ الطيف بوصفه قياسًا',
      `A spectrum separates incoming light by wavelength. Its horizontal axis may be wavelength in nanometers, frequency in hertz, or photon energy. Those quantities are related but are not numerically interchangeable. If wavelength increases, frequency decreases because c = λf in vacuum. An energy relation such as E = hf therefore says that shorter-wavelength photons carry more energy, not necessarily that the whole source emits more total power.

A smooth continuum can contain clues about temperature. Narrow absorption or emission features carry information about transitions between atomic or molecular energy states. A dark line is not a physical black stripe painted on the star. It is a reduced amount of light in a small wavelength interval relative to the surrounding spectrum. Which lines appear depends on temperature, ionization, density, and radiative transfer, so identifying elements is more careful than matching one isolated notch.

Begin an analysis by checking the wavelength calibration and the signal quality. Identify several features rather than just one. Compare their spacings with a reference pattern. If the same fractional shift explains multiple lines, a shared physical explanation becomes more credible. A single noisy feature may be misidentified, blended with another line, or affected by the atmosphere.

Now distinguish three quantities often confused in a photograph. Luminosity is the total emitted power, measured in watts. Flux is the power received per detector area, such as W m⁻². Surface brightness describes received light per apparent angular area. The inverse-square formula for an unresolved isotropic source concerns flux and distance; it should not be applied blindly to every extended patch in an image.

Finally inspect the image caption. Webb detects infrared wavelengths, which are outside normal human vision. A rendering can assign a red display channel to one filter and a blue channel to another. Those assignments preserve scientific distinctions while making them visible. They do not tell you what your unaided eyes would see from a spaceship near the cloud.`,
      `يفصل الطيف الضوء الوارد حسب الطول الموجي. قد يكون المحور الأفقي بالنانومتر أو بالتردد بالهرتز أو بطاقة الفوتون. ترتبط هذه الكميات لكنها لا تتبادل القيم عدديًا. إذا زاد الطول الموجي قل التردد لأن c = λf في الفراغ. لذلك تعني E = hf أن الفوتون الأقصر موجة أعلى طاقة، لا أن المصدر كله يصدر قدرة كلية أكبر بالضرورة.

قد يدل الطيف المتصل على الحرارة. وتحمل خطوط الامتصاص والإصدار معلومات عن انتقالات الحالات الطاقية للذرات والجزيئات. الخط الداكن ليس شريطًا أسود مرسومًا على سطح النجم، بل نقص الضوء في مجال موجي ضيق بالنسبة إلى جواره. يعتمد ظهور الخطوط على الحرارة والتأين والكثافة وانتقال الإشعاع؛ لذا يتطلب التعرف على العناصر أكثر من مطابقة انخفاض منفرد.

ابدأ بفحص معايرة الطول الموجي وجودة الإشارة. حدد عدة خطوط وقارن تباعدها بنمط مرجعي. إذا فسرت إزاحة كسرية واحدة خطوطًا متعددة، أصبح التفسير المشترك أقوى. قد يكون الخط المنفرد الضجيجي معرّفًا خطأ أو ممزوجًا بخط آخر أو متأثرًا بالغلاف الجوي.

ميّز الآن بين ثلاث كميات. الضياء قدرة المصدر الكلية بالواط. والتدفق قدرة مستقبلة لكل مساحة كاشف مثل W m⁻². أما السطوع السطحي فيصف الضوء المستقبَل لكل مساحة زاوية ظاهرة. تتناول علاقة التربيع العكسي تدفق مصدر نقطي متساوي الإصدار ومسافته، ولا يصح تطبيقها عميانيًا على كل رقعة ممتدة بالصورة.

أخيرًا افحص الوصف. يرصد ويب أطوالًا تحت حمراء خارج رؤية الإنسان. قد تعيّن المعالجة الأحمر لمرشح والأزرق لآخر. تحافظ التعيينات على فروق علمية وتجعلها مرئية، لكنها لا تصف بالضرورة ما تراه عينك من مركبة قرب السحابة.`,
    ),
    S(
      'CHECKPOINT',
      'Work through a fractional shift',
      'احسب الإزاحة الكسرية خطوة بخطوة',
      `Use a reference line at 600.0 nm and an observed line at 600.6 nm. Subtract first: Δλ = 0.6 nm. Divide by the reference, not the observed value: z = 0.6/600.0 = 0.001. Nanometers cancel, so z has no units. The positive sign denotes a longer observed wavelength.

If a small-speed Doppler interpretation is appropriate, vᵣ ≈ zc gives about 300 km/s for c ≈ 300,000 km/s. This is the line-of-sight component, not the complete space velocity. Large shifts need relativistic or cosmological treatment as appropriate. Explain those restrictions before turning a calculated number into a physical claim.`,
      `استعمل خطًا مرجعيًا عند 600.0 نانومتر وخطًا مرصودًا عند 600.6. اطرح أولًا: Δλ = 0.6 نانومتر. اقسم على المرجعي لا المرصود: z = 0.6/600.0 = 0.001. تُختصر النانومترات فتكون z بلا وحدة. تشير الإشارة الموجبة إلى طول مرصود أكبر.

إذا صلح تفسير دوبلر البطيء أعطت vᵣ ≈ zc نحو 300 كم/ث عند c ≈ 300000 كم/ث. هذه مركبة السرعة على خط النظر لا السرعة الفضائية الكاملة. تحتاج الإزاحات الكبيرة إلى معالجة نسبية أو كونية ملائمة. اذكر القيود قبل تحويل العدد إلى ادعاء فيزيائي.`,
    ),
  ],
  'l-3-1': [
    S(
      'WORKSHOP',
      'Read historical evidence without a simple hero story',
      'اقرأ التاريخ دون اختزاله في بطل واحد',
      `Astronomical knowledge accumulated through observing, recording, translating, calculating, and correcting. These activities occurred in many societies and often served practical needs such as calendars, navigation, and timekeeping. A useful history asks not only who proposed an idea, but also what records, instruments, institutions, and mathematical tools made the proposal possible.

Suppose you encounter a historical report of a “new star.” Do not immediately assign it a modern classification. Ask when and where it was observed, how long it remained visible, whether its position was recorded, and whether independent reports exist. A comet, a nova, a supernova, or a different phenomenon may require different evidence. Translating an old descriptive word directly into a modern technical category can produce a false conclusion.

Star catalogs illustrate both continuity and revision. Al-Sufi's tenth-century Book of the Fixed Stars drew on earlier catalog traditions while incorporating observation and description. It belongs within a much larger history involving Greek, Arabic, Persian, Indian, Chinese, and other contributions. Calling a work important does not require claiming that one person invented the entire discipline. Transmission and criticism are scientific achievements too.

Geometrical models could predict appearances without providing the modern physical explanation. A successful calendar or planetary position calculation is valuable, but predictive success over a limited range does not establish every assumption of a model. Later observations may distinguish models that previously produced similar results. This is the same evidence-versus-interpretation problem that appears in current astronomy.

Use a source checklist when researching a historical claim: distinguish the original record from a later translation; note the author's purpose; identify what was actually measured; compare independent scholarship; and mark what remains uncertain. Dates can provide useful landmarks, but understanding why an idea changed is more informative than memorizing a list of names. History becomes a lesson in how knowledge is built, not a contest to award all credit to one culture.`,
      `تراكمت المعرفة الفلكية بالرصد والتسجيل والترجمة والحساب والتصحيح. جرت هذه الأنشطة في مجتمعات عديدة وخدمت التقاويم والملاحة وضبط الوقت. يسأل التاريخ المفيد ليس فقط عمّن اقترح فكرة، بل عما أتاحها من سجلات وأجهزة ومؤسسات وأدوات رياضية.

إذا وجدت تقريرًا قديمًا عن «نجم جديد» فلا تصنفه فورًا بمصطلح حديث. اسأل متى وأين رُصد، وكم بقي ظاهرًا، وهل سُجل موضعه، وهل توجد تقارير مستقلة. يتطلب التمييز بين مذنب ومستعر ومستعر أعظم أدلة مختلفة. قد يؤدي تحويل وصف قديم مباشرة إلى فئة تقنية حديثة إلى استنتاج خاطئ.

توضح فهارس النجوم الاستمرار والمراجعة معًا. استند كتاب صور الكواكب الثابتة للصوفي في القرن العاشر إلى تقاليد فهرسة سابقة مع إضافات رصدية ووصفية. وهو جزء من تاريخ أوسع يشمل إسهامات يونانية وعربية وفارسية وهندية وصينية وغيرها. لا يستلزم الاعتراف بأهمية العمل ادعاء أن شخصًا واحدًا اخترع العلم كله. نقل المعرفة ونقدها إنجازان أيضًا.

استطاعت نماذج هندسية التنبؤ بالمظاهر دون التفسير الفيزيائي الحديث. نجاح تقويم أو حساب موضع كوكب مفيد، لكنه لا يثبت كل افتراضات النموذج. قد تميز أرصاد لاحقة بين نماذج كانت تعطي نتائج متشابهة. إنها مشكلة الدليل والتفسير نفسها التي نجدها في الفلك الحالي.

استخدم قائمة فحص للمصدر التاريخي: ميّز الأصل من ترجمته اللاحقة، وحدد غرض المؤلف وما قِيس فعلًا، وقارن الدراسات المستقلة، وصرّح بما بقي غير مؤكد. تساعد التواريخ على تحديد المحطات، لكن فهم سبب تغير الفكرة أهم من حفظ الأسماء. يصبح التاريخ درسًا في بناء المعرفة، لا مسابقة لمنح الفضل كله لثقافة واحدة.`,
    ),
    S(
      'CHECKPOINT',
      'A timeline with a reason attached',
      'خط زمني مرتبط بالأسباب',
      `Arrange these landmarks: Al-Sufi's star book in 964; Copernicus's major heliocentric publication in 1543; Kepler's first two planetary laws in 1609; Newton's Principia in 1687. Then attach one contribution to each: cataloging and observation, a changed planetary arrangement, quantitative orbital regularities, and a dynamical explanation.

The dates alone do not explain the transitions. Add the role of improved observations and mathematical methods. Kepler's third law was published later, in 1619, so avoid saying that all three laws appeared in 1609. Precision in historical wording matters just as precision in a scientific unit does.`,
      `رتّب المحطات: كتاب الصوفي سنة 964، ونشر كوبرنيكوس الرئيس سنة 1543، وقانونا كبلر الأولان سنة 1609، وكتاب المبادئ لنيوتن سنة 1687. اربط بكل محطة إسهامًا: الفهرسة والرصد، وتغيير ترتيب الكواكب، وانتظامات مدارية كمية، وتفسير ديناميكي.

لا تفسر التواريخ وحدها الانتقال؛ أضف دور تحسن الرصد والرياضيات. نُشر قانون كبلر الثالث لاحقًا سنة 1619، فلا تنسب القوانين الثلاثة جميعًا إلى 1609. دقة العبارة التاريخية مهمة مثل دقة الوحدة العلمية.`,
    ),
  ],
  'l-3-2': [
    S(
      'WORKSHOP',
      'From a changed viewpoint to a force law',
      'من تغيير المنظور إلى قانون القوة',
      `An Earth-centered description can reproduce many apparent sky motions with sufficient geometrical machinery. A Sun-centered arrangement makes some relationships easier to understand, but changing the center alone does not automatically yield the best predictions. Copernicus retained circular ingredients; Kepler later found that ellipses and specific timing rules fit the available planetary observations more accurately.

Separate three different kinds of statement. A geometrical statement describes the shape of an orbit. A kinematic statement describes how position changes with time. A dynamical statement relates the motion to forces and masses. Kepler's laws describe orbital patterns. Newtonian mechanics explains why an inverse-square gravitational attraction produces those patterns for idealized two-body systems. This distinction helps you see what a new theory adds rather than treating every historical model as an isolated picture.

In an ellipse, the Sun occupies one focus, not the geometric center. A planet moves faster near the Sun and slower farther away while sweeping equal areas in equal times. The third law connects orbital period and semimajor axis. For a low-mass body orbiting a one-solar-mass star, with P in years and a in AU, P² ≈ a³. A different central mass requires a mass factor; units and assumptions are part of the formula.

The telescope added important constraints. Jupiter's moons demonstrated that not everything revolves around Earth. Venus's observed phases ruled out the simplest traditional Ptolemaic arrangement, but were also compatible with a geoheliocentric alternative. No single observation should be inflated into proof of every component of the modern model. A web of observations and physical arguments changed the balance of evidence.

Newtonian gravity remains extremely useful in many weak-field, low-speed situations. General relativity extends its domain rather than making every earlier calculation worthless. Ask which approximation is adequate for the precision and physical regime of the problem. That question is more scientific than declaring a model universally true or universally useless.`,
      `يمكن لوصف متمركز حول الأرض تمثيل حركات ظاهرية كثيرة بآليات هندسية كافية. يجعل ترتيب متمركز حول الشمس بعض العلاقات أوضح، لكن تغيير المركز وحده لا يمنح أفضل التنبؤات. احتفظ كوبرنيكوس بعناصر دائرية، ثم وجد كبلر أن القطوع الناقصة وقواعد التوقيت تلائم الأرصاد أفضل.

افصل ثلاث عبارات. الهندسية تصف شكل المدار، والحركية تصف تغير الموضع مع الزمن، والديناميكية تربط الحركة بالقوى والكتل. تصف قوانين كبلر أنماطًا مدارية، بينما تفسر ميكانيكا نيوتن لماذا تنتج قوة الجاذبية ذات التربيع العكسي هذه الأنماط في نظام مثالي من جسمين. يوضح ذلك ما تضيفه النظرية بدل اعتبار كل نموذج مجرد صورة منفصلة.

تشغل الشمس بؤرة القطع الناقص لا مركزه الهندسي. يتحرك الكوكب أسرع قربها وأبطأ بعيدًا عنها، ماسحًا مساحات متساوية في أزمنة متساوية. يربط القانون الثالث الفترة بنصف المحور الأكبر. لجسم صغير حول نجم كتلته شمسية، بالسنوات والوحدات الفلكية، تكون P² ≈ a³. تتطلب كتلة مركزية مختلفة عامل كتلة؛ فالوحدات والافتراضات جزء من المعادلة.

أضاف التلسكوب قيودًا مهمة. أثبتت أقمار المشتري أن بعض الأجرام لا تدور حول الأرض. استبعدت أطوار الزهرة المرصودة أبسط ترتيب بطلمي تقليدي، لكنها وافقت أيضًا بديلًا أرضيًّا شمسيًّا. لا تضخّم رصدًا واحدًا ليصبح برهانًا على كل أجزاء النموذج الحديث؛ فقد غيرت شبكة أدلة وأفكار فيزيائية ميزان الترجيح.

تبقى جاذبية نيوتن مفيدة جدًا في الحقول الضعيفة والسرعات البطيئة. تمد النسبية العامة مجال الوصف ولا تجعل الحسابات السابقة كلها بلا قيمة. اسأل أي تقريب يكفي للدقة المطلوبة والظروف الفيزيائية، بدل وصف نموذج بأنه صحيح في كل شيء أو عديم الفائدة تمامًا.`,
    ),
    S(
      'CHECKPOINT',
      'Check a period and a force ratio',
      'تحقق من فترة ونسبة قوة',
      `For a = 9 AU around a one-solar-mass star, cube the distance first: 9³ = 729. Then take the positive square root: P = 27 years. It would be wrong to divide 9 by 2 or to interpret the 9 as kilometers. Compare with a = 1 AU, where the same convention gives one year.

For fixed masses, Newton's force magnitude varies as 1/r². Tripling the separation therefore leaves one ninth of the original force, about 0.111 times as much. This does not say that every orbital period grows by a factor of nine; a force ratio and a period law answer different questions. State the quantity being compared before calculating.`,
      `عند a = 9 وحدات فلكية حول كتلة شمسية، كعّب المسافة أولًا: 9³ = 729، ثم خذ الجذر الموجب: P = 27 سنة. لا تقسم 9 على 2 ولا تفسرها بالكيلومترات. عند وحدة فلكية واحدة تعطي الاصطلاحات نفسها سنة واحدة.

للكتل الثابتة تتناسب قوة نيوتن مع 1/r². تجعل مضاعفة الفصل ثلاث مرات القوة تُسع الأصل، أي نحو 0.111 منه. لا يعني ذلك أن كل فترة مدارية تزيد تسع مرات؛ فنسبة القوة وقانون الفترة يجيبان عن سؤالين مختلفين. حدد الكمية المقارنة قبل الحساب.`,
    ),
  ],
  'l-4-1': [
    S(
      'WORKSHOP',
      'Keep three kinds of distance separate',
      'افصل ثلاثة معانٍ للمسافة',
      `A nearby light-travel calculation can be very simple. If a stationary star is 20 light-years away, light takes about 20 years to reach us. We see an earlier state, not a live broadcast with zero delay. If someone there received a question and replied immediately, a round-trip exchange would take roughly 40 years. This local illustration neglects motion and expansion over the path.

At cosmological distances, saying “distance” without defining it can be misleading. Lookback time tells us how long the observed light has been traveling. Present-day proper distance describes a separation at a common cosmic time in a chosen cosmological model. Luminosity distance is a quantity defined through the relationship between observed flux and intrinsic luminosity. These definitions serve different purposes and need not have the same numerical value.

Why can the present radius of the observable universe be much larger than its age multiplied by c? The universe expanded while the light traveled. The current separation of regions is therefore not obtained simply by multiplying a light-travel time by the vacuum speed of light. A local light-speed limit does not forbid the distance between far-separated comoving regions from increasing rapidly in an expanding spacetime.

The observable boundary is not a material shell that a spacecraft would collide with. It concerns the history of signals that could reach an observer. Another observer far away would have an observable region centered on their own position. Neither observer thereby becomes a preferred physical center of the whole universe. Our data do not directly measure the total extent of everything beyond our observational limits.

Read a distant-galaxy headline by asking four questions: what was measured; which distance definition is reported; what cosmological parameters were assumed; and how large are the uncertainties? An age of about 13.8 billion years and a present observable radius near 46 billion light-years are model-based estimates, not two rival answers to the same question.`,
      `قد يكون حساب زمن انتقال الضوء قريبًا بسيطًا. إذا كان نجم ساكن على بعد 20 سنة ضوئية، احتاج الضوء نحو 20 سنة للوصول. نرى حالة سابقة لا بثًا مباشرًا بلا تأخر. ولو أرسلنا سؤالًا ورد الطرف الآخر فورًا استغرق الذهاب والإياب نحو 40 سنة. يهمل هذا المثال المحلي الحركة والتمدد على المسار.

أما كونيًا فكلمة «مسافة» بلا تعريف قد تضلل. يصف زمن النظر إلى الماضي مدة رحلة الضوء. وتصف المسافة الفعلية الحالية فصلًا عند زمن كوني مشترك ضمن نموذج محدد. وتُعرّف مسافة الضياء بعلاقة التدفق المرصود بالضياء الذاتي. تخدم التعريفات أغراضًا مختلفة ولا يلزم أن تتساوى أعدادها.

لماذا يتجاوز نصف قطر الكون المرصود الحالي عمره مضروبًا في c؟ لأن الكون تمدد أثناء رحلة الضوء. فلا نحصل على الفصل الحالي بمجرد ضرب مدة الرحلة في سرعة الضوء. لا يمنع الحد المحلي لسرعة الضوء ازدياد المسافة سريعًا بين مناطق متباعدة تتحرك مع التمدد.

الحد المرصود ليس قشرة مادية تصطدم بها مركبة. يتعلق بتاريخ الإشارات القادرة على الوصول إلى الراصد. ولراصد بعيد منطقة مرصودة متمركزة حول موقعه هو أيضًا. لا يجعل ذلك أيًا منهما مركزًا فيزيائيًا مفضلًا للكون كله. لا تقيس بياناتنا مباشرة الامتداد الكلي لما وراء حدود الرصد.

عند قراءة خبر مجرة بعيدة اسأل: ما القياس؟ وأي تعريف للمسافة استُخدم؟ وأي معاملات كونية افترضت؟ وما عدم اليقين؟ عمر يقارب 13.8 مليار سنة ونصف قطر مرصود حالي يقارب 46 مليار سنة ضوئية تقديران ضمن نموذج، لا إجابتان متنافستان عن السؤال نفسه.`,
    ),
    S(
      'CHECKPOINT',
      'A signal is evidence of a past event',
      'الإشارة دليل على حدث ماضٍ',
      `Suppose a distant source changes today in its own local environment. We cannot know about that change before a signal arrives. A telescope with greater magnification does not remove this delay: it changes what can be resolved, not the propagation speed of information.

For a 12-light-year local separation, the outward leg of a radio exchange is about 12 years and the return leg adds another 12. Radio waves and visible light travel at the same vacuum speed. Their different frequencies do not make radio messages cross empty space instantaneously. Identify this distinction whenever a story confuses communication technology with a way around light-travel time.`,
      `افترض أن مصدرًا بعيدًا تغير اليوم في بيئته المحلية. لا نعرف التغير قبل وصول إشارة. لا يزيل تكبير التلسكوب التأخر؛ فهو يغير التفاصيل الممكن فصلها لا سرعة انتقال المعلومات.

لمسافة محلية 12 سنة ضوئية تستغرق الرسالة الراديوية نحو 12 سنة ذهابًا ومثلها إيابًا. تتحرك موجات الراديو والضوء المرئي بالسرعة نفسها في الفراغ. لا تجعل اختلافات التردد الرسائل آنية. افصل تقنية الاتصال عن تجاوز زمن انتقال الضوء عند قراءة القصص العلمية.`,
    ),
  ],
  'l-4-2': [
    S(
      'WORKSHOP',
      'Why several independent clues matter',
      'لماذا تهم قرائن مستقلة متعددة',
      `The hot Big Bang framework is not supported by a single photograph of an explosion. It connects several observations: large-scale expansion, the cosmic microwave background, and the abundances of light elements produced in early nuclear reactions. A useful model must explain how these different measurements fit one history rather than merely attach the phrase “Big Bang” to each of them.

The cosmic microwave background is radiation from the epoch when the plasma became largely neutral and ordinary light could travel much more freely. It is not light from the exact mathematical instant of a beginning. Expansion stretched its wavelengths, leaving a nearly thermal spectrum near 2.725 K today. Small angular temperature variations carry information about early density fluctuations and the conditions from which later structure grew.

Primordial nucleosynthesis concerns an earlier epoch. Nuclear reactions in the hot young universe produced light nuclei in proportions that depend on conditions such as the baryon density. Comparing predicted and observed abundances provides a test distinct from measuring the microwave background. The real analysis must account for later stellar processing and measurement uncertainty; a classroom summary does not replace those corrections.

Dark matter and dark energy name different problems. Dark matter is associated with gravitating mass not accounted for by ordinary luminous matter in many observations, including motions and lensing. Dark energy is associated with the inferred accelerated expansion in the standard cosmological description. Their microscopic nature is not established simply because the model assigns them names. Unknown physical identity does not erase the measurements that motivated the terms.

Keep an evidence ladder in your notes. Label directly measured quantities as observations, well-tested explanatory frameworks as theories, proposed mechanisms as hypotheses, and ideas without decisive tests as speculative. Inflation has motivated testable models, while broad multiverse proposals remain much more speculative. Neither should be introduced as a photographically observed place. Scientific openness requires room for new evidence, not treating every idea as equally established.`,
      `لا يعتمد إطار الانفجار العظيم الساخن على صورة واحدة لانفجار. إنه يربط التمدد واسع النطاق والخلفية الكونية الميكروية ووفرة العناصر الخفيفة الناتجة من التفاعلات النووية المبكرة. يجب أن يفسر النموذج كيف تنتمي القياسات المختلفة إلى تاريخ واحد، لا أن يلصق بها اسمًا فقط.

الخلفية الميكروية إشعاع من حقبة أصبح فيها الغاز متعادلًا إلى حد كبير واستطاع الضوء السفر بحرية أكبر. ليست ضوء اللحظة الرياضية الأولى. مدّ التوسع أطوالها الموجية فصار طيفها شبه حراري عند نحو 2.725 كلفن حاليًا. تحمل الاختلافات الحرارية الزاوية الصغيرة معلومات عن تقلبات الكثافة المبكرة ونشأة البنى اللاحقة.

ينتمي التخليق النووي البدائي إلى حقبة أسبق. أنتجت التفاعلات في الكون الحار الفتي نوى خفيفة بنسب تعتمد على ظروف مثل كثافة الباريونات. تقدم مقارنة الوفرة المتوقعة والمرصودة اختبارًا مختلفًا عن قياس الخلفية. ويجب في التحليل الحقيقي مراعاة المعالجة النجمية اللاحقة وعدم يقين القياس؛ لا يغني الملخص المدرسي عن التصحيحات.

تسمّي المادة المظلمة والطاقة المظلمة مشكلتين مختلفتين. ترتبط الأولى بكتلة جاذبة لا تكفي المادة العادية المضيئة لتفسير آثارها في الحركة والعدسات. وترتبط الثانية بالتمدد المتسارع المستنتج ضمن الوصف الكوني القياسي. لا تُعرف هويتهما المجهرية لمجرد تسميتهما. ولا يمحو جهل الهوية القياسات التي حفزت المصطلحين.

اكتب سلّم أدلة: الكميات المقاسة أرصاد، والأطر التفسيرية المختبرة جيدًا نظريات، والآليات المقترحة فرضيات، والأفكار بلا اختبارات فاصلة تصورات تكهنية. ألهم التضخم نماذج قابلة للاختبار، بينما تبقى اقتراحات الأكوان المتعددة الأوسع أشد تكهنًا. لا تعرض أيًا منهما مكانًا مصورًا مباشرة. الانفتاح العلمي يعني قبول الأدلة الجديدة لا مساواة جميع الأفكار في درجة الثبوت.`,
    ),
    S(
      'CHECKPOINT',
      'Use the scale factor carefully',
      'استخدم عامل القياس بعناية',
      `Cosmological redshift obeys 1 + z = a(now)/a(emission) in the standard expanding-spacetime description. If the scale factor grew by four, then 1 + z = 4 and z = 3. A wavelength emitted at 500 nm would be observed at 2,000 nm in this idealized example. This is a ratio calculation, not a small-speed Doppler calculation.

Do not substitute z = 3 into v = zc and announce an ordinary local speed of three times light speed. The approximation v ≈ zc has a limited regime. Explain the physical setting before choosing the mathematical relationship. Correct arithmetic applied outside a formula's assumptions can still produce a wrong interpretation.`,
      `في وصف الزمكان المتمدد تكون 1 + z = a(الآن)/a(الإصدار). إذا نما عامل القياس أربع مرات، فإن z = 3. تصبح موجة مصدرة عند 500 نانومتر مرصودة عند 2000 نانومتر في المثال المثالي. هذا حساب نسبة لا حساب دوبلر للسرعات الصغيرة.

لا تعوّض z = 3 في v = zc وتعلن سرعة محلية عادية ثلاثة أمثال الضوء. للعلاقة التقريبية مجال محدود. اشرح الوضع الفيزيائي قبل اختيار المعادلة؛ فقد ينتج الحساب الصحيح خارج افتراضات القانون تفسيرًا خاطئًا.`,
    ),
  ],
};
