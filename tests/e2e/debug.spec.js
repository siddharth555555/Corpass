const { test, expect } = require('@playwright/test');

test('Debug User Profile', async ({ request }) => {
  const loginRes = await request.post('http://localhost:3001/auth/login', {
    data: { identifier: 'candi', password: 'Test@1234' }
  });
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  
  const meRes = await request.get('http://localhost:3001/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log("BUYER ME DATA:", meData);
  
  const productsRes = await request.get('http://localhost:3001/products/marketplace?buyerPincode=110002&search=E2E', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const productsData = await productsRes.json();
  console.log("PRODUCTS DATA (First 1):", JSON.stringify(productsData.slice(0, 1), null, 2));
});
