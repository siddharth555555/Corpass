import { test, expect } from '@playwright/test';

test.describe('Profile Editing', () => {
  test('buyer can open profile edit and view fields', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="loginId"]', 'testbuyer123');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/buyer/);

    // Go to profile
    await page.goto('/dashboard/buyer/profile');
    
    // Open edit modal
    await page.click('button:has-text("Edit Profile")');
    await expect(page.locator('h2:has-text("Edit Profile")')).toBeVisible();

    // Check fields are present
    await expect(page.locator('input[placeholder="Enter full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Registered company name"]')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('h2:has-text("Edit Profile")')).not.toBeVisible();
  });
});
