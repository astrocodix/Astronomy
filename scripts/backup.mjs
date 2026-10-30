import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { mkdirSync, chmodSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required.');
mkdirSync('backups', { recursive: true, mode: 0o700 });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
let destination;
if (url.startsWith('file:')) {
  const schema = resolve(process.env.PRISMA_SCHEMA || 'prisma/schema.prisma');
  const source = resolve(dirname(schema), decodeURIComponent(url.slice(5).split('?')[0]));
  if (!existsSync(source))
    throw new Error('SQLite source does not exist. Refusing to create an empty backup.');
  destination = resolve('backups', `academy-${stamp}.db`);
  execFileSync(process.env.PYTHON || 'python3', [
    '-c',
    'import sqlite3,sys; source=sqlite3.connect(sys.argv[1]); dest=sqlite3.connect(sys.argv[2]); source.backup(dest); assert dest.execute("PRAGMA integrity_check").fetchone()[0]=="ok"; dest.close(); source.close()',
    source,
    destination,
  ]);
} else if (url.startsWith('postgres')) {
  const u = new URL(url);
  destination = resolve('backups', `academy-${stamp}.pgdump`);
  // Keep the password out of command-line arguments and logs.
  const env = {
    ...process.env,
    PGHOST: u.hostname,
    PGPORT: u.port || '5432',
    PGUSER: decodeURIComponent(u.username),
    PGPASSWORD: decodeURIComponent(u.password),
    PGDATABASE: decodeURIComponent(u.pathname.slice(1)),
    PGSSLMODE: u.searchParams.get('sslmode') || 'prefer',
  };
  execFileSync('pg_dump', ['--format=custom', '--no-owner', '--file', destination], {
    env,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
} else throw new Error('Unsupported database provider.');
chmodSync(destination, 0o600);
console.log(`Consistent database backup: ${destination}`);
console.log(
  'Also back up storage/uploads, the attribution registry, and your secret manager. Encrypt off-host backups and test restoration.',
);
