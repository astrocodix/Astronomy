import test from 'node:test';
import assert from 'node:assert/strict';
import {
  grade,
  parseNumber,
  normalizeText,
  shuffle,
  selectQuestions,
  publicQuestion,
  calculateMastery,
} from '../src/lib/assessment';
import { questionDraftSchema, questionTypes } from '../src/lib/question-schema';
import { buildQuestions } from '../src/content/questions';
import { allLessons, lessonId, learningMinutes } from '../src/content';
import { curriculum } from '../src/content/curriculum';
const questions = buildQuestions();

test('roadmap has 12 stages and 146 genuine module titles', () => {
  assert.equal(curriculum.length, 12);
  assert.equal(
    curriculum.reduce((n, s) => n + s.modules.length, 0),
    146,
  );
});
test('all 16 bilingual lessons have substantial teaching and activities', () => {
  assert.equal(allLessons.length, 16);
  for (const l of allLessons) {
    assert.ok(l.objectives.length >= 2);
    for (const type of [
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
    ])
      assert.ok(
        l.sections.some((s) => s.type === type),
        `${lessonId(l)} lacks ${type}`,
      );
    assert.equal(l.sections.at(-1)?.type, 'SUMMARY');
    for (const lang of ['en', 'ar'] as const) {
      const words = l.sections
        .map((s) => s.content[lang])
        .join(' ')
        .split(/\s+/u).length;
      assert.ok(
        words >= (lang === 'en' ? 750 : 550),
        `${lessonId(l)} ${lang} too short (${words})`,
      );
    }
    assert.ok(learningMinutes(l) >= 15);
  }
});
test('864 variants cover all 12 formats and exceed item-count requirements', () => {
  assert.equal(questions.length, 864);
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  assert.deepEqual(new Set(questions.map((q) => q.type)), new Set(questionTypes));
  for (let i = 1; i <= 8; i++)
    assert.ok(questions.filter((q) => q.moduleId === `m-1-${i}`).length >= 100);
  for (const l of allLessons)
    assert.ok(questions.filter((q) => q.lessonId === lessonId(l)).length >= 30);
});
test('every seed question passes the same schema as CMS imports', () => {
  for (const q of questions) {
    const result = questionDraftSchema.safeParse(q);
    assert.ok(result.success, `${q.id}: ${result.error?.message}`);
  }
});
test('gold answer for every question grades correctly; reasoning stays provisional', () => {
  for (const q of questions) {
    const a = q.answer,
      response =
        a.kind === 'text'
          ? a.accepted[0]
          : a.kind === 'rubric'
            ? a.groups.map((g: string[]) => g[0]).join(' ')
            : a.correct;
    assert.equal(grade(a, response).correct, true, q.id);
    assert.equal(!!grade(a, response).provisional, q.type === 'REASONING');
    assert.equal(grade(a, null).correct, false);
  }
});
test('numeric parser accepts requested decimal/scientific and Arabic forms only', () => {
  for (const [v, n] of [
    ['٤٤٨٫٨', 448.8],
    ['−١٫٢', -1.2],
    ['۲۵', 25],
    ['1,000', 1000],
    ['١٬٠٠٠', 1000],
    ['2e3', 2000],
    [' .5 ', 0.5],
    [0, 0],
  ] as const)
    assert.equal(parseNumber(v), n);
  for (const v of [[], {}, true, '', ' ', '0x10', 'Infinity', 'NaN', '1,2', '1 2', '2 km', '3/4'])
    assert.equal(parseNumber(v), null);
  assert.equal(grade({ kind: 'number', correct: 0, tolerance: 0 }, false).correct, false);
  assert.equal(grade({ kind: 'number', correct: 10, tolerance: 0.1 }, 10.1).correct, true);
  assert.equal(grade({ kind: 'number', correct: 10, tolerance: 0.1 }, 10.1001).correct, false);
});
test('sets, order and matching reject duplicates, extra keys, and coercion', () => {
  assert.equal(grade({ kind: 'set', correct: ['a', 'b'] }, ['a', 'a', 'b']).correct, false);
  assert.equal(grade({ kind: 'set', correct: ['a', 'b'] }, ['b', 'a']).correct, true);
  assert.equal(grade({ kind: 'order', correct: ['a', 'b'] }, ['b', 'a']).correct, false);
  assert.equal(
    grade({ kind: 'match', correct: { r0: 'a', r1: 'b' } }, { r0: 'a', r1: 'b', r2: 'c' }).correct,
    false,
  );
  assert.equal(grade({ kind: 'match', correct: { r0: 'a', r1: 'b' } }, { r0: 'a' }).correct, false);
  assert.equal(
    grade({ kind: 'match', correct: { r0: 'a', r1: 'b' } }, { r0: 'a', r1: 'b' }).correct,
    true,
  );
  assert.equal(grade({ kind: 'text', accepted: ['42'] }, 42).correct, false);
  assert.equal(grade({ kind: 'choice', correct: '42' }, 42).correct, false);
});
test('Arabic text normalization supports diacritics without discarding meaning', () => {
  assert.equal(normalizeText('إِشَارَة'), normalizeText('اشارة'));
  assert.equal(
    grade({ kind: 'text', accepted: ['علم الفلك', 'astronomy'] }, '  Astronomy ').correct,
    true,
  );
  assert.equal(grade({ kind: 'text', accepted: ['astronomy'] }, ['astronomy']).correct, false);
});
test('unsubmitted shape never includes answer, explanation, option order, or arbitrary private data', () => {
  for (const q of questions) {
    const p: any = publicQuestion({
      ...q,
      data: { ...q.data, answer: q.answer, correct: 'secret', internalNote: 'private' },
    });
    for (const key of ['answer', 'explanationEn', 'explanationAr', 'concept'])
      assert.equal(key in p, false);
    assert.equal('correct' in p.data, false);
    assert.equal('internalNote' in p.data, false);
    assert.equal('answer' in p.data, false);
    for (const o of p.options) {
      assert.equal('order' in o, false);
      assert.ok(/^o-[a-f0-9]{20}$/.test(o.id));
    }
    assert.ok('answer' in publicQuestion(q, undefined, true));
  }
});
test('balanced selection has no repeated records and honors 30/40/30 when possible', () => {
  for (const count of [10, 20, 30, 50, 100]) {
    const selected = selectQuestions(
      questions.filter((q) => q.type !== 'REASONING'),
      count,
    );
    assert.equal(selected.length, count);
    assert.equal(new Set(selected.map((q) => q.id)).size, count);
    assert.equal(selected.filter((q) => q.difficulty === 'BEGINNER').length, count * 0.3);
    assert.equal(selected.filter((q) => q.difficulty === 'INTERMEDIATE').length, count * 0.4);
    assert.equal(selected.filter((q) => q.difficulty === 'ADVANCED').length, count * 0.3);
  }
});
test('balanced selection handles shortages without duplicate IDs', () => {
  const pool = questions.slice(0, 8);
  const selected = selectQuestions(pool, 20);
  assert.equal(selected.length, 8);
  assert.equal(new Set(selected.map((q) => q.id)).size, 8);
});
test('selection favors unseen independent concepts, shuffle never mutates input', () => {
  const pool = Array.from({ length: 40 }, (_, i) => ({
    id: String(i),
    concept: String(i),
    difficulty: i < 15 ? 'BEGINNER' : i < 30 ? 'INTERMEDIATE' : 'ADVANCED',
  }));
  const seen = new Set(['0', '15', '30']);
  assert.equal(
    selectQuestions(pool, 10, seen).some((q) => seen.has(q.id)),
    false,
  );
  const arr = [1, 2, 3];
  assert.deepEqual([...shuffle(arr)].sort(), arr);
  assert.deepEqual(arr, [1, 2, 3]);
});
test('mastery is regularized and latest distinct-concept evidence wins', () => {
  assert.equal(calculateMastery([]).confidence, 'UNASSESSED');
  const one = calculateMastery([{ concept: 'c', correct: true, createdAt: new Date() }]);
  assert.equal(one.score, 60);
  assert.equal(one.checks, 1);
  const many = Array.from({ length: 20 }, (_, i) => ({
    concept: `c${i}`,
    correct: true,
    createdAt: new Date('2026-10-28T12:00:00Z'),
  }));
  assert.equal(calculateMastery(many).confidence, 'DEVELOPING');
  const revised = calculateMastery([
    ...many,
    { concept: 'c0', correct: false, createdAt: new Date('2026-10-29T12:00:00Z') },
  ]);
  assert.equal(revised.checks, 20);
  assert.equal(revised.confidence, 'REINFORCED');
  assert.ok(revised.score < calculateMastery(many).score);
});
test('CMS validator rejects answer/type mismatches and missing image provenance', () => {
  const image = questions.find((q) => q.type === 'IMAGE')!;
  assert.equal(
    questionDraftSchema.safeParse({ ...image, data: { image: '/images/carina.webp' } }).success,
    false,
  );
  assert.equal(
    questionDraftSchema.safeParse({ ...questions[0], answer: { kind: 'number', correct: 1 } })
      .success,
    false,
  );
  assert.equal(
    questionDraftSchema.safeParse({
      ...questions[0],
      answer: { kind: 'choice', correct: 'missing' },
    }).success,
    false,
  );
});
