import { expect, test } from '@playwright/test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeScript = require.resolve('axe-core/axe.min.js')

test('protocol guide fits responsive widths and enlarged text', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [320, 375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/protocol', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1, name: /protocol architecture/i })).toBeVisible()
    const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
    expect(geometry.document, `Protocol at ${width}px`).toBeLessThanOrEqual(geometry.viewport)
    if ([320, 1440].includes(width)) await page.screenshot({ path: testInfo.outputPath(`protocol-${width}.png`), animations: 'disabled' })
  }

  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/protocol', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  const enlarged = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
  expect(enlarged.document, 'Protocol at 200% text').toBeLessThanOrEqual(enlarged.viewport)
})

test('protocol guide keeps keyboard controls and FAQ accessible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/protocol', { waitUntil: 'domcontentloaded' })
  const tab = page.getByRole('tab', { name: 'cURL' })
  await tab.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true')
  await page.getByText('Does VAMS run its own consensus?').click()
  await expect(page.getByText(/No separate VAMS consensus algorithm/)).toBeVisible()
  await page.route('**/__axe__.js', (request) => request.fulfill({ path: axeScript, contentType: 'application/javascript' }))
  await page.addScriptTag({ url: 'http://127.0.0.1:4373/__axe__.js' })
  const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.filter(({ impact }) => ['critical', 'serious'].includes(impact)).map(({ id, impact }) => ({ id, impact })))
  expect(violations).toEqual([])
})

test('protocol typography uses the shared display, body, and instrument faces', async ({ page }) => {
  await page.goto('/protocol', { waitUntil: 'domcontentloaded' })
  const typography = await page.evaluate(() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector)).fontFamily
    return {
      hero: style('.protocol-hero h1'),
      section: style('.protocol-section-heading h2'),
      card: style('.protocol-glass-card h3'),
      body: style('.protocol-hero__lead'),
      label: style('.protocol-kicker'),
    }
  })
  expect(typography.hero).toContain('Playfair Display')
  expect(typography.section).toContain('Playfair Display')
  expect(typography.card).toContain('Playfair Display')
  expect(typography.body).toContain('Inter')
  expect(typography.label).toContain('JetBrains Mono')
})

test('protocol headings reveal in view and remain readable with reduced motion', async ({ page }) => {
  await page.goto('/protocol', { waitUntil: 'domcontentloaded' })
  const hero = page.getByRole('heading', { level: 1, name: 'Protocol architecture.' })
  await expect(hero).toHaveAttribute('data-smoke-mode', 'words')
  await expect(hero.locator('.smoke-text__word--animated')).toHaveCount(2)
  const faq = page.getByRole('heading', { level: 2, name: 'Know the boundary of every claim.' })
  await faq.scrollIntoViewIfNeeded()
  await expect(faq.locator('.smoke-text__word--animated').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('section[aria-labelledby="faq"] h2#faq')).toBeVisible()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(hero).toBeVisible()
  await expect(hero.locator('.smoke-text__word--animated')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Know the boundary of every claim.' })).toBeVisible()
})
