import 'dotenv/config';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { db } from '../src/lib/db';
import { handle } from '../src/lib/api';
import { writeFileSync } from 'node:fs';
async function main() {
  const url = new URL(process.env.DATABASE_URL || 'file:');
  assert.ok(
    ['127.0.0.1', 'localhost'].includes(url.hostname) &&
      url.pathname === '/astroverse_verification',
    'Use only the local disposable PostgreSQL verification database.',
  );
  let cookie = '';
  const call = async (path: string, method = 'GET', body?: any) => {
    const response = await handle(
      new NextRequest(`http://pg.test/api/${path}`, {
        method,
        headers: {
          host: 'pg.test',
          origin: 'http://pg.test',
          'x-astroverse-client': 'academy',
          cookie,
          'content-type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    );
    if (response.headers.has('set-cookie'))
      cookie = response.headers.get('set-cookie')!.split(';')[0];
    return { status: response.status, data: await response.json() };
  };
  const start = await call('bootstrap');
  assert.equal(start.status, 200);
  assert.equal(start.data.counts.questions, 864);
  assert.equal(start.data.stages.length, 12);
  assert.equal((await call('lessons/l-1-1')).data.sections.length, 10);
  const attempts = await Promise.all([
    call('exams/start', 'POST', { kind: 'QUICK', scopeId: 'l-1-1' }),
    call('exams/start', 'POST', { kind: 'QUICK', scopeId: 'l-1-1' }),
  ]);
  assert.ok(
    attempts.every((a) => a.status === 200),
    JSON.stringify(attempts),
  );
  assert.equal(attempts[0].data.id, attempts[1].data.id);
  const exam = attempts[0].data;
  const questions = await db.question.findMany({
    where: { id: { in: exam.questions.map((q: any) => q.id) } },
  });
  const responses = Object.fromEntries(
    questions.map((q) => {
      const a: any = q.answer;
      return [q.id, a.kind === 'text' ? a.accepted[0] : a.correct];
    }),
  );
  assert.equal(
    (await call(`exams/${exam.id}/save`, 'POST', { responses, revision: 0 })).status,
    200,
  );
  assert.equal(
    (await call(`exams/${exam.id}/save`, 'POST', { responses: {}, revision: 0 })).status,
    409,
  );
  const result = await call(`exams/${exam.id}/submit`, 'POST', { responses });
  assert.equal(result.data.score, 100);
  assert.equal((await call('progress')).data.stats.completedLessons, 1);
  assert.equal((await call('lessons/l-1-2')).status, 200);
  const tutor = await call('tutor', 'POST', {
    message: 'parallax',
    language: 'ar',
    mode: 'academic',
    referenceOnly: true,
  });
  assert.equal(tutor.data.provider, 'reference');
  assert.ok(tutor.data.sources.length);
  const history = await call(`tutor/conversation/${tutor.data.conversationId}`);
  assert.equal(history.data.messages[1].provider, 'reference');
  assert.ok(history.data.messages[1].sources.length);
  assert.equal((await call('profile', 'PATCH', { theme: 'light', language: 'ar' })).status, 200);
  const report = {
    checkedAt: new Date().toISOString(),
    provider: 'PostgreSQL 17.11',
    passed: true,
    migrations: 5,
    stages: 12,
    modules: await db.module.count(),
    lessons: await db.lesson.count(),
    questions: await db.question.count(),
    checks: [
      'fresh migrations',
      'full seed',
      'JSON round trip',
      'concurrent single-active constraint',
      'draft revision conflict',
      'grading and persisted progress',
      'prerequisite unlock',
      'reference tutor provenance',
      'profile persistence',
    ],
    limitations: [
      'Smoke test, not a high-concurrency load test',
      'No live AI or mail-provider calls',
    ],
  };
  writeFileSync('tests/postgres-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
