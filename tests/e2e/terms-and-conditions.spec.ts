import { test, expect } from '@playwright/test';

test.describe('Terms and Conditions', () => {
  test('terms page should load and display correctly', async ({ page }) => {
    await page.goto('/terms');
    
    await expect(page.locator('h1:has-text("Terms & Conditions")')).toBeVisible();
    await expect(page.locator('text=Corpass operates solely as a facilitator')).toBeVisible();
    await expect(page.locator('a:has-text("Back to Login")')).toHaveAttribute('href', '/login');
  });

  test('registration form requires terms to be accepted', async ({ page }) => {
    await page.goto('/register');
    
    // Fill out basic form
    await page.fill('input[name="name"]', 'Jane Doe');
    await page.fill('input[name="loginId"]', 'janedoe123');
    await page.fill('input[name="email"]', 'jane@example.com');
    await page.fill('input[name="mobile"]', '9876543210');
    await page.fill('input[name="password"]', 'StrongPass123!');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="pincode"]', '123456');
    await page.fill('input[name="companyName"]', 'Test Co');
    await page.fill('input[name="companyAddress"]', 'Test Co Address');

    // DO NOT check the terms box
    const termsCheckbox = page.locator('input[name="terms"]');
    await expect(termsCheckbox).not.toBeChecked();

    // Try to submit
    await page.click('button[type="submit"]');

    // HTML5 validation or manual validation should trigger.
    // The browser will block it because we added 'required' to the checkbox,
    // but we can also verify no navigation happened.
    await expect(page).toHaveURL(/\/register/);
  });
});
