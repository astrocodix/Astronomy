import { lessons, type LessonSeed } from './lessons';
import { moreLessons } from './lessons-more';
import { workshops } from './workshops';
import { moreWorkshops } from './workshops-more';

/** One content entry point for seeding, authoring exports, and validation. */
export const allLessons: LessonSeed[] = [...lessons, ...moreLessons].map((lesson) => {
  const extra = { ...workshops, ...moreWorkshops }[`l-${lesson.module}-${lesson.order}`] || [];
  return {
    ...lesson,
    sections: lesson.sections.flatMap((section) =>
      section.type === 'SUMMARY' ? [...extra, section] : [section],
    ),
  };
});
export const lessonId = (lesson: Pick<LessonSeed, 'module' | 'order'>) =>
  `l-${lesson.module}-${lesson.order}`;
export const learningMinutes = (lesson: LessonSeed) => {
  const words = lesson.sections.reduce((n, s) => n + s.content.en.trim().split(/\s+/u).length, 0);
  // Reading plus the original guided investigations and comprehension checks.
  return Math.ceil(words / 160) + 12;
};
