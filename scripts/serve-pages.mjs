import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// A small local-only static preview server. Production hosting is provided by GitHub Pages.
const root = resolve(dirname(dirname(fileURLToPath(import.meta.url))), 'github-pages/out');
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (base && (!base.startsWith('/') || base.endsWith('/'))) {
  throw new Error(
    'NEXT_PUBLIC_BASE_PATH must be empty or start with / and have no trailing slash.',
  );
}
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};
async function sendFile(res, file, status = 200, method = 'GET') {
  res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  if (method === 'HEAD') return res.end();
  createReadStream(file)
    .on('error', () => res.destroy())
    .pipe(res);
}
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) throw new Error('Not found');
    const relative = pathname.slice(base.length) || '/';
    let target = resolve(root, `.${relative}`);
    if (target !== root && !target.startsWith(root + sep)) throw new Error('Not found');
    const info = await stat(target);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end();
        return;
      }
      target = join(target, 'index.html');
      await stat(target);
    }
    await sendFile(res, target, 200, req.method);
  } catch {
    try {
      await stat(join(root, '404.html'));
      await sendFile(res, join(root, '404.html'), 404, req.method);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    }
  }
}).listen(port, '0.0.0.0', () =>
  console.log(`Static preview listening on port ${port} at ${base || '/'}`),
);
