import { test, expect } from '@playwright/test';

test('Corpass Checkout E2E Flow', async ({ page }) => {
  test.setTimeout(90000);

  // 1. BUYER LOGIN
  await page.goto('/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi'); // buyer loginId
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/buyer/);

  // 2. PINCODE RESTRICTION
  await page.goto('/dashboard/buyer/catalog');
  
  // Enter out-of-range pincode
  await page.waitForSelector('input[placeholder="6 Digit Pincode"]');
  await page.fill('input[placeholder="6 Digit Pincode"]', '700157'); // Kolkata
  await page.click('button[title="Apply Pincode"]');
  await page.waitForTimeout(1500); // wait for network

  // 3. IN-RANGE ORDER PLACEMENT
  await page.fill('input[placeholder="6 Digit Pincode"]', '560001'); // Bangalore
  await page.click('button[title="Apply Pincode"]');
  await page.waitForTimeout(1500); // wait for network

  // Buy Now on an available product
  await page.waitForSelector('button:has-text("Buy Now"):not([disabled])');
  await page.click('button:has-text("Buy Now"):not([disabled]) >> nth=0');

  // Fill modal
  await page.waitForSelector('input[type="number"]');
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '500');
  
  // Addresses
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street');
  await page.fill('textarea[placeholder="Custom requirements..."]', 'E2E purchase order note.');
  
  // Test unchecked billing
  const sameAsShipping = page.locator('span:has-text("Billing Address is same as Shipping")').locator('..').locator('input[type="checkbox"]');
  await sameAsShipping.uncheck();
  await page.fill('textarea[placeholder="Enter billing address..."]', '456 Corporate Ave, Billing Dept');

  // Select Payment Method
  await page.selectOption('#payment-mode-select', 'BANK_TRANSFER');

  // Place Order
  await page.click('button:has-text("Place Order")');
  await page.waitForURL(/\/dashboard\/buyer\/orders/);
  await expect(page.locator('span:has-text("New Order")').first()).toBeVisible();

  // 4. SELLER LOGIC
  await page.evaluate(() => localStorage.removeItem('access_token'));
  
  await page.goto('/login');
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', 'seller20'); // Spark Creative loginId
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/seller/);

  // Manage Order (Split Pane)
  await page.goto('/dashboard/seller/orders');
  
  // Select first order in the left pane
  const orderListButton = page.locator('button', { hasText: 'New Order' }).first();
  await orderListButton.click(); 

  // Right pane actions
  const confirmBtn = page.locator('button:has-text("Confirm Order")');
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
    await expect(page.locator('.p-5.border-b').locator('span:has-text("Confirmed")')).toBeVisible();
  }

  const shipBtn = page.locator('button:has-text("Mark Shipped")');
  if (await shipBtn.isVisible()) {
    await shipBtn.click();
    await expect(page.locator('.p-5.border-b').locator('span:has-text("Shipped")')).toBeVisible();
  }

  const deliverBtn = page.locator('button:has-text("Mark Delivered")');
  if (await deliverBtn.isVisible()) {
    await deliverBtn.click();
    await expect(page.locator('.p-5.border-b').locator('span:has-text("Delivered")')).toBeVisible();
  }
});
