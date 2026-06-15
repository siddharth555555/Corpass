const { test, expect } = require('@playwright/test');

test('Support Page E2E Test', async ({ page }) => {
  // Increase timeout for this specific test
  test.setTimeout(60000);

  // 1. Log in as Buyer
  console.log('Logging in to test support page...');
  await page.goto('http://localhost:3000/login');
  
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');

  // Verify we land on the dashboard
  await page.waitForURL('**/dashboard/buyer');
  console.log('Logged in as Buyer successfully.');

  // 2. Navigate to Support page
  console.log('Navigating to Support page...');
  await page.click('text=Support');
  await page.waitForURL('**/dashboard/buyer/support');
  console.log('Arrived at Support page.');

  // 3. Verify Contact Information exists
  console.log('Verifying WhatsApp and Email info is visible...');
  await expect(page.locator('text=+91 93301 48030')).toBeVisible();
  await expect(page.locator('text=siddharth251002@gmail.com')).toBeVisible();

  // 4. Fill and Submit a Query
  console.log('Filling out support query...');
  await page.fill('input#subject', 'Test Query Subject');
  await page.fill('textarea#message', 'This is an automated test message from Playwright for the newly built Support page.');
  
  // Submit
  await page.click('button:has-text("Submit Query")');

  // Verify successful toast message appears
  console.log('Waiting for success toast...');
  await expect(page.locator('text=Query submitted successfully')).toBeVisible();

  console.log('Support page E2E test completed successfully!');
});
