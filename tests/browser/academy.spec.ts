import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const database = resolve('.cache/e2e.db');
const db = new PrismaClient({ datasources: { db: { url: `file:${database}` } } });
const errors: string[] = [];
const findings: any[] = [];
test.beforeAll(async ({ request }) => {
  const health = await (await request.get('/api/health')).json();
  expect(
    health.testMode,
    'Browser tests must use ACADEMY_TEST_MODE=true and the disposable .cache/e2e.db server.',
  ).toBe(true);
  mkdirSync('tests/screenshots', { recursive: true });
});
test.afterAll(async () => {
  await db.$disconnect();
  writeFileSync(
    'tests/browser-findings.json',
    JSON.stringify({ pageErrors: errors, accessibility: findings }, null, 2),
  );
});
test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
});
async function ready(page: Page, path = '/') {
  await page.goto(path);
  await expect(
    page
      .locator(
        '.cosmic-hero, .page-heading h1, .stage-detail-hero h1, .lesson-header h1, .auth-form-content h2, .landing-hero h1, .exam-session-heading h1, .empty-state h3',
      )
      .first(),
  ).toBeVisible();
  await expect(page.locator('.loading')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    })),
  ).toEqual(expect.objectContaining({ scroll: expect.any(Number) }));
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}
async function audit(page: Page, label: string) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  findings.push({
    page: label,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        html: n.html,
        failureSummary: n.failureSummary,
      })),
    })),
  });
  expect
    .soft(
      result.violations.map((v) => `${v.id} (${v.nodes.length})`),
      label,
    )
    .toEqual([]);
}
async function request(page: Page, path: string, method = 'GET', body?: any) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const r = await fetch(`/api/${path}`, {
        method,
        headers: { 'x-astroverse-client': 'academy', 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, data: await r.json() };
    },
    { path, method, body },
  );
}
async function enterAnswer(page: Page, q: any) {
  const a: any = (await db.question.findUniqueOrThrow({ where: { id: q.id } })).answer;
  if (a.kind === 'choice')
    await page.locator(`input[type=radio][value="${a.correct}"]`).check({ force: true });
  else if (a.kind === 'set')
    for (const id of a.correct)
      await page
        .locator('.answer-options .answer-option')
        .filter({ has: page.locator('input[type=checkbox]') })
        .filter({ hasText: q.options.find((o: any) => o.id === id).textEn })
        .locator('input')
        .check({ force: true });
  else if (a.kind === 'match')
    for (const row of q.data.rows)
      await page
        .locator('.matching-row')
        .filter({ hasText: row.en })
        .locator('select')
        .selectOption(a.correct[row.id]);
  else if (a.kind === 'order') {
    for (let desired = 0; desired < a.correct.length; desired++) {
      const text = q.options.find((o: any) => o.id === a.correct[desired]).textEn;
      let actual = (await page.locator('.ordering-row strong').allTextContents()).indexOf(text);
      while (actual > desired) {
        await page
          .locator('.ordering-row')
          .nth(actual)
          .getByRole('button', { name: 'Move up' })
          .click();
        actual--;
      }
    }
    await page.getByRole('button', { name: /Use this order|Order recorded/ }).click();
  } else if (a.kind === 'rubric')
    await page
      .getByLabel('Your scientific reasoning')
      .fill(a.groups.map((g: string[]) => g[0]).join(' '));
  else
    await page
      .locator('.numerical-answer input')
      .fill(a.kind === 'text' ? a.accepted[0] : String(a.correct));
}

test('all requested route families load, desktop navigation, no overflow or uncaught error', async ({
  page,
}) => {
  const routes = [
    '/',
    '/welcome',
    '/roadmap',
    '/courses',
    '/stages/s-1',
    '/stages/s-2',
    '/modules/m-1-1',
    '/lesson/l-1-1',
    '/exams',
    '/questions',
    '/tutor',
    '/observatory',
    '/library',
    '/progress',
    '/achievements',
    '/certificates',
    '/settings',
    '/profile',
    '/admin',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password?token=invalid',
  ];
  for (const route of routes) {
    await ready(page, route);
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
});

test('persistent language / theme, unchanged learner identity, mobile and tablet RTL layouts', async ({
  page,
}) => {
  await ready(page);
  const before = (await request(page, 'bootstrap')).data;
  await page.getByRole('button', { name: 'Switch light or dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to Arabic' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('.cosmic-hero')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const after = (await request(page, 'bootstrap')).data;
  expect(after.user.id).toBe(before.user.id);
  expect(after.progress.stats.completedLessons).toBe(before.progress.stats.completedLessons);
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({ path: 'tests/screenshots/mobile-ar-light.png', fullPage: true });
  await page.getByRole('button', { name: 'فتح القائمة' }).click();
  await expect(page.locator('.sidebar')).toHaveClass(/open/);
  await page.locator('.sidebar').getByRole('link', { name: 'مسار التعلم' }).click();
  await expect(page.locator('.page-heading h1')).toBeVisible();
  await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
  for (const route of [
    '/lesson/l-1-1',
    '/tutor',
    '/exams',
    '/questions',
    '/observatory',
    '/settings',
    '/library',
  ]) {
    await ready(page, route);
    await noOverflow(page);
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  await ready(page, '/roadmap');
  await noOverflow(page);
  await page.screenshot({ path: 'tests/screenshots/tablet-ar-light.png', fullPage: true });
});

test('lesson teaches, accessible bookmark / explanation levels / sources / search', async ({
  page,
}) => {
  await ready(page, '/lesson/l-1-1');
  await expect(page.getByText('GUIDED INVESTIGATION', { exact: true })).toBeVisible();
  await expect(page.locator('.type-workshop')).toContainText('comparison stars');
  await page.getByRole('button', { name: 'Advanced', exact: true }).click();
  await expect(page.locator('.deep-dive-content')).toBeVisible();
  await page.getByRole('button', { name: 'Bookmark lesson', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove bookmark' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove bookmark' })).toBeVisible();
  await page.getByRole('button', { name: /Search the universe/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('input').fill('universe');
  await expect(dialog.locator('.search-results a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.screenshot({ path: 'tests/screenshots/lesson-desktop.png', fullPage: true });
});

test('all 12 question controls submit server-scored feedback, including complete matching solutions', async ({
  page,
}) => {
  await ready(page, '/questions');
  const types = [
    'MCQ',
    'TRUE_FALSE',
    'MULTI_SELECT',
    'FILL',
    'MATCH',
    'ORDER',
    'NUMERIC',
    'REASONING',
    'IMAGE',
    'DIAGRAM',
    'SCENARIO',
    'ADVANCED',
  ];
  for (const type of types) {
    const response = page.waitForResponse(
      (r) =>
        r.url().includes('/api/questions?') &&
        r.url().includes(`type=${type}`) &&
        r.status() === 200,
    );
    await page.getByLabel('Question format').selectOption(type);
    const bank = await (await response).json();
    await expect(page.locator('.practice-question')).toBeVisible();
    await enterAnswer(page, bank.questions[0]);
    await page.getByRole('button', { name: 'Check my understanding', exact: true }).click();
    await expect(page.locator('.answer-feedback')).toBeVisible();
    await expect(page.locator('.answer-feedback')).toHaveClass(/correct/);
    if (type === 'MATCH')
      for (const row of bank.questions[0].data.rows)
        await expect(page.locator('.answer-feedback')).toContainText(row.en);
  }
});

test('exam autosave survives reload and locale change, hides solutions, and records submission', async ({
  page,
}) => {
  await ready(page, '/exams');
  const started = page.waitForResponse(
    (r) => r.url().endsWith('/api/exams/start') && r.status() === 200,
  );
  await page.getByRole('button', { name: 'Begin assessment', exact: true }).first().click();
  const exam = await (await started).json();
  expect(exam.questions).toHaveLength(10);
  expect(
    exam.questions.every((q: any) => q.answer === undefined && q.explanationEn === undefined),
  ).toBeTruthy();
  await expect(page.locator('.exam-session')).toBeVisible();
  await enterAnswer(page, exam.questions[0]);
  await expect(page.locator('.save-status')).toContainText('Progress saved');
  await page.reload();
  await expect(page.locator('.exam-session')).toBeVisible();
  const saved = (await request(page, `exams/${exam.id}`)).data;
  expect(Object.keys(saved.draftAnswers)).toContain(exam.questions[0].id);
  await page.getByRole('button', { name: 'Switch to Arabic' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.exam-session-heading h1')).toHaveText(exam.titleAr);
  await page.getByRole('button', { name: 'التبديل إلى الإنجليزية' }).click();
  await noOverflow(page);
  await page.getByRole('button', { name: 'Submit assessment', exact: true }).click();
  await page.getByRole('button', { name: 'Submit & see results' }).click();
  await expect(page.locator('.exam-results')).toBeVisible();
  await expect(page.locator('.result-hero')).toContainText('10');
  await expect(page.locator('.review-question .answer-feedback').first()).toBeVisible();
  const progress = (await request(page, 'progress')).data;
  expect(progress.stats.examsTaken).toBe(1);
  expect(progress.stats.completedLessons).toBe(0);
  expect(progress.stats.overallMastery).not.toBeNull();
});

test('reference tutor provenance, history, delete confirmation and honest no-match', async ({
  page,
}) => {
  await ready(page, '/tutor');
  await expect(page.getByText(/No AI provider is connected/)).toBeVisible();
  await page.getByLabel('Your question for Astro').fill('parallax distance');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('.chat-message.assistant')).toContainText(
    'not an AI-generated response',
  );
  await expect(page.locator('.message-label').last()).toContainText('Reference guide · not AI');
  await page.reload();
  await expect(page.locator('.conversation-item').first()).toBeVisible();
  await page.locator('.conversation-item').first().locator('button').first().click();
  await expect(page.locator('.chat-message.assistant .chat-sources')).toBeVisible();
  await page.getByRole('button', { name: 'New conversation', exact: true }).first().click();
  await page.getByLabel('Your question for Astro').fill('zzzzxxyyqq');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('.chat-message.assistant')).toContainText('No strong match');
  await page
    .locator('.conversation-item')
    .first()
    .getByRole('button', { name: 'Delete conversation' })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete conversation', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({ path: 'tests/screenshots/tutor-desktop.png', fullPage: true });
});

test('observatory interactions and attributed archive', async ({ page }) => {
  await ready(page, '/observatory');
  await page.getByRole('button', { name: 'Play orbital simulation' }).click();
  await expect(page.getByRole('button', { name: 'Pause orbital simulation' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset simulation' }).click();
  await page
    .locator('.planet-selector')
    .getByRole('button', { name: 'Earth', exact: true })
    .click();
  await expect(page.locator('.planet-profile')).toContainText('6,371');
  await page.getByRole('button', { name: 'Compare planets', exact: true }).click();
  await expect(page.locator('.comparison-table')).toContainText('Reference temperature');
  await page.getByRole('button', { name: 'Moon phases', exact: true }).click();
  await page.getByRole('slider').fill('0');
  await expect(page.locator('.moon-controls h2')).toHaveText('New Moon');
  await page.getByRole('slider').fill('14.8');
  await expect(page.locator('.moon-controls h2')).toHaveText('Full Moon');
  await page.screenshot({ path: 'tests/screenshots/moon-lab.png', fullPage: true });
  await page.getByRole('button', { name: 'Image archive', exact: true }).click();
  await page.locator('.gallery-card').last().click();
  await expect(page.getByRole('dialog')).toContainText('data-based rendering');
  await expect(page.getByRole('dialog')).toContainText('Ernie Wright');
  await page.keyboard.press('Escape');
});

test('registration, preferences, logout/login and protected editorial controls', async ({
  page,
}) => {
  await ready(page, '/register');
  await page.getByLabel('Your name', { exact: true }).fill('Browser Explorer');
  await page.getByLabel('Email address').fill(`browser-${Date.now()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('Browser-student-passphrase!');
  await page.getByRole('button', { name: 'Start my journey' }).click();
  await expect(page.locator('.cosmic-hero')).toBeVisible();
  await ready(page, '/settings');
  await page.getByLabel('Display name').fill('Updated Browser Explorer');
  await page.getByRole('button', { name: 'Save my preferences' }).click();
  await expect(page.locator('.toast')).toContainText('saved');
  await page.reload();
  await expect(page.getByLabel('Display name')).toHaveValue('Updated Browser Explorer');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.locator('.cosmic-hero')).toBeVisible();
  await ready(page, '/login');
  await page.getByLabel('Email address').fill('browser-admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Browser-test-only-passphrase!');
  await page.getByRole('button', { name: 'Sign in to my academy' }).click();
  await expect(page.locator('.cosmic-hero')).toBeVisible();
  await ready(page, '/admin');
  await expect(page.locator('.admin-table table')).toBeVisible();
  await page.getByRole('button', { name: 'Question review', exact: true }).click();
  await expect(page.locator('.question-review-queue article')).toHaveCount(20);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.admin-pagination')).toContainText('2 /');
  await page.getByRole('button', { name: 'Draft a question', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Bilingual question editor');
  await page.getByRole('dialog').getByLabel('Format', { exact: true }).selectOption('MATCH');
  await expect(page.getByLabel('Rows, chart or image metadata (JSON)')).toHaveValue(/row-1/);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'References & media' }).click();
  await expect(page.locator('.admin-media-grid article')).toHaveCount(16);
  await page
    .locator('.admin-media-grid article')
    .first()
    .getByRole('button', { name: 'Edit metadata' })
    .click();
  await expect(page.getByRole('dialog').getByLabel('English alternative text')).not.toBeEmpty();
  await page.keyboard.press('Escape');
});

test('narrow English and Arabic dark layouts, keyboard navigation and complex question formats', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ['/', '/welcome', '/stages/s-1', '/exams', '/questions', '/observatory']) {
    await ready(page, route);
    await noOverflow(page);
  }
  await ready(page, '/questions');
  for (const type of ['MATCH', 'ORDER', 'MULTI_SELECT', 'DIAGRAM', 'REASONING']) {
    const pending = page.waitForResponse(
      (r) =>
        r.url().includes('/api/questions?') &&
        r.url().includes(`type=${type}`) &&
        r.status() === 200,
    );
    await page.getByLabel('Question format').selectOption(type);
    await pending;
    await expect(page.locator('.practice-question')).toBeVisible();
    await noOverflow(page);
  }
  await page.getByRole('button', { name: 'Switch to Arabic' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await noOverflow(page);
  await page.getByRole('button', { name: 'فتح القائمة' }).click();
  await expect(page.locator('.sidebar')).toHaveClass(/open/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
  await expect(page.getByRole('button', { name: 'فتح القائمة' })).toBeFocused();
  await ready(page, '/observatory');
  for (let i = 0; i < 8; i++) {
    await page.locator('.observatory-tabs button').nth(i).click();
    await noOverflow(page);
  }
});

test('WCAG automated audit: representative routes, light/dark and Arabic mobile', async ({
  page,
}) => {
  for (const path of [
    '/',
    '/lesson/l-1-1',
    '/tutor',
    '/questions',
    '/settings',
    '/welcome',
    '/register',
    '/login',
    '/roadmap',
    '/stages/s-1',
    '/observatory',
    '/exams',
    '/progress',
    '/achievements',
    '/certificates',
    '/profile',
    '/library',
  ]) {
    await ready(page, path);
    await audit(page, `dark ${path}`);
  }
  await ready(page);
  await page.screenshot({ path: 'tests/screenshots/dashboard-desktop-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch light or dark theme' }).click();
  await audit(page, 'light dashboard');
  await page.screenshot({ path: 'tests/screenshots/dashboard-desktop-light.png', fullPage: true });
  for (const path of [
    '/lesson/l-1-1',
    '/tutor',
    '/questions',
    '/settings',
    '/register',
    '/roadmap',
    '/observatory',
    '/welcome',
  ]) {
    await ready(page, path);
    await audit(page, `light ${path}`);
  }
  await ready(page);
  await page.getByRole('button', { name: 'Switch to Arabic' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await audit(page, 'Arabic mobile light dashboard');
  for (const path of ['/lesson/l-1-1', '/questions', '/settings', '/register']) {
    await ready(page, path);
    await audit(page, `Arabic mobile light ${path}`);
  }
  expect(errors).toEqual([]);
});
