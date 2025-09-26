#!/usr/bin/env node
// Test script: Create then edit an opportunity to verify persistence
const { fetch } = globalThis;
const BASE = process.env.API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
async function json(url, opts){ const res = await fetch(url,{headers:{'Content-Type':'application/json'},...opts}); if(!res.ok) throw new Error(res.status+':'+res.statusText); return res.json(); }
(async()=>{ try {
  console.log('⚙️  Starting opportunity create/edit test');
  const initial = await json(`${BASE}/opportunities?_limit=200`); const initialCount = initial.length; console.log('Initial opportunities count:', initialCount);
  const createPayload = { title:'Integration Test Opportunity', company:'QA Corp', type:'job', level:'entry', location:'Remote', isRemote:true, description:'Opportunity description', contactEmail:'qa-opp@example.com', status:'pending', applicationCount:0, viewCount:0, postedDate:new Date().toISOString(), tags:['test'], requirements:['req1'] };
  const created = await json(`${BASE}/opportunities`, {method:'POST', body: JSON.stringify(createPayload)}); if(!created.id) throw new Error('Create failed: missing id'); console.log('✅ Created opportunity id:', created.id);
  const after = await json(`${BASE}/opportunities/${created.id}`); if(after.title !== createPayload.title) throw new Error('Created opportunity mismatch');
  const updatePayload = { ...after, status:'active', applicationCount: 3 };
  const updated = await json(`${BASE}/opportunities/${created.id}`, {method:'PUT', body: JSON.stringify(updatePayload)}); if(updated.status !== 'active') throw new Error('Update failed');
  const listAfter = await json(`${BASE}/opportunities?_limit=500`); if(listAfter.length !== initialCount + 1) throw new Error('Opportunity count did not increment');
  console.log('🎉 Opportunity create/edit persistence verified. Final count:', listAfter.length);
} catch(e){ console.error('❌ Test failed:', e.message); process.exit(1);} })();
