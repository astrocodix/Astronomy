import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// Also makes the export usable with a branch-based Pages deployment without running Jekyll.
await writeFile(join(root, 'github-pages', 'out', '.nojekyll'), '');
