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

test('Corpass All-Features E2E Testing Suite (Both Roles)', async ({ page }) => {
  test.setTimeout(120000);

  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[BROWSER ERROR]: ${err.toString()}`));

  // -------------------------------------------------------------
  // PART 1: BUYER FLOWS
  // -------------------------------------------------------------
  console.log('=== PART 1: BUYER FLOWS ===');
  console.log('Logging in as Buyer...');
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');
  console.log('✓ Buyer logged in.');

  // Feature: Update Buyer Profile
  console.log('Navigating to Buyer Profile...');
  await page.goto('http://localhost:3000/dashboard/buyer/profile');
  await page.click('button:has-text("Edit Profile")');
  await page.fill('#edit-profile-form input[type="text"] >> nth=3', 'Mumbai'); // City input
  await page.click('button:has-text("Save Changes")');
  await page.waitForTimeout(1000);
  console.log('✓ Buyer Profile city updated to Mumbai.');

  // Feature: Send Product Inquiry
  console.log('Navigating to Catalog for Inquiry...');
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  await page.waitForSelector('button:has-text("Inquire")');
  
  // Extract supplier details for dynamic login later
  const firstSupplierText = await page.locator('.flex.items-center.gap-2 span.truncate').first().textContent();
  const sellerName = firstSupplierText ? firstSupplierText.trim() : '';
  const sellerLoginId = nameToLoginId[sellerName] || 'seller01';
  console.log(`Product belongs to supplier: "${sellerName}" (loginId: ${sellerLoginId})`);

  console.log('Clicking Inquire...');
  await page.click('button:has-text("Inquire") >> nth=0');
  await page.waitForSelector('form#inquiry-form');
  await page.fill('form#inquiry-form textarea', 'E2E Testing: Do you support customized shipping speeds for bulk?');
  await page.click('button:has-text("Send Inquiry")');
  await page.waitForTimeout(1000);
  console.log('✓ Product Inquiry sent.');

  // Feature: Send Custom RFQ (Direct Request to Vendor)
  console.log('Navigating to RFQs page...');
  await page.goto('http://localhost:3000/dashboard/buyer/rfqs');
  await page.click('button:has-text("Custom Request")');
  await page.waitForSelector('form#custom-rfq-form');
  await page.fill('form#custom-rfq-form input[placeholder*="e.g."]', 'E2E Custom Request: 15 Premium Steel Workbenches');
  await page.fill('form#custom-rfq-form textarea', 'Need industrial grade with ESD protection.');
  await page.click('button:has-text("Send Inquiry")');
  await page.waitForTimeout(1000);
  console.log('✓ Custom RFQ sent.');

  // Feature: Place Buy Now Online Order
  console.log('Navigating to Catalog for Purchase...');
  await page.goto('http://localhost:3000/dashboard/buyer/catalog');
  
  // Apply a pincode first so products are visible
  await page.waitForSelector('input[placeholder="6 Digit Pincode"]');
  await page.fill('input[placeholder="6 Digit Pincode"]', '110001');
  await page.click('button[title="Apply Pincode"]');

  await page.waitForSelector('button:has-text("Buy Now"):not([disabled])');
  await page.click('button:has-text("Buy Now"):not([disabled]) >> nth=0');
  await page.waitForSelector('input[type="number"]');
  await page.fill('input[type="number"]', '');
  await page.fill('input[type="number"]', '10');
  
  // Fill the mandatory shipping address
  await page.fill('textarea[placeholder="Enter delivery address..."]', '123 E2E Test Street, Building B');
  await page.fill('textarea[placeholder="Custom requirements..."]', 'E2E online purchase order.');
  
  await page.click('button:has-text("Place Order")');
  await page.waitForURL('**/dashboard/buyer/orders');
  console.log('✓ Buy Now Order placed.');

  // Feature: Create Manual Invoice for onsite/offline transaction
  console.log('Creating Manual Invoice for offline deal...');
  await page.click('button:has-text("Invoices")');
  await page.click('button:has-text("Create Invoice") >> nth=0'); // The tab button
  await page.waitForSelector('form#inv-form');
  // Fill manual invoice form
  await page.selectOption('form#inv-form select >> nth=0', { label: sellerName });
  await page.fill('form#inv-form input >> nth=0', 'Onsite Raw Wooden Boards');
  await page.fill('form#inv-form input >> nth=1', '1200'); // unit price
  await page.fill('form#inv-form input >> nth=2', '15');   // quantity
  await page.fill('form#inv-form textarea', 'Manually created invoice for offline pickup.');
  await page.click('button[type="submit"][form="inv-form"]'); // Precise form submit button selector
  await page.waitForTimeout(1000);
  console.log('✓ Manual Invoice created.');

  // -------------------------------------------------------------
  // PART 2: SELLER FLOWS
  // -------------------------------------------------------------
  console.log('=== PART 2: SELLER FLOWS ===');
  console.log(`Logging out and logging in as Seller (${sellerLoginId})...`);
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Seller")');
  await page.fill('#identifier', sellerLoginId);
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/seller');
  console.log('✓ Seller logged in.');

  // Feature: Add New Product to Catalog
  console.log('Adding a new product to Seller catalog...');
  await page.click('button:has-text("Add Product")');
  await page.waitForSelector('form#add-product-form');
  await page.fill('form#add-product-form input >> nth=0', 'E2E Testing Ergonomic Chair');
  await page.fill('form#add-product-form textarea', 'High quality premium mesh seating with lumbar support.');
  await page.fill('form#add-product-form input[placeholder="Amount"]', '8500');
  await page.click('button:has-text("Publish Product")');
  await page.waitForTimeout(1500);
  console.log('✓ Seller Product published successfully.');

  // Feature: Respond to Buyer Inquiries (RFQs)
  console.log('Navigating to Seller Inquiries...');
  await page.goto('http://localhost:3000/dashboard/seller/inquiries');
  
  // Respond to first inquiry (Product inquiry)
  await page.waitForSelector('button:has-text("Write Response")');
  await page.click('button:has-text("Write Response") >> nth=0');
  await page.waitForSelector('form#respond-form');
  await page.fill('form#respond-form textarea', 'Response from E2E: Yes, we offer priority air shipping for bulk.');
  if (await page.locator('form#respond-form input[type="number"]').isVisible()) {
    await page.fill('form#respond-form input[type="number"]', '23000');
  }
  await page.click('button:has-text("Submit Response")');
  await page.waitForTimeout(1000);
  console.log('✓ Seller Responded to Product Inquiry.');

  // Respond to second inquiry (Custom RFQ)
  if (await page.locator('button:has-text("Write Response")').isVisible()) {
    await page.click('button:has-text("Write Response") >> nth=0');
    await page.waitForSelector('form#respond-form');
    await page.fill('form#respond-form textarea', 'Response from E2E: We can customize the benches with steel finishes.');
    if (await page.locator('form#respond-form input[type="number"]').isVisible()) {
      await page.fill('form#respond-form input[type="number"]', '54000');
    }
    await page.click('button:has-text("Submit Response")');
    await page.waitForTimeout(1000);
    console.log('✓ Seller Responded to Custom RFQ.');
  }

  // Feature: Update Seller Profile Settings
  console.log('Navigating to Seller Profile...');
  await page.goto('http://localhost:3000/dashboard/seller/profile');
  await page.click('button:has-text("Edit Settings")');
  await page.fill('#edit-vendor-form input[type="text"] >> nth=3', 'Bengaluru'); // City input
  await page.click('button:has-text("Save Settings")');
  await page.waitForTimeout(1000);
  console.log('✓ Seller Settings updated.');

  // Feature: Order Fulfillment Lifecycle
  console.log('Navigating to Seller Orders...');
  await page.goto('http://localhost:3000/dashboard/seller/orders');
  await page.waitForSelector('span:has-text("New Order")');
  
  // Confirm
  await page.click('button:has-text("Confirm") >> nth=0');
  await page.waitForSelector('span:has-text("Confirmed")');
  console.log('✓ Seller confirmed order.');

  // Ship
  await page.click('button:has-text("Mark Shipped") >> nth=0');
  await page.waitForSelector('span:has-text("Shipped")');
  console.log('✓ Seller shipped order.');

  // Deliver (Triggers Auto-Invoice)
  await page.click('button:has-text("Mark Delivered") >> nth=0');
  await page.waitForSelector('span:has-text("Delivered")');
  console.log('✓ Seller delivered order.');

  // Feature: Acknowledge Invoices
  console.log('Checking Invoices Tab...');
  await page.click('button:has-text("Invoices")');
  
  // Acknowledge the newly generated Auto-invoice (if button visible)
  const sellerAckBtn = page.locator('button:has-text("Acknowledge") >> nth=0');
  if (await sellerAckBtn.isVisible()) {
    await sellerAckBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ Seller acknowledged Auto-generated invoice.');
  }

  // Acknowledge the Manual invoice created by the buyer
  if (await page.locator('button:has-text("Acknowledge")').isVisible()) {
    await page.click('button:has-text("Acknowledge") >> nth=0');
    await page.waitForTimeout(1000);
    console.log('✓ Seller acknowledged Buyer Manual invoice.');
  }

  // -------------------------------------------------------------
  // PART 3: BUYER VERIFICATION
  // -------------------------------------------------------------
  console.log('=== PART 3: BUYER VERIFICATION ===');
  console.log('Logging out and back in as Buyer (candi) for final verification...');
  await page.evaluate(() => localStorage.removeItem('access_token'));
  await page.goto('http://localhost:3000/login');
  await page.click('button:has-text("I am a Company")');
  await page.fill('#identifier', 'candi');
  await page.fill('#password', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/buyer');

  // Verify Invoice dual acknowledgement success
  console.log('Checking dual acknowledged invoices...');
  await page.goto('http://localhost:3000/dashboard/buyer/orders');
  await page.click('button:has-text("Invoices")');
  await page.waitForSelector('span:has-text("Auto")');
  
  // Acknowledge the Auto-invoice on the buyer side
  const buyerAckBtn = page.locator('button:has-text("Acknowledge") >> nth=0');
  if (await buyerAckBtn.isVisible()) {
    await buyerAckBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.waitForSelector('span:has-text("Acknowledged")');
  console.log('✓ Verified: Auto-invoice dual-acknowledgement successfully set to ACKNOWLEDGED!');

  // Verify RFQ responses are loaded
  console.log('Checking RFQ responses...');
  await page.goto('http://localhost:3000/dashboard/buyer/rfqs');
  await page.waitForSelector('span:has-text("RESPONDED")');
  console.log('✓ Verified: RFQ/Inquiry Responses successfully loaded.');

  console.log('=== ALL FEATURES E2E SUITE COMPLETED SUCCESSFULLY ===');
});
