// Test helper. This runs in a fresh process so CONTENT_PREVIEW is evaluated independently.
import { NextRequest } from 'next/server';
import { handle } from '../src/lib/api';
import { db } from '../src/lib/db';
async function main() {
  if (
    process.env.CONTENT_PREVIEW !== 'false' ||
    !process.env.DATABASE_URL?.includes('integration-')
  )
    throw new Error('Use only with the isolated integration database.');
  const bootstrap = await handle(
    new NextRequest('http://academy.test/api/bootstrap', { headers: { host: 'academy.test' } }),
  );
  const data = await bootstrap.json();
  const cookie = bootstrap.headers.get('set-cookie')!.split(';')[0];
  const library = await handle(
    new NextRequest('http://academy.test/api/library', {
      headers: { host: 'academy.test', cookie },
    }),
  );
  const articles = await library.json();
  console.log(
    JSON.stringify({
      lessons: data.counts.lessons,
      questions: data.counts.questions,
      articles: articles.length,
    }),
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
