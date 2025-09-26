#!/usr/bin/env node
// Test script: Create then edit an event to verify persistence via mock server
const { fetch } = globalThis;

const BASE = (process.env.API_BASE_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

async function json(url, opts){
  const res = await fetch(url, {headers:{'Content-Type':'application/json'}, ...opts});
  if(!res.ok) throw new Error(res.status+':'+res.statusText);
  return res.json();
}

(async () => {
  try {
    console.log('⚙️  Starting event create/edit test');
    const initial = await json(`${BASE}/events?_limit=200`);
    const initialCount = initial.length;
    console.log('Initial events count:', initialCount);

    const createPayload = {
      title: 'Integration Test Event',
      slug: 'integration-test-event',
      excerpt: 'Short excerpt',
      description: 'Long description for integration test event',
      organizer: 'QA Bot',
      location: 'Remote',
      venue: 'Virtual',
      address: 'N/A',
      startDate: new Date().toISOString(),
      status: 'draft',
      isFeatured: false,
      tags: ['test'],
      rsvpCount: 0,
      attendanceCount: 0
    };

    const created = await json(`${BASE}/events`, {method:'POST', body: JSON.stringify(createPayload)});
    if(!created.id) throw new Error('Create failed: missing id');
    console.log('✅ Created event id:', created.id);

    const afterCreate = await json(`${BASE}/events/${created.id}`);
    if(afterCreate.title !== createPayload.title) throw new Error('Created event mismatch');

    const updatePayload = { ...afterCreate, title: 'Integration Test Event Updated', isFeatured: true }; 
    const updated = await json(`${BASE}/events/${created.id}`, {method:'PUT', body: JSON.stringify(updatePayload)});
    if(updated.title !== 'Integration Test Event Updated') throw new Error('Update failed');

    const listAfter = await json(`${BASE}/events?_limit=500`);
    const finalCount = listAfter.length;
    if(finalCount !== initialCount + 1) throw new Error('Event count did not increment');

    console.log('🎉 Event create/edit persistence verified. Final count:', finalCount);
  } catch (e) {
    console.error('❌ Test failed:', e.message);
    process.exit(1);
  }
})();
