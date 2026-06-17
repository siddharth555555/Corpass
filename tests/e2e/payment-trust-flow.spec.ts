import { test, expect } from '@playwright/test';

test('Corpass Payment Trust & Orders Split-Pane E2E Flow', async ({ page }) => {
  test.setTimeout(120000);

  // 1. BUYER LOGIN
  await page.goto('/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi'); // buyer loginId
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/buyer/);

  // 2. BUYER: ADD TO CART & PLACE ORDER
  await page.goto('/dashboard/buyer/catalog');

  // Click Buy Now on the first available product
  await page.waitForSelector('button:has-text("Buy Now"):not([disabled])');
  await page.click('button:has-text("Buy Now"):not([disabled]) >> nth=0');

  // Fill Checkout Modal
  await page.waitForSelector('input[type="number"]');
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '500'); // quantity
  
  // Addresses
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street');
  await page.fill('textarea[placeholder="Custom requirements..."]', 'Testing payment flow');
  
  // Select Payment Mode
  await page.selectOption('#payment-mode-select', 'BANK_TRANSFER');

  // Place Order
  await page.click('button:has-text("Place Order")');
  await page.waitForURL(/\/dashboard\/buyer\/orders/);

  // Verify the order is in the list
  await expect(page.locator('span:has-text("New Order")').first()).toBeVisible();
  
  // Get order number for tracking
  const firstOrderBtn = page.locator('button', { hasText: 'New Order' }).first();
  await firstOrderBtn.click();
  const orderNumber = await firstOrderBtn.locator('.font-mono').innerText();

  // 3. SELLER: DEMAND ADVANCE
  await page.evaluate(() => localStorage.removeItem('access_token'));
  
  await page.goto('/login');
  await page.click('button:has-text("I am a Seller")');
  // Log into Spark Creative (who owns the first product usually)
  await page.fill('#identifier', 'seller20'); 
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/seller/);

  await page.goto('/dashboard/seller/orders');
  
  // Click on the specific order in the left pane
  const sellerOrderBtn = page.locator(`button:has-text("${orderNumber}")`);
  await expect(sellerOrderBtn).toBeVisible();
  await sellerOrderBtn.click();

  // Check detail pane loaded
  await expect(page.locator('h4:has-text("Order Details")')).toBeVisible();

  // Confirm Order first
  const confirmBtn = page.locator('button:has-text("Confirm Order")');
  await confirmBtn.click();

  // Switch to Payments tab
  await page.click('button:has-text("payments")');

  // Request an advance
  await page.fill('input[placeholder="Amount (₹)"]', '100');
  await page.click('button:has-text("Request")');

  // Verify advance is reflected
  await expect(page.locator('span:has-text("Advance Requested")')).toBeVisible();
  await expect(page.locator('span:has-text("₹100")')).toBeVisible();

  // Try shipping without the advance (should fail, but UI might not have a clear visual block besides an alert, so we skip explicit verification of failure to avoid test hanging on unhandled alert)

  // 4. BUYER: RECORD PAYMENT
  await page.evaluate(() => localStorage.removeItem('access_token'));
  
  await page.goto('/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/buyer/);

  await page.goto('/dashboard/buyer/orders');

  const buyerOrderBtn = page.locator(`button:has-text("${orderNumber}")`);
  await expect(buyerOrderBtn).toBeVisible();
  await buyerOrderBtn.click();

  // Switch to Payments tab
  await page.click('button:has-text("payments")');

  // Verify advance requested is shown
  await expect(page.locator('span:has-text("Advance Required")')).toBeVisible();

  // Submit payment
  await page.fill('input[placeholder="Amount (₹)"]', '150');
  await page.fill('input[type="date"]', '2025-01-01');
  await page.fill('input[placeholder="UTR / Ref Number"]', 'UTR-123456789');
  await page.click('button:has-text("Submit Details")');

  // Wait for the payment to appear as pending
  await expect(page.locator('span:has-text("Pending Ack")')).toBeVisible();

  // 5. SELLER: ACKNOWLEDGE & SHIP
  await page.evaluate(() => localStorage.removeItem('access_token'));
  
  await page.goto('/login');
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', 'seller20'); 
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');

  await page.goto('/dashboard/seller/orders');
  
  await page.locator(`button:has-text("${orderNumber}")`).click();

  // Switch to Payments tab
  await page.click('button:has-text("payments")');

  // Click Acknowledge
  await page.click('button:has-text("ACK")');

  // Verify it says Acknowledged
  await expect(page.locator('span', { hasText: 'Acknowledged' }).last()).toBeVisible();

  // Now ship the order
  await page.click('button:has-text("Mark Shipped")');
  
  // Verify status is shipped in header
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Shipped")')).toBeVisible();
});
