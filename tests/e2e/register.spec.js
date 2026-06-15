const { test, expect } = require('@playwright/test');

test('register page role toggle test', async ({ page }) => {
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.toString()}`);
  });

  console.log('Navigating to http://localhost:3000/register...');
  await page.goto('http://localhost:3000/register');

  console.log('Page loaded. Checking subtitle...');
  let subtitle = await page.textContent('p.text-text-secondary');
  console.log(`Initial subtitle: "${subtitle?.trim()}"`);

  // Click "I am a Seller" button
  console.log('Clicking "I am a Seller" button...');
  await page.click('button:has-text("I am a Seller")');

  // Wait a short bit to allow React state update
  await page.waitForTimeout(1000);

  // Check the subtitle again
  subtitle = await page.textContent('p.text-text-secondary');
  console.log(`Subtitle after click: "${subtitle?.trim()}"`);

  // Assert it changed correctly
  expect(subtitle).toContain('Register as a seller');
  console.log('Role toggle test passed successfully.');
});
