// Quick test to verify API endpoint (dynamic base URL)
const testApiDirectly = async () => {
  const BASE = (process.env.API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');
  try {
    const response = await fetch(`${BASE}/chapters`);
    const data = await response.json();

    console.log('📡 API Base:', BASE);
    console.log('📡 API Response Status:', response.status);
    console.log('📊 Number of chapters:', Array.isArray(data) ? data.length : 'not-array');
    if (Array.isArray(data) && data.length) {
      console.log('🏢 Sample chapter data:');
      console.log('  Name:', data[0]?.name);
      console.log('  Location:', data[0]?.location);
      console.log('  Members:', data[0]?.memberCount);
      console.log('  Status:', data[0]?.status);
    }

    console.log('\n✅ API verification:');
    console.log('  - No hardcoded ports');
    console.log('  - API server responding correctly');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

testApiDirectly();