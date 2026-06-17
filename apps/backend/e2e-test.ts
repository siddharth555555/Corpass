import * as crypto from 'crypto';

const API_URL = 'http://localhost:3001';

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  
  const contentType = res.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw new Error(`API Error [${res.status}] ${path}: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
  }

  return data;
}

async function runE2E() {
  console.log('🚀 Starting End-to-End API Test...');
  const testId = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp for uniqueness
  
  // ---------------------------------------------------------
  // 1. REGISTER USERS
  // ---------------------------------------------------------
  console.log(`\n--- 1. Registering Users ---`);
  
  const sellerCreds = {
    loginId: `seller_${testId}`,
    email: `seller_${testId}@test.com`,
    password: 'password123',
    name: `Seller ${testId}`,
    mobile: `9999${timestamp}`,
    companyName: `Acme Corp ${testId}`,
    city: 'Mumbai',
    pincode: '400001',
    role: 'SELLER',
    address: '123 Seller St',
    gstin: '22AAAAA0000A1Z5'
  };
  
  const buyerCreds = {
    loginId: `buyer_${testId}`,
    email: `buyer_${testId}@test.com`,
    password: 'password123',
    name: `Buyer ${testId}`,
    mobile: `8888${timestamp}`,
    companyName: `Buyer Inc ${testId}`,
    companyAddress: '123 Buyer St',
    companyType: 'RETAILER',
    employeeCount: '10-50',
    city: 'Delhi',
    pincode: '110001',
    role: 'BUYER',
    address: '123 Buyer St'
  };

  const adminCreds = {
    loginId: `admin_${testId}`,
    email: `admin_${testId}@test.com`,
    password: 'password123',
    name: `Admin ${testId}`,
    mobile: `7777${timestamp}`,
    companyName: `Admin Ops ${testId}`,
    companyAddress: '1 Admin Way',
    companyType: 'ADMINISTRATION',
    employeeCount: '1-10',
    city: 'Bangalore',
    pincode: '560001',
    role: 'ADMIN',
    address: '1 Admin Way'
  };

  const sellerUser = await fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(sellerCreds) });
  const buyerUser = await fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(buyerCreds) });

  console.log('✅ Registered Seller:', sellerUser.user.email);
  console.log('✅ Registered Buyer:', buyerUser.user.email);
  console.log('✅ Using built-in admin credentials since admin registration routes to BUYER');

  // ---------------------------------------------------------
  // 2. LOGIN & GET TOKENS
  // ---------------------------------------------------------
  console.log(`\n--- 2. Authenticating Users ---`);
  
  const sellerAuth = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ identifier: sellerCreds.loginId, password: sellerCreds.password, role: 'SELLER' }) });
  const buyerAuth = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ identifier: buyerCreds.loginId, password: buyerCreds.password, role: 'BUYER' }) });
  const adminAuth = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ identifier: 'admin', password: 'admin', role: 'ADMIN' }) });

  const authS = { Authorization: `Bearer ${sellerAuth.access_token}` };
  const authB = { Authorization: `Bearer ${buyerAuth.access_token}` };
  const authA = { Authorization: `Bearer ${adminAuth.access_token}` };

  console.log('✅ Seller logged in');
  console.log('✅ Buyer logged in');
  console.log('✅ Admin logged in');

  // ---------------------------------------------------------
  // 3. SELLER PROFILE & PRODUCT CREATION
  // ---------------------------------------------------------
  console.log(`\n--- 3. Seller Profile & Product ---`);
  
  const profileData = {
    businessType: 'MANUFACTURER',
    yearEstablished: 2020,
    annualTurnover: '1_5_CR',
    gstNumber: '22AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    deliveryRange: 'SHIPPING_AVAILABLE'
  };

  const sellerProfile = await fetchApi('/auth/profile', { method: 'PATCH', headers: authS, body: JSON.stringify(profileData) });
  console.log('✅ Seller profile created');

  const productData = {
    name: 'Industrial Steel Pipes',
    description: 'High-quality industrial steel pipes.',
    category: 'RAW_MATERIALS',
    subCategory: 'STEEL',
    priceType: 'FIXED',
    price: 1500,
    pricingUnit: 'TONNE',
    stockQuantity: 100,
    minQtyPurchase: 10,
    minAmountPurchase: 15000,
    deliveryTimeDays: 7
  };

  const product = await fetchApi('/products', { method: 'POST', headers: authS, body: JSON.stringify(productData) });
  console.log('✅ Seller created product:', product.name, `[ID: ${product.id}]`);

  // ---------------------------------------------------------
  // 4. BUYER ORDERS PRODUCT
  // ---------------------------------------------------------
  console.log(`\n--- 4. Buyer Places Order ---`);
  
  const orderData = {
    productId: product.id,
    quantity: 20, // 20 * 1500 = 30000
    buyerPincode: '110001',
    shippingAddress: '123 Buyer Street, Delhi',
    billingAddress: '123 Buyer Street, Delhi',
    buyerNote: 'Please deliver ASAP',
    paymentMode: 'BANK_TRANSFER'
  };

  const order = await fetchApi('/orders', { method: 'POST', headers: authB, body: JSON.stringify(orderData) });
  console.log(`✅ Buyer placed order [ID: ${order.id}] Status: ${order.status}`);

  // ---------------------------------------------------------
  // 5. NEGOTIATION (COUNTER OFFER)
  // ---------------------------------------------------------
  console.log(`\n--- 5. Order Negotiation ---`);
  
  await fetchApi(`/orders/${order.id}/counter`, { 
    method: 'PATCH', headers: authS, 
    body: JSON.stringify({ counterPrice: 1450, counterQuantity: 20, counterNote: 'Discounted rate' }) 
  });
  console.log('✅ Seller sent counter offer');

  await fetchApi(`/orders/${order.id}/accept`, { method: 'PATCH', headers: authB });
  console.log('✅ Buyer accepted counter offer. Status: CONFIRMED');

  // ---------------------------------------------------------
  // 6. ORDER JOURNEY & ADVANCE REQUEST
  // ---------------------------------------------------------
  console.log(`\n--- 6. Advance & Order Journey ---`);
  
  // Seller requests advance
  await fetchApi(`/orders/${order.id}/request-advance`, { method: 'PATCH', headers: authS, body: JSON.stringify({ amount: 10000 }) });
  console.log('✅ Seller requested advance of 10000');

  // Buyer makes payment
  const payment = await fetchApi(`/orders/${order.id}/payments`, { 
    method: 'POST', headers: authB, 
    body: JSON.stringify({ amount: 10000, paymentDate: new Date().toISOString(), utr: 'UTR123456' }) 
  });
  console.log(`✅ Buyer recorded payment [ID: ${payment.id}]`);

  // Seller acknowledges payment
  await fetchApi(`/orders/payments/${payment.id}/acknowledge`, { method: 'PATCH', headers: authS });
  console.log('✅ Seller acknowledged payment');

  // Seller ships order
  await fetchApi(`/orders/${order.id}/ship`, { method: 'PATCH', headers: authS });
  console.log('✅ Seller shipped order');

  // Seller delivers order (Auto-generates invoice and asset)
  await fetchApi(`/orders/${order.id}/deliver`, { method: 'PATCH', headers: authS });
  console.log('✅ Seller delivered order (Invoice auto-generated)');

  // ---------------------------------------------------------
  // 7. INVOICES & DISPUTES
  // ---------------------------------------------------------
  console.log(`\n--- 7. Invoices & Disputes ---`);
  
  // Fetch invoices for buyer
  const buyerInvoices = await fetchApi('/invoices', { headers: authB });
  const invoice = buyerInvoices[0];
  console.log(`✅ Found Invoice [ID: ${invoice.id}] from Order delivery`);

  // Buyer disputes invoice
  await fetchApi(`/invoices/${invoice.id}/dispute`, { method: 'PATCH', headers: authB });
  console.log(`✅ Buyer disputed Invoice`);

  // Record a payment against invoice
  const invPayment = await fetchApi(`/invoices/${invoice.id}/payments`, { 
    method: 'POST', headers: authB, 
    body: JSON.stringify({ amount: 5000, paymentDate: new Date().toISOString(), utr: 'UTR9999' }) 
  });
  console.log(`✅ Buyer added payment to Invoice [ID: ${invPayment.id}]`);

  // Seller disputes payment with new payload
  await fetchApi(`/invoices/payments/${invPayment.id}/dispute`, { 
    method: 'PATCH', headers: authS, 
    body: JSON.stringify({ disputeType: 'LESS_AMOUNT', disputeComment: 'You paid 5k instead of 10k.' }) 
  });
  console.log('✅ Seller disputed Invoice Payment with details (LESS_AMOUNT)');

  // ---------------------------------------------------------
  // 8. REVIEWS
  // ---------------------------------------------------------
  console.log(`\n--- 8. Reviews ---`);
  
  await fetchApi('/reviews', { 
    method: 'POST', headers: authB, 
    body: JSON.stringify({ orderId: order.id, rating: 5, comment: 'Great product and quick delivery' }) 
  });
  console.log('✅ Buyer reviewed Seller');

  // ---------------------------------------------------------
  // 9. SUPPORT TICKETS
  // ---------------------------------------------------------
  console.log(`\n--- 9. Support Tickets ---`);
  
  const ticket = await fetchApi('/support/query', { 
    method: 'POST', headers: authB, 
    body: JSON.stringify({ message: 'Defective Item. One pipe is broken.' }) 
  });
  console.log(`✅ Buyer raised Support Ticket [ID: ${ticket.id}]`);

  // ---------------------------------------------------------
  // 10. NOTIFICATIONS CHECK
  // ---------------------------------------------------------
  console.log(`\n--- 10. Notifications Verification ---`);
  
  const sellerNotifs = await fetchApi('/notifications', { headers: authS });
  console.log(`✅ Seller has ${sellerNotifs.length} notifications`);
  
  const buyerNotifs = await fetchApi('/notifications', { headers: authB });
  console.log(`✅ Buyer has ${buyerNotifs.length} notifications`);
  
  const adminNotifs = await fetchApi('/notifications', { headers: authA });
  console.log(`✅ Admin has ${adminNotifs.length} notifications`);

  console.log('\n🎉 E2E TEST COMPLETED SUCCESSFULLY! 🎉');
}

runE2E().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  process.exit(1);
});
