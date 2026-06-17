const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/products/marketplace?buyerPincode=110001&search=E2E',
  method: 'GET',
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', d => { data += d; });
  res.on('end', () => { console.log("Response:", data); });
});

req.on('error', error => { console.error(error); });
req.end();
