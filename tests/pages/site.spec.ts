import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const path = (route = '/') => `${base}${route}`;
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

test('the static export supports direct links, local reading marks, and the curriculum', async ({
  page,
}) => {
  const errors: string[] = [],
    failed: string[] = [],
    api: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:4173'))
      failed.push(response.url());
  });
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('/api/')) api.push(request.url());
  });
  await page.goto(path());
  await expect(page.getByRole('heading', { name: 'Welcome to your universe.' })).toBeVisible();
  await expect(
    page.getByText('Lessons are awaiting independent scientific and Arabic editorial review.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Begin your journey' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/lesson/l-1-1/`));
  await expect(page.getByRole('heading', { name: 'Your Place in the Universe' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByRole('button', { name: 'Remove reading mark' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove reading mark' })).toBeVisible();
  await page.getByRole('link', { name: /NEXT LESSON/ }).click();
  await expect(page.getByRole('heading', { name: 'Reading the Night Sky' })).toBeVisible();
  await page.goto(path('/stages/s-1/'));
  await expect(page.locator('.gp-lesson-row')).toHaveCount(16);
  await expect(page.locator('.gp-lesson-row').first()).toContainText('Your Place in the Universe');
  await page.goto(path('/stages/s-2/'));
  await expect(
    page.getByText('lessons for this stage have not been authored yet.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('.gp-lesson-row')).toHaveCount(0);
  await page.goto(path('/roadmap/'));
  await expect(page.locator('.gp-stage-card')).toHaveCount(12);
  const missing = await page.goto(path('/does-not-exist/'));
  expect(missing?.status()).toBe(404);
  expect(errors).toEqual([]);
  expect(failed.filter((url) => !url.includes('/does-not-exist/'))).toEqual([]);
  expect(api).toEqual([]);
});

test('search, language, theme, and reload work at the configured base path', async ({ page }) => {
  await page.goto(path());
  await page.getByRole('button', { name: 'Search the universe…' }).click();
  const dialog = page.getByRole('dialog', { name: 'Search the academy' });
  await dialog.getByRole('textbox').fill('parallax');
  await dialog.getByRole('link', { name: /Parallax: Measuring the Nearby Stars/ }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/lesson/l-7-2/`));
  await page.getByRole('button', { name: /Switch to Arabic/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveText('اختلاف المنظر: قياس النجوم القريبة');
  await page.getByRole('button', { name: 'تغيير المظهر' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await noOverflow(page);
});

test('the original interactive observatory works without API calls and uses prefixed images', async ({
  page,
}) => {
  const errors: string[] = [],
    failed: string[] = [],
    api: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(response.url());
  });
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('/api/')) api.push(request.url());
  });
  await page.goto(path('/observatory/'));
  await page.locator('.planet-selector button').filter({ hasText: 'Earth' }).click();
  await expect(page.locator('.planet-profile-body h2')).toHaveText('Earth');
  await page.getByRole('button', { name: 'Moon phases' }).click();
  await expect(page.locator('.moon-display image').first()).toHaveAttribute(
    'href',
    `${base}/images/moon.webp`,
  );
  await page.locator('.moon-controls input[type=range]').fill('15');
  await expect(page.locator('.moon-controls h2')).toHaveText('Full Moon');
  await page.getByRole('button', { name: 'Image archive' }).click();
  await expect(page.locator('.image-gallery img')).toHaveCount(5);
  for (const img of await page.locator('.image-gallery img').all())
    await expect(img).toHaveAttribute('src', new RegExp(`^${base}/images/`));
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect(api).toEqual([]);
});

test('mobile RTL navigation remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path());
  await page.getByRole('button', { name: /Switch to Arabic/ }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await noOverflow(page);
  await page.getByRole('button', { name: 'فتح القائمة' }).click();
  await expect(page.getByRole('button', { name: 'فتح القائمة' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page.getByRole('link', { name: 'المرصد الفلكي' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/observatory/`));
  await expect(page.getByRole('heading', { name: 'مقعد أمامي لمشاهدة الكون.' })).toBeVisible();
  await noOverflow(page);
});

test('home and lesson have no automated WCAG A/AA violations', async ({ page }) => {
  for (const route of ['/', '/lesson/l-1-1/']) {
    await page.goto(path(route));
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.page-enter')).toHaveCSS('opacity', '1');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`),
      JSON.stringify(
        result.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => ({ html: node.html, summary: node.failureSummary })),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  }
});
