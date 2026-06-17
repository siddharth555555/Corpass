const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );
  
  await page.goto('http://localhost:3000/login');
  
  // Try logging in
  await page.click('text="I am a Company"');
  await page.fill('input[type="text"]', '9330148030');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Sign In")');
  
  await page.waitForTimeout(2000);
  console.log('Current URL:', page.url());
  
  // Go to buyer dashboard
  await page.goto('http://localhost:3000/dashboard/buyer');
  await page.waitForTimeout(2000);
  
  const html = await page.content();
  console.log('Sidebar user loaded?', html.includes('Siddharth Jaiswal'));
  console.log('Sidebar workspace loaded?', html.includes('Corpass') && !html.includes('Loading...'));
  
  await browser.close();
})();
