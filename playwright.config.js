import { defineConfig } from '@playwright/test'
import process from 'node:process'

const browserChannel = process.env.VAMS_PLAYWRIGHT_CHANNEL
const marketingPort = Number(process.env.VAMS_AUDIT_MARKETING_PORT || 4373)
const consolePort = Number(process.env.VAMS_AUDIT_CONSOLE_PORT || 4374)
const statusPort = Number(process.env.VAMS_AUDIT_STATUS_PORT || 4375)

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
    baseURL: `http://127.0.0.1:${marketingPort}`,
    ...(browserChannel ? { channel: browserChannel } : {}),
    colorScheme: 'dark',
    locale: 'en-US',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    actionTimeout: 60_000,
    navigationTimeout: 60_000,
  },
  webServer: [
    {
      command: `npx vite preview --outDir dist/marketing --host 127.0.0.1 --port ${marketingPort} --strictPort`,
      url: `http://127.0.0.1:${marketingPort}`,
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: `npx vite preview --outDir dist/console --host 127.0.0.1 --port ${consolePort} --strictPort`,
      url: `http://127.0.0.1:${consolePort}`,
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: `npx vite preview --outDir dist/status --host 127.0.0.1 --port ${statusPort} --strictPort`,
      url: `http://127.0.0.1:${statusPort}`,
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
})
