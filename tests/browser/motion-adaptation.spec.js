import { expect, test } from '@playwright/test'

test('marketing navigation keeps the dark identity and resolves the new heading cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('link', { name: 'Protocol', exact: true }).click()

  await expect(page).toHaveURL(/\/protocol$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Protocol architecture.' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.goo-cursor')).toHaveCount(1)
  await page.getByRole('link', { name: 'Network', exact: true }).click()
  await expect(page).toHaveURL(/\/network$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Independent infrastructure.' })).toBeVisible()
})

test('desktop cursor is pointer-led, while touch and reduced motion retain the native cursor', async ({ page, browser }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.mouse.move(400, 300)
  await expect(page.locator('.goo-cursor')).toHaveAttribute('data-state', 'active')
  await expect(page.locator('html')).toHaveAttribute('data-goo-cursor', 'active')

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  try {
    const touchPage = await touchContext.newPage()
    await touchPage.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(touchPage.locator('.goo-cursor')).toHaveCount(0)
    await expect(touchPage.locator('.motion-chapter')).toHaveCSS('clip-path', 'none')
  } finally {
    await touchContext.close()
  }

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.goo-cursor')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-goo-cursor', 'active')
})

test('scroll motion highlights the currently read architecture row', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.locator('[data-scene-chapter="architecture"]').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('.architecture-grid article.is-reading').count()).toBeGreaterThan(0)
})
