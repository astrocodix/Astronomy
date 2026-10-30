import mediaRegistry from '../public/images/attributions.json';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';
import { curriculum, L } from '../src/content/curriculum';
import { allLessons, learningMinutes } from '../src/content';
import { concepts } from '../src/content/concepts';
import { buildQuestions } from '../src/content/questions';
const db = new PrismaClient();
import { refs, moduleRefs } from '../src/content/references';
const imageMeta: Record<string, any> = Object.fromEntries(
  Object.entries(mediaRegistry).map(([key, im]) => [
    key,
    {
      title: L(im.titleEn, im.titleAr),
      caption: L(im.captionEn, im.captionAr),
      alt: L(im.altEn, im.altAr),
      credit: im.credit,
      source: im.source,
      kind: im.kind,
    },
  ]),
);
async function main() {
  await db.course.upsert({
    where: { id: 'astronomy' },
    update: {},
    create: {
      id: 'astronomy',
      titleEn: 'The Complete Astronomy Journey',
      titleAr: 'الرحلة الكاملة في علم الفلك',
      descriptionEn: 'From your first look up to research-level thinking.',
      descriptionAr: 'من نظرتك الأولى إلى السماء حتى التفكير البحثي.',
    },
  });
  for (let i = 0; i < curriculum.length; i++) {
    const s = curriculum[i];
    const id = `s-${i + 1}`;
    await db.learningStage.upsert({
      where: { id },
      update: {},
      create: {
        id,
        courseId: 'astronomy',
        order: i + 1,
        titleEn: s.title.en,
        titleAr: s.title.ar,
        descriptionEn: s.description.en,
        descriptionAr: s.description.ar,
        image: `/images/${s.image}.webp`,
        color: s.color,
        status: i === 0 ? 'AVAILABLE' : 'PLANNED',
      },
    });
    for (let j = 0; j < s.modules.length; j++) {
      const m = s.modules[j];
      await db.module.upsert({
        where: { id: `m-${i + 1}-${j + 1}` },
        update: {},
        create: {
          id: `m-${i + 1}-${j + 1}`,
          stageId: id,
          order: j + 1,
          titleEn: m.en,
          titleAr: m.ar,
          status: i === 0 ? 'AVAILABLE' : 'PLANNED',
        },
      });
    }
  }
  for (const r of refs)
    await db.scientificReference.upsert({ where: { id: r.id }, update: {}, create: r });
  const all = allLessons;
  for (const l of all) {
    const id = `l-${l.module}-${l.order}`;
    if (!(await db.lesson.findUnique({ where: { id } }))) {
      const im = imageMeta[l.image];
      const ct = concepts[l.module].slice(l.order === 1 ? 0 : 12, l.order === 1 ? 12 : 25);
      await db.lesson.create({
        data: {
          id,
          moduleId: `m-1-${l.module}`,
          order: l.order,
          titleEn: l.title.en,
          titleAr: l.title.ar,
          summaryEn: l.summary.en,
          summaryAr: l.summary.ar,
          objectives: l.objectives,
          terms: ct,
          duration: learningMinutes(l),
          diagram: l.diagram,
          status: 'PUBLISHED',
          reviewStatus: 'PENDING',
          sections: {
            create: l.sections.map((s, i) => ({
              order: i,
              type: s.type,
              titleEn: s.title.en,
              titleAr: s.title.ar,
              contentEn: s.content.en,
              contentAr: s.content.ar,
            })),
          },
          images: {
            create: {
              url: `/images/${l.image}.webp`,
              titleEn: im.title.en,
              titleAr: im.title.ar,
              captionEn: im.caption.en,
              captionAr: im.caption.ar,
              altEn: im.alt.en,
              altAr: im.alt.ar,
              credit: im.credit,
              sourceUrl: im.source,
              kind: im.kind,
            },
          },
          references: { create: moduleRefs[l.module].map((referenceId) => ({ referenceId })) },
        },
      });
    }
    for (const [kind, count, minutes] of [
      ['QUICK', 10, 15],
      ['STANDARD', 20, 30],
      ['ADVANCED', 30, 45],
    ] as const)
      await db.examTemplate.upsert({
        where: { id: `exam-${id}-${kind}` },
        update: {},
        create: {
          id: `exam-${id}-${kind}`,
          titleEn: `${kind.toLowerCase()} · ${l.title.en}`,
          titleAr: `${kind === 'QUICK' ? 'اختبار سريع' : kind === 'STANDARD' ? 'اختبار قياسي' : 'اختبار متقدم'} · ${l.title.ar}`,
          kind,
          count,
          minutes,
          lessonId: id,
        },
      });
  }
  const qs = buildQuestions();
  let inserted = 0;
  for (const q of qs) {
    if (await db.question.findUnique({ where: { id: q.id }, select: { id: true } })) continue;
    const { options, ...data } = q;
    await db.question.create({
      data: { ...data, status: 'PUBLISHED', reviewStatus: 'PENDING', options: { create: options } },
    });
    inserted++;
  }
  for (let i = 1; i <= 8; i++)
    await db.examTemplate.upsert({
      where: { id: `exam-module-${i}` },
      update: {},
      create: {
        id: `exam-module-${i}`,
        titleEn: `Module ${i} examination`,
        titleAr: `اختبار الوحدة ${i}`,
        kind: 'MODULE',
        count: 50,
        minutes: 60,
        moduleId: `m-1-${i}`,
      },
    });
  await db.examTemplate.upsert({
    where: { id: 'exam-stage-1' },
    update: {},
    create: {
      id: 'exam-stage-1',
      titleEn: 'Introduction to Astronomy · Stage Final',
      titleAr: 'مقدمة في علم الفلك · الاختبار النهائي',
      kind: 'STAGE',
      count: 100,
      minutes: 120,
      stageId: 's-1',
    },
  });
  const badges = [
    [
      'first-lesson',
      'First Light',
      'الضوء الأول',
      'Pass your first lesson assessment.',
      'اجتز أول تقييم لدرس.',
      'sparkles',
      100,
    ],
    [
      'perfect',
      'Perfect Orbit',
      'المدار المثالي',
      'Score 100% on a submitted examination.',
      'حقق 100% في اختبار مكتمل.',
      'target',
      200,
    ],
    [
      'stage-1',
      'Cosmic Foundations',
      'الأسس الكونية',
      'Pass the introduction stage final.',
      'اجتز الاختبار النهائي للمقدمة.',
      'orbit',
      500,
    ],
    [
      'stage-2',
      'Solar System Explorer',
      'مستكشف النظام الشمسي',
      'Pass stage 2.',
      'اجتز المرحلة الثانية.',
      'planet',
      500,
    ],
    [
      'stage-4',
      'Stellar Evolution Expert',
      'خبير التطور النجمي',
      'Pass stage 4.',
      'اجتز المرحلة الرابعة.',
      'star',
      750,
    ],
    [
      'stage-5',
      'Galaxy Researcher',
      'باحث المجرات',
      'Pass stage 5.',
      'اجتز المرحلة الخامسة.',
      'galaxy',
      750,
    ],
    [
      'stage-6',
      'Black Hole Explorer',
      'مستكشف الثقوب السوداء',
      'Pass stage 6.',
      'اجتز المرحلة السادسة.',
      'orbit',
      750,
    ],
    [
      'stage-9',
      'Cosmology Scholar',
      'دارس الكونيات',
      'Pass stage 9.',
      'اجتز المرحلة التاسعة.',
      'sparkles',
      1000,
    ],
    [
      'stage-10',
      'Astronomy Observer',
      'الراصد الفلكي',
      'Pass stage 10.',
      'اجتز المرحلة العاشرة.',
      'telescope',
      1000,
    ],
    [
      'stage-8',
      'Mathematics Master',
      'متقن الرياضيات',
      'Pass stage 8.',
      'اجتز المرحلة الثامنة.',
      'target',
      1000,
    ],
    [
      'stage-12',
      'Advanced Astronomy Graduate',
      'خريج الفلك المتقدم',
      'Pass the research capstone stage.',
      'اجتز مرحلة المشروع البحثي.',
      'award',
      2000,
    ],
  ];
  for (const b of badges)
    await db.achievement.upsert({
      where: { id: String(b[0]) },
      update: {},
      create: {
        id: String(b[0]),
        titleEn: String(b[1]),
        titleAr: String(b[2]),
        descriptionEn: String(b[3]),
        descriptionAr: String(b[4]),
        icon: String(b[5]),
        xp: Number(b[6]),
      },
    });
  for (let i = 0; i < all.length; i += 2) {
    const l = all[i],
      id = `article-${l.module}`;
    const contentEn = l.sections
      .filter((s) => ['CORE', 'INTERMEDIATE', 'ADVANCED', 'MISCONCEPTION'].includes(s.type))
      .map((s) => `## ${s.title.en}\n${s.content.en}`)
      .join('\n\n');
    const contentAr = l.sections
      .filter((s) => ['CORE', 'INTERMEDIATE', 'ADVANCED', 'MISCONCEPTION'].includes(s.type))
      .map((s) => `## ${s.title.ar}\n${s.content.ar}`)
      .join('\n\n');
    await db.libraryArticle.upsert({
      where: { id },
      update: {},
      create: {
        id,
        titleEn: l.title.en,
        titleAr: l.title.ar,
        summaryEn: l.summary.en,
        summaryAr: l.summary.ar,
        contentEn,
        contentAr,
        category: [
          'Astronomy',
          'Astrophysics',
          'History',
          'Cosmology',
          'Stars',
          'Research',
          'Mathematics',
          'Observational Astronomy',
        ][l.module - 1],
        image: `/images/${l.image}.webp`,
        lessonId: `l-${l.module}-${l.order}`,
        readMinutes: 6,
        references: { create: moduleRefs[l.module].map((referenceId) => ({ referenceId })) },
      },
    });
  }
  for (const [key, value] of Object.entries({
    passingScore: 70,
    enforcePrerequisites: true,
    aiDailyLimit: Number(process.env.AI_DAILY_LIMIT || 30),
    aiModel: process.env.AI_MODEL || 'gpt-4.1-mini',
  }))
    await db.appSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const p = process.env.ADMIN_PASSWORD;
    if (p.length < 12) throw new Error('Admin password must have 12+ characters');
    const salt = randomBytes(16).toString('hex');
    const passwordHash = `${salt}:${scryptSync(p, salt, 64).toString('hex')}`;
    await db.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: 'ADMIN',
        isGuest: false,
        profile: { create: { name: 'Academy Administrator' } },
      },
    });
  }
  console.log(
    JSON.stringify(
      {
        stages: await db.learningStage.count(),
        modules: await db.module.count(),
        lessons: await db.lesson.count(),
        questions: await db.question.count(),
        insertedQuestions: inserted,
        examTemplates: await db.examTemplate.count(),
        contentReview: 'PENDING — pilot preview only',
      },
      null,
      2,
    ),
  );
}
main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
