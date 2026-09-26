import { expect, test } from '@playwright/test'

test('one adaptive neural scene carries the homepage topology from hero through CTA', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)

  const scene = page.locator('[data-marketing-scene]')
  await expect(scene).toHaveAttribute('data-hero-renderer', 'ready')
  await expect(scene).toHaveAttribute('data-scene-active', 'intro')
  await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(1)
  await page.locator('.hero').hover({ position: { x: 960, y: 280 } })
  await expect(scene).toHaveCSS('--scene-pointer-opacity', '1')
  await expect(scene).not.toHaveCSS('--scene-pointer-nx', '0')

  for (const chapter of ['lifecycle', 'architecture', 'evidence', 'journey', 'cta']) {
    await page.locator(`[data-scene-chapter="${chapter}"]`).evaluate((element) => {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
    })
    await expect(scene).toHaveAttribute('data-scene-active', chapter)
    expect(await page.locator('[data-marketing-three] canvas').count()).toBeLessThanOrEqual(1)
    await expect.poll(() => scene.evaluate((element) => element.getBoundingClientRect().top)).toBe(0)
  }
})

test('light theme preserves the dark hero before transitioning to editorial contrast', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('vams-theme', 'light'))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'commit' })

  const scene = page.locator('[data-marketing-scene]')
  await expect(scene).toHaveCSS('position', 'fixed')
  await expect(scene).toHaveAttribute('data-scene-active', 'intro')
  await expect.poll(() => scene.evaluate((element) => element.style.getPropertyValue('--scene-theme-mix'))).toBe('1.000')

  await page.locator('[data-scene-chapter="lifecycle"]').evaluate((element) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
  })
  await expect(scene).toHaveAttribute('data-scene-active', 'lifecycle')
  await expect.poll(() => scene.evaluate((element) => element.style.getPropertyValue('--scene-theme-mix'))).toBe('0.000')
})

test('compact mobile uses the static neural scene and keeps the first CTA in view', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/', { waitUntil: 'commit' })

  await expect(page.locator('[data-marketing-scene]')).toHaveAttribute('data-hero-renderer', 'fallback')
  await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(0)
  const ctaBounds = await page.getByRole('link', { name: /Explore the network/ }).boundingBox()
  expect(ctaBounds).not.toBeNull()
  expect(ctaBounds.y + ctaBounds.height).toBeLessThanOrEqual(568)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
})

test('leaving home disposes the neural scene and topic routes exclude Three.js', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const requestedAssets = []
  page.on('request', (request) => requestedAssets.push(request.url()))

  await page.goto('/protocol', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('[data-marketing-scene]')).toHaveCount(0)
  expect(requestedAssets.some((url) => url.includes('three-marketing'))).toBe(false)
  await page.goto('/', { waitUntil: 'commit' })
  await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(1)
  await page.goto('/protocol', { waitUntil: 'commit' })
  await expect(page.locator('[data-marketing-scene]')).toHaveCount(0)
  await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(0)
})
