import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';

test(
  'isolated database / API / tutor-provider-contract integration',
  { timeout: 120000 },
  async (t) => {
    mkdirSync('.cache', { recursive: true });
    const file = resolve('.cache', `integration-${process.pid}.db`);
    copyFileSync(resolve('prisma/academy.db'), file);
    Object.assign(process.env, {
      DATABASE_URL: `file:${file}`,
      CONTENT_PREVIEW: 'true',
      NODE_ENV: 'test',
    });
    delete process.env.OPENAI_API_KEY;
    delete process.env.RESEND_API_KEY;
    const { db } = await import('../src/lib/db');
    const { handle } = await import('../src/lib/api');
    const { tutorReply, tutorStatus } = await import('../src/lib/tutor');
    await db.contentReview.deleteMany();
    await db.auditLog.deleteMany();
    await db.user.deleteMany();
    await db.rateLimitBucket.deleteMany();
    await db.appSetting.update({ where: { key: 'enforcePrerequisites' }, data: { value: true } });
    const uploaded: string[] = [];
    class Agent {
      cookie = '';
      id = '';
      async call(path: string, method = 'GET', payload?: any, extra: Record<string, string> = {}) {
        const isForm = payload instanceof FormData;
        const headers: Record<string, string> = {
          host: 'academy.test',
          origin: 'http://academy.test',
          'x-astroverse-client': 'academy',
          ...(this.cookie ? { cookie: this.cookie } : {}),
          ...(!isForm && payload !== undefined ? { 'content-type': 'application/json' } : {}),
          ...extra,
        };
        const req = new NextRequest(`http://academy.test/api/${path}`, {
          method,
          headers,
          ...(payload !== undefined ? { body: isForm ? payload : JSON.stringify(payload) } : {}),
        });
        const res = await handle(req);
        const cookie = res.headers.get('set-cookie');
        if (cookie) this.cookie = cookie.split(';')[0];
        const data = res.headers.get('content-type')?.includes('application/json')
          ? await res.json()
          : await res.text();
        return { status: res.status, data, headers: res.headers };
      }
      async bootstrap() {
        const r = await this.call('bootstrap');
        assert.equal(r.status, 200);
        this.id = r.data.user.id;
        return r.data;
      }
    }
    const student = new Agent(),
      other = new Agent(),
      admin = new Agent();
    let examId = '',
      savedQuestion: any;
    const solutions = async (exam: any) => {
      const rows = await db.question.findMany({
        where: { id: { in: exam.questions.map((q: any) => q.id) } },
      });
      return Object.fromEntries(
        rows.map((q) => {
          const a: any = q.answer;
          return [q.id, a.kind === 'text' ? a.accepted[0] : a.correct];
        }),
      );
    };
    const startPass = async (kind: string, scopeId: string) => {
      const started = await student.call('exams/start', 'POST', { kind, scopeId });
      assert.equal(started.status, 200, `${kind} ${scopeId}: ${JSON.stringify(started.data)}`);
      const result = await student.call(`exams/${started.data.id}/submit`, 'POST', {
        responses: await solutions(started.data),
      });
      assert.equal(result.status, 200);
      assert.equal(result.data.score, 100);
      return result.data;
    };
    try {
      await t.test(
        'health, real initial counts, guest sessions, RBAC, and request origin',
        async () => {
          assert.equal((await student.call('health')).data.database, true);
          const data = await student.bootstrap();
          await other.bootstrap();
          await admin.bootstrap();
          assert.equal(data.counts.questions, 864);
          assert.equal(data.progress.stats.examsTaken, 0);
          assert.equal(data.progress.stats.overallMastery, null);
          assert.notEqual(student.id, other.id);
          assert.ok(student.cookie.startsWith('astro_session='));
          assert.equal((await student.call('admin')).status, 403);
          assert.equal((await new Agent().call('admin')).status, 401);
          assert.equal(
            (
              await student.call(
                'profile',
                'PATCH',
                { name: 'Bad origin' },
                { origin: 'https://evil.invalid' },
              )
            ).status,
            403,
          );
          assert.equal(
            (
              await student.call(
                'profile',
                'PATCH',
                { name: 'Missing header' },
                { 'x-astroverse-client': '' },
              )
            ).status,
            403,
          );
          assert.equal((await student.call('lessons/l-2-1')).status, 403);
          assert.equal(
            (await student.call('exams/start', 'POST', { kind: 'STAGE', scopeId: 's-2' })).status,
            404,
          );
          await db.user.update({
            where: { id: admin.id },
            data: { role: 'ADMIN', isGuest: false, email: 'admin-fixture@example.test' },
          });
        },
      );
      await t.test(
        'registration preserves progress identity and rejects injected roles',
        async () => {
          await student.call('lessons/l-1-1');
          const r = await student.call('auth/register', 'POST', {
            name: 'Test Explorer',
            email: 'explorer@example.test',
            password: 'Test-only-passphrase-2026!',
            language: 'en',
            role: 'ADMIN',
          });
          assert.equal(r.status, 200);
          assert.equal(r.data.user.id, student.id);
          assert.equal(r.data.user.role, 'STUDENT');
          assert.equal(await db.lessonProgress.count({ where: { userId: student.id } }), 1);
          assert.equal(
            (await student.call('auth/forgot', 'POST', { email: 'explorer@example.test' })).status,
            503,
          );
        },
      );
      await t.test(
        'quick examination is balanced, answer-free, resumable, and owner-scoped',
        async () => {
          const parallel = await Promise.all([
            student.call('exams/start', 'POST', { kind: 'QUICK', scopeId: 'l-1-1' }),
            student.call('exams/start', 'POST', { kind: 'QUICK', scopeId: 'l-1-1' }),
          ]);
          assert.ok(
            parallel.every((r) => r.status === 200),
            JSON.stringify(parallel),
          );
          assert.equal(parallel[0].data.id, parallel[1].data.id);
          const r = parallel[0];
          assert.equal(
            await db.examAttempt.count({ where: { userId: student.id, status: 'IN_PROGRESS' } }),
            1,
          );
          assert.equal(
            (await student.call('exams/start', 'POST', { kind: 'STANDARD', scopeId: 'l-1-1' }))
              .status,
            409,
          );
          examId = r.data.id;
          assert.equal(r.data.questions.length, 10);
          assert.equal(r.data.questions.filter((q: any) => q.difficulty === 'BEGINNER').length, 3);
          assert.equal(
            r.data.questions.filter((q: any) => q.difficulty === 'INTERMEDIATE').length,
            4,
          );
          assert.equal(r.data.questions.filter((q: any) => q.difficulty === 'ADVANCED').length, 3);
          for (const q of r.data.questions) {
            assert.equal(q.answer, undefined);
            assert.equal(q.explanationEn, undefined);
            assert.ok(
              q.options.every((o: any) => !Object.hasOwn(o, 'order') && !/-o\d+$/.test(o.id)),
            );
          }
          assert.equal(
            (await student.call('exams/start', 'POST', { kind: 'QUICK', scopeId: 'l-1-1' })).data
              .id,
            examId,
          );
          assert.equal((await other.call(`exams/${examId}`)).status, 404);
          savedQuestion = r.data.questions[0];
          assert.equal(
            (
              await student.call('tutor', 'POST', {
                message: 'Explain light',
                mode: 'beginner',
                language: 'en',
              })
            ).status,
            409,
          );
          assert.equal(
            (
              await student.call(`questions/${savedQuestion.id}/attempt`, 'POST', {
                response: 'anything',
              })
            ).status,
            409,
          );
        },
      );
      await t.test(
        'draft revision, persistence, locale independence, and submission idempotency',
        async () => {
          const exam = (await student.call(`exams/${examId}`)).data,
            answers = await solutions(exam);
          const saved = await student.call(`exams/${examId}/save`, 'POST', {
            revision: 0,
            responses: { ...answers, foreignQuestion: 'ignored' },
          });
          assert.equal(saved.status, 200);
          assert.equal(saved.data.revision, 1);
          assert.equal(
            (await student.call(`exams/${examId}/save`, 'POST', { revision: 0, responses: {} }))
              .status,
            409,
          );
          await student.call('profile', 'PATCH', {
            language: 'ar',
            theme: 'light',
            timezone: 'Africa/Cairo',
          });
          const reloaded = (await student.call(`exams/${examId}`)).data;
          assert.deepEqual(reloaded.draftAnswers, answers);
          assert.equal(reloaded.draftRevision, 1);
          assert.ok(reloaded.titleAr);
          const submitted = await student.call(`exams/${examId}/submit`, 'POST', {
            responses: answers,
          });
          assert.equal(submitted.data.score, 100);
          assert.equal(submitted.data.answers.length, 10);
          assert.ok(submitted.data.questions.every((q: any) => q.answer && q.explanationAr));
          assert.equal(
            (await student.call(`exams/${examId}/submit`, 'POST', { responses: {} })).data.score,
            100,
          );
          assert.equal(await db.studentAnswer.count({ where: { examId } }), 10);
          assert.equal(
            (await student.call(`exams/${examId}/save`, 'POST', { revision: 1, responses: {} }))
              .status,
            409,
          );
          assert.equal((await student.call('lessons/l-1-2')).status, 200);
          assert.equal(
            (await student.call('exams/start', 'POST', { kind: 'MODULE', scopeId: 'm-1-1' }))
              .status,
            403,
          );
          assert.equal(
            (await student.call('exams/start', 'POST', { kind: 'STAGE', scopeId: 's-1' })).status,
            403,
          );
        },
      );
      await t.test('expiry uses only the saved draft, not a late replacement', async () => {
        const e = (
          await student.call('exams/start', 'POST', { kind: 'STANDARD', scopeId: 'l-1-1' })
        ).data;
        assert.equal(e.questions.length, 20);
        const answers = await solutions(e);
        const one = Object.fromEntries(Object.entries(answers).slice(0, 1));
        assert.equal(
          (await student.call(`exams/${e.id}/save`, 'POST', { revision: 0, responses: one }))
            .status,
          200,
        );
        await db.examAttempt.update({
          where: { id: e.id },
          data: { expiresAt: new Date(Date.now() - 5000) },
        });
        const result = await student.call(`exams/${e.id}/submit`, 'POST', { responses: answers });
        assert.equal(result.data.score, 5);
        assert.equal(result.data.status, 'SUBMITTED');
        const e2 = (
          await student.call('exams/start', 'POST', { kind: 'ADVANCED', scopeId: 'l-1-1' })
        ).data;
        assert.equal(e2.questions.length, 30);
        await db.examAttempt.update({
          where: { id: e2.id },
          data: { expiresAt: new Date(Date.now() - 5000) },
        });
        assert.equal((await student.call(`exams/${e2.id}`)).data.status, 'SUBMITTED');
      });
      await t.test('simultaneous heartbeats cannot double-credit study time', async () => {
        await db.lessonProgress.update({
          where: { userId_lessonId: { userId: student.id, lessonId: 'l-1-1' } },
          data: { lastOpened: new Date(Date.now() - 31000) },
        });
        const replies = await Promise.all([
          student.call('progress/heartbeat', 'POST', { lessonId: 'l-1-1' }),
          student.call('progress/heartbeat', 'POST', { lessonId: 'l-1-1' }),
        ]);
        assert.equal(
          replies.reduce((n, r) => n + r.data.seconds, 0),
          30,
        );
      });
      await t.test(
        'all 12 practice formats return feedback; rubric does not increase mastery evidence',
        async () => {
          const qs = await db.question.findMany({ where: { moduleId: 'm-1-1' } });
          for (const type of [...new Set(qs.map((q) => q.type))]) {
            const q = qs.find((q) => q.type === type)!,
              a: any = q.answer,
              before = await db.studentAnswer.count({ where: { userId: student.id } });
            const response =
              a.kind === 'text'
                ? a.accepted[1]
                : a.kind === 'rubric'
                  ? a.groups.map((g: string[]) => g[0]).join(' ')
                  : a.correct;
            const result = await student.call(`questions/${q.id}/attempt`, 'POST', { response });
            assert.equal(result.status, 200, type);
            assert.equal(result.data.correct, true, type);
            assert.equal(
              await db.studentAnswer.count({ where: { userId: student.id } }),
              before + (type === 'REASONING' ? 0 : 1),
            );
          }
        },
      );
      await t.test(
        'reference tutor is honest, bilingual, no-match aware, persisted and owner-scoped',
        async () => {
          const r = await student.call('tutor', 'POST', {
            message: 'parallax distance',
            language: 'en',
            mode: 'academic',
          });
          assert.equal(r.status, 200);
          assert.equal(r.data.provider, 'reference');
          assert.match(r.data.text, /not an AI-generated response/);
          assert.ok(r.data.sources.length);
          const c = await student.call(`tutor/conversation/${r.data.conversationId}`);
          assert.equal(c.data.messages[1].provider, 'reference');
          assert.ok(c.data.messages[1].sources.length);
          assert.equal(
            (await other.call(`tutor/conversation/${r.data.conversationId}`)).status,
            404,
          );
          const ar = await student.call('tutor', 'POST', {
            message: 'النجوم',
            language: 'ar',
            mode: 'beginner',
            conversationId: r.data.conversationId,
          });
          assert.match(ar.data.text, /ليس ردًا/);
          const noMatch = await student.call('tutor', 'POST', {
            message: 'zzzzxxyyqq',
            language: 'en',
            mode: 'research',
          });
          assert.equal(noMatch.data.sources.length, 0);
          assert.match(noMatch.data.text, /No strong match/);
          await other.call(`tutor/conversations/${r.data.conversationId}`, 'DELETE');
          assert.ok(await db.aIConversation.findUnique({ where: { id: r.data.conversationId } }));
          await student.call(`tutor/conversations/${r.data.conversationId}`, 'DELETE');
          assert.equal(
            await db.aIConversation.findUnique({ where: { id: r.data.conversationId } }),
            null,
          );
          assert.equal((await tutorStatus()).verified, false);
        },
      );
      await t.test(
        'SIMULATED provider: SSE completion, provenance, history/context, failure, truncation, cancellation',
        async () => {
          let behavior = 'success',
            captured: any;
          const server = createServer((req, res) => {
            let body = '';
            req.on('data', (c) => (body += c));
            req.on('end', () => {
              captured = JSON.parse(body);
              if (behavior === 'error') {
                res.writeHead(503);
                res.end('unavailable');
                return;
              }
              res.writeHead(200, { 'Content-Type': 'text/event-stream' });
              res.write(
                `data: ${JSON.stringify({ choices: [{ delta: { content: 'Simulated astronomy response.' } }] })}\n\n`,
              );
              if (behavior === 'cancel') return;
              if (behavior === 'success') {
                res.write(
                  `data: ${JSON.stringify({ choices: [], usage: { total_tokens: 42 } })}\n\n`,
                );
                res.write('data: [DONE]\n\n');
              }
              res.end();
            });
          });
          await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
          const address = server.address() as any;
          process.env.OPENAI_API_KEY = 'SIMULATED-TEST-KEY-NOT-A-CREDENTIAL';
          process.env.AI_BASE_URL = `http://127.0.0.1:${address.port}`;
          process.env.AI_TIMEOUT_MS = '1000';
          try {
            assert.equal((await tutorStatus()).verified, false);
            const first = await tutorReply(student.id, {
              message: 'Explain parallax',
              language: 'en',
              mode: 'academic',
            });
            const stream = await first.text();
            assert.match(stream, /"type":"done"/);
            assert.match(stream, /"provider":"ai"/);
            const ai = await db.aIMessage.findFirst({
              where: { role: 'assistant', provider: 'ai' },
              orderBy: { createdAt: 'desc' },
            });
            assert.ok(ai);
            assert.ok((ai.sources as any[]).length);
            assert.equal((await tutorStatus()).verified, true);
            assert.match(captured.messages[0].content, /Learner context:/);
            assert.match(captured.messages[0].content, /Your Place in the Universe/);
            const second = await tutorReply(student.id, {
              message: 'Give a more advanced derivation',
              language: 'en',
              mode: 'advanced',
              conversationId: ai.conversationId,
            });
            await second.text();
            assert.ok(captured.messages.length >= 4);
            assert.equal(
              (await db.aIConversation.findUnique({ where: { id: ai.conversationId } }))?.mode,
              'advanced',
            );
            process.env.OPENAI_API_KEY = 'DIFFERENT-SIMULATED-KEY';
            assert.equal((await tutorStatus()).verified, false);
            behavior = 'error';
            await assert.rejects(() =>
              tutorReply(student.id, {
                message: 'Test provider error',
                language: 'en',
                mode: 'beginner',
              }),
            );
            behavior = 'truncated';
            const partial = await tutorReply(student.id, {
              message: 'Test truncated stream',
              language: 'en',
              mode: 'beginner',
            });
            assert.match(await partial.text(), /"type":"error"/);
            assert.equal((await tutorStatus()).verified, false);
            behavior = 'cancel';
            const cancelled = await tutorReply(student.id, {
              message: 'Test cancellation',
              language: 'en',
              mode: 'beginner',
            });
            const reader = cancelled.body!.getReader();
            await reader.read();
            await reader.cancel();
            await new Promise((r) => setTimeout(r, 100));
            assert.equal((await tutorStatus()).verified, false);
            const timedOut = await tutorReply(student.id, {
              message: 'Test full-stream timeout',
              language: 'en',
              mode: 'beginner',
            });
            assert.match(await timedOut.text(), /"type":"error"/);
          } finally {
            delete process.env.OPENAI_API_KEY;
            delete process.env.AI_BASE_URL;
            server.closeAllConnections();
            await new Promise<void>((r) => server.close(() => r()));
          }
        },
      );
      await t.test(
        'full prerequisite sequence produces genuine isolated-test progress and a certificate',
        async () => {
          await db.rateLimitBucket.deleteMany({ where: { key: `exam-start:${student.id}` } });
          for (let m = 1; m <= 8; m++) {
            if (m > 1) await startPass('QUICK', `l-${m}-1`);
            await startPass('QUICK', `l-${m}-2`);
            await startPass('MODULE', `m-1-${m}`);
            // Start limit is tested independently; this accelerated test simulates days of learning.
            await db.rateLimitBucket.deleteMany({ where: { key: `exam-start:${student.id}` } });
          }
          const final = await startPass('STAGE', 's-1');
          assert.equal(final.questions.length, 100);
          const progress = (await student.call('progress')).data;
          assert.equal(progress.stats.completedLessons, 16);
          assert.equal(progress.stats.completedStages, 1);
          assert.equal(progress.certificates.length, 1);
          assert.ok(progress.mastery.every((m: any) => m.checks > 0));
          assert.ok(progress.earned.some((a: any) => a.achievementId === 'stage-1'));
          const certificate = await student.call(`certificates/${progress.certificates[0].id}`);
          assert.equal(certificate.status, 200);
          assert.match(certificate.data, /Non-accredited/);
          assert.match(certificate.data, /غير معتمدة أكاديميًا/);
          assert.match(certificate.data, /نتيجة الاختبار النهائي/);
          assert.equal(
            (await other.call(`certificates/${progress.certificates[0].id}`)).status,
            404,
          );
        },
      );
      await t.test(
        'review gate, question authoring/versioning, immutable assessed questions, structure validation',
        async () => {
          assert.equal((await admin.call('admin')).status, 200);
          const instructor = new Agent();
          await instructor.bootstrap();
          assert.equal(
            (
              await instructor.call('auth/register', 'POST', {
                email: 'instructor-fixture@example.test',
                password: 'Instructor-fixture-passphrase!',
                name: 'Test Instructor',
              })
            ).status,
            200,
          );
          assert.equal(
            (await admin.call(`admin/users/${instructor.id}`, 'PATCH', { role: 'INSTRUCTOR' }))
              .status,
            200,
          );
          const editorPayload = await instructor.call('admin');
          assert.equal(editorPayload.status, 200);
          assert.deepEqual(editorPayload.data.users, []);
          assert.equal(
            (await instructor.call(`admin/users/${other.id}`, 'PATCH', { role: 'ADMIN' })).status,
            403,
          );
          assert.equal(
            (await instructor.call('admin/settings', 'PATCH', { passingScore: 70 })).status,
            403,
          );

          const page = await admin.call('admin/questions?page=2&review=PENDING&lesson=l-1-1');
          assert.equal(page.status, 200);
          assert.equal(page.data.items.length, 20);
          assert.ok(page.data.total >= 50);
          const original = await db.question.findUnique({
            where: { id: savedQuestion.id },
            include: { options: true },
          });
          assert.equal(
            (await admin.call(`admin/questions/${original!.id}`, 'PATCH', original)).status,
            409,
          );
          const draft = {
            ...original,
            promptEn: `${original!.promptEn} (version test)`,
            concept: 'integration-version',
          };
          const created = await admin.call('admin/questions', 'POST', draft);
          assert.equal(created.status, 200);
          assert.equal(created.data.status, 'DRAFT');
          assert.equal(created.data.reviewStatus, 'PENDING');
          assert.equal(
            (
              await admin.call(`admin/review/${created.data.id}`, 'POST', {
                type: 'QUESTION',
                decision: 'APPROVE',
                notes: 'Test fixture review only',
                humanReviewed: false,
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await admin.call(`admin/review/${created.data.id}`, 'POST', {
                type: 'QUESTION',
                decision: 'APPROVE',
                notes: 'Test fixture review only',
                humanReviewed: true,
              })
            ).status,
            200,
          );
          assert.equal(
            (
              await admin.call('admin/review/l-1-1', 'POST', {
                type: 'LESSON',
                decision: 'APPROVE',
                notes: 'Test publication gate',
                humanReviewed: true,
              })
            ).status,
            409,
          );
          const twenty = await db.question.findMany({ where: { lessonId: 'l-1-1' }, take: 20 });
          for (const q of twenty)
            assert.equal(
              (
                await admin.call(`admin/review/${q.id}`, 'POST', {
                  type: 'QUESTION',
                  decision: 'APPROVE',
                  notes: 'Test-only human review fixture',
                  humanReviewed: true,
                })
              ).status,
              200,
            );
          assert.equal(
            (
              await admin.call('admin/review/l-1-1', 'POST', {
                type: 'LESSON',
                decision: 'APPROVE',
                notes: 'Test-only lesson gate fixture',
                humanReviewed: true,
              })
            ).status,
            200,
          );
          assert.equal(
            (
              await admin.call('admin/structure/m-2-1', 'PATCH', {
                type: 'MODULE',
                titleEn: 'Formation of the solar system',
                titleAr: 'تكوّن النظام الشمسي',
                order: 1,
                status: 'AVAILABLE',
              })
            ).status,
            409,
          );
          assert.equal(
            (await student.call('admin/settings', 'PATCH', { passingScore: 70 })).status,
            403,
          );
          const probe = execFileSync(
            resolve('node_modules/.bin/tsx'),
            ['scripts/probe-reviewed-content.ts'],
            {
              env: { ...process.env, CONTENT_PREVIEW: 'false', DATABASE_URL: `file:${file}` },
              encoding: 'utf8',
            },
          );
          const checked = JSON.parse(probe.trim());
          assert.equal(checked.lessons, 1);
          assert.ok(checked.questions >= 20 && checked.questions < 100);
          assert.equal(checked.articles, 1);
        },
      );
      await t.test(
        'upload re-encoding, accessible post-build media, metadata editing, attribution, associations',
        async () => {
          const sharp = (await import('sharp')).default;
          const bytes = await sharp({
            create: { width: 16, height: 16, channels: 3, background: '#123456' },
          })
            .png()
            .toBuffer();
          const form = new FormData();
          form.append('file', new File([new Uint8Array(bytes)], 'test.png', { type: 'image/png' }));
          const meta = {
            lessonId: 'l-1-1',
            titleEn: 'Test illustration',
            titleAr: 'رسم توضيحي للاختبار',
            captionEn: 'Artificial colored square for a software test only.',
            captionAr: 'مربع ملون اصطناعي لاختبار البرمجيات فقط وليس رصدًا.',
            altEn: 'A dark blue square',
            altAr: 'مربع أزرق داكن',
            credit: 'Software test fixture',
            sourceUrl: 'https://example.org/software-test',
            kind: 'ILLUSTRATION',
          };
          for (const [key, value] of Object.entries(meta)) form.append(key, value);
          const result = await admin.call('admin/image', 'POST', form);
          assert.equal(result.status, 200, JSON.stringify(result.data));
          assert.match(result.data.url, /^\/api\/media\//);
          uploaded.push(resolve('storage/uploads', result.data.url.split('/').at(-1)));
          const media = await new Agent().call(result.data.url.replace('/api/', ''));
          assert.equal(media.status, 200);
          assert.equal(media.headers.get('content-type'), 'image/webp');
          assert.equal(
            (
              await admin.call(`admin/images/${result.data.id}`, 'PATCH', {
                ...meta,
                titleEn: 'Updated test illustration',
              })
            ).status,
            200,
          );
          assert.equal((await db.lesson.findUnique({ where: { id: 'l-1-1' } }))?.status, 'DRAFT');
          assert.equal((await admin.call(`admin/images/${result.data.id}`, 'DELETE')).status, 200);
          const ref = await db.scientificReference.findUnique({ where: { id: 'openstax-intro' } });
          assert.equal(
            (
              await admin.call(`admin/references/${ref!.id}`, 'PATCH', {
                ...ref,
                lessonIds: ['l-1-1'],
              })
            ).status,
            200,
          );
        },
      );
      await t.test(
        'password rotation, export privacy, adaptive practice and persisted profile',
        async () => {
          const exported = await student.call('profile/export');
          assert.equal(exported.status, 200);
          const data =
            typeof exported.data === 'string' ? exported.data : JSON.stringify(exported.data);
          assert.equal(data.includes('passwordHash'), false);
          assert.equal(data.includes('astro_session'), false);
          const profile = (await student.call('bootstrap')).data.user.profile;
          assert.equal(profile.language, 'ar');
          assert.equal(profile.theme, 'light');
          assert.equal(profile.timezone, 'Africa/Cairo');
          const old = new Agent();
          old.cookie = student.cookie;
          assert.equal(
            (
              await student.call('profile/password', 'POST', {
                current: 'wrong',
                password: 'Another-test-only-phrase!',
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await student.call('profile/password', 'POST', {
                current: 'Test-only-passphrase-2026!',
                password: 'Another-test-only-phrase!',
              })
            ).status,
            200,
          );
          assert.equal((await old.call('progress')).status, 401);
          assert.equal((await student.call('progress')).status, 200);
          const practice = await student.call(
            'questions?module=m-1-2&difficulty=ADAPTIVE&type=ALL',
          );
          assert.equal(practice.status, 200);
          assert.ok(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(practice.data.difficulty));
        },
      );
      await t.test(
        'recovery tokens are single-use even under simultaneous submissions',
        async () => {
          const { hashToken } = await import('../src/lib/auth');
          const token = 'a'.repeat(64);
          await db.passwordResetToken.create({
            data: {
              id: hashToken(token),
              userId: other.id,
              expiresAt: new Date(Date.now() + 60000),
            },
          });
          const results = await Promise.all([
            other.call('auth/reset', 'POST', { token, password: 'Reset-test-passphrase-one!' }),
            other.call('auth/reset', 'POST', { token, password: 'Reset-test-passphrase-two!' }),
          ]);
          assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
          assert.equal(await db.passwordResetToken.count({ where: { userId: other.id } }), 0);
          assert.equal((await other.call('progress')).status, 401);
        },
      );
      await t.test(
        'offline content export, dry run, and attributed draft-only import',
        async () => {
          const output = resolve('.cache', `pipeline-${process.pid}.json`),
            bin = resolve('node_modules/.bin/tsx');
          try {
            execFileSync(
              bin,
              [
                'scripts/generate-content.ts',
                '--export-seed',
                '--module',
                'm-1-1',
                '--out',
                output,
              ],
              { env: process.env },
            );
            const before = await db.lesson.count();
            execFileSync(bin, ['scripts/import-content.ts', '--file', output], {
              env: process.env,
            });
            assert.equal(await db.lesson.count(), before);
            execFileSync(
              bin,
              [
                'scripts/import-content.ts',
                '--file',
                output,
                '--apply',
                '--actor-email',
                'admin-fixture@example.test',
              ],
              { env: process.env },
            );
            assert.equal(await db.lesson.count(), before + 2);
            const drafts = await db.lesson.findMany({
              where: { id: { startsWith: 'lesson-' } },
              include: { questions: true },
            });
            assert.equal(drafts.length, 2);
            assert.ok(
              drafts.every(
                (l) =>
                  l.status === 'DRAFT' &&
                  l.reviewStatus === 'PENDING' &&
                  l.questions.every((q) => q.status === 'DRAFT' && q.reviewStatus === 'PENDING'),
              ),
            );
          } finally {
            for (const p of [output, `${output}.receipt.json`]) if (existsSync(p)) rmSync(p);
          }
        },
      );
    } finally {
      await db.$disconnect();
      for (const path of uploaded) if (existsSync(path)) rmSync(path);
      for (const suffix of ['', '-wal', '-shm', '-journal'])
        if (existsSync(file + suffix)) rmSync(file + suffix);
    }
  },
);
