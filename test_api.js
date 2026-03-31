const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test789@test.com',
  address: '123 Test St',
  password: 'testpass123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/salesman-profile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, JSON.stringify(res.headers));
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (error) => {
  console.error('ERROR:', error.message);
});

req.write(data);
req.end();
