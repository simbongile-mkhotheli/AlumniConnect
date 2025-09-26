// Integration test for QA item create + edit persistence
// Mirrors existing entity tests (events/partners/opportunities)

const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

const BASE = process.env.API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000';

async function getAll() {
  const res = await fetch(`${BASE}/qaItems`);
  if (!res.ok) throw new Error('Failed to list QA items');
  return res.json();
}

async function create(item) {
  const res = await fetch(`${BASE}/qaItems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Failed to create QA item');
  return res.json();
}

async function update(id, patch) {
  const res = await fetch(`${BASE}/qaItems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error('Failed to update QA item');
  return res.json();
}

(async () => {
  const before = await getAll();
  const initialCount = before.length;

  const newItem = {
    type: 'question',
    status: 'pending',
    category: 'general',
    title: 'Integration Test QA Question',
    content: 'How does the new mutation pattern ensure consistency?',
    authorId: 'tester-qa',
    authorName: 'QA Tester',
    tags: ['integration','mutation'],
    answerCount: 0,
    viewCount: 0,
    voteCount: 0,
    commentCount: 0,
    participantCount: 0,
    allowComments: true,
    allowVoting: true,
    isFeatured: false,
    isSticky: false
  };

  const created = await create(newItem);
  if (!created.id) throw new Error('Created QA item missing id');

  const afterCreate = await getAll();
  if (afterCreate.length !== initialCount + 1) {
    throw new Error(`QA item count did not increment. Expected ${initialCount + 1}, got ${afterCreate.length}`);
  }

  const updated = await update(created.id, { title: 'Integration Test QA Question Updated', viewCount: 5 });
  if (updated.title !== 'Integration Test QA Question Updated') {
    throw new Error('QA item title update not persisted');
  }
  if (updated.viewCount !== 5) {
    throw new Error('QA item viewCount update not persisted');
  }

  console.log('QA create/edit persistence test passed');
})();
