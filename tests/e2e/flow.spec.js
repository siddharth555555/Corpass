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

  // Individual Names (fallback)
  'Simar Kumar': 'sidd',
  'Rajesh Patel': 'seller01',
  'Priya Sharma': 'seller02',
  'Amit Verma': 'seller03',
  'Sneha Iyer': 'seller04',
  'Vikram Singh': 'seller05',
  'Meera Gupta': 'seller06',
  'Arjun Nair': 'seller07',
  'Kavita Reddy': 'seller08',
  'Suresh Kumar': 'seller09',
  'Divya Menon': 'seller10',
  'Rohit Joshi': 'seller11',
  'Ananya Das': 'seller12',
  'Karthik Rajan': 'seller13',
  'Neha Agarwal': 'seller14',
  'Sanjay Mishra': 'seller15',
  'Pooja Bhat': 'seller16',
  'Manish Tiwari': 'seller17',
  'Ritu Saxena': 'seller18',
  'Arun Pillai': 'seller19',
  'Lakshmi Rao': 'seller20',
};

test('end-to-end B2B procurement flow', async ({ page }) => {
  // Set longer timeout
  test.setTimeout(90000);

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR]: ${err.toString()}`);
  });

  // 1. Log in as Buyer
  console.log('--- STEP 1: Log in as Buyer (candi) ---');
  await page.goto('http://localhost:3000/login');
  
  // Click Company switch tab
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');

  // Verify we land on the dashboard
  await page.waitForURL('**/dashboard/buyer');
  console.log('Logged in as Buyer successfully.');

  // 2. Go to Catalog and place a "Buy Now" order
  console.log('--- STEP 2: Navigate to Catalog ---');
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  
  // Wait for product cards to load
  await page.waitForSelector('button:has-text("Buy Now")');
  
  // Identify the seller name of the first product card
  const sellerText = await page.locator('.flex.items-center.gap-2 span.truncate').first().textContent();
  const sellerName = sellerText ? sellerText.trim() : '';
  const sellerLoginId = nameToLoginId[sellerName] || 'seller01';
  console.log(`First product belongs to supplier: "${sellerName}" (loginId: ${sellerLoginId})`);

  // Apply a pincode first so products are visible and deliverable
  await page.waitForSelector('input[placeholder="6 Digit Pincode"]');
  await page.fill('input[placeholder="6 Digit Pincode"]', '110001');
  await page.click('button[title="Apply Pincode"]');
  await page.waitForTimeout(500);

  // Click Buy Now on the first available product
  console.log('Clicking Buy Now...');
  await page.waitForSelector('button:has-text("Buy Now"):not([disabled])');
  await page.click('button:has-text("Buy Now"):not([disabled]) >> nth=0');

  // Fill modal form
  console.log('Filling Buy Now form...');
  await page.waitForSelector('input[type="number"]');
  // Clear  // Fill order quantity and note
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '10');
  
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street');
  await page.fill('textarea[placeholder="Custom requirements..."]', 'E2E purchase order note.');

  // Click Place Order
  await page.waitForTimeout(500);
  await page.click('button:has-text("Place Order")');

  // Verify redirect to buyer orders page
  await page.waitForURL('**/dashboard/buyer/orders');
  console.log('Order placed and redirected to orders tab.');

  // Verify newly placed order exists in the list (wait for the "Placed" badge)
  await page.waitForSelector('span:has-text("Placed")');
  console.log('Placed order visible on Buyer dashboard.');

  // 3. Log out and Log in as the correct Seller
  console.log(`--- STEP 3: Log in as Seller (${sellerLoginId}) ---`);
  // Log out by clearing token and going to login
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  
  // Click Seller switch tab
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', sellerLoginId);
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');

  // Verify landing on seller dashboard
  await page.waitForURL('**/dashboard/seller');
  console.log('Logged in as Seller successfully.');

  // Go to Seller Orders page
  await page.goto('http://localhost:3000/dashboard/seller/orders');
  
  // Find the order that is "Placed" and click Confirm (seller renders "New Order" instead of "Placed")
  console.log('Finding Placed order (New Order) to Confirm...');
  await page.waitForSelector('span:has-text("New Order")');
  await page.click('button:has-text("Confirm") >> nth=0');
  
  // Wait for status to update to Confirmed
  await page.waitForSelector('span:has-text("Confirmed")');
  console.log('Order confirmed successfully.');

  // Ship the order
  console.log('Marking order as Shipped...');
  await page.click('button:has-text("Mark Shipped") >> nth=0');
  await page.waitForSelector('span:has-text("Shipped")');
  console.log('Order marked as Shipped.');

  // Deliver the order (this triggers the auto-invoice)
  console.log('Marking order as Delivered...');
  await page.click('button:has-text("Mark Delivered") >> nth=0');
  await page.waitForSelector('span:has-text("Delivered")');
  console.log('Order marked as Delivered.');

  // Go to Invoices tab
  console.log('Checking Invoices tab...');
  await page.click('button:has-text("Invoices")');
  
  // The newly delivered order should generate a pending invoice.
  await page.waitForSelector('span:has-text("Auto")');
  console.log('Auto-generated invoice found on Seller dashboard.');

  // Acknowledge the invoice on the Seller side (Seller auto-ack is already done or can click)
  const ackBtn = page.locator('button:has-text("Acknowledge") >> nth=0');
  if (await ackBtn.isVisible()) {
    console.log('Clicking Seller Acknowledge on invoice...');
    await ackBtn.click();
    await page.waitForTimeout(1000);
  } else {
    console.log('Invoice already acknowledged by Seller.');
  }

  // 4. Log out and Log back in as Buyer (candi) to acknowledge invoice
  console.log('--- STEP 4: Acknowledge invoice as Buyer (candi) ---');
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  
  // Wait for login to complete and redirect to dashboard first (prevents race condition)
  await page.waitForURL('**/dashboard/buyer');
  console.log('Logged back in as Buyer successfully.');
  
  // Go to Buyer Orders page
  await page.goto('http://localhost:3000/dashboard/buyer/orders');
  
  // Switch to Invoices tab
  await page.click('button:has-text("Invoices")');
  
  // Verify invoice exists
  await page.waitForSelector('span:has-text("Auto")');
  console.log('Buyer sees the Auto-generated invoice.');

  // Click Acknowledge as Buyer
  console.log('Clicking Buyer Acknowledge on invoice...');
  await page.click('button:has-text("Acknowledge") >> nth=0');
  
  // Once buyer acknowledges, both sides are checked, status should become ACKNOWLEDGED
  await page.waitForSelector('span:has-text("Acknowledged")');
  console.log('Invoice status is now ACKNOWLEDGED! E2E Flow Completed Successfully!');
});
