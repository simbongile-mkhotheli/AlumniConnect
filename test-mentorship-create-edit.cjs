// Integration test for Mentorship create + edit persistence
// Parallels other entity tests

const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

const BASE = process.env.API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000';

async function getAll() {
  const res = await fetch(`${BASE}/mentorships`);
  if (!res.ok) throw new Error('Failed to list mentorships');
  return res.json();
}

async function create(item) {
  const res = await fetch(`${BASE}/mentorships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to create mentorship');
  return res.json();
}

async function update(id, patch) {
  const res = await fetch(`${BASE}/mentorships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error('Failed to update mentorship');
  return res.json();
}

(async () => {
  const before = await getAll();
  const initialCount = before.length;

  const newItem = {
    title: 'Integration Test Mentorship',
    type: 'general',
    status: 'pending',
    mentorId: 'mentor-test',
    mentorName: 'Mentor Test',
    menteeId: 'mentee-test',
    menteeName: 'Mentee Test',
    description: 'Testing mentorship create/edit persistence',
    tags: ['test','integration'],
    sessionCount: 0,
    completedSessions: 0,
    startDate: new Date().toISOString(),
    category: 'testing'
  };

  const created = await create(newItem);
  if (!created.id) throw new Error('Created mentorship missing id');

  const afterCreate = await getAll();
  if (afterCreate.length !== initialCount + 1) {
    throw new Error(`Mentorship count did not increment. Expected ${initialCount + 1}, got ${afterCreate.length}`);
  }

  const updated = await update(created.id, { title: 'Integration Test Mentorship Updated', sessionCount: 3 });
  if (updated.title !== 'Integration Test Mentorship Updated') {
    throw new Error('Mentorship title update not persisted');
  }
  if (updated.sessionCount !== 3) {
    throw new Error('Mentorship sessionCount update not persisted');
  }

  console.log('Mentorship create/edit persistence test passed');
})();
