import { expect, test } from '@playwright/test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeScript = require.resolve('axe-core/axe.min.js')

test('network guide fits mobile, tablet, desktop, and enlarged text', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/network', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1, name: /independent infrastructure/i })).toBeVisible()
    const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
    expect(geometry.document, `Network at ${width}px`).toBeLessThanOrEqual(geometry.viewport)
    if ([320, 1440].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath(`network-${width}.png`), animations: 'disabled' })
      await page.locator('.network-flow-panel').screenshot({ path: testInfo.outputPath(`network-flow-${width}.png`), animations: 'disabled' })
      await page.locator('.network-code-card').screenshot({ path: testInfo.outputPath(`network-code-${width}.png`), animations: 'disabled' })
    }
  }

  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/network', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  const enlarged = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
  expect(enlarged.document, 'Network at 200% text').toBeLessThanOrEqual(enlarged.viewport)
})

test('network code controls, FAQ, sources, and accessibility work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/network', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Read-only endpoint').selectOption('da')
  const curl = page.getByRole('tab', { name: 'cURL' })
  await curl.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('/da/status')
  await page.getByText('Are listed nodes necessarily live and available?').click()
  await expect(page.getByText(/fresh, authenticated telemetry/i)).toBeVisible()
  await expect(page.locator('a[href$="docs/API_REFERENCE.md"]').first()).toBeVisible()
  await page.route('**/__axe__.js', (request) => request.fulfill({ path: axeScript, contentType: 'application/javascript' }))
  await page.addScriptTag({ url: 'http://127.0.0.1:4373/__axe__.js' })
  const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.filter(({ impact }) => ['critical', 'serious'].includes(impact)).map(({ id, impact }) => ({ id, impact })))
  expect(violations).toEqual([])
})

test('network typography and smoke reveal match the site design', async ({ page }) => {
  await page.goto('/network', { waitUntil: 'domcontentloaded' })
  const heading = page.getByRole('heading', { level: 2, name: 'Know what the network proves.' })
  await heading.scrollIntoViewIfNeeded()
  await expect(heading.locator('.smoke-text__word--animated').first()).toHaveCSS('opacity', '1')
  const fonts = await page.evaluate(() => {
    const face = (selector) => getComputedStyle(document.querySelector(selector)).fontFamily
    return { hero: face('.network-hero h1'), section: face('.network-section-heading h2'), body: face('.network-hero__lead'), label: face('.network-kicker') }
  })
  expect(fonts.hero).toContain('Playfair Display')
  expect(fonts.section).toContain('Playfair Display')
  expect(fonts.body).toContain('Inter')
  expect(fonts.label).toContain('JetBrains Mono')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: /independent infrastructure/i })).toBeVisible()
  await expect(page.locator('.network-hero .smoke-text__word--animated')).toHaveCount(0)
})

test('protocol remains reachable from the network guide', async ({ page }) => {
  await page.goto('/network', { waitUntil: 'domcontentloaded' })
  await page.getByRole('link', { name: 'Read protocol architecture' }).click()
  await expect(page).toHaveURL(/\/protocol$/)
  await expect(page.locator('.protocol-guide').last().getByRole('heading', { level: 1, name: /protocol architecture/i })).toBeVisible()
})
