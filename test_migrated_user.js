const http = require('http');

// Test: Login first user (whose password was migrated from plain text)
console.log('=== Test: Login Migrated User ===');
const loginData = JSON.stringify({
  email: 'test789@test.com',
  password: 'testpass123'  // Original plain text password
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/salesman-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const response = JSON.parse(body);
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS! User with migrated password can login');
      console.log('User:', response.user);
    } else {
      console.log('❌ FAILED:', response.error);
    }
    process.exit(0);
  });
});

loginReq.on('error', console.error);
loginReq.write(loginData);
loginReq.end();
