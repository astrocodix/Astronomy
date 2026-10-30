import { db } from './db';
import { ApiError } from './auth';
import {
  settings,
  checkLessonAccess,
  checkModuleAccess,
  refreshMastery,
  award,
  publishedWhere,
  publishedQuestionWhere,
} from './learning';
import { shuffle, selectQuestions, grade, publicQuestion } from './assessment';
import { z } from 'zod';

const examShape = {
  questions: {
    orderBy: { order: 'asc' as const },
    include: { question: { include: { options: true } } },
  },
  answers: true,
};
export const responseValue = z.union([
  z.string().max(4000),
  z.number().finite(),
  z.null(),
  z.array(z.string().max(160)).max(40),
  z.record(z.string().max(160), z.string().max(160)).refine((v) => Object.keys(v).length <= 40),
]);
export const responsesSchema = z
  .record(z.string().max(160), responseValue)
  .refine((v) => Object.keys(v).length <= 150);

export async function startExam(userId: string, input: { kind: string; scopeId: string }) {
  const conf = await settings();
  let count = 10,
    minutes = 15,
    title = '',
    titleAr = '';
  const where: any = { ...publishedQuestionWhere, type: { not: 'REASONING' } };
  const { kind, scopeId } = input;
  let templateScope: any;
  if (['QUICK', 'STANDARD', 'ADVANCED'].includes(kind)) {
    const l = await checkLessonAccess(userId, scopeId);
    title = l.titleEn;
    titleAr = l.titleAr;
    where.lessonId = l.id;
    count = kind === 'QUICK' ? 10 : kind === 'STANDARD' ? 20 : 30;
    minutes = count * 1.5;
    templateScope = { lessonId: l.id };
  } else if (kind === 'MODULE') {
    const m = await checkModuleAccess(userId, scopeId);
    const lessons = await db.lesson.findMany({
      where: { moduleId: m.id, ...publishedWhere },
      select: { id: true },
    });
    if (!lessons.length)
      throw new ApiError(
        409,
        'This module has no published lessons yet.',
        'لا دروس منشورة في هذه الوحدة بعد.',
      );
    const completed = await db.lessonProgress.count({
      where: { userId, completed: true, lessonId: { in: lessons.map((l) => l.id) } },
    });
    if (conf.enforcePrerequisites && completed < lessons.length)
      throw new ApiError(
        403,
        'Pass every published lesson assessment before the module examination.',
        'اجتز تقييم كل درس منشور قبل اختبار الوحدة.',
      );
    title = m.titleEn;
    titleAr = m.titleAr;
    count = 50;
    minutes = 60;
    where.moduleId = m.id;
    templateScope = { moduleId: m.id };
  } else if (kind === 'STAGE') {
    const stage = await db.learningStage.findUnique({
      where: { id: scopeId },
      include: { modules: true },
    });
    if (
      !stage ||
      stage.status !== 'AVAILABLE' ||
      !stage.modules.length ||
      stage.modules.some((m) => m.status !== 'AVAILABLE')
    )
      throw new ApiError(
        404,
        'This stage final is not yet available.',
        'الاختبار النهائي لهذه المرحلة غير متاح بعد.',
      );
    const n = await db.moduleProgress.count({
      where: { userId, passed: true, moduleId: { in: stage.modules.map((m) => m.id) } },
    });
    if (conf.enforcePrerequisites && n < stage.modules.length)
      throw new ApiError(
        403,
        'Pass all module examinations before the stage final.',
        'اجتز كل اختبارات الوحدات قبل الاختبار النهائي.',
      );
    title = stage.titleEn;
    titleAr = stage.titleAr;
    count = 100;
    minutes = 120;
    where.moduleId = { in: stage.modules.map((m) => m.id) };
    templateScope = { stageId: scopeId };
  } else if (kind === 'REVISION') {
    const m = await checkModuleAccess(userId, scopeId);
    where.moduleId = scopeId;
    count = 20;
    minutes = 30;
    title = `Targeted revision · ${m.titleEn}`;
    titleAr = `مراجعة موجهة · ${m.titleAr}`;
  } else throw new ApiError(400, 'Unknown exam type.', 'نوع اختبار غير معروف.');

  // A single active assessment prevents answer harvesting via overlapping short quizzes.
  const active = await db.examAttempt.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    orderBy: { startedAt: 'desc' },
  });
  if (active && active.expiresAt > new Date()) {
    if (active.kind === kind && active.scopeId === scopeId) return getExam(userId, active.id);
    throw new ApiError(
      409,
      'You already have an active assessment. Resume it from the exam center before starting another.',
      'لديك تقييم جارٍ. تابعه من مركز الاختبارات قبل بدء تقييم آخر.',
    );
  }
  if (active) await submitExam(userId, active.id, active.draftAnswers as Record<string, unknown>);
  // Expired attempts are never discarded: opening one grades its last saved draft.
  const pool = await db.question.findMany({ where, include: { options: true } });
  if (pool.length < count)
    throw new ApiError(
      409,
      'This assessment does not yet have enough available questions. Production content must pass human review.',
      'لا يتوفر عدد كافٍ من الأسئلة لهذا التقييم بعد. يتطلب النشر الفعلي مراجعة بشرية.',
    );
  const recent = await db.studentAnswer.findMany({
    where: { userId },
    select: { questionId: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const selected = selectQuestions(pool, count, new Set(recent.map((r) => r.questionId)));
  const template = templateScope
    ? await db.examTemplate.findFirst({ where: { kind, ...templateScope }, select: { id: true } })
    : null;
  let attempt;
  try {
    attempt = await db.examAttempt.create({
      data: {
        userId,
        title,
        titleAr,
        kind,
        scopeId,
        templateId: template?.id,
        passingScore: conf.passingScore,
        expiresAt: new Date(Date.now() + minutes * 60000),
        questions: {
          create: selected.map((q, i) => ({
            questionId: q.id,
            order: i,
            optionOrder: shuffle(q.options.map((o) => o.id)),
          })),
        },
      },
    });
  } catch (error) {
    if ((error as any)?.code !== 'P2002') throw error;
    const winner = await db.examAttempt.findFirst({ where: { userId, status: 'IN_PROGRESS' } });
    if (winner && winner.kind === kind && winner.scopeId === scopeId)
      return getExam(userId, winner.id);
    throw new ApiError(
      409,
      'An assessment was started in another tab. Resume it from the exam center.',
      'بدأ تقييم في تبويب آخر. تابعه من مركز الاختبارات.',
    );
  }
  return getExam(userId, attempt.id);
}

export async function getExam(userId: string, id: string): Promise<any> {
  const e = await db.examAttempt.findFirst({ where: { id, userId }, include: examShape });
  if (!e) throw new ApiError(404, 'Examination not found.', 'لم يُعثر على الاختبار.');
  if (e.status === 'IN_PROGRESS' && e.expiresAt.getTime() + 3000 < Date.now())
    return submitExam(userId, id, {});
  const review = e.status === 'SUBMITTED';
  return {
    id: e.id,
    title: e.title,
    titleAr: e.titleAr,
    kind: e.kind,
    scopeId: e.scopeId,
    status: e.status,
    startedAt: e.startedAt,
    expiresAt: e.expiresAt,
    serverNow: new Date(),
    score: e.score,
    passingScore: e.passingScore,
    duration: e.duration,
    draftRevision: e.draftRevision,
    draftAnswers: review ? {} : e.draftAnswers,
    questions: e.questions.map((eq) =>
      publicQuestion(eq.question, eq.optionOrder as string[], review),
    ),
    answers: review
      ? e.answers.map((a) => ({
          questionId: a.questionId,
          response: a.response,
          correct: a.correct,
          score: a.score,
        }))
      : [],
  };
}

export async function saveExam(
  userId: string,
  id: string,
  responses: Record<string, unknown>,
  revision?: number,
) {
  const e = await db.examAttempt.findFirst({
    where: { id, userId },
    include: { questions: { select: { questionId: true } } },
  });
  if (!e) throw new ApiError(404, 'Exam not found.', 'لم يُعثر على الاختبار.');
  if (e.status !== 'IN_PROGRESS')
    throw new ApiError(409, 'This exam is already complete.', 'اكتمل هذا الاختبار بالفعل.');
  if (e.expiresAt < new Date())
    throw new ApiError(
      409,
      'The examination time has elapsed. Submit to review your saved answers.',
      'انتهى الوقت. سلّم لمراجعة الإجابات المحفوظة.',
    );
  const allowed = new Set(e.questions.map((x) => x.questionId));
  const clean = Object.fromEntries(
    Object.entries(responsesSchema.parse(responses)).filter(([key]) => allowed.has(key)),
  );
  const updated = await db.examAttempt.updateMany({
    where: {
      id,
      userId,
      status: 'IN_PROGRESS',
      draftRevision: revision ?? e.draftRevision,
      expiresAt: { gt: new Date() },
    },
    data: { draftAnswers: clean as any, draftRevision: { increment: 1 } },
  });
  if (!updated.count)
    throw new ApiError(
      409,
      'The draft changed in another tab or the exam ended. Reload to recover the latest saved version.',
      'تغيرت المسودة في تبويب آخر أو انتهى الاختبار. أعد التحميل لاستعادة أحدث نسخة محفوظة.',
    );
  return { saved: true, revision: (revision ?? e.draftRevision) + 1 };
}

export async function submitExam(
  userId: string,
  id: string,
  responses: Record<string, unknown>,
): Promise<any> {
  const e = await db.examAttempt.findFirst({ where: { id, userId }, include: examShape });
  if (!e) throw new ApiError(404, 'Exam not found.', 'لم يُعثر على الاختبار.');
  if (e.status === 'SUBMITTED') return getExam(userId, id);
  if (e.status !== 'IN_PROGRESS')
    throw new ApiError(409, 'This attempt is no longer active.', 'هذه المحاولة لم تعد جارية.');
  // A documented 3-second transport grace; after that, only a pre-deadline DB draft is gradeable.
  const expired = Date.now() > e.expiresAt.getTime() + 3000;
  const finalResponses = expired
    ? (e.draftAnswers as Record<string, unknown>)
    : responsesSchema.parse(responses);
  const evaluated = e.questions.map((eq) => {
    const response = finalResponses[eq.questionId] ?? null;
    return { questionId: eq.questionId, response, ...grade(eq.question.answer, response) };
  });
  const score = Math.round((100 * evaluated.filter((x) => x.correct).length) / evaluated.length);
  const duration = Math.max(
    0,
    Math.min(
      Math.floor((Date.now() - e.startedAt.getTime()) / 1000),
      Math.round((e.expiresAt.getTime() - e.startedAt.getTime()) / 1000),
    ),
  );
  const passed = score >= e.passingScore;
  const acquired = await db.$transaction(
    async (tx) => {
      const claimed = await tx.examAttempt.updateMany({
        where: { id, userId, status: 'IN_PROGRESS' },
        data: { status: 'SUBMITTED', score, duration, submittedAt: new Date(), draftAnswers: {} },
      });
      if (!claimed.count) return false;
      for (const a of evaluated)
        await tx.studentAnswer.create({
          data: {
            userId,
            examId: id,
            questionId: a.questionId,
            response: a.response as any,
            correct: a.correct,
            score: a.score,
          },
        });
      if (passed && ['QUICK', 'STANDARD', 'ADVANCED'].includes(e.kind))
        await tx.lessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId: e.scopeId } },
          update: { completed: true, completedAt: new Date() },
          create: { userId, lessonId: e.scopeId, completed: true, completedAt: new Date() },
        });
      if (passed && e.kind === 'MODULE')
        await tx.moduleProgress.upsert({
          where: { userId_moduleId: { userId, moduleId: e.scopeId } },
          update: { passed: true, passedAt: new Date() },
          create: { userId, moduleId: e.scopeId, passed: true, passedAt: new Date() },
        });
      if (passed && e.kind === 'STAGE') {
        await tx.stageProgress.upsert({
          where: { userId_stageId: { userId, stageId: e.scopeId } },
          update: { passed: true, passedAt: new Date() },
          create: { userId, stageId: e.scopeId, passed: true, passedAt: new Date() },
        });
        await tx.certificate.upsert({
          where: { userId_stageId: { userId, stageId: e.scopeId } },
          update: {},
          create: { userId, stageId: e.scopeId, score },
        });
      }
      return true;
    },
    { timeout: 20000 },
  );
  if (acquired) {
    await refreshMastery(
      userId,
      e.questions.map((q) => q.question.moduleId),
    );
    if (passed && ['QUICK', 'STANDARD', 'ADVANCED'].includes(e.kind))
      await award(userId, 'first-lesson');
    if (score === 100) await award(userId, 'perfect');
    if (passed && e.kind === 'STAGE') await award(userId, `stage-${e.scopeId.split('-')[1]}`);
  }
  return getExam(userId, id);
}
