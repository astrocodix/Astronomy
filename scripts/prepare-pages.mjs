import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The static edition reuses the full application's attributed assets without checking in copies.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'public');
const target = join(root, 'github-pages', 'public');
await mkdir(target, { recursive: true });
for (const entry of ['images', 'fonts', 'icon.svg']) {
  await cp(join(source, entry), join(target, entry), { recursive: true });
}
// The server app uses root-relative font URLs. Resolve them relative to the copied CSS so
// fonts also load when Pages serves the site at /<repository>/ instead of the origin root.
for (const css of ['inter.css', 'cairo.css']) {
  const path = join(target, 'fonts', css);
  const contents = await readFile(path, 'utf8');
  await writeFile(path, contents.replaceAll('url(/fonts/', 'url(./'));
}
