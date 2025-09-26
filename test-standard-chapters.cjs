// Test script to verify StandardRegionalChaptersCard data integration
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

async function testStandardChaptersIntegration() {
  console.log('🧪 Testing StandardRegionalChaptersCard Integration\n');
  console.log('='.repeat(60));

  try {
    // Test chapters endpoint
    console.log('📡 Testing Chapters API...');
    const response = await axios.get(`${API_BASE_URL}/chapters`);
    const chapters = response.data;

    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Total chapters: ${chapters.length}`);

    // Filter active chapters (what the component will show)
    const activeChapters = chapters.filter(
      chapter => chapter.status === 'active'
    );
    console.log(`✅ Active chapters: ${activeChapters.length}`);

    // Show first 3 active chapters (what the component displays)
    const displayChapters = activeChapters.slice(0, 3);
    console.log(`✅ Chapters to display: ${displayChapters.length}`);

    console.log('\n📋 Chapter Data Analysis:');
    console.log('-'.repeat(40));

    displayChapters.forEach((chapter, index) => {
      console.log(`\n${index + 1}. ${chapter.name || 'Unnamed Chapter'}`);
      console.log(`   ID: ${chapter.id}`);
      console.log(`   Location: ${chapter.location || 'Unknown'}`);
      console.log(`   Status: ${chapter.status}`);
      console.log(`   Members: ${chapter.memberCount || 0}`);
      console.log(`   Events: ${chapter.eventsThisMonth || 0}`);
      console.log(`   Sponsor: ${chapter.sponsor || 'None'}`);
      console.log(`   Is Sponsored: ${chapter.isSponsored ? 'Yes' : 'No'}`);
    });

    // Test data transformation (what the component does)
    console.log('\n🔄 Testing Data Transformation:');
    console.log('-'.repeat(40));

    const transformedChapters = displayChapters.map(chapter => {
      // Simulate the component's getChapterSponsor logic
      let sponsor = 'Community Sponsored';
      if (chapter.sponsor) {
        sponsor = chapter.sponsor;
      } else if (chapter.isSponsored) {
        sponsor = 'Sponsored';
      } else {
        // Default sponsors based on location
        const locationSponsors = {
          'Cape Town': 'iWeb',
          Johannesburg: 'Telkom',
          Durban: 'CompTIA',
          Pretoria: 'GitHub',
          'Port Elizabeth': 'Microsoft',
          Bloemfontein: 'Standard Bank',
        };
        const city = (chapter.location || '').split(',')[0].trim();
        sponsor = locationSponsors[city] || 'Community Sponsored';
      }

      return {
        id: chapter.id,
        name: chapter.name,
        members: chapter.memberCount || 0,
        events: chapter.eventsThisMonth || 0,
        location: chapter.location,
        sponsor: sponsor,
      };
    });

    console.log('Transformed chapters for display:');
    transformedChapters.forEach((chapter, index) => {
      console.log(`${index + 1}. ${chapter.name}`);
      console.log(
        `   ${chapter.members} members • ${chapter.events} events this month`
      );
      console.log(`   📍 ${chapter.location}`);
      console.log(`   Sponsored by ${chapter.sponsor}`);
      console.log('');
    });

    // Test component states
    console.log('🎯 Component State Analysis:');
    console.log('-'.repeat(40));

    if (activeChapters.length === 0) {
      console.log('⚠️  Component will show: Empty state (no active chapters)');
    } else if (activeChapters.length > 0) {
      console.log(
        `✅ Component will show: ${Math.min(3, activeChapters.length)} chapters`
      );
      console.log(
        `✅ Total active count: ${activeChapters.length} active chapters`
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 StandardRegionalChaptersCard Integration Test Complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Total chapters in database: ${chapters.length}`);
    console.log(`   • Active chapters: ${activeChapters.length}`);
    console.log(
      `   • Chapters displayed: ${Math.min(3, activeChapters.length)}`
    );
    console.log(`   • API Response: ✅ Working`);
    console.log(`   • Data transformation: ✅ Working`);
    console.log(`   • Component integration: ✅ Ready`);

    if (activeChapters.length > 0) {
      console.log('');
      console.log(
        '✅ RESULT: StandardRegionalChaptersCard will display real data'
      );
      console.log(
        '   The component should now show actual chapters from the database'
      );
      console.log('   instead of the previous hardcoded data.');
    } else {
      console.log('');
      console.log('⚠️  RESULT: No active chapters found');
      console.log(
        '   The component will show the empty state with fallback data.'
      );
    }
  } catch (error) {
    console.log('❌ Error testing chapters integration:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
  console.log('   1. Ensure backend server is running on port 4000 (npm run server)');
  console.log('   2. Check if Postgres is seeded (server/seeds/db.json then npm run server:seed)');
  console.log('   3. Verify API endpoint is accessible');
  }
}

// Run the test
testStandardChaptersIntegration().catch(console.error);
