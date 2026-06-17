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

test('Corpass All-Features E2E Testing Suite (Both Roles)', async ({ page }) => {
  test.setTimeout(120000);

  // -------------------------------------------------------------
  // PART 1: BUYER FLOWS
  // -------------------------------------------------------------
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  // Feature: Update Buyer Profile
  await page.goto('http://localhost:3000/dashboard/buyer/profile');
  await page.click('button:has-text("Edit Profile")');
  await page.fill('#edit-profile-form input[type="text"] >> nth=3', 'Mumbai'); // City input
  await page.click('button:has-text("Save Changes")');
  await page.waitForTimeout(1000);

  // Feature: Send Product Inquiry
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  await page.waitForSelector('button:has-text("Inquire")');
  
  // Extract supplier details for dynamic login later
  const firstSupplierText = await page.locator('.flex.items-center.gap-2 span.truncate').first().textContent();
  const sellerName = firstSupplierText ? firstSupplierText.trim() : '';
  const sellerLoginId = nameToLoginId[sellerName] || 'seller01';

  await page.click('button:has-text("Inquire") >> nth=0');
  await page.waitForSelector('form#inquiry-form');
  await page.fill('form#inquiry-form textarea', 'E2E Testing: Do you support customized shipping speeds for bulk?');
  await page.click('button:has-text("Send Inquiry")');
  await page.waitForTimeout(1000);

  // (Removed Custom Request feature since it was removed in UI redesign)

  // Feature: Place Buy Now Online Order
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  
  await page.waitForSelector('button:has-text("Buy Now"):not([disabled])');
  await page.click('button:has-text("Buy Now"):not([disabled]) >> nth=0');
  await page.waitForSelector('input[type="number"]');
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '10');
  
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street, Building B');
  await page.selectOption('#payment-mode-select', 'BANK_TRANSFER');
  await page.click('button:has-text("Place Order")');
  await page.waitForURL('**/dashboard/buyer/orders');

  // -------------------------------------------------------------
  // PART 2: SELLER FLOWS
  // -------------------------------------------------------------
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', sellerLoginId);
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/seller');

  // Feature: Add New Product to Catalog
  await page.click('button:has-text("Add Product")');
  await page.waitForSelector('form#add-product-form');
  await page.fill('form#add-product-form input >> nth=0', 'E2E Testing Ergonomic Chair');
  await page.fill('form#add-product-form textarea', 'High quality premium mesh seating with lumbar support.');
  await page.fill('form#add-product-form input[placeholder="Amount"]', '8500');
  await page.click('button:has-text("Publish Product")');
  await page.waitForTimeout(1500);

  // Feature: Respond to Buyer Inquiries
  await page.goto('http://localhost:3000/dashboard/seller/messages');
  
  // Need to select the inquiry thread
  await page.waitForSelector('span:has-text("Company")');
  await page.locator('button:has-text("Company")').first().click();
  await page.waitForSelector('textarea[placeholder="Type your message..."]');
  await page.fill('textarea[placeholder="Type your message..."]', 'Response from E2E: Yes, we offer priority air shipping for bulk.');
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(1000);

  // Feature: Update Seller Profile Settings
  await page.goto('http://localhost:3000/dashboard/seller/profile');
  await page.click('button:has-text("Edit Settings")');
  await page.fill('#edit-vendor-form input[type="text"] >> nth=3', 'Bengaluru'); // City input
  await page.click('button:has-text("Save Settings")');
  await page.waitForTimeout(1000);

  // Feature: Order Fulfillment Lifecycle
  await page.goto('http://localhost:3000/dashboard/seller/orders');
  await page.waitForSelector('button:has-text("PLACED")');
  
  // Select the order
  await page.locator('button', { hasText: 'New Order' }).first().click();

  // Confirm
  await page.click('button:has-text("Confirm Order")');
  await expect(page.locator('.p-5.border-b').locator('span:has-text("Confirmed")')).toBeVisible();

  // Demand an advance instead of Invoices!
  await page.click('button:has-text("payments")');
  await page.fill('input[placeholder="Amount (₹)"]', '500');
  await page.click('button:has-text("Request")');
  await expect(page.locator('span:has-text("Advance Requested")')).toBeVisible();

  // -------------------------------------------------------------
  // PART 3: BUYER VERIFICATION
  // -------------------------------------------------------------
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  // Verify advance requested
  await page.goto('http://localhost:3000/dashboard/buyer/orders');
  await expect(page.locator('button', { hasText: 'New Order' }).first()).toBeVisible();
  await page.click('button:has-text("payments")');
  await expect(page.locator('span:has-text("Advance Required")')).toBeVisible();

  // Verify RFQ responses are loaded
  await page.goto('http://localhost:3000/dashboard/buyer/messages');
  await page.waitForSelector('div:has-text("Response from E2E")');
});
