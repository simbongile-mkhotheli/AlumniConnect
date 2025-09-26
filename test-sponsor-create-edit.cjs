// Integration test for sponsor create & edit persistence in mock mode
const axios = require('axios');

const API = process.env.API_BASE_URL || 'http://localhost:4000/api';

async function run() {
  console.log('🧪 Sponsor Create/Edit Persistence Test');
  console.log('='.repeat(60));

  // 1. Fetch initial list
  const initialRes = await axios.get(`${API}/sponsors`);
  const initialList = initialRes.data;
  console.log(`Initial sponsors count: ${initialList.length}`);

  // 2. Create sponsor (POST)
  const createPayload = {
    name: 'Test Persistence Sponsor',
    tier: 'gold',
    status: 'active',
    logo: 'https://picsum.photos/200/100?random=999',
    description: 'Persistence verification sponsor',
    website: 'https://example.com',
    contactEmail: 'test-persist@example.com',
    eventsSponsored: 0,
    chaptersSponsored: 0,
    totalValue: 0,
    partnershipSince: new Date().toISOString(),
    tags: ['test','persistence']
  };
  const createRes = await axios.post(`${API}/sponsors`, createPayload);
  const created = createRes.data;
  console.log(`Created sponsor id: ${created.id}`);

  // 3. Refetch list & assert increment
  const afterCreateRes = await axios.get(`${API}/sponsors`);
  const afterCreateList = afterCreateRes.data;
  console.log(`Post-create sponsors count: ${afterCreateList.length}`);
  if (afterCreateList.length !== initialList.length + 1) {
    throw new Error('Count did not increment after create');
  }

  // 4. Update sponsor (PUT) - change name & tier
  const updatedName = 'Updated Persistence Sponsor';
  const updateRes = await axios.put(`${API}/sponsors/${created.id}`, {
    ...created,
    name: updatedName,
    tier: 'platinum'
  });
  const updated = updateRes.data;
  console.log(`Updated sponsor name: ${updated.name}, tier: ${updated.tier}`);

  // 5. Fetch single sponsor to verify update persisted
  const singleRes = await axios.get(`${API}/sponsors/${created.id}`);
  const single = singleRes.data;
  if (single.name !== updatedName) {
    throw new Error('Update did not persist to subsequent fetch');
  }

  console.log('✅ Create + edit persistence validated.');
  console.log('='.repeat(60));
}

run().catch(err => {
  console.error('❌ Test failed:', err.message);
  if (err.response) {
    console.error('Status:', err.response.status);
    console.error('Body:', err.response.data);
  }
  process.exit(1);
});
