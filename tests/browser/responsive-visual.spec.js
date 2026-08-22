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
  await page.goto('/', { waitUntil: 'commit' })
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
        visualHeadingRows: visualRows.size,
      }
    })

    expect(geometry.documentWidth).toBeLessThanOrEqual(viewport.width)
    expect(geometry.badgeLeft).toBeGreaterThanOrEqual(0)
    expect(geometry.badgeRight).toBeLessThanOrEqual(viewport.width)
    expect(geometry.firstActionTop).toBeLessThanOrEqual(viewport.height + 96)

    if (viewport.width >= 1200) expect(geometry.visualHeadingRows).toBe(3)
    if (viewport.width < 360) expect(geometry.visualHeadingRows).toBeGreaterThanOrEqual(4)

    await expect(page).toHaveScreenshot(`marketing-${viewport.name}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    })
  })
}

test('motion and neural topography activate only for the capable marketing profile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const requestedAssets = []
  page.on('request', (request) => requestedAssets.push(request.url()))

  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('[data-hero-renderer="ready"]')).toBeVisible()
  await expect(page.locator('[data-marketing-three] canvas')).toBeVisible()
  await expect(page.locator('[data-smoke-final="true"]')).toHaveCSS('opacity', '1')
  await expect(page.locator('[data-neural-quality="high"]')).toBeVisible()
  await expect(page.locator('[data-marketing-three]')).toHaveAttribute('data-proof-count', '1')
  await expect(page.locator('[data-marketing-three]')).toHaveAttribute('data-proof-wave', 'complete')

  const wordIndexes = await page.locator('[data-smoke-mode="words"] .smoke-text__word--animated')
    .evaluateAll((words) => words.map((word) => Number(word.dataset.smokeIndex)))
  expect(wordIndexes).toEqual([0, 1, 2, 3, 4])

  const heroGlass = await page.locator('.protocol-strip > div').first().evaluate((surface) => {
    const style = getComputedStyle(surface)
    return style.backdropFilter || style.webkitBackdropFilter
  })
  expect(heroGlass).not.toBe('none')

  await page.locator('.lifecycle-section').scrollIntoViewIfNeeded()
  await expect.poll(async () => page.locator('.lifecycle-list .is-active').count()).toBeGreaterThan(0)
  await page.locator('.hero').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-smoke-mode="words"] .smoke-text__word--animated').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('[data-marketing-three]')).toHaveAttribute('data-proof-count', '1')

  expect(requestedAssets.some((url) => url.includes('three-marketing'))).toBe(true)
  expect(requestedAssets.some((url) => url.includes('gsap-marketing'))).toBe(true)
})

test('mobile hero uses the low-DPR performance profile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)

  const field = page.locator('[data-neural-quality="low"]')
  await expect(field).toBeVisible()
  await expect(page.locator('[data-hero-renderer="ready"]')).toBeVisible()

  const renderSize = await field.locator('canvas').evaluate((canvas) => ({
    cssHeight: canvas.clientHeight,
    cssWidth: canvas.clientWidth,
    height: canvas.height,
    width: canvas.width,
  }))
  expect(renderSize.width).toBeLessThanOrEqual(Math.ceil(renderSize.cssWidth))
  expect(renderSize.height).toBeLessThanOrEqual(Math.ceil(renderSize.cssHeight))
})

test('WebGL failure retains the complete static hero', async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return originalGetContext.call(this, type, ...args)
    }
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('[data-hero-renderer="fallback"]')).toBeVisible()
  await expect(page.locator('.neural-field--static')).toBeVisible()
  await expect(page.locator('[data-marketing-three]')).toHaveCount(0)
  await expect(page.locator('.hero h1')).toHaveAccessibleName('Verifiable infrastructure for autonomous agents.')
})

test('reduced motion uses the complete static hero without loading cinematic bundles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const requestedAssets = []
  page.on('request', (request) => requestedAssets.push(request.url()))

  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.hero-visual--static')).toBeVisible()
  await expect(page.locator('[data-marketing-three]')).toHaveCount(0)
  await expect(page.locator('[data-smoke-mode="words"] .smoke-text__word')).toHaveCount(5)
  await expect(page.locator('.smoke-text__word--animated')).toHaveCount(0)
  expect(requestedAssets.some((url) => /three-marketing|gsap-marketing/.test(url))).toBe(false)
})

for (const surface of [
  { name: 'console', port: 4374, path: '/overview' },
  { name: 'status', port: 4375, path: '/status' },
]) {
  test(`${surface.name} mobile surface excludes cinematic bundles`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const requestedAssets = []
    page.on('request', (request) => requestedAssets.push(request.url()))

    await page.goto(`http://127.0.0.1:${surface.port}/`, { waitUntil: 'commit' })
    await expect(page).toHaveURL(new RegExp(`${surface.path}$`))
    await page.evaluate(() => document.fonts.ready)

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(390)
    expect(requestedAssets.some((url) => /three-marketing|gsap-marketing/.test(url))).toBe(false)

    const glassSurface = surface.name === 'console' ? '.console-header' : '.status-column'
    const glassFilter = await page.locator(glassSurface).first().evaluate((element) => {
      const style = getComputedStyle(element)
      return style.backdropFilter || style.webkitBackdropFilter
    })
    expect(glassFilter).not.toBe('none')

    await expect(page).toHaveScreenshot(`${surface.name}-390x844.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    })
  })
}
