import { PrismaClient } from '@prisma/client';
import * as assert from 'assert';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3003';

async function fetchApi(path: string, method: string, body?: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- Starting Reviews E2E Tests ---');

  // 1. Get an existing delivered order
  const order = await prisma.order.findFirst({
    where: { status: 'DELIVERED' },
    include: { buyer: true, sellerProfile: { include: { user: true } } }
  });

  if (!order) {
    console.log('No DELIVERED order found. Please ensure there is at least one delivered order.');
    process.exit(1);
  }

  // Clear existing reviews for this order to have a fresh state
  await prisma.review.deleteMany({ where: { orderId: order.id } });

  console.log(`Using Order ID: ${order.id}`);

  // 2. Generate tokens for buyer and seller by forcing a new login or just signing a new JWT?
  // Easier to login if we know password, but we don't.
  // We can just manually generate tokens if we import JwtService or we can reset password for them.
  // Wait, let's just get the users and bypass login by doing a raw DB update to known password, then login.
  
  const testPassword = 'TestPassword123!';
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash(testPassword, 10);

  // Update both buyer and seller passwords
  await prisma.user.updateMany({
    where: { id: { in: [order.buyerId, order.sellerProfile.userId] } },
    data: { password: hash }
  });

  // Login Buyer
  const buyerLogin = await fetchApi('/auth/login', 'POST', { identifier: order.buyer.loginId, password: testPassword });
  assert.equal(buyerLogin.status, 200, 'Buyer login failed');
  const buyerToken = buyerLogin.data.access_token;
  
  // Login Seller
  const sellerLogin = await fetchApi('/auth/login', 'POST', { identifier: order.sellerProfile.user.loginId, password: testPassword });
  assert.equal(sellerLogin.status, 200, 'Seller login failed');
  const sellerToken = sellerLogin.data.access_token;

  // 3. Test Buyer Submits Review
  console.log('Testing Buyer Review Submission...');
  const buyerReviewRes = await fetchApi('/reviews', 'POST', {
    orderId: order.id,
    rating: 4,
    comment: 'Great supplier, fast delivery!'
  }, buyerToken);
  
  assert.equal(buyerReviewRes.status, 201, 'Buyer review submission failed');
  console.log('✅ Buyer review submitted successfully');

  // 4. Test Duplicate Buyer Review
  console.log('Testing Duplicate Review Block...');
  const duplicateReviewRes = await fetchApi('/reviews', 'POST', {
    orderId: order.id,
    rating: 5,
    comment: 'Trying to review again'
  }, buyerToken);
  
  assert.equal(duplicateReviewRes.status, 409, 'Duplicate review should be blocked with 409');
  console.log('✅ Duplicate review correctly blocked');

  // 5. Test Seller Submits Review
  console.log('Testing Seller Review Submission...');
  const sellerReviewRes = await fetchApi('/reviews', 'POST', {
    orderId: order.id,
    rating: 5,
    comment: 'Excellent buyer, prompt payment.'
  }, sellerToken);
  
  assert.equal(sellerReviewRes.status, 201, 'Seller review submission failed');
  console.log('✅ Seller review submitted successfully');

  // 6. Test Fetching Stats for Supplier
  console.log('Testing Fetch Supplier Stats...');
  const statsRes = await fetchApi(`/reviews/stats/${order.sellerProfile.userId}`, 'GET');
  assert.equal(statsRes.status, 200, 'Failed to fetch stats');
  assert.ok(statsRes.data.averageRating > 0, 'Average rating should be > 0');
  assert.ok(statsRes.data.totalReviews >= 1, 'Total reviews should be >= 1');
  console.log('✅ Stats fetched successfully: ', statsRes.data);

  console.log('--- All Reviews Tests Passed Successfully! ---');
  process.exit(0);
}

runTests().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
