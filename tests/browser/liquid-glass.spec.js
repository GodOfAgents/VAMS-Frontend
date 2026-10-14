import { expect, test } from '@playwright/test'

test('marketing navigation uses the renderer on capable desktops and retains CSS glass on mobile', async ({ page }) => {
  const liquidRequests = []
  page.on('request', (request) => {
    if (/liquid[-.]?gl/i.test(request.url())) liquidRequests.push(request.url())
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.marketing-nav')).toHaveAttribute('data-glass-eligibility', 'eligible')
  await expect(page.locator('.marketing-nav__inner')).toHaveAttribute('data-glass-renderer', /^(ready|css)$/)
  await expect(page.locator('.marketing-nav').getByRole('link', { name: 'Open console' })).toBeVisible()
  expect(liquidRequests.length).toBeGreaterThan(0)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.marketing-nav')).toHaveAttribute('data-glass-eligibility', 'css')
  await expect(page.locator('.marketing-nav__inner')).toHaveAttribute('data-glass-renderer', 'css')
  expect(liquidRequests).toHaveLength(1)

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(page.locator('.marketing-nav').getByRole('link', { name: 'Protocol' })).toBeVisible()
  await page.locator('.marketing-nav').getByRole('link', { name: 'Protocol' }).click()
  await expect(page).toHaveURL(/\/protocol$/)
})

test('failed liquid module loading leaves the navigation and CSS material usable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  let interceptedLiquidModule = false
  await page.route(/liquid[-.]?gl.*\.js/i, (route) => {
    interceptedLiquidModule = true
    return route.abort()
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('.marketing-nav__inner')).toHaveAttribute('data-glass-renderer', 'css')
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  expect(interceptedLiquidModule).toBe(true)
})

test('console and status profiles do not request the liquidGL renderer', async ({ page }) => {
  const liquidRequests = []
  page.on('request', (request) => {
    if (/liquidgl/i.test(request.url())) liquidRequests.push(request.url())
  })

  await page.goto('http://127.0.0.1:4374/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/overview$/)
  expect(liquidRequests).toHaveLength(0)

  await page.goto('http://127.0.0.1:4375/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/status$/)
  expect(liquidRequests).toHaveLength(0)
})
