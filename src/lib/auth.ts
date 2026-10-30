import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';
const scrypt = promisify(scryptCb);
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public ar = 'تعذّر إكمال الطلب. يرجى المحاولة مجددًا.',
  ) {
    super(message);
  }
}
export const hashToken = (s: string) => createHash('sha256').update(s).digest('hex');
export async function hashPassword(p: string) {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(p, salt, 64)) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
export async function checkPassword(p: string, hash: string) {
  const [salt, h] = hash.split(':');
  if (!salt || !h) return false;
  const actual = (await scrypt(p, salt, 64)) as Buffer;
  const expected = Buffer.from(h, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export async function findUser(req: NextRequest) {
  const raw = req.cookies.get('astro_session')?.value;
  if (!raw) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(raw) },
    include: { user: { include: { profile: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
export async function requireUser(req: NextRequest) {
  const u = await findUser(req);
  if (!u)
    throw new ApiError(
      401,
      'Your session has expired. Please refresh the page.',
      'انتهت الجلسة. يرجى تحديث الصفحة.',
    );
  return u;
}
export async function requireStaff(req: NextRequest, adminOnly = false) {
  const u = await requireUser(req);
  if (!['ADMIN', ...(adminOnly ? [] : ['INSTRUCTOR'])].includes(u.role))
    throw new ApiError(
      403,
      'Instructor or administrator access is required.',
      'يلزم حساب مدرّس أو مسؤول.',
    );
  return u;
}
export async function newSession(userId: string, req: NextRequest) {
  const raw = randomBytes(32).toString('hex');
  await db.session.create({
    data: { id: hashToken(raw), userId, expiresAt: new Date(Date.now() + 14 * 86400000) },
  });
  return (res: NextResponse) => {
    res.cookies.set('astro_session', raw, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:',
      maxAge: 14 * 86400,
      path: '/',
    });
    return res;
  };
}
export async function rateLimit(key: string, limit: number, seconds = 60) {
  const now = new Date();
  await db.rateLimitBucket.deleteMany({ where: { key, expiresAt: { lt: now } } });
  const bucket = await db.rateLimitBucket.upsert({
    where: { key },
    update: { hits: { increment: 1 } },
    create: { key, hits: 1, expiresAt: new Date(Date.now() + seconds * 1000) },
  });
  if (bucket.hits > limit)
    throw new ApiError(
      429,
      'Too many requests. Please wait a little and try again.',
      'طلبات كثيرة. انتظر قليلًا ثم حاول مجددًا.',
    );
}
export function checkOrigin(req: NextRequest) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (origin) {
    let originHost = '';
    try {
      originHost = new URL(origin).host;
    } catch {
      throw new ApiError(403, 'Invalid request origin.', 'مصدر الطلب غير صالح.');
    }
    if (originHost !== host && origin !== process.env.APP_URL)
      throw new ApiError(403, 'Cross-origin request rejected.', 'رُفض الطلب من مصدر مختلف.');
  }
  if (req.headers.get('x-astroverse-client') !== 'academy')
    throw new ApiError(
      403,
      'Missing request verification header.',
      'ترويسة التحقق من الطلب مفقودة.',
    );
}
export function clientKey(req: NextRequest) {
  return hashToken(req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local');
}
export async function limitedBytes(req: NextRequest, max = 1_000_000) {
  if (Number(req.headers.get('content-length') || 0) > max)
    throw new ApiError(413, 'Request too large.', 'الطلب كبير جدًا.');
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new ApiError(413, 'Request too large.', 'الطلب كبير جدًا.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
export async function body(req: NextRequest) {
  const text = new TextDecoder().decode(await limitedBytes(req));
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new ApiError(400, 'Invalid request data.', 'بيانات الطلب غير صالحة.');
  }
}

export function publicUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    isGuest: u.isGuest,
    name: u.profile?.name ?? 'Explorer',
    profile: u.profile,
  };
}
