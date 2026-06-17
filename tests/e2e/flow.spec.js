const { test, expect } = require('@playwright/test');

const nameToLoginId = {
  // Company Names
  'PaperWorld India': 'seller01',
  'FurnishCorp': 'seller02',
  'GiftCraft Studios': 'seller03',
  'TechZone Solutions': 'seller04',
  'FreshBite Supplies': 'seller05',
  'CleanPro Industries': 'seller06',
  'ToolMaster India': 'seller07',
  'PackRight Solutions': 'seller08',
  'PrintEx Graphics': 'seller09',
  'CloudSoft Technologies': 'seller10',
  'OfficeHub Supplies': 'seller11',
  'SitRight Furniture': 'seller12',
  'GadgetGift Co': 'seller13',
  'NetGear Solutions': 'seller14',
  'TeaCafe Distributors': 'seller15',
  'SafeZone Supplies': 'seller16',
  'WrapWell Packaging': 'seller17',
  'BrandPrint Media': 'seller18',
  'BizConsult Partners': 'seller19',
  'Spark Creative Agency': 'seller20',
};

test('end-to-end B2B procurement flow', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Log in as Buyer
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  // 2. Go to Catalog and place a "Buy Now" order
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  
  // Wait for product cards to load
  await page.waitForSelector('button:has-text("Buy Now")');
  
  // Identify the seller name of the first product card
  const sellerText = await page.locator('.flex.items-center.gap-2 span.truncate').first().textContent();
  const sellerName = sellerText ? sellerText.trim() : '';
  const sellerLoginId = nameToLoginId[sellerName] || 'seller01';

  // Click Buy Now on the first available product
  await page.waitForSelector('button:has-text("Buy Now"):not([disabled])');
  await page.click('button:has-text("Buy Now"):not([disabled]) >> nth=0');

  // Fill modal form
  await page.waitForSelector('input[type="number"]');
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '10');
  
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street');
  await page.fill('textarea[placeholder="Custom requirements..."]', 'E2E purchase order note.');

  // Select Payment Mode
  await page.selectOption('#payment-mode-select', 'BANK_TRANSFER');

  // Click Place Order
  await page.waitForTimeout(500);
  await page.click('button:has-text("Place Order")');

  // Verify redirect to buyer orders page
  await page.waitForURL('**/dashboard/buyer/orders');

  // Verify newly placed order exists in the list
  await expect(page.locator('button', { hasText: 'New Order' }).first()).toBeVisible();
  
  // 3. Log out and Log in as the correct Seller
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', sellerLoginId);
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard/seller');

  // Go to Seller Orders page
  await page.goto('http://localhost:3000/dashboard/seller/orders');
  
  // Find the order that is "PLACED" and click Confirm
  await page.locator('button', { hasText: 'New Order' }).first().click();
  
  await page.click('button:has-text("Confirm Order")');
  
  // Wait for status to update to Confirmed
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Confirmed")')).toBeVisible();

  // Ship the order
  await page.click('button:has-text("Mark Shipped")');
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Shipped")')).toBeVisible();

  // Deliver the order
  await page.click('button:has-text("Mark Delivered")');
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Delivered")')).toBeVisible();
});
