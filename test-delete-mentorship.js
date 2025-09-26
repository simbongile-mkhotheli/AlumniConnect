// Simple test to verify mentorship delete functionality
import MentorshipService from './src/services/mentorshipService.js';

async function testDeleteMentorship() {
  try {
    console.log('Testing mentorship delete functionality...');
    
    // First, let's get a list of mentorships
    const mentorships = await MentorshipService.getMentorships(1, 5);
    console.log('Available mentorships:', mentorships);
    
    if (mentorships.data && mentorships.data.length > 0) {
      const firstMentorship = mentorships.data[0];
      console.log(`Attempting to delete mentorship: ${firstMentorship.id}`);
      
      // Try to delete the first mentorship
      const deleteResult = await MentorshipService.deleteMentorship(firstMentorship.id);
      console.log('Delete result:', deleteResult);
      
      // Try to fetch the deleted mentorship
      try {
        const fetchDeleted = await MentorshipService.getMentorship(firstMentorship.id);
        console.log('Fetch after delete:', fetchDeleted);
      } catch (error) {
        console.log('Expected error when fetching deleted mentorship:', error.message);
      }
    } else {
      console.log('No mentorships found to delete');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDeleteMentorship();