#!/usr/bin/env node
// Test script: Create then edit a partner to verify persistence
const { fetch } = globalThis;
const BASE = process.env.API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
async function json(url, opts){ const res = await fetch(url,{headers:{'Content-Type':'application/json'},...opts}); if(!res.ok) throw new Error(res.status+':'+res.statusText); return res.json(); }
(async()=>{ try {
  console.log('⚙️  Starting partner create/edit test');
  const initial = await json(`${BASE}/partners?_limit=200`); const initialCount = initial.length; console.log('Initial partners count:', initialCount);
  const createPayload = { name:'Integration Test Partner', type:'hiring', status:'pending', description:'Partner desc', contactEmail:'qa-partner@example.com', createdAt:new Date().toISOString(), partnershipSince:new Date().toISOString(), jobOpportunities:0, alumniHired:0, hireRate:0, tags:['test'] };
  const created = await json(`${BASE}/partners`, {method:'POST', body: JSON.stringify(createPayload)}); if(!created.id) throw new Error('Create failed: missing id'); console.log('✅ Created partner id:', created.id);
  const after = await json(`${BASE}/partners/${created.id}`); if(after.name !== createPayload.name) throw new Error('Created partner mismatch');
  const updatePayload = { ...after, status:'active', alumniHired: 5 };
  const updated = await json(`${BASE}/partners/${created.id}`, {method:'PUT', body: JSON.stringify(updatePayload)}); if(updated.status !== 'active') throw new Error('Update failed');
  const listAfter = await json(`${BASE}/partners?_limit=500`); if(listAfter.length !== initialCount + 1) throw new Error('Partner count did not increment');
  console.log('🎉 Partner create/edit persistence verified. Final count:', listAfter.length);
} catch(e){ console.error('❌ Test failed:', e.message); process.exit(1);} })();
