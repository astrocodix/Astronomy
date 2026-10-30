import { copyFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
async function main() {
  mkdirSync('.cache', { recursive: true });
  const path = resolve('.cache/e2e.db');
  for (const suffix of ['', '-wal', '-shm', '-journal'])
    if (existsSync(path + suffix)) rmSync(path + suffix);
  copyFileSync('prisma/academy.db', path);
  process.env.DATABASE_URL = `file:${path}`;
  const { db } = await import('../src/lib/db');
  const { hashPassword } = await import('../src/lib/auth');
  await db.contentReview.deleteMany();
  await db.auditLog.deleteMany();
  await db.user.deleteMany();
  await db.rateLimitBucket.deleteMany();
  await db.user.create({
    data: {
      email: 'browser-admin@example.test',
      passwordHash: await hashPassword('Browser-test-only-passphrase!'),
      isGuest: false,
      role: 'ADMIN',
      profile: { create: { name: 'Browser QA Administrator' } },
    },
  });
  await db.$disconnect();
  console.log(
    'Isolated browser database prepared at .cache/e2e.db. Production learning data was not modified.',
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
