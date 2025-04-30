import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Verify the page title
    await expect(page).toHaveTitle(/BuildTrack Pro/);
    
    // Verify key elements are present
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to dashboard when authenticated', async ({ page }) => {
    // This is a placeholder test that will be implemented when auth is fully set up
    test.skip(true, 'Auth flow needs to be implemented first');
    
    // Navigate to the homepage
    await page.goto('/');
    
    // Find and click the dashboard link/button
    await page.locator('a[href="/dashboard"]').click();
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
