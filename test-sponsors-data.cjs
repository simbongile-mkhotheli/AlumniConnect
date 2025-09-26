const fs = require('fs');
const path = require('path');

// Read the database file (prefer server seeds path; legacy mock-server path removed)
const dbPath = path.join(__dirname, 'server', 'seeds', 'db.json');
const dbContent = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbContent);

console.log('=== SPONSORS IN DATABASE ===');
db.sponsors.forEach(sponsor => {
  console.log(`ID: ${sponsor.id} | Name: ${sponsor.name} | Status: ${sponsor.status}`);
});

console.log('\n=== CHAPTERS WITH SPONSORS ===');
db.chapters
  .filter(chapter => chapter.sponsor && chapter.isSponsored)
  .forEach(chapter => {
    console.log(`Chapter: ${chapter.name} | Sponsor ID: ${chapter.sponsor} | IsSponsored: ${chapter.isSponsored}`);
  });

console.log('\n=== SPONSOR ID VALIDATION ===');
db.chapters
  .filter(chapter => chapter.sponsor && chapter.isSponsored)
  .forEach(chapter => {
    const sponsor = db.sponsors.find(s => s.id === chapter.sponsor);
    if (sponsor) {
      console.log(`✅ ${chapter.name} -> ${sponsor.name}`);
    } else {
      console.log(`❌ ${chapter.name} -> SPONSOR NOT FOUND: ${chapter.sponsor}`);
    }
  });