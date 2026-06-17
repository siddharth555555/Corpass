const { test, expect } = require('@playwright/test');

test('Verify Buyer Dashboard loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  await page.click('text="I am a Company"');
  await page.fill('input[type="text"]', '9330148030');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Sign In")');
  
  await page.waitForURL('**/dashboard/buyer');
  await page.waitForSelector('text="Siddharth Jaiswal"');
  await page.waitForSelector('text="Corpass"');
  
  const html = await page.content();
  if (html.includes('Loading...')) {
    throw new Error("Page still says Loading...");
  }
});
