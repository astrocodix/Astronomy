import { randomInt } from 'node:crypto';

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function normalizeText(v: unknown) {
  return typeof v === 'string'
    ? v
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[أإآ]/g, 'ا')
        .replace(/[’‘]/g, "'")
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
}
export function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.length > 200) return null;
  let text = value
    .normalize('NFKC')
    .trim()
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/٫/g, '.')
    .replace(/−/g, '-');
  // Grouped thousands are accepted only in unambiguous three-digit groups.
  if (/[,٬]/.test(text)) {
    if (!/^[+-]?\d{1,3}(?:[,٬]\d{3})+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(text)) return null;
    text = text.replace(/[,٬]/g, '');
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}
const stringList = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export function grade(
  answer: any,
  response: unknown,
): { correct: boolean; score: number; provisional?: boolean } {
  const provisional = answer?.kind === 'rubric';
  if (response === undefined || response === null || !answer)
    return { correct: false, score: 0, ...(provisional ? { provisional: true } : {}) };
  let correct = false;
  switch (answer.kind) {
    case 'choice':
      correct = typeof response === 'string' && response === answer.correct;
      break;
    case 'set':
      correct =
        stringList(response) &&
        stringList(answer.correct) &&
        response.length === answer.correct.length &&
        new Set(response).size === response.length &&
        answer.correct.every((v: string) => response.includes(v));
      break;
    case 'order':
      correct =
        stringList(response) &&
        stringList(answer.correct) &&
        response.length === answer.correct.length &&
        response.every((v, i) => v === answer.correct[i]);
      break;
    case 'text':
      correct =
        typeof response === 'string' &&
        normalizeText(response).length > 0 &&
        Array.isArray(answer.accepted) &&
        answer.accepted.some((v: string) => normalizeText(v) === normalizeText(response));
      break;
    case 'number': {
      const n = parseNumber(response),
        tolerance = Number(answer.tolerance ?? 0);
      const roundoff = Number.EPSILON * 8 * Math.max(1, Math.abs(answer.correct));
      correct =
        n !== null &&
        typeof answer.correct === 'number' &&
        Number.isFinite(answer.correct) &&
        Number.isFinite(tolerance) &&
        tolerance >= 0 &&
        Math.abs(n - answer.correct) <= tolerance + roundoff;
      break;
    }
    case 'match': {
      const expected = record(answer.correct) ? Object.entries(answer.correct) : [];
      correct =
        record(response) &&
        expected.length > 0 &&
        Object.keys(response).length === expected.length &&
        expected.every(([key, value]) => Object.hasOwn(response, key) && response[key] === value);
      break;
    }
    case 'rubric': {
      const text = normalizeText(response);
      correct =
        typeof response === 'string' &&
        text.length > 0 &&
        Array.isArray(answer.groups) &&
        answer.groups.every((g: string[]) => g.some((x) => text.includes(normalizeText(x))));
      return { correct, score: correct ? 1 : 0, provisional: true };
    }
  }
  return { correct, score: correct ? 1 : 0 };
}
export function calculateMastery(
  attempts: { concept: string; correct: boolean; createdAt: Date }[],
) {
  const recent = [...attempts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const unique = new Map<string, { correct: boolean; createdAt: Date }>();
  for (const a of recent) if (!unique.has(a.concept)) unique.set(a.concept, a);
  const checks = unique.size;
  if (!checks) return { score: 0, checks: 0, confidence: 'UNASSESSED' };
  const successes = [...unique.values()].filter((x) => x.correct).length;
  // Beta(2,2) regularization avoids declaring mastery after one lucky response.
  const score = Math.round((100 * (successes + 2)) / (checks + 4));
  const days = new Set(recent.map((x) => x.createdAt.toISOString().slice(0, 10))).size;
  return { score, checks, confidence: checks >= 15 && days >= 2 ? 'REINFORCED' : 'DEVELOPING' };
}
export function selectQuestions<T extends { id: string; difficulty: string; concept: string }>(
  pool: T[],
  count: number,
  seen: Set<string> = new Set(),
): T[] {
  const selected: T[] = [],
    used = new Set<string>(),
    usedConcepts = new Set<string>();
  const buckets = [
    ['BEGINNER', Math.round(count * 0.3)],
    ['INTERMEDIATE', Math.round(count * 0.4)],
    ['ADVANCED', count - Math.round(count * 0.3) - Math.round(count * 0.4)],
  ] as const;
  const choose = (candidates: T[], needed: number) => {
    const random = shuffle(candidates).sort(
      (a, b) => Number(seen.has(a.id)) - Number(seen.has(b.id)),
    );
    for (const preferNew of [true, false])
      for (const q of random) {
        if (needed <= 0) return;
        if (used.has(q.id) || (preferNew && usedConcepts.has(q.concept))) continue;
        selected.push(q);
        used.add(q.id);
        usedConcepts.add(q.concept);
        needed--;
      }
  };
  // Fill each difficulty independently; only then backfill shortages from the remaining pool.
  for (const [difficulty, n] of buckets)
    choose(
      pool.filter((q) => q.difficulty === difficulty),
      n,
    );
  if (selected.length < count) choose(pool, count - selected.length);
  return shuffle(selected.slice(0, count));
}
export function publicQuestion(q: any, optionOrder?: string[], review = false) {
  const options = optionOrder
    ? optionOrder.map((id) => q.options.find((o: any) => o.id === id)).filter(Boolean)
    : shuffle(q.options);
  // Explicit allow-list: arbitrary CMS/provider metadata must never expose an answer key.
  const data: Record<string, unknown> = {};
  for (const key of [
    'rows',
    'image',
    'alt',
    'credit',
    'source',
    'chart',
    'illustrative',
    'practiceOnly',
    'rubricNotice',
  ])
    if (q.data?.[key] !== undefined) data[key] = q.data[key];
  const sanitized = {
    id: q.id,
    moduleId: q.moduleId,
    lessonId: q.lessonId,
    type: q.type,
    difficulty: q.difficulty,
    promptEn: q.promptEn,
    promptAr: q.promptAr,
    data,
    options: options.map((o: any) => ({ id: o.id, textEn: o.textEn, textAr: o.textAr })),
  };
  return review
    ? {
        ...sanitized,
        answer: q.answer,
        explanationEn: q.explanationEn,
        explanationAr: q.explanationAr,
      }
    : sanitized;
}
