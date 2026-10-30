import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { allLessons, lessonId, learningMinutes } from '../src/content';
import { refs, moduleRefs } from '../src/content/references';
import { concepts } from '../src/content/concepts';
import { buildQuestions } from '../src/content/questions';
import media from '../public/images/attributions.json';
const db = new PrismaClient();
async function main() {
  if (process.env.CONTENT_PREVIEW !== 'true')
    throw new Error('Pilot refresh is disabled outside CONTENT_PREVIEW=true.');
  const questions = buildQuestions(),
    ids = questions.map((q) => q.id),
    lessons = allLessons.map(lessonId);
  const [attempts, answers, reviewed] = await Promise.all([
    db.examQuestion.count({ where: { questionId: { in: ids } } }),
    db.studentAnswer.count({ where: { questionId: { in: ids } } }),
    db.lesson.count({
      where: { id: { in: lessons }, OR: [{ reviewStatus: 'APPROVED' }, { status: 'DRAFT' }] },
    }),
  ]);
  if (attempts || answers || reviewed)
    throw new Error(
      'Refusing to overwrite assessed, approved, or edited content. Version it instead.',
    );
  console.log({
    lessons: lessons.length,
    questions: ids.length,
    assessmentsUsingTheseQuestions: attempts,
    mode: process.argv.includes('--apply') ? 'APPLY' : 'DRY RUN',
  });
  if (!process.argv.includes('--apply')) return;
  if (!process.env.DATABASE_URL?.startsWith('file:'))
    throw new Error(
      'This pilot refresh supports SQLite only. Back up PostgreSQL with pg_dump and use versioned imports.',
    );
  const database = resolve('prisma', process.env.DATABASE_URL.slice(5));
  mkdirSync('backups', { recursive: true });
  const backup = resolve(
    'backups',
    `pilot-before-refresh-${new Date().toISOString().replace(/[:.]/g, '-')}.db`,
  );
  execFileSync('python', [
    '-c',
    'import sqlite3,sys; s=sqlite3.connect(sys.argv[1]); d=sqlite3.connect(sys.argv[2]); s.backup(d); d.close(); s.close()',
    database,
    backup,
  ]);
  console.log('Consistent SQLite backup:', backup);
  await db.$transaction(
    async (tx) => {
      for (const r of refs)
        await tx.scientificReference.upsert({ where: { id: r.id }, update: r, create: r });
      for (const l of allLessons) {
        const id = lessonId(l),
          im = media[l.image as keyof typeof media];
        await tx.lessonSection.deleteMany({ where: { lessonId: id } });
        await tx.lessonImage.deleteMany({
          where: { lessonId: id, url: { startsWith: '/images/' } },
        });
        await tx.lessonReference.deleteMany({ where: { lessonId: id } });
        await tx.lesson.update({
          where: { id },
          data: {
            titleEn: l.title.en,
            titleAr: l.title.ar,
            summaryEn: l.summary.en,
            summaryAr: l.summary.ar,
            objectives: l.objectives,
            terms: concepts[l.module].slice(l.order === 1 ? 0 : 12, l.order === 1 ? 12 : 25),
            duration: learningMinutes(l),
            diagram: l.diagram,
            status: 'PUBLISHED',
            reviewStatus: 'PENDING',
            sections: {
              create: l.sections.map((s, order) => ({
                order,
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
                titleEn: im.titleEn,
                titleAr: im.titleAr,
                captionEn: im.captionEn,
                captionAr: im.captionAr,
                altEn: im.altEn,
                altAr: im.altAr,
                credit: im.credit,
                sourceUrl: im.source,
                kind: im.kind,
              },
            },
            references: { create: moduleRefs[l.module].map((referenceId) => ({ referenceId })) },
          },
        });
        if (l.order === 1) {
          const content = (lang: 'en' | 'ar') =>
            l.sections
              .filter((s) =>
                [
                  'CORE',
                  'INTERMEDIATE',
                  'ADVANCED',
                  'WORKSHOP',
                  'CHECKPOINT',
                  'MISCONCEPTION',
                ].includes(s.type),
              )
              .map((s) => `## ${s.title[lang]}\n${s.content[lang]}`)
              .join('\n\n');
          await tx.libraryArticle.update({
            where: { id: `article-${l.module}` },
            data: {
              contentEn: content('en'),
              contentAr: content('ar'),
              readMinutes: Math.ceil(content('en').split(/\s+/).length / 180),
            },
          });
        }
      }
      for (const q of questions) {
        const { options, ...rest } = q;
        await tx.questionOption.deleteMany({ where: { questionId: q.id } });
        const data = {
          ...rest,
          status: 'PUBLISHED',
          reviewStatus: 'PENDING',
          options: { create: options },
        };
        await tx.question.upsert({ where: { id: q.id }, update: data, create: data });
      }
    },
    { timeout: 60000 },
  );
  console.log(
    'Pilot refreshed. Human approval remains PENDING; progress and accounts were preserved.',
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
