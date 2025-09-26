// Simple test to verify API is working
const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const req = http.request(`${base}/${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            path,
            status: res.statusCode,
            count: Array.isArray(json) ? json.length : 'not-array',
            success: res.statusCode === 200
          });
        } catch (e) {
          resolve({
            path,
            status: res.statusCode,
            error: 'Invalid JSON',
            success: false
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        path,
        error: error.message,
        success: false
      });
    });
    
    req.end();
  });
}

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  const endpoints = ['chapters', 'events', 'users'];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint}:`, result);
  }
  
  console.log('\nAPI test completed!');
}

testAPI();