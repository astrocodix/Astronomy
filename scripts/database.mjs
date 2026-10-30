import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const command = process.argv[2] || 'generate';
if (!['generate', 'migrate', 'setup'].includes(command))
  throw new Error('Choose generate, migrate, or setup.');
const schema =
  process.env.PRISMA_SCHEMA ||
  (process.env.DATABASE_URL?.startsWith('postgres')
    ? 'prisma/postgresql/schema.prisma'
    : 'prisma/schema.prisma');
const prisma = resolve('node_modules/prisma/build/index.js');
const run = (args) =>
  execFileSync(process.execPath, [prisma, ...args, '--schema', schema], {
    stdio: 'inherit',
    env: process.env,
  });
if (command === 'generate' || command === 'setup') run(['generate']);
if (command === 'migrate' || command === 'setup') run(['migrate', 'deploy']);
if (command === 'setup')
  execFileSync(process.execPath, [resolve('node_modules/tsx/dist/cli.mjs'), 'prisma/seed.ts'], {
    stdio: 'inherit',
    env: process.env,
  });
