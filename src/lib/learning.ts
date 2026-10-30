import { db } from './db';
import { ApiError } from './auth';
import { calculateMastery } from './assessment';
export async function settings() {
  const rows = await db.appSetting.findMany();
  return Object.fromEntries(rows.map((x) => [x.key, x.value])) as {
    passingScore: number;
    enforcePrerequisites: boolean;
    aiDailyLimit: number;
    aiModel: string;
  };
}
export const publishedWhere = {
  status: 'PUBLISHED',
  ...(process.env.CONTENT_PREVIEW === 'true' ? {} : { reviewStatus: 'APPROVED' }),
};
export const publishedQuestionWhere = {
  status: 'PUBLISHED',
  ...(process.env.CONTENT_PREVIEW === 'true' ? {} : { reviewStatus: 'APPROVED' }),
  lesson: { is: publishedWhere },
};
export async function catalog() {
  return db.learningStage.findMany({
    orderBy: { order: 'asc' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: publishedWhere,
            orderBy: { order: 'asc' },
            select: {
              id: true,
              titleEn: true,
              titleAr: true,
              summaryEn: true,
              summaryAr: true,
              duration: true,
              difficulty: true,
              order: true,
              reviewStatus: true,
              _count: { select: { questions: { where: publishedQuestionWhere } } },
            },
          },
          _count: { select: { questions: { where: publishedQuestionWhere } } },
        },
      },
    },
  });
}
export async function checkModuleAccess(userId: string, moduleId: string) {
  const mod = await db.module.findUnique({ where: { id: moduleId }, include: { stage: true } });
  if (!mod || mod.status !== 'AVAILABLE' || mod.stage.status !== 'AVAILABLE')
    throw new ApiError(
      404,
      'This curriculum is in development, not yet published.',
      'هذا المنهج قيد التطوير ولم يُنشر بعد.',
    );
  const config = await settings();
  if (!config.enforcePrerequisites) return mod;
  if (mod.order > 1) {
    const previous = await db.module.findFirst({
      where: { stageId: mod.stageId, order: { lt: mod.order } },
      orderBy: { order: 'desc' },
    });
    const passed =
      previous &&
      (await db.moduleProgress.findUnique({
        where: { userId_moduleId: { userId, moduleId: previous.id } },
      }));
    if (previous && !passed?.passed)
      throw new ApiError(
        403,
        'Pass the previous module examination to unlock this module.',
        'اجتز اختبار الوحدة السابقة لفتح هذه الوحدة.',
      );
  }
  if (mod.stage.order > 1) {
    const previousStage = await db.learningStage.findFirst({
      where: { courseId: mod.stage.courseId, order: { lt: mod.stage.order } },
      orderBy: { order: 'desc' },
    });
    const prev =
      previousStage &&
      (await db.stageProgress.findUnique({
        where: { userId_stageId: { userId, stageId: previousStage.id } },
      }));
    if (previousStage && !prev?.passed)
      throw new ApiError(403, 'Complete the previous stage first.', 'أكمل المرحلة السابقة أولًا.');
  }
  return mod;
}
export async function checkLessonAccess(userId: string, lessonId: string) {
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, ...publishedWhere } });
  if (!lesson)
    throw new ApiError(404, 'This lesson has not been published.', 'لم يُنشر هذا الدرس.');
  await checkModuleAccess(userId, lesson.moduleId);
  const conf = await settings();
  if (conf.enforcePrerequisites && lesson.order > 1) {
    const previous = await db.lesson.findFirst({
      where: { moduleId: lesson.moduleId, order: { lt: lesson.order }, ...publishedWhere },
      orderBy: { order: 'desc' },
    });
    const done =
      previous &&
      (await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: previous.id } },
      }));
    if (previous && !done?.completed)
      throw new ApiError(
        403,
        'Pass the previous lesson’s quiz to continue.',
        'اجتز اختبار الدرس السابق للمتابعة.',
      );
  }
  return lesson;
}
export async function refreshMastery(userId: string, moduleIds: string[]) {
  for (const moduleId of [...new Set(moduleIds)]) {
    const answers = await db.studentAnswer.findMany({
      where: { userId, question: { moduleId, type: { not: 'REASONING' } } },
      include: { question: { select: { concept: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const result = calculateMastery(
      answers.map((a) => ({
        concept: a.question.concept,
        correct: a.correct,
        createdAt: a.createdAt,
      })),
    );
    await db.topicMastery.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: result,
      create: { userId, moduleId, ...result },
    });
  }
}
export async function award(userId: string, achievementId: string) {
  const a = await db.achievement.findUnique({ where: { id: achievementId } });
  if (!a) return;
  const existing = await db.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId } },
  });
  if (existing) return;
  await db.userAchievement.upsert({
    where: { userId_achievementId: { userId, achievementId } },
    update: {},
    create: { userId, achievementId },
  });
  await db.notification.create({
    data: {
      userId,
      titleEn: `Achievement unlocked: ${a.titleEn}`,
      titleAr: `إنجاز جديد: ${a.titleAr}`,
      bodyEn: a.descriptionEn,
      bodyAr: a.descriptionAr,
      href: '/achievements',
    },
  });
}
export async function analytics(userId: string) {
  const [
    lessons,
    exams,
    mastery,
    stages,
    modules,
    earned,
    sessions,
    certificates,
    answers,
    plan,
    bookmarks,
    notifications,
    activeExams,
    examStats,
    examDates,
  ] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId } }),
    db.examAttempt.findMany({
      where: { userId, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        title: true,
        titleAr: true,
        kind: true,
        scopeId: true,
        score: true,
        passingScore: true,
        duration: true,
        submittedAt: true,
      },
      take: 100,
    }),
    db.topicMastery.findMany({
      where: { userId },
      include: { module: { select: { titleEn: true, titleAr: true } } },
    }),
    db.stageProgress.findMany({ where: { userId } }),
    db.moduleProgress.findMany({ where: { userId } }),
    db.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
    db.studySession.findMany({ where: { userId }, select: { seconds: true, createdAt: true } }),
    db.certificate.findMany({
      where: { userId },
      include: { stage: { select: { titleEn: true, titleAr: true } } },
    }),
    db.studentAnswer.findMany({
      where: { userId },
      select: { questionId: true, correct: true, createdAt: true },
    }),
    db.studyPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    db.bookmark.findMany({
      where: { userId },
      include: {
        lesson: { select: { id: true, titleEn: true, titleAr: true } },
        article: { select: { id: true, titleEn: true, titleAr: true, image: true } },
      },
    }),
    db.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.examAttempt.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
      select: { id: true, title: true, titleAr: true, kind: true, expiresAt: true },
      take: 15,
    }),
    db.examAttempt.aggregate({
      where: { userId, status: 'SUBMITTED' },
      _count: { _all: true },
      _avg: { score: true },
    }),
    db.examAttempt.findMany({
      where: { userId, status: 'SUBMITTED' },
      select: { submittedAt: true },
    }),
  ]);
  const profile = await db.userProfile.findUnique({ where: { userId } });
  const timezone = profile?.timezone || 'Asia/Riyadh';
  const day = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  const active = new Set([
    ...sessions.map((s) => day(s.createdAt)),
    ...examDates.filter((e) => e.submittedAt).map((e) => day(e.submittedAt!)),
  ]);
  let streak = 0;
  const today = new Date();
  let cursor = new Date(today);
  if (!active.has(day(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (active.has(day(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (streak > 3660) break;
  }
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 6 + i);
    const key = day(date);
    return {
      date: key,
      minutes: Math.round(
        sessions.filter((s) => day(s.createdAt) === key).reduce((t, s) => t + s.seconds, 0) / 60,
      ),
    };
  });
  const completed = lessons.filter((l) => l.completed).length;
  const totalSeconds = sessions.reduce((t, s) => t + s.seconds, 0);
  const distinctCorrect = new Set(answers.filter((a) => a.correct).map((a) => a.questionId)).size;
  const xp =
    completed * 50 + distinctCorrect * 5 + earned.reduce((t, e) => t + e.achievement.xp, 0);
  const assessed = mastery.filter((m) => m.checks > 0);
  const overallMastery = assessed.length
    ? Math.round(
        assessed.reduce((t, m) => t + m.score * m.checks, 0) /
          assessed.reduce((t, m) => t + m.checks, 0),
      )
    : null;
  return {
    lessons,
    exams,
    activeExams,
    mastery,
    stages,
    modules,
    earned,
    certificates,
    bookmarks,
    notifications,
    plan,
    weekly,
    stats: {
      completedLessons: completed,
      completedStages: stages.filter((s) => s.passed).length,
      totalSeconds,
      examAverage: examStats._avg.score === null ? null : Math.round(examStats._avg.score),
      examsTaken: examStats._count._all,
      questionsAttempted: answers.length,
      streak,
      xp,
      level: Math.floor(xp / 500) + 1,
      overallMastery,
    },
  };
}
