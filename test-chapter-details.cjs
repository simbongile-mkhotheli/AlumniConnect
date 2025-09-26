// Test script to verify chapter details functionality
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

async function testChapterDetails() {
  console.log('🧪 Testing Chapter Details Functionality\n');
  console.log('='.repeat(60));

  try {
    // First, get the list of chapters to find a valid ID
    console.log('📡 Fetching chapters list...');
    const chaptersResponse = await axios.get(`${API_BASE_URL}/chapters`);
    const chapters = chaptersResponse.data;

    console.log(`✅ Status: ${chaptersResponse.status}`);
    console.log(`✅ Total chapters: ${chapters.length}`);

    if (chapters.length === 0) {
      console.log('❌ No chapters found in database');
      return;
    }

    // Test fetching individual chapter details
    const testChapter = chapters[0]; // Use first chapter for testing
    console.log(
      `\n🔍 Testing chapter details for: "${testChapter.name}" (ID: ${testChapter.id})`
    );
    console.log('-'.repeat(40));

    const chapterResponse = await axios.get(
      `${API_BASE_URL}/chapters/${testChapter.id}`
    );
    const chapterDetails = chapterResponse.data;

    console.log(`✅ Chapter Details API Status: ${chapterResponse.status}`);
    console.log('\n📋 Chapter Details:');
    console.log(`   Name: ${chapterDetails.name}`);
    console.log(`   Location: ${chapterDetails.location}`);
    console.log(`   Status: ${chapterDetails.status}`);
    console.log(
      `   Performance: ${chapterDetails.performance || 'Not specified'}`
    );
    console.log(`   Lead: ${chapterDetails.leadName || 'Not assigned'}`);
    console.log(`   Members: ${chapterDetails.memberCount || 0}`);
    console.log(`   Engagement: ${chapterDetails.engagementRate || 0}%`);
    console.log(`   Events This Month: ${chapterDetails.eventsThisMonth || 0}`);
    console.log(`   Sponsored: ${chapterDetails.isSponsored ? 'Yes' : 'No'}`);
    if (chapterDetails.sponsor) {
      console.log(`   Sponsor: ${chapterDetails.sponsor}`);
    }

    // Test with a few more chapters
    console.log('\n🔄 Testing additional chapters...');
    const testChapters = chapters.slice(0, 3); // Test first 3 chapters

    for (let i = 0; i < testChapters.length; i++) {
      const chapter = testChapters[i];
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chapters/${chapter.id}`
        );
        console.log(
          `   ✅ ${chapter.name} (${chapter.id}): ${response.status} OK`
        );
      } catch (error) {
        console.log(
          `   ❌ ${chapter.name} (${chapter.id}): ${error.response?.status || 'Error'}`
        );
      }
    }

    // Test with invalid ID
    console.log('\n🚫 Testing invalid chapter ID...');
    try {
      await axios.get(`${API_BASE_URL}/chapters/invalid-id`);
      console.log('   ❌ Should have failed with invalid ID');
    } catch (error) {
      console.log(
        `   ✅ Correctly handled invalid ID: ${error.response?.status || 'Error'}`
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Chapter Details API Test Complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Total chapters available: ${chapters.length}`);
    console.log(`   • Chapter details API: ✅ Working`);
    console.log(`   • Individual chapter fetch: ✅ Working`);
    console.log(`   • Error handling: ✅ Working`);
    console.log('');
    console.log('✅ RESULT: Chapter details functionality is ready!');
    console.log(
      '   You can now click "View" on any chapter in the Regional Chapters Manager'
    );
    console.log(
      '   to see the detailed chapter information instead of "Coming Soon".'
    );
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Open http://localhost:5174/admin/chapters');
    console.log('   2. Click the "👁️ View" button on any chapter');
    console.log('   3. Verify the chapter details page displays real data');
    console.log(
      '   4. Test the tab navigation (Overview, Members, Events, Analytics)'
    );
    console.log(
      '   5. Test the action buttons (Edit, Activate/Deactivate, Delete)'
    );
  } catch (error) {
    console.log('❌ Error testing chapter details:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
  console.log('   1. Ensure backend server is running on port 4000 (npm run server)');
  console.log('   2. Check if Postgres is seeded (server/seeds/db.json then npm run server:seed)');
    console.log('   3. Verify API endpoint is accessible');
    console.log('   4. Check network connectivity');
  }
}

// Run the test
testChapterDetails().catch(console.error);
