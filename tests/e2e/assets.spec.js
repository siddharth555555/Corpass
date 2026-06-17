const { test, expect } = require('@playwright/test');

const nameToLoginId = {
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

test('asset management flow', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Log in as Buyer
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  // 2. Go to Assets and manually add one
  await page.goto('http://localhost:3000/dashboard/buyer/assets');
  await page.click('button:has-text("Add Asset")');
  await page.fill('input[placeholder="e.g. Dell XPS 15"]', 'Office Printer X');
  await page.selectOption('select', 'Hardware');
  // Fill "Good" condition quantity
  await page.locator('div.flex.items-center:has(label:text-is("Good")) >> input[type="number"]').fill('3');
  await page.fill('textarea', 'Manual test asset');
  await page.click('button:has-text("Save Asset")');

  await page.waitForSelector('h3:has-text("Office Printer X")');

  // 3. Procure a new asset via Order Flow
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  await page.waitForSelector('button:has-text("Buy Now")');
  
  const sellerText = await page.locator('.flex.items-center.gap-2 span.truncate').first().textContent();
  const sellerName = sellerText ? sellerText.trim() : '';
  const sellerLoginId = nameToLoginId[sellerName] || 'seller01';
  
  await page.click('button:has-text("Buy Now") >> nth=0');
  await page.waitForSelector('input[type="number"]');
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '500');
  
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street');
  await page.selectOption('#payment-mode-select', 'BANK_TRANSFER');
  await page.click('button:has-text("Place Order")');
  
  await page.waitForURL('**/dashboard/buyer/orders');
  await expect(page.locator('button', { hasText: 'New Order' }).first()).toBeVisible();

  // Log out and log in as seller
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', sellerLoginId);
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/seller');

  // Seller Dashboard: Confirm -> Ship -> Deliver
  await page.goto('http://localhost:3000/dashboard/seller/orders');
  await page.locator('button', { hasText: 'PLACED' }).first().click();

  await page.click('button:has-text("Confirm Order")');
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Confirmed")')).toBeVisible();
  
  await page.click('button:has-text("Mark Shipped")');
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Shipped")')).toBeVisible();
  
  await page.click('button:has-text("Mark Delivered")');
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Delivered")')).toBeVisible();

  // Back to Buyer to verify automatic asset ingestion
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  await page.goto('http://localhost:3000/dashboard/buyer/assets');
  // It should now have a new asset with Perfect condition and Source order number
  await page.waitForSelector('p:has-text("Source")');
  await page.waitForSelector('span:has-text("Perfect")'); // auto generated
});
