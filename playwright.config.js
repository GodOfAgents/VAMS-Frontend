import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  timeout: 180_000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 60_000 },
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:4373',
    channel: 'chrome',
    colorScheme: 'dark',
    locale: 'en-US',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    actionTimeout: 60_000,
    navigationTimeout: 60_000,
  },
  webServer: [
    {
      command: 'npm run preview:marketing',
      url: 'http://127.0.0.1:4373',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'npm run preview:console',
      url: 'http://127.0.0.1:4374',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'npm run preview:status',
      url: 'http://127.0.0.1:4375',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
})
