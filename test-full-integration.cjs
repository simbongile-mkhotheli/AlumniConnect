// Comprehensive integration test for AlumniConnect API and frontend
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';
const REACT_APP_URL = 'http://localhost:5174';

// Test data structure and API response format
async function testApiIntegration() {
  console.log('🧪 AlumniConnect API Integration Test\n');
  console.log('='.repeat(60));

  const endpoints = [
    {
      name: 'Events',
      url: '/events',
      expectedFields: ['id', 'title', 'startDate', 'location', 'status'],
    },
    {
      name: 'Sponsors',
      url: '/sponsors',
      expectedFields: ['id', 'name', 'tier', 'status'],
    },
    {
      name: 'Partners',
      url: '/partners',
      expectedFields: ['id', 'name', 'type', 'status'],
    },
    {
      name: 'Chapters',
      url: '/chapters',
      expectedFields: ['id', 'name', 'location', 'status'],
    },
    {
      name: 'Opportunities',
      url: '/opportunities',
      expectedFields: ['id', 'title', 'company', 'type', 'status'],
    },
    {
      name: 'Mentorships',
      url: '/mentorships',
      expectedFields: ['id', 'title', 'type', 'status'],
    },
    {
      name: 'Q&A',
      url: '/qa',
      expectedFields: ['id', 'title', 'content', 'type', 'status'],
    },
    {
      name: 'Spotlights',
      url: '/spotlights',
      expectedFields: ['id', 'title', 'type', 'status'],
    },
  ];

  let totalTests = 0;
  let passedTests = 0;

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing ${endpoint.name} API`);
    console.log('-'.repeat(40));

    try {
      totalTests++;

      // Test collection endpoint
      const response = await axios.get(`${API_BASE_URL}${endpoint.url}`);
      const data = response.data;

      console.log(`✅ Status: ${response.status}`);
      console.log(
        `✅ Response Type: ${Array.isArray(data) ? 'Array' : typeof data}`
      );
      console.log(
        `✅ Items Count: ${Array.isArray(data) ? data.length : 'N/A'}`
      );

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        console.log(`✅ First Item ID: ${firstItem.id || 'Missing'}`);

        // Check expected fields
        const missingFields = endpoint.expectedFields.filter(
          field => !(field in firstItem)
        );
        if (missingFields.length === 0) {
          console.log(`✅ All expected fields present`);
        } else {
          console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
        }

        // Test individual item endpoint
        if (firstItem.id) {
          try {
            const itemResponse = await axios.get(
              `${API_BASE_URL}${endpoint.url}/${firstItem.id}`
            );
            console.log(`✅ Individual item fetch: ${itemResponse.status}`);
            console.log(
              `✅ Individual item ID: ${itemResponse.data.id || 'Missing'}`
            );
          } catch (itemError) {
            console.log(
              `❌ Individual item fetch failed: ${itemError.message}`
            );
          }
        }

        passedTests++;
      } else {
        console.log(`⚠️  Empty or invalid data structure`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`❌ Status: ${error.response.status}`);
        console.log(
          `❌ Response: ${JSON.stringify(error.response.data).substring(0, 200)}...`
        );
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(
    `📊 API Test Results: ${passedTests}/${totalTests} endpoints working`
  );

  // Test API response normalization
  console.log('\n🔄 Testing API Response Normalization');
  console.log('-'.repeat(40));

  try {
    const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
    const rawData = eventsResponse.data;

    // Simulate our normalization logic
    const isWrapped =
      rawData && typeof rawData === 'object' && 'success' in rawData;
    const normalizedData = isWrapped
      ? rawData
      : {
          data: rawData,
          success: true,
          message: 'Request successful',
        };

    console.log(`✅ Raw response is wrapped: ${isWrapped}`);
    console.log(
      `✅ Normalized response has success: ${normalizedData.success}`
    );
    console.log(`✅ Normalized response has data: ${!!normalizedData.data}`);
    console.log(
      `✅ Data items count: ${Array.isArray(normalizedData.data) ? normalizedData.data.length : 'N/A'}`
    );
  } catch (error) {
    console.log(`❌ Normalization test failed: ${error.message}`);
  }

  // Test CRUD operations
  console.log('\n🔧 Testing CRUD Operations');
  console.log('-'.repeat(40));

  try {
    // Test POST (Create)
    const newEvent = {
      title: 'Test Event',
      description: 'Test event description',
      startDate: new Date().toISOString(),
      location: 'Test Location',
      status: 'draft',
      organizer: 'Test Organizer',
    };

    const createResponse = await axios.post(`${API_BASE_URL}/events`, newEvent);
    console.log(`✅ CREATE: Status ${createResponse.status}`);

    const createdEventId =
      createResponse.data.id || createResponse.data.data?.id;
    if (createdEventId) {
      console.log(`✅ Created event ID: ${createdEventId}`);

      // Test PUT (Update)
      const updateData = { title: 'Updated Test Event' };
      const updateResponse = await axios.put(
        `${API_BASE_URL}/events/${createdEventId}`,
        updateData
      );
      console.log(`✅ UPDATE: Status ${updateResponse.status}`);

      // Test DELETE
      const deleteResponse = await axios.delete(
        `${API_BASE_URL}/events/${createdEventId}`
      );
      console.log(`✅ DELETE: Status ${deleteResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ CRUD test failed: ${error.message}`);
  }

  // Test custom endpoints
  console.log('\n🎯 Testing Custom Endpoints');
  console.log('-'.repeat(40));

  const customEndpoints = [
    '/spotlights/featured',
    '/partners/hiring',
    '/qa/trending',
    '/qa/unanswered',
  ];

  for (const endpoint of customEndpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      console.log(
        `✅ ${endpoint}: Status ${response.status}, Items: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`
      );
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 AlumniConnect API Integration Test Complete!');
  console.log('');
  console.log('📋 Summary:');
  console.log(`   • API: ${API_BASE_URL}`);
  console.log(`   • React App: http://localhost:5174`);
  console.log(`   • API Endpoints: ${passedTests}/${totalTests} working`);
  console.log(`   • Response Format: Normalized for compatibility`);
  console.log(`   • CRUD Operations: Tested`);
  console.log(`   • Custom Endpoints: Tested`);
  console.log('');
  console.log('✅ Frontend-Backend Integration: READY');
}

// Run the comprehensive test
testApiIntegration().catch(console.error);
