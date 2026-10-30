import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { contentBundleSchema } from '../src/lib/content-bundle';
import media from '../public/images/attributions.json';
const db = new PrismaClient();
async function main() {
  const args = process.argv.slice(2),
    file = args[args.indexOf('--file') + 1];
  if (!args.includes('--file') || !file)
    throw new Error(
      'Usage: npm run content:import -- --file drafts/file.json [--apply]. Default is a dry run.',
    );
  if (statSync(file).size > 8_000_000)
    throw new Error('Bundle exceeds 8 MB. Split it into smaller reviewable files.');
  const bundle = contentBundleSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
  const module = await db.module.findUnique({ where: { id: bundle.moduleId } });
  if (!module)
    throw new Error('The parent module does not exist. Create it in the protected studio first.');
  for (const l of bundle.lessons)
    for (const id of l.referenceIds)
      if (!(await db.scientificReference.findUnique({ where: { id } })))
        throw new Error(`Unknown reference ${id}. Verify and register sources before importing.`);
  const localIds = new Set(bundle.lessons.map((l) => l.localId));
  for (const q of bundle.questions)
    if (!localIds.has(q.lessonId)) {
      const lesson = await db.lesson.findUnique({ where: { id: q.lessonId } });
      if (!lesson || lesson.moduleId !== module.id)
        throw new Error(`Question points outside this module: ${q.lessonId}`);
    }
  const summary = {
    module: module.id,
    newLessons: bundle.lessons.length,
    newQuestions: bundle.questions.length,
    provenance: bundle.provenance,
    status: 'DRAFT',
    reviewStatus: 'PENDING',
    mode: args.includes('--apply') ? 'APPLY' : 'DRY RUN',
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!args.includes('--apply')) {
    console.log(
      'No database changes. Back up the database, then repeat with --apply to import new drafts.',
    );
    return;
  }
  const actorEmail = args.includes('--actor-email') ? args[args.indexOf('--actor-email') + 1] : '';
  const actor = actorEmail
    ? await db.user.findUnique({ where: { email: actorEmail.toLowerCase() } })
    : null;
  if (!actor || !['ADMIN', 'INSTRUCTOR'].includes(actor.role))
    throw new Error(
      'Applying imports requires --actor-email for an existing educator account (audit attribution).',
    );
  const mapping = new Map<string, string>();
  await db.$transaction(
    async (tx) => {
      const max = await tx.lesson.aggregate({
        where: { moduleId: module.id },
        _max: { order: true },
      });
      for (const [i, l] of bundle.lessons.entries()) {
        const id = `lesson-${randomBytes(10).toString('hex')}`,
          im = media[l.image as keyof typeof media];
        mapping.set(l.localId, id);
        await tx.lesson.create({
          data: {
            id,
            moduleId: module.id,
            order: (max._max.order || 0) + i + 1,
            titleEn: l.title.en,
            titleAr: l.title.ar,
            summaryEn: l.summary.en,
            summaryAr: l.summary.ar,
            objectives: l.objectives,
            terms: l.terms,
            duration: l.duration,
            diagram: l.diagram,
            status: 'DRAFT',
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
            references: {
              create: [...new Set(l.referenceIds)].map((referenceId) => ({ referenceId })),
            },
          },
        });
      }
      for (const q of bundle.questions) {
        const id = `generated-${randomBytes(12).toString('hex')}`,
          map = new Map(q.options.map((o) => [o.id, `o-${randomBytes(12).toString('hex')}`]));
        const answer: any = { ...q.answer };
        if (answer.kind === 'choice') answer.correct = map.get(answer.correct);
        if (['set', 'order'].includes(answer.kind))
          answer.correct = answer.correct.map((key: string) => map.get(key));
        if (answer.kind === 'match')
          answer.correct = Object.fromEntries(
            Object.entries(answer.correct).map(([key, value]) => [key, map.get(String(value))]),
          );
        const { options, ...rest } = q;
        await tx.question.create({
          data: {
            ...rest,
            id,
            moduleId: module.id,
            lessonId: mapping.get(q.lessonId) || q.lessonId,
            concept: q.concept || id,
            answer,
            status: 'DRAFT',
            reviewStatus: 'PENDING',
            generated: bundle.provenance === 'AI_DRAFT',
            options: { create: options.map((o, order) => ({ ...o, id: map.get(o.id)!, order })) },
          },
        });
      }
      await tx.auditLog.create({
        data: { userId: actor.id, action: `CLI_IMPORT_${bundle.provenance}`, entityId: module.id },
      });
    },
    { timeout: 60000 },
  );
  writeFileSync(
    `${file}.receipt.json`,
    JSON.stringify(
      {
        ...summary,
        actorId: actor.id,
        importedAt: new Date().toISOString(),
        lessonMapping: Object.fromEntries(mapping),
      },
      null,
      2,
    ),
  );
  console.log(
    'Imported new drafts only. No lessons, questions, stages or modules were automatically published.',
  );
  if (mapping.size)
    console.log(JSON.stringify({ lessonMapping: Object.fromEntries(mapping) }, null, 2));
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
