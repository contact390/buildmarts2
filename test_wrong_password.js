const http = require('http');

// Test: Login with wrong password
console.log('=== Test: Login with Wrong Password ===');
const wrongLoginData = JSON.stringify({
  email: 'john.smith@test.com',
  password: 'WrongPassword'
});

const wrongLoginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/salesman-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': wrongLoginData.length
  }
};

const wrongLoginReq = http.request(wrongLoginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const response = JSON.parse(body);
    console.log('Response:', JSON.stringify(response, null, 2));
    
    // Test: Get profile
    console.log('\n=== Test: Get Salesman Profile ===');
    const profileOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/salesman-profile/2',
      method: 'GET'
    };

    const profileReq = http.request(profileOptions, (res2) => {
      let body2 = '';
      res2.on('data', (chunk) => { body2 += chunk; });
      res2.on('end', () => {
        console.log('Status:', res2.statusCode);
        const profileResponse = JSON.parse(body2);
        console.log('Response:', JSON.stringify(profileResponse, null, 2));
        process.exit(0);
      });
    });
    profileReq.on('error', console.error);
    profileReq.end();
  });
});

wrongLoginReq.on('error', console.error);
wrongLoginReq.write(wrongLoginData);
wrongLoginReq.end();
