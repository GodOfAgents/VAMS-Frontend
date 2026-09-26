import { expect, test } from '@playwright/test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeScript = require.resolve('axe-core/axe.min.js')

const widths = [320, 375, 768, 1440, 1920]
const routes = [
  { name: 'homepage', origin: 'http://127.0.0.1:4373', path: '/' },
  { name: 'protocol', origin: 'http://127.0.0.1:4373', path: '/protocol' },
  { name: 'research', origin: 'http://127.0.0.1:4373', path: '/research' },
  { name: 'status', origin: 'http://127.0.0.1:4375', path: '/status' },
  { name: 'overview', origin: 'http://127.0.0.1:4374', path: '/overview' },
  { name: 'service-block-detail', origin: 'http://127.0.0.1:4374', path: '/service-blocks/sb_oms_v1' },
]

test('public, research, status, and console routes fit the target viewport widths', async ({ page }, testInfo) => {
  test.setTimeout(180_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const route of routes) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${route.origin}${route.path}`, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => document.fonts.ready)
      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
      expect(geometry.scrollWidth, `${route.name} at ${width}px`).toBeLessThanOrEqual(geometry.clientWidth)

      if ([320, 1440].includes(width) && ['homepage', 'research', 'overview'].includes(route.name)) {
        await page.screenshot({ path: testInfo.outputPath(`${route.name}-${width}.png`), animations: 'disabled' })
      }
    }
  }
})

test('200% text enlargement does not cause horizontal page overflow on key reading surfaces', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const route of routes.filter(({ name }) => ['research', 'status', 'overview'].includes(name))) {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto(`${route.origin}${route.path}`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(geometry.scrollWidth, `${route.name} at 200% text`).toBeLessThanOrEqual(geometry.clientWidth)
  }
})

test('research and overview have no serious axe accessibility violations at phone and desktop widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const route of routes.filter(({ name }) => ['research', 'overview'].includes(name))) {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${route.origin}${route.path}`, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => document.fonts.ready)
      await page.route('**/__axe__.js', (request) => request.fulfill({ path: axeScript, contentType: 'application/javascript' }))
      await page.addScriptTag({ url: `${route.origin}/__axe__.js` })
      const violations = await page.evaluate(async () => {
        const result = await window.axe.run(document, { resultTypes: ['violations'] })
        return result.violations
          .filter(({ impact }) => ['critical', 'serious'].includes(impact))
          .map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length }))
      })
      expect(violations, `${route.name} at ${width}px`).toEqual([])
    }
  }
})
