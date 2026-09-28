import { expect, test } from '@playwright/test'

const viewportBaselines = [
  { name: '320x568', width: 320, height: 568 },
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '844x390-landscape', width: 844, height: 390 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
]

async function settleStaticPage(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.hero')).toBeVisible()
}

for (const viewport of viewportBaselines) {
  test(`marketing layout remains intentional at ${viewport.name}`, async ({ page }) => {
    test.setTimeout(600_000)
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await settleStaticPage(page)

    const geometry = await page.evaluate(() => {
      const badge = document.querySelector('.hero .status-badge')?.getBoundingClientRect()
      const firstAction = document.querySelector('.hero__actions')?.getBoundingClientRect()
      const header = document.querySelector('.site-header__bar')?.getBoundingClientRect()
      const visualRows = new Set()
      for (const line of document.querySelectorAll('.hero .smoke-text__line')) {
        for (const word of line.querySelectorAll('.smoke-text__word')) {
          visualRows.add(Math.round(word.getBoundingClientRect().top))
        }
      }

      return {
        badgeLeft: badge?.left ?? 0,
        badgeRight: badge?.right ?? 0,
        documentWidth: document.documentElement.scrollWidth,
        firstActionTop: firstAction?.top ?? Number.POSITIVE_INFINITY,
        headerRight: header?.right ?? 0,
        visualHeadingRows: visualRows.size,
      }
    })

    expect(geometry.documentWidth).toBeLessThanOrEqual(viewport.width)
    expect(geometry.headerRight).toBeLessThanOrEqual(viewport.width)
    expect(geometry.badgeLeft).toBeGreaterThanOrEqual(0)
    expect(geometry.badgeRight).toBeLessThanOrEqual(viewport.width)
    expect(geometry.firstActionTop).toBeLessThanOrEqual(viewport.height + 96)

    if (viewport.width >= 1200) expect(geometry.visualHeadingRows).toBe(3)
    if (viewport.width < 360) expect(geometry.visualHeadingRows).toBeGreaterThanOrEqual(3)

    await expect(page).toHaveScreenshot(`marketing-${viewport.name}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    })
  })
}

test('the hero heading reveal completes and the marketing bundle stays lean', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const requestedAssets = []
  page.on('request', (request) => requestedAssets.push(request.url()))

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.hero [data-smoke-final="true"]')).toHaveCSS('opacity', '1')

  const wordIndexes = await page.locator('.hero [data-smoke-mode="words"] .smoke-text__word--animated')
    .evaluateAll((words) => words.map((word) => Number(word.dataset.smokeIndex)))
  expect(wordIndexes).toEqual([0, 1, 2, 3, 4])
  await expect(page.locator('.hero h1')).toHaveAccessibleName('Sovereign infrastructure for enduring services.')

  // At most one canvas: the hero light slats, which fall back to CSS without WebGL.
  expect(await page.locator('canvas').count()).toBeLessThanOrEqual(1)
  expect(await page.locator('canvas').evaluateAll((canvases) => canvases.every((canvas) => canvas.closest('.hero .slats')))).toBe(true)
  await expect(page.locator('.hero .slats')).toHaveAttribute('data-slats', /^(ready|fallback)$/)
  expect(requestedAssets.some((url) => /three|gsap/.test(url))).toBe(false)
})

test('reduced motion renders the complete static hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.hero [data-smoke-mode="words"] .smoke-text__word')).toHaveCount(5)
  await expect(page.locator('.smoke-text__word--animated')).toHaveCount(0)
  await expect(page.locator('.hero h1')).toHaveAccessibleName('Sovereign infrastructure for enduring services.')
})

for (const surface of [
  { name: 'console', port: 4374, path: '/overview' },
  { name: 'status', port: 4375, path: '/status' },
]) {
  test(`${surface.name} mobile surface stays within the viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.goto(`http://127.0.0.1:${surface.port}/`, { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(new RegExp(`${surface.path}$`))
    await page.evaluate(() => document.fonts.ready)

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(390)
    await expect(page.locator('.stage')).toHaveCount(0)

    if (surface.name === 'console') {
      await expect(page.locator('.mobile-bottom-nav')).toBeVisible()
      await page.getByRole('button', { name: 'More' }).click()
      await expect(page.locator('.console-sidebar')).toHaveClass(/is-open/)
      await page.getByRole('button', { name: 'Close navigation' }).click()
      await expect(page.locator('.console-sidebar')).not.toHaveClass(/is-open/)
    } else {
      await expect(page.getByRole('link', { name: 'Protocol home' })).toBeVisible()
    }

    await expect(page).toHaveScreenshot(`${surface.name}-390x844.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    })
  })
}
