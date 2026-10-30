import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allLessons, learningMinutes, lessonId } from '../../../../src/content';
import { concepts } from '../../../../src/content/concepts';
import { curriculum } from '../../../../src/content/curriculum';
import { moduleRefs, refs } from '../../../../src/content/references';
import { LessonReader } from '../../../components/lesson';

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return allLessons.map((lesson) => ({ id: lessonId(lesson) }));
}
function findLesson(id: string) {
  const index = allLessons.findIndex((lesson) => lessonId(lesson) === id);
  if (index < 0) notFound();
  return index;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = allLessons[findLesson((await params).id)];
  return { title: lesson.title.en, description: lesson.summary.en };
}
export default async function Page({ params }: Props) {
  const id = (await params).id;
  const index = findLesson(id),
    lesson = allLessons[index];
  const neighbor = (position: number) =>
    allLessons[position]
      ? { id: lessonId(allLessons[position]), title: allLessons[position].title }
      : null;
  return (
    <LessonReader
      id={id}
      lesson={lesson}
      duration={learningMinutes(lesson)}
      moduleTitle={curriculum[0].modules[lesson.module - 1]}
      terms={concepts[lesson.module].slice(
        lesson.order === 1 ? 0 : 12,
        lesson.order === 1 ? 12 : 25,
      )}
      references={refs.filter((reference) => moduleRefs[lesson.module].includes(reference.id))}
      previous={neighbor(index - 1)}
      next={neighbor(index + 1)}
    />
  );
}
