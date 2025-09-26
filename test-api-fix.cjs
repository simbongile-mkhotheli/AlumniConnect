// Test script to verify API response normalization
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

// Simulate the normalization logic from our ApiService
function normalizeResponse(responseData) {
  // Check if response is already wrapped
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData
  ) {
    return responseData;
  }

  // If response is unwrapped, wrap it
  return {
    data: responseData,
    success: true,
    message: 'Request successful',
  };
}

function normalizePaginatedResponse(responseData, page = 1, limit = 20) {
  // Check if response is already wrapped with pagination
  if (
    responseData &&
    typeof responseData === 'object' &&
    'pagination' in responseData
  ) {
    return responseData;
  }

  // Check if response is wrapped but without pagination
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData
  ) {
    const data = Array.isArray(responseData.data) ? responseData.data : [];
    return {
      data,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
      },
      success: responseData.success,
      message: responseData.message,
      error: responseData.error,
    };
  }

  // If response is raw array, wrap it with pagination
  const data = Array.isArray(responseData) ? responseData : [];
  return {
    data,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
    success: true,
    message: 'Request successful',
  };
}

async function testEndpoints() {
  console.log('🧪 Testing API Response Normalization\n');

  const endpoints = [
    { name: 'Events', url: '/events' },
    { name: 'Sponsors', url: '/sponsors' },
    { name: 'Partners', url: '/partners' },
    { name: 'Chapters', url: '/chapters' },
    { name: 'Opportunities', url: '/opportunities' },
    { name: 'Mentorships', url: '/mentorships' },
    { name: 'Q&A', url: '/qa' },
    { name: 'Spotlights', url: '/spotlights' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.name} (${endpoint.url})`);

      const response = await axios.get(`${API_BASE_URL}${endpoint.url}`);
      const rawData = response.data;

      console.log(
        `  Raw response type: ${Array.isArray(rawData) ? 'Array' : typeof rawData}`
      );
      console.log(
        `  Raw response length: ${Array.isArray(rawData) ? rawData.length : 'N/A'}`
      );

      // Test normalization
      const normalized = normalizeResponse(rawData);
      console.log(
        `  ✅ Normalized: success=${normalized.success}, hasData=${!!normalized.data}`
      );

      // Test paginated normalization
      const paginatedNormalized = normalizePaginatedResponse(rawData, 1, 10);
      console.log(
        `  ✅ Paginated: success=${paginatedNormalized.success}, items=${paginatedNormalized.data.length}, totalPages=${paginatedNormalized.pagination.totalPages}`
      );

      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  // Test a specific item endpoint
  try {
    console.log('📡 Testing Single Item (Events/event-1)');
    const response = await axios.get(`${API_BASE_URL}/events/event-1`);
    const rawData = response.data;

    console.log(`  Raw response type: ${typeof rawData}`);
    console.log(`  Has ID: ${rawData?.id ? 'Yes' : 'No'}`);

    const normalized = normalizeResponse(rawData);
    console.log(
      `  ✅ Normalized: success=${normalized.success}, hasData=${!!normalized.data}`
    );
    console.log(`  Data ID: ${normalized.data?.id || 'N/A'}`);
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  console.log('\n🎉 API Response Normalization Test Complete!');
}

// Run the test
testEndpoints().catch(console.error);
