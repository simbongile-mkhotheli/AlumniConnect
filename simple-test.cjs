const axios = require('axios');

async function testSingleEndpoint() {
  try {
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const response = await axios.get(`${base}/events`);
    console.log('Response structure:');
    console.log('Keys:', Object.keys(response.data));
    console.log('Has success?', 'success' in response.data);
    console.log('Has data?', 'data' in response.data);
    console.log('Has message?', 'message' in response.data);

    if (Array.isArray(response.data)) {
      console.log('Response is raw array with', response.data.length, 'items');
    } else if (response.data.data && Array.isArray(response.data.data)) {
      console.log(
        'Response is wrapped with',
        response.data.data.length,
        'items'
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSingleEndpoint();
