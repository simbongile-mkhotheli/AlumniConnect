const http = require('http');

// Test server connectivity
const testRequest = () => {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server Response: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📡 Response Body:', data);
      console.log('🔒 Security Headers:');
      console.log('  X-Content-Type-Options:', res.headers['x-content-type-options']);
      console.log('  X-Frame-Options:', res.headers['x-frame-options']);
      console.log('  X-XSS-Protection:', res.headers['x-xss-protection']);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Connection Error:', err.message);
  });

  req.on('timeout', () => {
    console.error('⏰ Request timed out');
    req.destroy();
  });

  req.end();
};

console.log('🔍 Testing AlumniConnect Server...');
testRequest();