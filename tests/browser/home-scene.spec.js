import { expect, test } from '@playwright/test'

async function scrollToSelector(page, selector, offset = 0) {
  await page.locator(selector).first().evaluate((element, extra) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + extra, behavior: 'instant' })
  }, offset)
}

test('the horizon stage pins, opens to full bleed, and reveals every protocol readout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const stage = page.locator('.stage')
  await expect(stage).toHaveClass(/stage--animated/)
  await expect(page.locator('.stage__sticky')).toHaveCSS('position', 'sticky')

  const readouts = page.locator('.protocol-strip > div')
  await expect(readouts).toHaveCount(4)
  await expect(readouts.first()).toHaveCSS('opacity', '0')

  await stage.evaluate((element) => {
    const end = element.getBoundingClientRect().top + window.scrollY + element.offsetHeight - window.innerHeight
    window.scrollTo({ top: end - 40, behavior: 'instant' })
  })

  for (let index = 0; index < 4; index += 1) {
    await expect.poll(() => readouts.nth(index).evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.98)
  }
  await expect.poll(() => page.locator('.stage__card').evaluate((element) => getComputedStyle(element).clipPath)).toMatch(/inset\(0(px|%)?\)|inset\(0% 0% 0% 0% round 0px\)|none/)
})

test('the architecture orbit lights the boundary whose description is in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'networkidle' })

  const orbit = page.locator('.orbit')
  await scrollToSelector(page, '[data-orbit-index="2"]', -380)
  await expect(orbit).toHaveAttribute('data-active', '2')
  await expect(page.locator('.orbit__ring[data-ring="blocks"]')).toHaveClass(/is-active/)
  await expect(page.locator('[data-orbit-index="2"]')).toHaveClass(/is-active/)

  await page.locator('[data-orbit-index="5"]').hover()
  await expect(orbit).toHaveAttribute('data-active', '5')
  await expect(page.locator('.orbit__ring[data-ring="portable"]')).toHaveClass(/is-active/)
})

test('the lifecycle timeline marks the step crossing the viewport centre', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'networkidle' })

  await scrollToSelector(page, '[data-lifecycle-step="04"]', -420)
  await expect.poll(async () => page.locator('.lifecycle-step.is-active').count()).toBe(1)
  await expect(page.locator('.lifecycle-timeline')).not.toHaveAttribute('data-active-step', '-1')
})

test('reduced motion renders the complete static homepage without pinning', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.locator('.stage')).not.toHaveClass(/stage--animated/)
  await expect(page.locator('.stage__sticky')).not.toHaveCSS('position', 'sticky')
  const opacities = await page.locator('.protocol-strip > div').evaluateAll((items) => items.map((item) => getComputedStyle(item).opacity))
  expect(opacities).toEqual(['1', '1', '1', '1'])
  await expect(page.locator('.lifecycle-step.is-active')).toHaveCount(0)
})

test('compact mobile keeps the first call to action in the initial viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const ctaBounds = await page.getByRole('link', { name: /Explore the network/ }).boundingBox()
  expect(ctaBounds).not.toBeNull()
  expect(ctaBounds.y + ctaBounds.height).toBeLessThanOrEqual(568)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
})

test('the mobile menu opens, carries the preference toggles, and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/protocol', { waitUntil: 'networkidle' })

  const menu = page.getByRole('button', { name: 'Open navigation' })
  await menu.click()
  const navigation = page.locator('#primary-navigation')
  await expect(navigation).toHaveClass(/is-open/)
  await expect(navigation.getByRole('link', { name: 'Research' })).toBeVisible()
  await expect(navigation.locator('.site-nav__tools .icon-button')).toHaveCount(2)
  await page.keyboard.press('Escape')
  await expect(navigation).not.toHaveClass(/is-open/)
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused()
})

test('topic routes do not mount the homepage stage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/protocol', { waitUntil: 'networkidle' })
  await expect(page.locator('.stage')).toHaveCount(0)
  await expect(page.locator('.topic-principles .principle-row')).toHaveCount(4)
  await expect(page.locator('canvas')).toHaveCount(0)
})
