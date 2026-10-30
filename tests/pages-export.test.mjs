import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

const root = join(process.cwd(), 'github-pages', 'out');
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const read = (path) => readFile(join(root, path), 'utf8');

test('exports the public routes, all stages, and all pilot lessons', async () => {
  for (const route of ['', 'roadmap', 'observatory', 'library', 'about']) {
    await access(join(root, route, 'index.html'));
  }
  for (let stage = 1; stage <= 12; stage++) {
    await access(join(root, `stages/s-${stage}/index.html`));
  }
  for (let module = 1; module <= 8; module++) {
    for (let lesson = 1; lesson <= 2; lesson++) {
      await access(join(root, `lesson/l-${module}-${lesson}/index.html`));
    }
  }
  await access(join(root, '404.html'));
  await access(join(root, '.nojekyll'));
});

test('uses the configured Pages base path for navigation, images, fonts, and Next assets', async () => {
  const html = await read('index.html');
  assert.ok(html.includes(`href="${base}/lesson/l-1-1/"`));
  assert.ok(html.includes(`src="${base}/images/carina.webp"`));
  assert.ok(html.includes(`href="${base}/fonts/inter.css"`));
  assert.ok(html.includes(`${base}/_next/static/`));
  assert.ok(!html.includes('href="/api/'));
  const inter = await read('fonts/inter.css');
  const cairo = await read('fonts/cairo.css');
  assert.match(inter, /url\(\.\/inter-\d+\.ttf\)/);
  assert.match(cairo, /url\(\.\/cairo-\d+\.ttf\)/);
  await access(join(root, 'images', 'carina.webp'));
  await access(join(root, 'fonts', 'inter-3.ttf'));
});

test('makes the limits and review status visible in the exported HTML', async () => {
  const home = await read('index.html');
  const about = await read('about/index.html');
  const lesson = await read('lesson/l-1-1/index.html');
  const planned = await read('stages/s-2/index.html');
  assert.match(home, /awaiting independent scientific and Arabic editorial review/);
  assert.match(home, /noindex/);
  assert.match(about, /Accounts, synced progress, assessments/);
  assert.match(lesson, /Your Place in the Universe/);
  assert.match(lesson, /An invitation to look up/);
  assert.match(planned, /lessons for this stage have not been authored yet/);
});
