import { test, expect } from '@playwright/test'

test.describe('frontpage works', () => {
  test('page is right', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/thermo/)

    const heading = page.getByRole('heading', { name: 'Hello world!' })
    await expect(heading).toBeVisible()
  })
})
