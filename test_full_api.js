const http = require('http');

// Test 1: Register new salesman
console.log('=== Test 1: Register Salesman ===');
const registerData = JSON.stringify({
  name: 'John Smith',
  email: 'john.smith@test.com',
  phone: '9876543210',
  company: 'Smith Enterprises',
  address: '456 Main Street',
  password: 'SecurePassword123',
  gst: 'GST12345'
});

const registerOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/salesman-profile',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

const registerReq = http.request(registerOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const response = JSON.parse(body);
    console.log('Response:', JSON.stringify(response, null, 2));
    
    // Test 2: Login with correct password
    console.log('\n=== Test 2: Login with Correct Password ===');
    const loginData = JSON.stringify({
      email: 'john.smith@test.com',
      password: 'SecurePassword123'
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

    const loginReq = http.request(loginOptions, (res2) => {
      let body2 = '';
      res2.on('data', (chunk) => { body2 += chunk; });
      res2.on('end', () => {
        console.log('Status:', res2.statusCode);
        const loginResponse = JSON.parse(body2);
        console.log('Response:', JSON.stringify(loginResponse, null, 2));

        // Test 3: Login with wrong password
        console.log('\n=== Test 3: Login with Wrong Password ===');
        const wrongLoginData = JSON.stringify({
          email: 'john.smith@test.com',
          password: 'WrongPassword'
        });

        const loginReq2 = http.request(loginOptions, (res3) => {
          let body3 = '';
          res3.on('data', (chunk) => { body3 += chunk; });
          res3.on('end', () => {
            console.log('Status:', res3.statusCode);
            const loginResponse2 = JSON.parse(body3);
            console.log('Response:', JSON.stringify(loginResponse2, null, 2));
            
            // Test 4: Get profile
            if (response.user && response.user.id) {
              console.log('\n=== Test 4: Get Salesman Profile ===');
              const profileOptions = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/salesman-profile/' + response.user.id,
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              };

              const profileReq = http.request(profileOptions, (res4) => {
                let body4 = '';
                res4.on('data', (chunk) => { body4 += chunk; });
                res4.on('end', () => {
                  console.log('Status:', res4.statusCode);
                  const profileResponse = JSON.parse(body4);
                  console.log('Response:', JSON.stringify(profileResponse, null, 2));
                  process.exit(0);
                });
              });
              profileReq.on('error', console.error);
              profileReq.end();
            } else {
              process.exit(0);
            }
          });
        });
        loginReq2.on('error', console.error);
        loginReq2.write(wrongLoginData);
        loginReq2.end();
      });
    });
    loginReq.on('error', console.error);
    loginReq.write(loginData);
    loginReq.end();
  });
});

registerReq.on('error', console.error);
registerReq.write(registerData);
registerReq.end();
