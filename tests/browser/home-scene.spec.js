import { expect, test } from '@playwright/test'

test('one adaptive neural scene carries the homepage topology from hero through CTA', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)

  const scene = page.locator('[data-marketing-scene]')
  await expect(scene).toHaveAttribute('data-hero-renderer', /^(ready|fallback)$/)
  if (await scene.getAttribute('data-hero-renderer') === 'fallback') {
    await expect(page.locator('.neural-field--static')).toBeVisible()
    await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(0)
    return
  }

  await expect(scene).toHaveAttribute('data-scene-active', 'intro')
  await expect(page.locator('.scene-progress')).toBeVisible()
  await expect(page.locator('.scene-progress__ticks i')).toHaveCount(6)
  await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(1)
  await page.locator('.hero').hover({ position: { x: 960, y: 280 } })
  await expect(scene).toHaveCSS('--scene-pointer-opacity', '1')
  await expect(scene).not.toHaveCSS('--scene-pointer-nx', '0')
  await page.screenshot({ path: testInfo.outputPath('desktop-neural-hover.png'), animations: 'disabled' })

  for (const chapter of ['lifecycle', 'architecture', 'evidence', 'journey', 'cta']) {
    await page.locator(`[data-scene-chapter="${chapter}"]`).evaluate((element) => {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
    })
    await expect(scene).toHaveAttribute('data-scene-active', chapter)
    await page.mouse.move(1060, 420)
    await expect(scene).toHaveCSS('--scene-pointer-opacity', '1')
    expect(await page.locator('[data-marketing-three] canvas').count()).toBeLessThanOrEqual(1)
    await expect.poll(() => scene.evaluate((element) => element.getBoundingClientRect().top)).toBe(0)
  }
})

test('homepage remains dark across every scene chapter', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'commit' })

  const scene = page.locator('[data-marketing-scene]')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(scene).toHaveCSS('position', 'fixed')
  await expect(scene).toHaveAttribute('data-scene-active', 'intro')
  await expect.poll(() => scene.evaluate((element) => element.style.getPropertyValue('--scene-theme-mix'))).toBe('1.000')

  await page.locator('[data-scene-chapter="lifecycle"]').evaluate((element) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
  })
  await expect(scene).toHaveAttribute('data-scene-active', 'lifecycle')
  await expect.poll(() => scene.evaluate((element) => element.style.getPropertyValue('--scene-theme-mix'))).toBe('1.000')
})

test('compact mobile uses the low-quality neural scene and keeps the first CTA in view', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/', { waitUntil: 'commit' })

  const scene = page.locator('[data-marketing-scene]')
  await expect(scene).toHaveAttribute('data-hero-renderer', /^(ready|fallback)$/)
  await expect(page.locator('[data-marketing-scene]')).toHaveAttribute('data-hero-quality', 'low')
  if (await scene.getAttribute('data-hero-renderer') === 'ready') {
    await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(1)
  } else {
    await expect(page.locator('[data-marketing-three] canvas')).toHaveCount(0)
    await expect(page.locator('.neural-field--static')).toBeVisible()
  }
  await expect(page.locator('.scene-progress')).toBeHidden()
  const ctaBounds = await page.getByRole('link', { name: /Inspect the architecture/ }).boundingBox()
  expect(ctaBounds).not.toBeNull()
  expect(ctaBounds.y + ctaBounds.height).toBeLessThanOrEqual(568)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
})

test('touch excites the mobile neural field and releases after a short afterglow', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  try {
    const page = await context.newPage()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const scene = page.locator('[data-marketing-scene]')
    await expect(scene).toHaveAttribute('data-hero-renderer', /^(ready|fallback)$/)
    test.skip(await scene.getAttribute('data-hero-renderer') === 'fallback', 'WebGL unavailable in this browser')

    await page.touchscreen.tap(300, 650)
    await expect(scene).toHaveCSS('--scene-pointer-opacity', '1')
    await page.screenshot({ path: testInfo.outputPath('mobile-neural-touch.png'), animations: 'disabled' })
    await expect.poll(() => scene.evaluate((element) => element.style.getPropertyValue('--scene-pointer-opacity')), { timeout: 3000 }).toBe('0')
  } finally {
    await context.close()
  }
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

test('public surfaces share fluid hover treatment without mounting a protocol scene', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/protocol', { waitUntil: 'commit' })
  const component = page.locator('.protocol-glass-card').first()
  await expect(component).toBeVisible()
  await expect(component).toHaveCSS('transition-property', /transform/)
  await expect(page.locator('[data-marketing-scene]')).toHaveCount(0)

  await page.goto('/build', { waitUntil: 'commit' })
  const migrationStep = page.locator('.migration-path li').first()
  await expect(migrationStep).toHaveCSS('transition-property', /transform/)
})
