import { defineConfig } from '@playwright/test';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const port = 4173;
const customBrowser = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
export default defineConfig({
  testDir: './tests/pages',
  timeout: 45000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}${basePath}/`,
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'dark',
    contextOptions: { reducedMotion: 'reduce' },
    browserName: 'chromium',
    launchOptions: customBrowser ? { executablePath: customBrowser, args: ['--no-sandbox'] } : {},
  },
  webServer: {
    command: 'node scripts/serve-pages.mjs',
    url: `http://127.0.0.1:${port}${basePath}/`,
    env: { NEXT_PUBLIC_BASE_PATH: basePath, PORT: String(port) },
    reuseExistingServer: false,
    timeout: 30000,
  },
});
