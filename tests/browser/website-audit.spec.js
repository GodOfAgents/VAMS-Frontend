import { expect, test } from '@playwright/test'
import process from 'node:process'
import { createRequire } from 'node:module'

const marketingOrigin = process.env.VAMS_AUDIT_MARKETING_ORIGIN || 'http://127.0.0.1:4373'
const consoleOrigin = process.env.VAMS_AUDIT_CONSOLE_ORIGIN || 'http://127.0.0.1:4374'
const statusOrigin = process.env.VAMS_AUDIT_STATUS_ORIGIN || 'http://127.0.0.1:4375'
const require = createRequire(import.meta.url)
const axeScript = require.resolve('axe-core/axe.min.js')

test('mobile console dialog traps and restores focus and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${consoleOrigin}/overview`)

  const trigger = page.getByRole('button', { name: 'Open navigation' })
  await expect(page.locator('.console-sidebar').getByRole('navigation', { name: 'Console' })).toBeHidden()
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Console navigation' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Nodes' })).toBeVisible()
  await page.route('**/__axe__.js', (request) => request.fulfill({ path: axeScript, contentType: 'application/javascript' }))
  await page.addScriptTag({ url: `${consoleOrigin}/__axe__.js` })
  const dialogViolations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[role="dialog"]'))).violations.map(({ id, impact }) => ({ id, impact })))
  expect(dialogViolations).toEqual([])
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  const more = page.getByRole('button', { name: 'More' })
  await more.click()
  await expect(dialog).toBeVisible()
  await page.locator('.console-dialog-overlay').click({ position: { x: 380, y: 400 } })
  await expect(dialog).toBeHidden()
  await expect(more).toBeFocused()
})

test('research filters retain the active section and stay within the mobile filter panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/research')
  await page.getByRole('link', { name: 'Research ledger' }).click()
  const search = page.getByRole('textbox', { name: 'Search research' })
  await search.fill('DBOS')
  await expect(page).toHaveURL(/research\?q=DBOS#ledger$/)
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible()

  const bounds = await page.getByLabel('Family').evaluate((select) => {
    const panel = select.closest('.research-filters').getBoundingClientRect()
    const control = select.getBoundingClientRect()
    return { panelRight: panel.right, controlRight: control.right }
  })
  expect(bounds.controlRight).toBeLessThanOrEqual(bounds.panelRight + 1)

  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL(/research#ledger$/)
})

test('reduced motion preference persists and never overrides device settings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(marketingOrigin)
  const toggle = page.locator('.motion-preference-toggle')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Turn off reduced motion' })).toHaveAttribute('aria-pressed', 'true')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const devicePreference = page.getByRole('button', { name: 'Reduced motion is enabled by your device settings' })
  await expect(devicePreference).toBeDisabled()
  await expect(devicePreference).toHaveAttribute('aria-pressed', 'true')
})

test('compiled surface previews render direct route entries and refreshes', async ({ page }) => {
  for (const [origin, path, heading] of [
    [marketingOrigin, '/network', 'Independent infrastructure.'],
    [statusOrigin, '/status', 'Operational status is not release readiness.'],
    [consoleOrigin, '/overview', 'Protocol overview'],
  ]) {
    const response = await page.goto(`${origin}${path}`)
    expect(response?.ok(), `${path} preview response`).toBeTruthy()
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }
  const response = await page.goto(`${marketingOrigin}/an-unknown-route`)
  expect(response?.ok()).toBeTruthy()
  await expect(page.getByRole('heading', { name: 'This protocol route does not exist.' })).toBeVisible()
})
