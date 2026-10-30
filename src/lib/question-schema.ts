import { z } from 'zod';
export const questionTypes = [
  'MCQ',
  'TRUE_FALSE',
  'MULTI_SELECT',
  'FILL',
  'MATCH',
  'ORDER',
  'NUMERIC',
  'REASONING',
  'IMAGE',
  'DIAGRAM',
  'SCENARIO',
  'ADVANCED',
] as const;
const identifier = z.string().regex(/^[\w-]{1,160}$/);
const localized = z.object({
  en: z.string().trim().min(1).max(2000),
  ar: z.string().trim().min(1).max(2000),
});
const ids = z
  .array(identifier)
  .min(1)
  .max(40)
  .refine((v) => new Set(v).size === v.length, 'Duplicate option IDs are not permitted.');
export const answerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('choice'), correct: identifier }),
  z.object({ kind: z.literal('set'), correct: ids }),
  z.object({ kind: z.literal('order'), correct: ids }),
  z.object({
    kind: z.literal('text'),
    accepted: z.array(z.string().trim().min(1).max(300)).min(1).max(30),
  }),
  z.object({
    kind: z.literal('number'),
    correct: z.number().finite(),
    tolerance: z.number().finite().nonnegative().default(0),
  }),
  z.object({
    kind: z.literal('match'),
    correct: z
      .record(identifier, identifier)
      .refine((v) => Object.keys(v).length > 0 && Object.keys(v).length <= 40),
  }),
  z.object({
    kind: z.literal('rubric'),
    groups: z
      .array(z.array(z.string().trim().min(1).max(200)).min(1).max(30))
      .min(1)
      .max(20),
  }),
]);
export const questionDataSchema = z.object({
  rows: z
    .array(
      z.object({ id: identifier, en: z.string().min(1).max(500), ar: z.string().min(1).max(500) }),
    )
    .min(2)
    .max(20)
    .optional(),
  image: z
    .string()
    .regex(/^\/(?:images|uploads|api\/media)\/[a-zA-Z0-9_-]+\.(?:webp|png|jpg|jpeg)$/)
    .optional(),
  alt: localized.optional(),
  credit: z.string().min(3).max(600).optional(),
  source: z
    .url()
    .refine((v) => v.startsWith('https://'))
    .optional(),
  chart: z
    .array(z.object({ x: z.number().finite(), y: z.number().finite() }))
    .min(2)
    .max(24)
    .optional(),
  illustrative: z.literal(true).optional(),
  practiceOnly: z.boolean().optional(),
  rubricNotice: z.boolean().optional(),
});
export const questionDraftSchema = z
  .object({
    lessonId: identifier,
    type: z.enum(questionTypes),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    concept: identifier.optional(),
    promptEn: z.string().trim().min(10).max(4000),
    promptAr: z.string().trim().min(10).max(4000),
    explanationEn: z.string().trim().min(10).max(5000),
    explanationAr: z.string().trim().min(10).max(5000),
    options: z
      .array(
        z.object({
          id: identifier,
          textEn: z.string().trim().min(1).max(2000),
          textAr: z.string().trim().min(1).max(2000),
        }),
      )
      .max(40),
    answer: answerSchema,
    data: questionDataSchema,
  })
  .superRefine((q, ctx) => {
    const fail = (message: string, path: (string | number)[] = ['answer']) =>
      ctx.addIssue({ code: 'custom', message, path });
    const expected: Record<string, string> = {
      MCQ: 'choice',
      TRUE_FALSE: 'choice',
      SCENARIO: 'choice',
      IMAGE: 'choice',
      MULTI_SELECT: 'set',
      FILL: 'text',
      MATCH: 'match',
      ORDER: 'order',
      NUMERIC: 'number',
      DIAGRAM: 'number',
      ADVANCED: 'number',
      REASONING: 'rubric',
    };
    if (q.answer.kind !== expected[q.type])
      fail(`Question type ${q.type} requires answer kind ${expected[q.type]}.`);
    const optionIds = q.options.map((o) => o.id);
    if (new Set(optionIds).size !== optionIds.length)
      fail('Option IDs must be unique.', ['options']);
    const a = q.answer;
    const referenced =
      a.kind === 'choice'
        ? [a.correct]
        : a.kind === 'set' || a.kind === 'order'
          ? a.correct
          : a.kind === 'match'
            ? Object.values(a.correct)
            : [];
    if (referenced.some((id) => !optionIds.includes(id)))
      fail('The key references an option that does not exist.');
    if (['choice', 'set', 'order', 'match'].includes(a.kind) && q.options.length < 2)
      fail('At least two options are required.', ['options']);
    if (q.type === 'TRUE_FALSE' && q.options.length !== 2)
      fail('True/false needs exactly two options.', ['options']);
    if (a.kind === 'order' && a.correct.length !== optionIds.length)
      fail('Ordering must include every option exactly once.');
    if (a.kind === 'match') {
      const rows = q.data.rows || [],
        rowIds = rows.map((r) => r.id);
      if (
        rows.length < 2 ||
        new Set(rowIds).size !== rowIds.length ||
        Object.keys(a.correct).length !== rows.length ||
        rowIds.some((id) => !Object.hasOwn(a.correct, id))
      )
        fail('Matching needs a complete, unique row-to-option key.');
    }
    if (q.type === 'IMAGE' && (!q.data.image || !q.data.credit || !q.data.source || !q.data.alt))
      fail('Images require a local media path, credit, HTTPS source, and bilingual alt.', ['data']);
    if (q.type === 'DIAGRAM' && (!q.data.chart || !q.data.illustrative))
      fail('A teaching chart must include points and be labeled illustrative.', ['data']);
    if (q.data.chart && new Set(q.data.chart.map((p) => p.x)).size !== q.data.chart.length)
      fail('Chart x values must be distinct.', ['data', 'chart']);
    if (q.type === 'REASONING' && (!q.data.practiceOnly || !q.data.rubricNotice))
      fail('Keyword rubrics are provisional, practice-only feedback.', ['data']);
    if (['text', 'number', 'rubric'].includes(a.kind) && q.options.length)
      fail('This response format must not contain options.', ['options']);
  });
