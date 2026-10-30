import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { allLessons, lessonId, learningMinutes } from '../src/content';
import { buildQuestions } from '../src/content/questions';
import { curriculum } from '../src/content/curriculum';
import { moduleRefs, refs } from '../src/content/references';
import { questionDraftSchema } from '../src/lib/question-schema';
import registry from '../public/images/attributions.json';
const errors: string[] = [],
  warnings = [
    'Content is an authored pilot pending independent scientific and Arabic editorial review.',
    'The 864 records include concept variants; they are not 864 independently reviewed concepts.',
    'Stages 2–12 are a complete roadmap, not completed course content.',
    'Link accessibility does not establish a license or independently verify every scientific claim.',
  ];
const questions = buildQuestions();
const lessons = allLessons.map((l) => {
  const id = lessonId(l),
    enWords = l.sections
      .map((s) => s.content.en)
      .join(' ')
      .split(/\s+/).length,
    arWords = l.sections
      .map((s) => s.content.ar)
      .join(' ')
      .split(/\s+/).length;
  const count = questions.filter((q) => q.lessonId === id).length;
  if (enWords < 750 || arWords < 550) errors.push(`${id}: insufficient bilingual depth`);
  if (count < 30 || l.sections.length < 10 || l.objectives.length < 2)
    errors.push(`${id}: incomplete lesson structure`);
  if (!(l.image in registry) || !moduleRefs[l.module]?.length)
    errors.push(`${id}: missing media or reference`);
  for (const s of l.sections)
    if (!s.title.en || !s.title.ar || !s.content.en || !s.content.ar)
      errors.push(`${id}: missing translation`);
  return {
    id,
    titleEn: l.title.en,
    titleAr: l.title.ar,
    sections: l.sections.length,
    enWords,
    arWords,
    learningMinutes: learningMinutes(l),
    questions: count,
    reviewStatus: 'PENDING',
  };
});
for (const q of questions) {
  const result = questionDraftSchema.safeParse(q);
  if (!result.success) errors.push(`${q.id}: ${result.error.message}`);
}
for (const [id, im] of Object.entries(registry)) {
  const path = `public/images/${id}.webp`;
  if (!existsSync(path)) errors.push(`${id}: missing local media`);
  else if (readFileSync(path).subarray(8, 12).toString() !== 'WEBP')
    errors.push(`${id}: invalid WebP file`);
  for (const key of [
    'titleEn',
    'titleAr',
    'captionEn',
    'captionAr',
    'altEn',
    'altAr',
    'credit',
    'source',
    'download',
    'checkedAt',
  ] as const)
    if (!im[key]) errors.push(`${id}: missing ${key}`);
  if (!['OBSERVATION', 'ILLUSTRATION'].includes(im.kind) || !im.source.startsWith('https://'))
    errors.push(`${id}: invalid provenance`);
}
for (const r of refs)
  if (!r.url.startsWith('https://')) errors.push(`Reference ${r.id} must use HTTPS`);
const modules = Array.from({ length: 8 }, (_, i) => {
  const qs = questions.filter((q) => q.moduleId === `m-1-${i + 1}`);
  if (qs.length < 100) errors.push(`Module ${i + 1}: fewer than 100 items`);
  return {
    moduleId: `m-1-${i + 1}`,
    questions: qs.length,
    distinctConceptKeys: new Set(qs.map((q) => q.concept)).size,
  };
});
const report = {
  checkedAt: new Date().toISOString(),
  passed: errors.length === 0,
  stages: curriculum.length,
  roadmapModules: curriculum.reduce((n, s) => n + s.modules.length, 0),
  questions: questions.length,
  formats: [...new Set(questions.map((q) => q.type))],
  modules,
  lessons,
  images: Object.keys(registry).length,
  references: refs.length,
  errors,
  warnings,
};
mkdirSync('docs', { recursive: true });
writeFileSync('docs/content-report.json', JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      passed: report.passed,
      lessons: lessons.length,
      questions: questions.length,
      modules: modules.length,
      errors,
      warnings,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
