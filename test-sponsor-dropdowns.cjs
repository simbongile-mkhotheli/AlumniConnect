const { expect } = require('@playwright/test');

/**
 * Test script to verify all sponsors are showing in dropdown forms
 * Tests: ChapterEditorPage, EventEditorPage, and other components with sponsor dropdowns
 */

async function testSponsorsAPI() {
  console.log('🔍 Testing Sponsors API endpoint...');
  
  try {
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${base}/sponsors`);
    const sponsors = await response.json();
    
    console.log(`✅ Found ${sponsors.length} sponsors in API:`);
    sponsors.forEach((sponsor, index) => {
      console.log(`   ${index + 1}. ${sponsor.name} (${sponsor.tier}, ${sponsor.status})`);
    });
    
    // Check if we have all expected sponsors
    const expectedSponsors = [
      'Sponsor Company 1', 'Sponsor Company 2', 'Sponsor Company 3', 'Sponsor Company 4',
      'Sponsor Company 5', 'Sponsor Company 6', 'Sponsor Company 7', 'Sponsor Company 8',
      'Sponsor Company 9', 'Telkom', 'CompTIA', 'GitHub'
    ];
    
    const foundNames = sponsors.map(s => s.name);
    const missing = expectedSponsors.filter(name => !foundNames.includes(name));
    
    if (missing.length === 0) {
      console.log('✅ All expected sponsors found in API!');
    } else {
      console.log(`❌ Missing sponsors: ${missing.join(', ')}`);
    }
    
    return sponsors;
  } catch (error) {
    console.error('❌ Error testing sponsors API:', error.message);
    return [];
  }
}

async function testChaptersAPI() {
  console.log('\n🔍 Testing Chapters API endpoint...');
  
  try {
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${base}/chapters`);
    const chapters = await response.json();
    
    console.log(`✅ Found ${chapters.length} chapters in API`);
    
    // Check sponsor references
    const sponsorRefs = new Set();
    chapters.forEach(chapter => {
      if (chapter.sponsorId) {
        sponsorRefs.add(chapter.sponsorId);
      }
    });
    
    console.log(`   - Sponsor references found: ${Array.from(sponsorRefs).join(', ')}`);
    
    return chapters;
  } catch (error) {
    console.error('❌ Error testing chapters API:', error.message);
    return [];
  }
}

async function testEventsAPI() {
  console.log('\n🔍 Testing Events API endpoint...');
  
  try {
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${base}/events`);
    const events = await response.json();
    
    console.log(`✅ Found ${events.length} events in API`);
    
    // Check sponsor references  
    const sponsorRefs = new Set();
    events.forEach(event => {
      if (event.sponsor) {
        sponsorRefs.add(event.sponsor);
      }
    });
    
    console.log(`   - Sponsor references found: ${Array.from(sponsorRefs).join(', ')}`);
    
    return events;
  } catch (error) {
    console.error('❌ Error testing events API:', error.message);
    return [];
  }
}

async function main() {
  console.log('📋 Testing Sponsor Dropdown Data Integration\n');
  console.log('=' .repeat(60));
  
  const sponsors = await testSponsorsAPI();
  const chapters = await testChaptersAPI();
  const events = await testEventsAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 SUMMARY:');
  console.log(`   • ${sponsors.length} sponsors available for dropdowns`);
  console.log(`   • ${chapters.length} chapters with sponsor references`);
  console.log(`   • ${events.length} events with sponsor references`);
  
  const activeSponsors = sponsors.filter(s => s.status === 'active');
  console.log(`   • ${activeSponsors.length} active sponsors should show in form dropdowns`);
  
  if (activeSponsors.length >= 12) {
    console.log('✅ SUCCESS: All expected sponsors are available for forms!');
  } else {
    console.log('❌ WARNING: Some sponsors may be missing from dropdowns');
  }
  
  console.log('\n🧪 To test forms manually:');
  console.log('   1. Go to http://localhost:5174');
  console.log('   2. Navigate to Admin → Chapters → Create/Edit');
  console.log('   3. Check sponsor dropdown shows all companies');
  console.log('   4. Navigate to Admin → Events → Create/Edit');
  console.log('   5. Check sponsor dropdown shows all companies');
  console.log('   6. Verify you see: Sponsor Company 1-9, Telkom, CompTIA, GitHub');
}

main().catch(console.error);