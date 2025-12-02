// Test script to verify the roles API
const https = require('https');

async function testRolesAPI() {
  return new Promise((resolve, reject) => {
    console.log('Testing /api/roles endpoint...');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/roles',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const roles = JSON.parse(data);
          console.log(`Status: ${res.statusCode}`);
          console.log(`Roles returned: ${roles.length}`);
          console.log('First 5 roles:');
          roles.slice(0, 5).forEach(role => {
            console.log(`- ${role.name} (${role.category})`);
          });

          if (roles.length > 0) {
            console.log('✅ API test successful!');
          } else {
            console.log('❌ No roles returned');
          }
          resolve();
        } catch (error) {
          console.error('❌ Failed to parse response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

testRolesAPI().catch(console.error);