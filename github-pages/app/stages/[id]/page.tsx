import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allLessons, learningMinutes, lessonId } from '../../../../src/content';
import { curriculum } from '../../../../src/content/curriculum';
import { StageView } from '../../../components/stage';

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return curriculum.map((_, index) => ({ id: `s-${index + 1}` }));
}
function stageIndex(id: string) {
  const index = curriculum.findIndex((_, i) => id === `s-${i + 1}`);
  if (index < 0) notFound();
  return index;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const index = stageIndex((await params).id);
  return { title: curriculum[index].title.en, description: curriculum[index].description.en };
}
export default async function Page({ params }: Props) {
  const index = stageIndex((await params).id);
  const lessons =
    index === 0
      ? allLessons.map((lesson) => ({
          id: lessonId(lesson),
          module: lesson.module,
          order: lesson.order,
          title: lesson.title,
          summary: lesson.summary,
          duration: learningMinutes(lesson),
        }))
      : [];
  return <StageView stage={curriculum[index]} index={index} lessons={lessons} />;
}
