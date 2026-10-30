import { allLessons, lessonId } from '../../src/content';
import { Home } from '../components/home';

export default function Page() {
  return (
    <Home lessons={allLessons.map((lesson) => ({ id: lessonId(lesson), title: lesson.title }))} />
  );
}
