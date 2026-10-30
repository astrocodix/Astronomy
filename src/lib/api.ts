import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { db } from './db';
import {
  ApiError,
  body,
  limitedBytes,
  checkOrigin,
  clientKey,
  findUser,
  requireUser,
  requireStaff,
  publicUser,
  newSession,
  hashPassword,
  checkPassword,
  hashToken,
  rateLimit,
} from './auth';
import {
  catalog,
  analytics,
  settings,
  checkLessonAccess,
  publishedWhere,
  publishedQuestionWhere,
  refreshMastery,
  checkModuleAccess,
} from './learning';
import { startExam, getExam, submitExam, saveExam, responsesSchema, responseValue } from './exams';
import { publicQuestion, grade, shuffle } from './assessment';
import { tutorStatus, tutorReply } from './tutor';
import { questionDraftSchema, questionTypes } from './question-schema';
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const idSchema = z.string().min(1).max(150);
const locale = z.enum(['en', 'ar']);
export async function handle(req: NextRequest) {
  try {
    checkOrigin(req);
    const path = req.nextUrl.pathname
      .replace(/^\/api\/?/, '')
      .split('/')
      .filter(Boolean);
    const [root, a, b] = path;
    const method = req.method;
    if (root === 'media' && method === 'GET' && a && /^[a-f0-9]{32}\.webp$/.test(a)) {
      const fs = await import('node:fs/promises');
      try {
        const bytes = await fs.readFile(`${process.cwd()}/storage/uploads/${a}`);
        return new NextResponse(new Uint8Array(bytes), {
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch {
        throw new ApiError(404, 'Image not found.', 'الصورة غير موجودة.');
      }
    }
    if (root === 'health')
      return json({
        status: 'ok',
        database: !!(await db.course.findUnique({ where: { id: 'astronomy' } })),
        testMode:
          process.env.ACADEMY_TEST_MODE === 'true' &&
          !!process.env.DATABASE_URL?.endsWith('/e2e.db'),
      });
    if (root === 'bootstrap' && method === 'GET') {
      let u = await findUser(req);
      let attach: ((r: NextResponse) => NextResponse) | null = null;
      if (!u) {
        await rateLimit(`guest:${clientKey(req)}`, 30, 3600);
        u = await db.user.create({
          data: {
            isGuest: true,
            profile: { create: { name: 'Explorer' } },
            notifications: {
              create: {
                titleEn: 'Your universe of learning awaits',
                titleAr: 'عالمك من المعرفة ينتظرك',
                bodyEn:
                  'Begin with Your Place in the Universe. Your progress is saved in this browser session.',
                bodyAr: 'ابدأ بدرس مكانك في الكون. يُحفظ تقدمك في جلسة هذا المتصفح.',
                href: '/lesson/l-1-1',
              },
            },
          },
          include: { profile: true },
        });
        attach = await newSession(u.id, req);
      }
      const [stages, progress, config, tutor, counts] = await Promise.all([
        catalog(),
        analytics(u.id),
        settings(),
        tutorStatus(),
        Promise.all([
          db.question.count({ where: publishedQuestionWhere }),
          db.lesson.count({ where: publishedWhere }),
          db.module.count(),
        ]),
      ]);
      const res = json({
        user: publicUser(u),
        stages,
        progress,
        settings: {
          passingScore: config.passingScore,
          enforcePrerequisites: config.enforcePrerequisites,
        },
        tutor,
        counts: { questions: counts[0], lessons: counts[1], modules: counts[2] },
        pilot: process.env.CONTENT_PREVIEW === 'true',
      });
      return attach ? attach(res) : res;
    }
    if (root === 'auth') {
      if (method !== 'POST') throw new ApiError(405, 'Method not allowed.');
      await rateLimit(`auth:${clientKey(req)}`, 12, 60);
      const data = await body(req);
      if (a === 'register') {
        const input = z
          .object({
            name: z.string().trim().min(2).max(80),
            email: z.email().max(254),
            password: z.string().min(12).max(128),
            language: locale.default('en'),
          })
          .parse(data);
        const email = input.email.toLowerCase();
        if (await db.user.findUnique({ where: { email } }))
          throw new ApiError(
            409,
            'This email is already registered. Please sign in.',
            'هذا البريد مسجل بالفعل. سجّل الدخول.',
          );
        const guest = await findUser(req);
        const passwordHash = await hashPassword(input.password);
        let u;
        if (guest?.isGuest)
          u = await db.user.update({
            where: { id: guest.id },
            data: {
              email,
              passwordHash,
              isGuest: false,
              profile: { update: { name: input.name, language: input.language } },
            },
            include: { profile: true },
          });
        else
          u = await db.user.create({
            data: {
              email,
              passwordHash,
              isGuest: false,
              profile: { create: { name: input.name, language: input.language } },
            },
            include: { profile: true },
          });
        await db.session.deleteMany({ where: { userId: u.id } });
        return (await newSession(u.id, req))(json({ user: publicUser(u) }));
      }
      if (a === 'login') {
        const input = z.object({ email: z.email(), password: z.string().max(128) }).parse(data);
        const u = await db.user.findUnique({
          where: { email: input.email.toLowerCase() },
          include: { profile: true },
        });
        const valid = u?.passwordHash
          ? await checkPassword(input.password, u.passwordHash)
          : await checkPassword(
              input.password,
              '00000000000000000000000000000000:' + '00'.repeat(64),
            );
        if (!u || !valid)
          throw new ApiError(
            401,
            'The email or password is incorrect.',
            'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
          );
        const old = req.cookies.get('astro_session')?.value;
        if (old) await db.session.deleteMany({ where: { id: hashToken(old) } });
        return (await newSession(u.id, req))(json({ user: publicUser(u) }));
      }
      if (a === 'logout') {
        const raw = req.cookies.get('astro_session')?.value;
        if (raw) await db.session.deleteMany({ where: { id: hashToken(raw) } });
        const res = json({ ok: true });
        res.cookies.delete('astro_session');
        return res;
      }
      if (a === 'forgot') {
        const input = z.object({ email: z.email() }).parse(data);
        if (!process.env.RESEND_API_KEY)
          throw new ApiError(
            503,
            'Password recovery email is not configured in this preview. Contact the academy administrator.',
            'بريد استعادة كلمة المرور غير مهيأ في هذه المعاينة. تواصل مع المسؤول.',
          );
        const u = await db.user.findUnique({
          where: { email: input.email.toLowerCase() },
          include: { profile: true },
        });
        if (u) {
          const token = randomBytes(32).toString('hex');
          await db.passwordResetToken.create({
            data: {
              id: hashToken(token),
              userId: u.id,
              expiresAt: new Date(Date.now() + 30 * 60000),
            },
          });
          const link = `${process.env.APP_URL}/reset-password?token=${token}`;
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.MAIL_FROM,
              to: [u.email],
              subject:
                u.profile?.language === 'ar'
                  ? 'استعادة كلمة مرور أستروفرس'
                  : 'Reset your Astroverse password',
              text:
                u.profile?.language === 'ar'
                  ? `أعد تعيين كلمة المرور خلال 30 دقيقة: ${link}\nإذا لم تطلب ذلك فتجاهل الرسالة.`
                  : `Reset your password within 30 minutes: ${link}\nIf you did not request this, ignore this message.`,
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (!response.ok) {
            await db.passwordResetToken.delete({ where: { id: hashToken(token) } });
            throw new ApiError(
              502,
              'Email delivery is unavailable. Please try again later.',
              'إرسال البريد غير متاح. حاول لاحقًا.',
            );
          }
        }
        return json({ message: 'If that account exists, a recovery link has been sent.' });
      }
      if (a === 'reset') {
        const input = z
          .object({ token: z.string().min(32).max(128), password: z.string().min(12).max(128) })
          .parse(data);
        const token = await db.passwordResetToken.findUnique({
          where: { id: hashToken(input.token) },
        });
        if (!token || token.expiresAt < new Date())
          throw new ApiError(
            400,
            'This recovery link is invalid or expired.',
            'رابط الاستعادة غير صالح أو منتهي.',
          );
        const passwordHash = await hashPassword(input.password);
        await db.$transaction(async (tx) => {
          const claimed = await tx.passwordResetToken.deleteMany({
            where: { id: token.id, expiresAt: { gt: new Date() } },
          });
          if (!claimed.count)
            throw new ApiError(
              400,
              'This recovery link was already used or expired.',
              'استُخدم رابط الاستعادة أو انتهت صلاحيته.',
            );
          await tx.user.update({ where: { id: token.userId }, data: { passwordHash } });
          await tx.session.deleteMany({ where: { userId: token.userId } });
          await tx.passwordResetToken.deleteMany({ where: { userId: token.userId } });
        });
        return json({ ok: true });
      }
    }
    const user = await requireUser(req);
    await rateLimit(`api:${user.id}`, 240, 60);
    if (root === 'catalog' && method === 'GET') return json(await catalog());
    if (root === 'progress' && method === 'GET') return json(await analytics(user.id));
    if (root === 'lessons' && a && method === 'GET') {
      await checkLessonAccess(user.id, a);
      const l = await db.lesson.findUnique({
        where: { id: a },
        include: {
          sections: { orderBy: { order: 'asc' } },
          images: true,
          references: { include: { reference: true } },
          module: { include: { stage: { select: { id: true, titleEn: true, titleAr: true } } } },
          _count: { select: { questions: { where: publishedQuestionWhere } } },
        },
      });
      await db.lessonProgress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId: a } },
        update: { lastOpened: new Date() },
        create: { userId: user.id, lessonId: a },
      });
      return json(l);
    }
    if (root === 'progress' && a === 'heartbeat' && method === 'POST') {
      const input = z.object({ lessonId: idSchema }).parse(await body(req));
      await checkLessonAccess(user.id, input.lessonId);
      const p = await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId: input.lessonId } },
      });
      if (!p) return json({ seconds: 0 });
      const seconds = Math.min(30, Math.floor((Date.now() - p.lastOpened.getTime()) / 1000));
      if (seconds < 20) return json({ seconds: 0 });
      const credited = await db.$transaction(async (tx) => {
        const claimed = await tx.lessonProgress.updateMany({
          where: { id: p.id, lastOpened: p.lastOpened },
          data: { seconds: { increment: seconds }, lastOpened: new Date() },
        });
        if (!claimed.count) return 0;
        await tx.studySession.create({
          data: { userId: user.id, lessonId: input.lessonId, seconds },
        });
        return seconds;
      });
      return json({ seconds: credited });
    }
    if (root === 'exams') {
      if (a === 'templates' && method === 'GET')
        return json(
          await db.examTemplate.findMany({
            include: {
              lesson: { select: { titleEn: true, titleAr: true } },
              module: { select: { titleEn: true, titleAr: true } },
              stage: { select: { titleEn: true, titleAr: true } },
            },
          }),
        );
      if (a === 'start' && method === 'POST') {
        await rateLimit(`exam-start:${user.id}`, 10, 60);
        return json(
          await startExam(
            user.id,
            z
              .object({
                kind: z.enum(['QUICK', 'STANDARD', 'ADVANCED', 'MODULE', 'STAGE', 'REVISION']),
                scopeId: idSchema,
              })
              .parse(await body(req)),
          ),
        );
      }
      if (a && method === 'GET') return json(await getExam(user.id, a));
      if (a && b === 'save' && method === 'POST') {
        const input = z
          .object({ responses: responsesSchema, revision: z.number().int().min(0).optional() })
          .parse(await body(req));
        return json(await saveExam(user.id, a, input.responses, input.revision));
      }
      if (a && b === 'submit' && method === 'POST') {
        const input = z.object({ responses: responsesSchema }).parse(await body(req));
        return json(await submitExam(user.id, a, input.responses));
      }
    }
    if (root === 'questions' && method === 'GET') {
      const mod = req.nextUrl.searchParams.get('module') || 'm-1-1';
      await checkModuleAccess(user.id, mod);
      let difficulty = req.nextUrl.searchParams.get('difficulty');
      if (difficulty === 'ADAPTIVE') {
        const mastery = await db.topicMastery.findUnique({
          where: { userId_moduleId: { userId: user.id, moduleId: mod } },
        });
        difficulty =
          !mastery || mastery.score < 50
            ? 'BEGINNER'
            : mastery.score < 80
              ? 'INTERMEDIATE'
              : 'ADVANCED';
      }
      const type = req.nextUrl.searchParams.get('type');
      const where: any = {
        moduleId: mod,
        ...publishedQuestionWhere,
        ...(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty || '')
          ? { difficulty }
          : {}),
        ...(type && type !== 'ALL' ? { type } : {}),
      };
      const rows = await db.question.findMany({ where, include: { options: true } });
      const done = await db.studentAnswer.findMany({
        where: { userId: user.id, question: { moduleId: mod } },
        orderBy: { createdAt: 'desc' },
        take: 60,
        select: { questionId: true },
      });
      const seen = new Set(done.map((q) => q.questionId));
      const random = shuffle(rows).sort((x, y) => Number(seen.has(x.id)) - Number(seen.has(y.id)));
      return json({
        total: rows.length,
        questions: random.slice(0, 20).map((q) => publicQuestion(q)),
        difficulty: difficulty || 'ALL',
      });
    }
    if (root === 'questions' && a && b === 'attempt' && method === 'POST') {
      await rateLimit(`practice:${user.id}`, 30, 60);
      const input = z.object({ response: responseValue }).parse(await body(req));
      const q = await db.question.findFirst({
        where: { id: a, ...publishedQuestionWhere },
        include: { options: true },
      });
      if (!q) throw new ApiError(404, 'Question not found.');
      await checkModuleAccess(user.id, q.moduleId);
      const active = await db.examQuestion.findFirst({
        where: { questionId: q.id, exam: { userId: user.id, status: 'IN_PROGRESS' } },
      });
      if (active)
        throw new ApiError(
          409,
          'Finish your active exam before reviewing this question.',
          'أكمل الاختبار الجاري قبل مراجعة هذا السؤال.',
        );
      const result = grade(q.answer, input.response);
      if (!result.provisional) {
        await db.studentAnswer.create({
          data: {
            userId: user.id,
            questionId: q.id,
            response: (input.response ?? null) as any,
            correct: result.correct,
            score: result.score,
          },
        });
        await refreshMastery(user.id, [q.moduleId]);
      }
      return json({ ...result, question: publicQuestion(q, undefined, true) });
    }
    if (root === 'tutor') {
      if (a === 'status' && method === 'GET') return json(await tutorStatus());
      if (a === 'conversations' && method === 'GET')
        return json(
          await db.aIConversation.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
            include: { _count: { select: { messages: true } } },
          }),
        );
      if (a === 'conversations' && b && method === 'DELETE') {
        await db.aIConversation.deleteMany({ where: { id: b, userId: user.id } });
        return json({ ok: true });
      }
      if (a === 'conversation' && b && method === 'GET') {
        const convo = await db.aIConversation.findFirst({
          where: { id: b, userId: user.id },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!convo) throw new ApiError(404, 'Conversation not found.');
        return json(convo);
      }
      if (method === 'POST') {
        await rateLimit(`tutor:${user.id}`, 12, 60);
        return await tutorReply(
          user.id,
          z
            .object({
              message: z.string().trim().min(1).max(4000),
              language: locale,
              mode: z.enum(['beginner', 'academic', 'advanced', 'research', 'exam']),
              conversationId: idSchema.optional(),
              referenceOnly: z.boolean().optional(),
            })
            .parse(await body(req)),
        );
      }
    }
    if (root === 'library' && method === 'GET') {
      const visibleLessons = await db.lesson.findMany({
        where: {
          ...publishedWhere,
          module: { status: 'AVAILABLE', stage: { status: 'AVAILABLE' } },
        },
        select: { id: true },
      });
      const visibleIds = visibleLessons.map((l) => l.id);
      if (a) {
        const article = await db.libraryArticle.findUnique({
          where: { id: a },
          include: { references: { include: { reference: true } } },
        });
        if (!article || !article.lessonId || !visibleIds.includes(article.lessonId))
          throw new ApiError(404, 'Article not found.', 'المقال غير منشور.');
        return json(article);
      }
      const q = (req.nextUrl.searchParams.get('q') || '').slice(0, 100);
      return json(
        await db.libraryArticle.findMany({
          where: {
            lessonId: { in: visibleIds },
            OR: [
              { titleEn: { contains: q } },
              { titleAr: { contains: q } },
              { contentEn: { contains: q } },
              { contentAr: { contains: q } },
            ],
          },
          include: { references: { include: { reference: true } } },
        }),
      );
    }
    if (root === 'bookmarks' && method === 'POST') {
      const input = z
        .object({ lessonId: idSchema.optional(), articleId: idSchema.optional() })
        .refine((v) => !!v.lessonId !== !!v.articleId)
        .parse(await body(req));
      const where = input.lessonId
        ? { userId: user.id, lessonId: input.lessonId }
        : { userId: user.id, articleId: input.articleId };
      const existing = await db.bookmark.findFirst({ where });
      if (existing) {
        await db.bookmark.delete({ where: { id: existing.id } });
        return json({ saved: false });
      }
      if (
        (input.lessonId && !(await db.lesson.findUnique({ where: { id: input.lessonId } }))) ||
        (input.articleId &&
          !(await db.libraryArticle.findUnique({ where: { id: input.articleId } })))
      )
        throw new ApiError(404, 'Resource not found.');
      await db.bookmark.create({ data: { userId: user.id, ...input } });
      return json({ saved: true });
    }
    if (root === 'achievements' && method === 'GET')
      return json(
        await db.achievement.findMany({
          include: { users: { where: { userId: user.id }, select: { earnedAt: true } } },
        }),
      );
    if (root === 'plan' && method === 'POST') {
      const input = z
        .object({ dailyMinutes: z.number().int().min(10).max(120) })
        .parse(await body(req));
      const progress = await analytics(user.id);
      const completed = new Set(progress.lessons.filter((l) => l.completed).map((l) => l.lessonId));
      const weak = progress.mastery
        .filter((m) => m.score < 70 && m.checks > 0)
        .sort((a, b) => a.score - b.score)
        .map((m) => m.moduleId);
      const all = await db.lesson.findMany({
        where: publishedWhere,
        orderBy: [{ moduleId: 'asc' }, { order: 'asc' }],
      });
      const ordered = [
        ...all.filter((l) => weak.includes(l.moduleId)),
        ...all.filter((l) => !completed.has(l.id) && !weak.includes(l.moduleId)),
      ];
      const days = Array.from({ length: 7 }, (_, i) => {
        const l = ordered[i % Math.max(ordered.length, 1)];
        return {
          day: i + 1,
          lessonId: l?.id ?? 'l-1-1',
          titleEn: l?.titleEn ?? 'Review your stage',
          titleAr: l?.titleAr ?? 'راجع مرحلتك',
          minutes: input.dailyMinutes,
          review: l ? weak.includes(l.moduleId) : true,
          lockedUntilPrerequisite: true,
        };
      });
      const p = await db.studyPlan.create({
        data: { userId: user.id, days, dailyMinutes: input.dailyMinutes },
      });
      await db.userProfile.update({
        where: { userId: user.id },
        data: { dailyGoal: input.dailyMinutes },
      });
      return json(p);
    }
    if (root === 'notifications' && method === 'POST') {
      await db.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
      return json({ ok: true });
    }
    if (root === 'profile') {
      if (a === 'export' && method === 'GET') {
        const data = {
          profile: publicUser(user),
          progress: await analytics(user.id),
          allExamAttempts: await db.examAttempt.findMany({
            where: { userId: user.id },
            select: {
              id: true,
              title: true,
              titleAr: true,
              kind: true,
              scopeId: true,
              status: true,
              score: true,
              passingScore: true,
              duration: true,
              startedAt: true,
              submittedAt: true,
            },
          }),
          allSubmittedAnswers: await db.studentAnswer.findMany({
            where: { userId: user.id },
            select: {
              questionId: true,
              examId: true,
              response: true,
              correct: true,
              score: true,
              createdAt: true,
            },
          }),
          conversations: await db.aIConversation.findMany({
            where: { userId: user.id },
            include: { messages: true },
          }),
        };
        return new NextResponse(JSON.stringify(data, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="astroverse-learning-data.json"',
            'Cache-Control': 'no-store',
          },
        });
      }
      if (method === 'PATCH') {
        const input = z
          .object({
            name: z.string().trim().min(2).max(80).optional(),
            bio: z.string().max(600).optional(),
            language: locale.optional(),
            theme: z.enum(['light', 'dark', 'system']).optional(),
            dailyGoal: z.number().int().min(10).max(120).optional(),
            timezone: z
              .string()
              .max(80)
              .refine((v) => {
                try {
                  Intl.DateTimeFormat('en', { timeZone: v });
                  return true;
                } catch {
                  return false;
                }
              })
              .optional(),
            tutorMode: z.enum(['beginner', 'academic', 'advanced', 'research', 'exam']).optional(),
          })
          .parse(await body(req));
        return json(await db.userProfile.update({ where: { userId: user.id }, data: input }));
      }
      if (a === 'password' && method === 'POST') {
        const input = z
          .object({ current: z.string().max(128), password: z.string().min(12).max(128) })
          .parse(await body(req));
        if (!user.passwordHash || !(await checkPassword(input.current, user.passwordHash)))
          throw new ApiError(
            400,
            'Current password is incorrect.',
            'كلمة المرور الحالية غير صحيحة.',
          );
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash: await hashPassword(input.password) },
        });
        await db.session.deleteMany({ where: { userId: user.id } });
        return (await newSession(user.id, req))(json({ ok: true }));
      }
    }
    if (root === 'certificates' && a && method === 'GET') {
      const c = await db.certificate.findFirst({
        where: { id: a, userId: user.id },
        include: { stage: true, user: { include: { profile: true } } },
      });
      if (!c)
        throw new ApiError(
          404,
          'An earned certificate is required.',
          'يلزم الحصول على شهادة أولًا.',
        );
      const escape = (s: string) =>
        s.replace(
          /[<>&"']/g,
          (x) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[x]!,
        );
      const rawName = c.user.profile?.name || 'Explorer';
      const name = escape(rawName);
      const nameSize = Math.min(
        44,
        Math.max(14, Math.floor(940 / (Array.from(rawName).length * 0.85))),
      );
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#0b1020"/><rect x="30" y="30" width="1140" height="790" fill="none" stroke="#a496ee" stroke-width="2"/><g font-family="Arial,sans-serif" text-anchor="middle"><text x="600" y="130" fill="#b6a5ff" font-size="22" letter-spacing="5">ASTROVERSE ACADEMY</text><text x="600" y="230" fill="#f3f5ff" font-size="48">Certificate of Completion</text><text x="600" y="285" fill="#a4aec5" font-size="24">شهادة إتمام</text><text x="600" y="385" fill="#ffffff" font-size="${nameSize}">${name}</text><text x="600" y="455" fill="#a4aec5" font-size="22">has successfully completed the assessed learning stage</text><text x="600" y="485" fill="#a4aec5" font-size="20" direction="rtl">أتمّ بنجاح المرحلة التعليمية وتقييماتها</text><text x="600" y="535" fill="#b6a5ff" font-size="30">${escape(c.stage.titleEn)}</text><text x="600" y="575" fill="#a4aec5" font-size="24">${escape(c.stage.titleAr)}</text><text x="600" y="635" fill="#ffffff" font-size="20">Final examination: ${c.score}% · Issued ${c.issuedAt.toISOString().slice(0, 10)}</text><text x="600" y="665" fill="#a4aec5" font-size="18" direction="rtl">نتيجة الاختبار النهائي: ${c.score}٪ · تاريخ الإصدار: ${c.issuedAt.toISOString().slice(0, 10)}</text><text x="600" y="715" fill="#a4aec5" font-size="14">Credential ${escape(c.id)} · Non-accredited academy completion certificate</text><text x="600" y="739" fill="#a4aec5" font-size="17" direction="rtl">شهادة إتمام تعليمية غير معتمدة أكاديميًا</text><text x="600" y="785" fill="#a4aec5" font-size="18">Learn the Universe. Understand Everything.</text></g></svg>`;
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': 'attachment; filename="astroverse-certificate.svg"',
          'Cache-Control': 'private, no-store',
        },
      });
    }
    if (root === 'admin') return await admin(req, path, user.id);
    throw new ApiError(404, 'This resource was not found.', 'لم يُعثر على هذا المورد.');
  } catch (e) {
    if (e instanceof ApiError) return json({ error: e.message, errorAr: e.ar }, e.status);
    if (e instanceof z.ZodError)
      return json(
        {
          error: 'Please check the required fields and their format.',
          errorAr: 'راجع الحقول المطلوبة وصيغتها.',
          fields: e.issues.map((x) => ({ path: x.path, message: x.message })),
        },
        400,
      );
    if ((e as any)?.code === 'P2002')
      return json(
        {
          error: 'That identifier or ordering position is already in use.',
          errorAr: 'المعرّف أو موضع الترتيب مستخدم بالفعل.',
        },
        409,
      );
    if ((e as any)?.code === 'P2025')
      return json(
        {
          error: 'The requested record no longer exists.',
          errorAr: 'السجل المطلوب لم يعد موجودًا.',
        },
        404,
      );
    console.error('API error', e instanceof Error ? e.message : e);
    return json(
      {
        error: 'Something went wrong. Please retry. Your saved progress is safe.',
        errorAr: 'حدث خطأ. حاول مجددًا؛ تقدمك المحفوظ آمن.',
      },
      500,
    );
  }
}
async function admin(req: NextRequest, path: string[], userId: string) {
  const staff = await requireStaff(req);
  const [, section, id] = path;
  const method = req.method;
  if (!section && method === 'GET') {
    const [lessons, questions, users, config, reviews, usage, refs] = await Promise.all([
      db.lesson.findMany({
        orderBy: [{ moduleId: 'asc' }, { order: 'asc' }],
        include: {
          sections: true,
          images: true,
          references: { include: { reference: true } },
          module: true,
          _count: { select: { questions: true } },
        },
      }),
      db.question.findMany({
        where: { OR: [{ reviewStatus: { not: 'APPROVED' } }, { generated: true }] },
        include: { options: true },
        take: 100,
      }),
      staff.role === 'ADMIN'
        ? db.user.findMany({
            where: { isGuest: false },
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
              profile: true,
              _count: { select: { examAttempts: true, lessons: true } },
            },
          })
        : Promise.resolve([]),
      settings(),
      db.contentReview.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      db.aIUsageLog.groupBy({ by: ['status'], _count: true, _sum: { tokens: true } }),
      db.scientificReference.findMany({ include: { lessons: true } }),
    ]);
    return json({
      lessons,
      questions,
      users,
      settings: config,
      reviews,
      usage,
      references: refs,
      role: staff.role,
      stats: {
        learners: await db.user.count({ where: { isGuest: false, role: 'STUDENT' } }),
        guests: await db.user.count({ where: { isGuest: true } }),
        exams: await db.examAttempt.count({ where: { status: 'SUBMITTED' } }),
        questions: await db.question.count(),
      },
    });
  }
  if (section === 'settings' && method === 'PATCH') {
    await requireStaff(req, true);
    const v = z
      .object({
        passingScore: z.number().int().min(50).max(100),
        enforcePrerequisites: z.boolean(),
        aiDailyLimit: z.number().int().min(0).max(500),
        aiModel: z.string().regex(/^[\w.\-/:]{1,100}$/),
      })
      .parse(await body(req));
    for (const [key, value] of Object.entries(v))
      await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    await db.auditLog.create({ data: { userId, action: 'UPDATE_SETTINGS', entityId: 'academy' } });
    return json(v);
  }
  if (section === 'users' && id && method === 'PATCH') {
    await requireStaff(req, true);
    const input = z
      .object({ role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']) })
      .parse(await body(req));
    if (id === userId)
      throw new ApiError(400, 'You cannot change your own role.', 'لا يمكنك تغيير دور حسابك.');
    await db.user.update({ where: { id }, data: input });
    await db.auditLog.create({ data: { userId, action: `SET_ROLE_${input.role}`, entityId: id } });
    return json({ ok: true });
  }
  if (section === 'lessons' && method === 'POST') {
    const v = z
      .object({
        moduleId: idSchema,
        titleEn: z.string().min(3).max(200),
        titleAr: z.string().min(3).max(200),
        summaryEn: z.string().min(10).max(1000),
        summaryAr: z.string().min(10).max(1000),
      })
      .parse(await body(req));
    const max = await db.lesson.aggregate({
      where: { moduleId: v.moduleId },
      _max: { order: true },
    });
    const lesson = await db.lesson.create({
      data: {
        id: `lesson-${randomBytes(8).toString('hex')}`,
        ...v,
        order: (max._max.order || 0) + 1,
        objectives: [],
        terms: [],
        status: 'DRAFT',
        reviewStatus: 'PENDING',
      },
    });
    await db.auditLog.create({ data: { userId, action: 'CREATE_LESSON', entityId: lesson.id } });
    return json(lesson);
  }
  if (section === 'lessons' && id && method === 'PATCH') {
    const v = z
      .object({
        titleEn: z.string().min(3).max(200),
        titleAr: z.string().min(3).max(200),
        summaryEn: z.string().min(10).max(1500),
        summaryAr: z.string().min(10).max(1500),
        duration: z.number().int().min(5).max(180),
        objectives: z
          .array(z.object({ en: z.string().min(5), ar: z.string().min(5) }))
          .min(2)
          .optional(),
        sections: z
          .array(
            z.object({
              id: idSchema.optional(),
              order: z.number().int().min(0),
              type: z.string().max(30),
              titleEn: z.string().min(1).max(200),
              titleAr: z.string().min(1).max(200),
              contentEn: z.string().min(20).max(25000),
              contentAr: z.string().min(20).max(25000),
            }),
          )
          .min(1)
          .max(30),
      })
      .parse(await body(req));
    const { sections, ...rest } = v;
    await db.$transaction(async (tx) => {
      await tx.lesson.update({
        where: { id },
        data: { ...rest, reviewStatus: 'PENDING', status: 'DRAFT' },
      });
      await tx.lessonSection.deleteMany({ where: { lessonId: id } });
      await tx.lessonSection.createMany({
        data: sections.map(({ id: _, ...s }) => ({ ...s, lessonId: id })),
      });
      await tx.auditLog.create({ data: { userId, action: 'EDIT_LESSON', entityId: id } });
    });
    return json({ ok: true });
  }
  if (section === 'review' && id && method === 'POST') {
    const v = z
      .object({
        type: z.enum(['LESSON', 'QUESTION']),
        decision: z.enum(['APPROVE', 'REJECT', 'UNPUBLISH']),
        notes: z.string().min(5).max(2000),
        humanReviewed: z.boolean(),
      })
      .parse(await body(req));
    if (v.decision === 'APPROVE' && !v.humanReviewed)
      throw new ApiError(
        400,
        'Confirm a human scientific and translation review before publishing.',
        'أكد المراجعة البشرية العلمية واللغوية قبل النشر.',
      );
    if (v.type === 'LESSON') {
      const l = await db.lesson.findUnique({
        where: { id },
        include: {
          sections: true,
          references: true,
          images: true,
          _count: {
            select: { questions: { where: { status: 'PUBLISHED', reviewStatus: 'APPROVED' } } },
          },
        },
      });
      if (!l) throw new ApiError(404, 'Lesson not found.');
      if (
        v.decision === 'APPROVE' &&
        (l.sections.reduce((n, s) => n + s.contentEn.split(/\s+/u).length, 0) < 750 ||
          l.sections.reduce((n, s) => n + s.contentAr.split(/\s+/u).length, 0) < 550)
      )
        throw new ApiError(
          409,
          'A publishable lesson needs substantial teaching in both languages (at least 750 English and 550 Arabic words).',
          'يحتاج الدرس إلى شرح وافٍ باللغتين: 750 كلمة إنجليزية و550 عربية على الأقل.',
        );
      if (
        v.decision === 'APPROVE' &&
        (l._count.questions < 20 ||
          l.sections.length < 6 ||
          !l.references.length ||
          !l.images.length ||
          (l.objectives as any[]).length < 2)
      )
        throw new ApiError(
          409,
          'Publication requires 20 approved questions, six sections, two objectives, an attributed image, and a scientific reference.',
          'يتطلب النشر 20 سؤالًا معتمدًا وستة أقسام وهدفين وصورة موثقة ومرجعًا علميًا.',
        );
      await db.lesson.update({
        where: { id },
        data: {
          status: v.decision === 'APPROVE' ? 'PUBLISHED' : 'DRAFT',
          reviewStatus:
            v.decision === 'APPROVE'
              ? 'APPROVED'
              : v.decision === 'REJECT'
                ? 'REJECTED'
                : 'PENDING',
        },
      });
    } else {
      const item = await db.question.findUnique({ where: { id }, include: { options: true } });
      if (!item) throw new ApiError(404, 'Question not found.', 'السؤال غير موجود.');
      if (v.decision === 'APPROVE') questionDraftSchema.parse(item);
      await db.question.update({
        where: { id },
        data: {
          status: v.decision === 'APPROVE' ? 'PUBLISHED' : 'DRAFT',
          reviewStatus:
            v.decision === 'APPROVE'
              ? 'APPROVED'
              : v.decision === 'REJECT'
                ? 'REJECTED'
                : 'PENDING',
        },
      });
    }
    await db.contentReview.create({
      data: {
        entityId: id,
        entityType: v.type,
        reviewerId: userId,
        decision: v.decision,
        notes: v.notes,
      },
    });
    await db.auditLog.create({ data: { userId, action: `${v.decision}_${v.type}`, entityId: id } });
    return json({ ok: true });
  }
  if (section === 'references' && method === 'POST') {
    const input = z
      .object({
        title: z.string().min(3).max(250),
        publisher: z.string().min(2).max(150),
        url: z.url().refine((v) => v.startsWith('https://')),
        lessonId: idSchema.optional(),
      })
      .parse(await body(req));
    const { lessonId, ...rest } = input;
    const r = await db.scientificReference.upsert({
      where: { url: rest.url },
      update: {},
      create: { id: `ref-${randomBytes(8).toString('hex')}`, ...rest },
    });
    if (lessonId)
      await db.lessonReference.upsert({
        where: { lessonId_referenceId: { lessonId, referenceId: r.id } },
        update: {},
        create: { lessonId, referenceId: r.id },
      });
    return json(r);
  }
  if (section === 'references' && id && method === 'PATCH') {
    const input = z
      .object({
        title: z.string().min(3).max(250),
        publisher: z.string().min(2).max(150),
        url: z.url().refine((v) => v.startsWith('https://')),
        lessonIds: z.array(idSchema).max(200),
      })
      .parse(await body(req));
    const { lessonIds, ...rest } = input;
    const old = await db.lessonReference.findMany({ where: { referenceId: id } });
    await db.$transaction(async (tx) => {
      await tx.scientificReference.update({ where: { id }, data: rest });
      await tx.lessonReference.deleteMany({ where: { referenceId: id } });
      await tx.lessonReference.createMany({
        data: [...new Set(lessonIds)].map((lessonId) => ({ lessonId, referenceId: id })),
      });
      await tx.lesson.updateMany({
        where: { id: { in: [...new Set([...lessonIds, ...old.map((x) => x.lessonId)])] } },
        data: { status: 'DRAFT', reviewStatus: 'PENDING' },
      });
      await tx.auditLog.create({ data: { userId, action: 'EDIT_REFERENCE', entityId: id } });
    });
    return json({ ok: true });
  }
  if (section === 'images' && id && (method === 'PATCH' || method === 'DELETE')) {
    const previous = await db.lessonImage.findUnique({ where: { id } });
    if (!previous) throw new ApiError(404, 'Image not found.', 'الصورة غير موجودة.');
    const input =
      method === 'PATCH'
        ? z
            .object({
              lessonId: idSchema,
              titleEn: z.string().min(3).max(250),
              titleAr: z.string().min(3).max(250),
              captionEn: z.string().min(15).max(3000),
              captionAr: z.string().min(15).max(3000),
              altEn: z.string().min(5).max(700),
              altAr: z.string().min(5).max(700),
              credit: z.string().min(3).max(700),
              sourceUrl: z.url().refine((v) => v.startsWith('https://')),
              kind: z.enum(['OBSERVATION', 'ILLUSTRATION']),
            })
            .parse(await body(req))
        : null;
    await db.$transaction(async (tx) => {
      if (input) await tx.lessonImage.update({ where: { id }, data: input });
      else await tx.lessonImage.delete({ where: { id } });
      await tx.lesson.updateMany({
        where: { id: { in: [previous.lessonId, ...(input ? [input.lessonId] : [])] } },
        data: { status: 'DRAFT', reviewStatus: 'PENDING' },
      });
      await tx.auditLog.create({
        data: { userId, action: input ? 'EDIT_IMAGE' : 'UNLINK_IMAGE', entityId: id },
      });
    });
    return json({ ok: true });
  }
  if (section === 'structure' && method === 'POST') {
    await requireStaff(req, true);
    const input = z
      .object({
        type: z.enum(['STAGE', 'MODULE']),
        titleEn: z.string().min(3).max(150),
        titleAr: z.string().min(3).max(150),
        parentId: idSchema,
        order: z.number().int().min(1).max(200),
      })
      .parse(await body(req));
    const id = `custom-${randomBytes(8).toString('hex')}`;
    if (input.type === 'MODULE')
      return json(
        await db.module.create({
          data: {
            id,
            stageId: input.parentId,
            titleEn: input.titleEn,
            titleAr: input.titleAr,
            order: input.order,
          },
        }),
      );
    return json(
      await db.learningStage.create({
        data: {
          id,
          courseId: input.parentId,
          titleEn: input.titleEn,
          titleAr: input.titleAr,
          order: input.order,
          descriptionEn: 'Draft curriculum — not published.',
          descriptionAr: 'منهج مسودة غير منشور.',
          image: '/images/carina.webp',
          color: '#9c72ff',
        },
      }),
    );
  }
  if (section === 'structure' && id && method === 'PATCH') {
    await requireStaff(req, true);
    const v = z
      .object({
        type: z.enum(['STAGE', 'MODULE']),
        titleEn: z.string().min(3).max(150),
        titleAr: z.string().min(3).max(150),
        order: z.number().int().min(1).max(200),
        status: z.enum(['PLANNED', 'AVAILABLE']).optional(),
      })
      .parse(await body(req));
    const { type, ...rest } = v;
    if (rest.status === 'AVAILABLE') {
      if (type === 'MODULE') {
        const lessons = await db.lesson.findMany({
          where: { moduleId: id },
          include: {
            _count: {
              select: { questions: { where: { status: 'PUBLISHED', reviewStatus: 'APPROVED' } } },
            },
          },
        });
        if (
          !lessons.length ||
          lessons.some(
            (l) =>
              l.status !== 'PUBLISHED' || l.reviewStatus !== 'APPROVED' || l._count.questions < 20,
          ) ||
          lessons.reduce((n, l) => n + l._count.questions, 0) < 100
        )
          throw new ApiError(
            409,
            'Availability requires reviewed lessons, 20 approved items per lesson, and 100 per module.',
            'تتطلب الإتاحة دروسًا مراجعة و20 سؤالًا معتمدًا للدرس و100 للوحدة.',
          );
      } else {
        const modules = await db.module.findMany({ where: { stageId: id } });
        if (!modules.length || modules.some((m) => m.status !== 'AVAILABLE'))
          throw new ApiError(
            409,
            'Make every reviewed module available before opening a stage.',
            'أتِح كل الوحدات المراجعة قبل فتح المرحلة.',
          );
      }
    }
    const entity =
      type === 'STAGE'
        ? await db.learningStage.update({ where: { id }, data: rest })
        : await db.module.update({ where: { id }, data: rest });
    await db.auditLog.create({ data: { userId, action: 'EDIT_STRUCTURE', entityId: id } });
    return json(entity);
  }
  if (section === 'questions' && method === 'GET') {
    const sp = req.nextUrl.searchParams,
      page = Math.max(1, Math.min(100000, Number(sp.get('page')) || 1)),
      search = (sp.get('q') || '').slice(0, 150),
      review = sp.get('review'),
      lessonId = sp.get('lesson');
    const where: any = {
      ...(lessonId ? { lessonId } : {}),
      ...(['PENDING', 'APPROVED', 'REJECTED'].includes(review || '')
        ? { reviewStatus: review }
        : {}),
      ...(search
        ? {
            OR: [
              { promptEn: { contains: search } },
              { promptAr: { contains: search } },
              { id: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      db.question.findMany({
        where,
        include: {
          options: { orderBy: { order: 'asc' } },
          _count: { select: { studentAnswers: true, examQuestions: true } },
        },
        orderBy: { id: 'asc' },
        skip: (page - 1) * 20,
        take: 20,
      }),
      db.question.count({ where }),
    ]);
    return json({ items, total, page, pages: Math.ceil(total / 20) });
  }
  if (section === 'questions' && (method === 'POST' || method === 'PATCH')) {
    const input = questionDraftSchema.parse(await body(req));
    const lesson = await db.lesson.findUnique({ where: { id: input.lessonId } });
    if (!lesson) throw new ApiError(404, 'Lesson not found.', 'الدرس غير موجود.');
    if (method === 'PATCH') {
      if (!id) throw new ApiError(400, 'A question ID is required.', 'يلزم معرّف السؤال.');
      const existing = await db.question.findUnique({
        where: { id },
        include: { _count: { select: { studentAnswers: true, examQuestions: true } } },
      });
      if (!existing) throw new ApiError(404, 'Question not found.', 'السؤال غير موجود.');
      if (existing._count.studentAnswers || existing._count.examQuestions)
        throw new ApiError(
          409,
          'This item has assessment history and is immutable. Duplicate it as a new draft, then unpublish the original if needed.',
          'للسؤال سجل تقييم فلا يمكن تغييره. انسخه إلى مسودة جديدة ثم ألغ نشر الأصل عند الحاجة.',
        );
      if (existing.lessonId !== input.lessonId)
        throw new ApiError(
          400,
          'Keep the original lesson when editing; duplicate to move an item.',
          'احتفظ بالدرس الأصلي عند التحرير؛ انسخ السؤال لنقله.',
        );
    }
    const qid = method === 'PATCH' ? id : `authored-${randomBytes(10).toString('hex')}`;
    const map = new Map(input.options.map((o) => [o.id, `o-${randomBytes(12).toString('hex')}`]));
    const answer: any = { ...input.answer };
    if (answer.kind === 'choice') answer.correct = map.get(answer.correct);
    if (['set', 'order'].includes(answer.kind))
      answer.correct = answer.correct.map((x: string) => map.get(x));
    if (answer.kind === 'match')
      answer.correct = Object.fromEntries(
        Object.entries(answer.correct).map(([k, v]) => [k, map.get(String(v))]),
      );
    const { options, ...rest } = input;
    const item = await db.$transaction(async (tx) => {
      if (method === 'PATCH') await tx.questionOption.deleteMany({ where: { questionId: qid } });
      const data = {
        ...rest,
        concept: input.concept || qid,
        moduleId: lesson.moduleId,
        answer,
        status: 'DRAFT',
        reviewStatus: 'PENDING',
        generated: false,
        options: { create: options.map((o, order) => ({ ...o, id: map.get(o.id)!, order })) },
      };
      const saved =
        method === 'PATCH'
          ? await tx.question.update({ where: { id: qid }, data })
          : await tx.question.create({ data: { id: qid, ...data } });
      if (method === 'PATCH')
        await tx.lesson.update({
          where: { id: lesson.id },
          data: { status: 'DRAFT', reviewStatus: 'PENDING' },
        });
      await tx.auditLog.create({
        data: {
          userId,
          action: method === 'PATCH' ? 'EDIT_QUESTION' : 'CREATE_QUESTION',
          entityId: qid,
        },
      });
      return saved;
    });
    return json(item);
  }
  if (section === 'image' && method === 'POST') {
    const bounded = await limitedBytes(req, 6 * 1024 * 1024);
    const data = await new Response(bounded as unknown as BodyInit, {
      headers: { 'Content-Type': req.headers.get('content-type') || '' },
    }).formData();
    const file = data.get('file');
    const lessonId = String(data.get('lessonId') || '');
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
      throw new ApiError(
        400,
        'Upload a JPEG, PNG, or WebP image smaller than 5 MB.',
        'ارفع صورة JPEG أو PNG أو WebP أقل من 5 ميغابايت.',
      );
    const meta = z
      .object({
        titleEn: z.string().min(3),
        titleAr: z.string().min(3),
        captionEn: z.string().min(15),
        captionAr: z.string().min(15).max(3000),
        altEn: z.string().min(5).max(700),
        altAr: z.string().min(5).max(700),
        credit: z.string().min(3),
        sourceUrl: z.url().refine((v) => v.startsWith('https://')),
        kind: z.enum(['OBSERVATION', 'ILLUSTRATION']),
      })
      .parse(
        Object.fromEntries(
          [
            'titleEn',
            'titleAr',
            'captionEn',
            'captionAr',
            'altEn',
            'altAr',
            'credit',
            'sourceUrl',
            'kind',
          ].map((k) => [k, String(data.get(k) || '')]),
        ),
      );
    if (!(await db.lesson.findUnique({ where: { id: lessonId } })))
      throw new ApiError(404, 'Lesson not found.', 'الدرس غير موجود.');
    const sharp = (await import('sharp')).default;
    const bytes = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 20_000_000,
    })
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();
    const fs = await import('node:fs/promises');
    await fs.mkdir(`${process.cwd()}/storage/uploads`, { recursive: true });
    const name = `${randomBytes(16).toString('hex')}.webp`;
    await fs.writeFile(`${process.cwd()}/storage/uploads/${name}`, bytes);
    const image = await db.$transaction(async (tx) => {
      const im = await tx.lessonImage.create({
        data: { lessonId, url: `/api/media/${name}`, ...meta },
      });
      await tx.lesson.update({
        where: { id: lessonId },
        data: { status: 'DRAFT', reviewStatus: 'PENDING' },
      });
      await tx.auditLog.create({ data: { userId, action: 'UPLOAD_IMAGE', entityId: im.id } });
      return im;
    });
    return json(image);
  }
  throw new ApiError(404, 'Administrative resource not found.', 'المورد الإداري غير موجود.');
}
