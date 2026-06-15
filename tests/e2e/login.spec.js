const { test, expect } = require('@playwright/test');

test('login page test', async ({ page }) => {
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.toString()}`);
  });

  console.log('Navigating to http://localhost:3000/login...');
  await page.goto('http://localhost:3000/login');

  console.log('Page loaded. Checking title...');
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Check the initial text of the submit button
  let submitBtnText = await page.textContent('button[type="submit"]');
  console.log(`Initial submit button text: "${submitBtnText?.trim()}"`);

  // Click the "I am a Seller" button
  console.log('Clicking "I am a Seller" button...');
  await page.click('button:has-text("I am a Seller")');

  // Wait a short bit to allow React state update
  await page.waitForTimeout(1000);

  // Check the text of the submit button again
  submitBtnText = await page.textContent('button[type="submit"]');
  console.log(`Submit button text after click: "${submitBtnText?.trim()}"`);

  // Try logging in with invalid credentials to see if it shows error message
  console.log('Entering credentials...');
  await page.fill('#identifier', 'invalid_user');
  await page.fill('#password', 'wrong_password');
  
  console.log('Submitting form...');
  await page.click('button[type="submit"]');
  
  // Wait for error message or navigation
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  console.log(`Current URL after submit: ${currentUrl}`);
  
  // Check if error message container is visible
  const errorContainer = await page.$('.bg-danger-50');
  if (errorContainer) {
    const errorMessage = await errorContainer.textContent();
    console.log(`Error message displayed: "${errorMessage?.trim()}"`);
  } else {
    console.log('No error message element found.');
  }
});
