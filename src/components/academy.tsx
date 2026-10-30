'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AppProvider, useApp } from './context';
import { Shell } from './shell';
import { Dashboard } from './dashboard';
import { Roadmap, Courses, StagePage } from './curriculum-pages';
import { LessonViewer } from './lesson';
import { ExamsCenter, ExamAttemptPage, QuestionBank } from './assessments';
import { TutorPage } from './tutor-page';
import { ScientificLibrary } from './library';
import { SettingsPage, AuthPage } from './account';
import { Landing } from './landing';
import { Loading, EmptyState, Button } from './ui';
const Observatory = dynamic(() => import('./observatory').then((m) => m.Observatory), {
  loading: () => <Loading />,
});
const ProgressPage = dynamic(() => import('./progress-pages').then((m) => m.ProgressPage), {
  loading: () => <Loading />,
});
const Achievements = dynamic(() => import('./progress-pages').then((m) => m.Achievements), {
  loading: () => <Loading />,
});
const Certificates = dynamic(() => import('./progress-pages').then((m) => m.Certificates), {
  loading: () => <Loading />,
});
const AdminStudio = dynamic(() => import('./admin').then((m) => m.AdminStudio), {
  loading: () => <Loading />,
});
function Pages() {
  const { data, t, error, refresh } = useApp();
  const path = usePathname();
  const pieces = path.split('/').filter(Boolean);
  if (!data) {
    return error ? (
      <div className="initial-error">
        <EmptyState
          title={t('Let’s reconnect to your universe.', 'لنعد الاتصال بكونك.')}
          description={error}
          action={<Button onClick={refresh}>{t('Try again', 'حاول مجددًا')}</Button>}
        />
      </div>
    ) : (
      <Loading />
    );
  }
  if (['welcome', 'landing'].includes(pieces[0])) return <Landing />;
  if (['register', 'login', 'forgot-password', 'reset-password'].includes(pieces[0]))
    return (
      <AuthPage
        key={pieces[0]}
        type={
          pieces[0] === 'register'
            ? 'register'
            : pieces[0] === 'login'
              ? 'login'
              : pieces[0] === 'forgot-password'
                ? 'forgot'
                : 'reset'
        }
      />
    );
  let page: React.ReactNode;
  if (!pieces.length || pieces[0] === 'dashboard') page = <Dashboard />;
  else if (pieces[0] === 'roadmap' || (pieces[0] === 'stages' && !pieces[1])) page = <Roadmap />;
  else if (pieces[0] === 'courses') page = <Courses />;
  else if (pieces[0] === 'stages' && pieces[1]) page = <StagePage key={pieces[1]} id={pieces[1]} />;
  else if (pieces[0] === 'modules' && pieces[1]) {
    const s = data.stages.find((s) => s.modules.some((m) => m.id === pieces[1]));
    page = <StagePage id={s?.id || 's-1'} initialModule={pieces[1]} />;
  } else if (['lesson', 'lessons'].includes(pieces[0]) && pieces[1])
    page = <LessonViewer key={pieces[1]} id={pieces[1]} />;
  else if (pieces[0] === 'exams') page = <ExamsCenter key={path} />;
  else if (pieces[0] === 'exam' && pieces[1])
    page = <ExamAttemptPage key={pieces[1]} id={pieces[1]} />;
  else if (pieces[0] === 'questions') page = <QuestionBank />;
  else if (pieces[0] === 'tutor') page = <TutorPage />;
  else if (pieces[0] === 'observatory') page = <Observatory />;
  else if (pieces[0] === 'library') page = <ScientificLibrary />;
  else if (pieces[0] === 'progress') page = <ProgressPage />;
  else if (pieces[0] === 'achievements') page = <Achievements />;
  else if (pieces[0] === 'certificates') page = <Certificates />;
  else if (pieces[0] === 'settings' || pieces[0] === 'profile')
    page = <SettingsPage key={pieces[0]} profileOnly={pieces[0] === 'profile'} />;
  else if (pieces[0] === 'admin') page = <AdminStudio />;
  else
    page = (
      <EmptyState
        title={t('This corner of the cosmos is uncharted.', 'هذه الزاوية من الكون لم تُرسم بعد.')}
        description={t('Head back to your learning workspace.', 'عُد إلى مساحة تعلمك.')}
        action={<Button href="/">{t('Back to my universe', 'العودة إلى كوني')}</Button>}
      />
    );
  return <Shell>{page}</Shell>;
}
export default function Academy() {
  return (
    <AppProvider>
      <Pages />
    </AppProvider>
  );
}
