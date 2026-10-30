import { z } from 'zod';
import { questionDraftSchema } from './question-schema';
import media from '../../public/images/attributions.json';
const localized = z.object({
  en: z.string().trim().min(1).max(25000),
  ar: z.string().trim().min(1).max(25000),
});
const sectionKinds = [
  'INTRO',
  'CORE',
  'INTERMEDIATE',
  'ADVANCED',
  'EXAMPLE',
  'MISCONCEPTION',
  'APPLICATION',
  'WORKSHOP',
  'CHECKPOINT',
  'SUMMARY',
] as const;
export const lessonDraftSchema = z
  .object({
    localId: z.string().regex(/^[\w-]{1,120}$/),
    title: localized,
    summary: localized,
    objectives: z.array(localized).min(2).max(12),
    terms: z
      .array(z.object({ term: localized, definition: localized }))
      .min(5)
      .max(35),
    duration: z.number().int().min(5).max(180),
    diagram: z.enum([
      'scale',
      'sky',
      'spectrum',
      'orbit',
      'timeline',
      'expansion',
      'lifecycle',
      'method',
      'lighttravel',
      'parallax',
    ]),
    image: z
      .string()
      .refine(
        (key) => key in media,
        'Use an attributed image key in public/images/attributions.json.',
      ),
    referenceIds: z.array(z.string().min(1).max(150)).min(1).max(12),
    sections: z
      .array(z.object({ type: z.enum(sectionKinds), title: localized, content: localized }))
      .min(10)
      .max(30),
  })
  .superRefine((lesson, ctx) => {
    for (const type of sectionKinds)
      if (!lesson.sections.some((s) => s.type === type))
        ctx.addIssue({ code: 'custom', path: ['sections'], message: `Missing ${type}` });
    for (const lang of ['en', 'ar'] as const) {
      const count = lesson.sections
        .map((s) => s.content[lang])
        .join(' ')
        .trim()
        .split(/\s+/u).length;
      if (count < (lang === 'en' ? 750 : 550))
        ctx.addIssue({
          code: 'custom',
          path: ['sections'],
          message: `Insufficient ${lang} depth: ${count} words.`,
        });
    }
  });
export const contentBundleSchema = z
  .object({
    version: z.literal(1),
    moduleId: z.string().regex(/^[\w-]{1,150}$/),
    provenance: z.enum(['AI_DRAFT', 'HUMAN_DRAFT', 'SEED_EXPORT']),
    lessons: z.array(lessonDraftSchema).max(20).default([]),
    questions: z.array(questionDraftSchema).max(500).default([]),
    notes: z.string().max(4000).optional(),
  })
  .superRefine((bundle, ctx) => {
    if (!bundle.lessons.length && !bundle.questions.length)
      ctx.addIssue({ code: 'custom', message: 'No content to import.' });
    const ids = bundle.lessons.map((l) => l.localId);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', path: ['lessons'], message: 'Duplicate local lesson IDs.' });
    const prompts = bundle.questions.map((q) =>
      JSON.stringify({
        lessonId: q.lessonId,
        type: q.type,
        prompt: q.promptEn.trim().toLowerCase(),
        options: q.options.map((o) => o.textEn),
        data: q.data,
      }),
    );
    if (new Set(prompts).size !== prompts.length)
      ctx.addIssue({
        code: 'custom',
        path: ['questions'],
        message: 'Exact duplicate prompts within this bundle.',
      });
  });
export type ContentBundle = z.infer<typeof contentBundleSchema>;
