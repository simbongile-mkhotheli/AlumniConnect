// Test script to verify API response format
// Run: node test-api-format.cjs

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

async function testApiFormat(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    const response = await axios.get(`${API_BASE_URL}${endpoint}`);

    // Check if response has the expected format
    const hasCorrectFormat =
      response.data &&
      typeof response.data.success === 'boolean' &&
      'data' in response.data &&
      'message' in response.data;

    if (hasCorrectFormat) {
      console.log(`✅ ${description}: Correct API format`);
      console.log(`   Success: ${response.data.success}`);
      console.log(`   Message: ${response.data.message}`);
      console.log(
        `   Data type: ${Array.isArray(response.data.data) ? 'Array' : typeof response.data.data}`
      );
      if (Array.isArray(response.data.data)) {
        console.log(`   Items count: ${response.data.data.length}`);
      }
    } else {
      console.log(`❌ ${description}: Incorrect API format`);
      console.log(`   Response structure:`, Object.keys(response.data));
    }

    return hasCorrectFormat;
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    return false;
  }
}

async function runFormatTests() {
  console.log('🚀 Testing AlumniConnect API Response Format...\n');
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Expected format: { data, success, message }`);

  const tests = [
    ['/events', 'Events endpoint'],
    ['/sponsors', 'Sponsors endpoint'],
    ['/partners', 'Partners endpoint'],
    ['/chapters', 'Chapters endpoint'],
    ['/opportunities', 'Opportunities endpoint'],
    ['/applications', 'Applications endpoint'],
    ['/mentorships', 'Mentorships endpoint'],
    ['/qa', 'Q&A endpoint'],
    ['/spotlights', 'Spotlights endpoint'],
    ['/users', 'Users endpoint'],
  ];

  let passed = 0;
  let total = tests.length;

  for (const [endpoint, description] of tests) {
    const success = await testApiFormat(endpoint, description);
    if (success) passed++;
  }

  console.log(
    `\n📊 Format Test Results: ${passed}/${total} endpoints have correct format`
  );

  if (passed === total) {
    console.log('🎉 All API endpoints return properly formatted responses!');
    console.log('✅ Frontend services should now work correctly with the API');
  } else {
    console.log('⚠️  Some endpoints have incorrect response format.');
  }

  // Test a specific endpoint to show the actual response structure
  console.log('\n📋 Sample Response Structure:');
  try {
    const sampleResponse = await axios.get(`${API_BASE_URL}/events`);
    console.log(JSON.stringify(sampleResponse.data, null, 2));
  } catch (error) {
    console.log('Failed to get sample response:', error.message);
  }
}

runFormatTests().catch(console.error);
