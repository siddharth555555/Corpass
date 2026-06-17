const { test, expect } = require('@playwright/test');

test('Delivery Range and City/Pincode Selection', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Login as Seller
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', 'seller02');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/seller');

  // 2. Set Profile Delivery Range to Local with City
  await page.goto('http://localhost:3000/dashboard/seller/profile');
  await page.click('button:has-text("Edit Settings")');
  
  // Select Local Range
  await page.locator('text=Delivery Range Capability').locator('..').locator('select').selectOption('LOCAL_100KM');
  
  // Search and add city
  await page.fill('input[placeholder="Search and add cities..."]', 'Del');
  await page.waitForSelector('button:has-text("Delhi, Delhi")');
  await page.click('button:has-text("Delhi, Delhi")');
  
  await page.click('button:has-text("Save Settings")');
  await page.waitForTimeout(1000);

  // 3. Add a Product with Hyper Local Pincode
  await page.goto('http://localhost:3000/dashboard/seller/catalog');
  await page.click('button:has-text("Add Product")');
  
  // Fill basic details
  const uniqueId = Date.now().toString();
  const productName = `E2E Desk ${uniqueId}`;
  
  // The first input is name
  await page.fill('form#add-product-form input >> nth=0', productName);
  await page.fill('form#add-product-form textarea', 'Test Desk');
  await page.fill('form#add-product-form input[placeholder="Amount"]', '4000');
  
  // Select Hyper Local
  await page.locator('text=Delivery Range').locator('..').locator('select').selectOption('HYPER_LOCAL_20KM');
  
  // Add pincode
  await page.fill('input[placeholder="Type pincode and press Enter"]', '110001');
  await page.keyboard.press('Enter');
  await page.waitForSelector('span:has-text("110001")');
  
  await page.click('button:has-text("Publish Product")');
  await page.waitForTimeout(1500);

  // 4. Verify as Buyer with WRONG pincode
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  // Update profile to wrong pincode
  await page.goto('http://localhost:3000/dashboard/buyer/profile');
  await page.click('button:has-text("Edit Profile")');
  await page.fill('input[placeholder="6-digit pincode"]', '110002');
  await page.click('button:has-text("Save Changes")');
  await page.waitForSelector('form#edit-profile-form', { state: 'hidden' });

  // Search product
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  
  // Check the 'Show out-of-range' checkbox
  await page.locator('label', { hasText: 'Show out-of-range products' }).locator('input').check();
  
  await page.fill('input[placeholder="Search products, brands or categories..."]', productName);
  await page.waitForTimeout(1500);
  
  // It should show Out of Range
  await expect(page.locator(`text=${productName}`).first()).toBeVisible();
  await expect(page.locator('text=Out of Range').first()).toBeVisible();

  // 5. Update profile to CORRECT pincode
  await page.goto('http://localhost:3000/dashboard/buyer/profile');
  await page.click('button:has-text("Edit Profile")');
  await page.fill('input[placeholder="6-digit pincode"]', '110001');
  await page.click('button:has-text("Save Changes")');
  await page.waitForSelector('form#edit-profile-form', { state: 'hidden' });

  // Search product again
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  await page.fill('input[placeholder="Search products, brands or categories..."]', productName);
  await page.waitForTimeout(1500);
  
  // It should NOT show Out of Range for that product
  // Wait explicitly for the API response by looking for the product title first
  await expect(page.locator(`text=${productName}`).first()).toBeVisible();
  await expect(page.locator('text=Out of Range')).toHaveCount(0);
});
