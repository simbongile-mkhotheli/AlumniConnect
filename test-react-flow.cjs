// Test the React filter flow to debug the exact issue
const testReactFilterFlow = async () => {
  console.log('=== Testing React Filter Flow ===');

  try {
    // Fetch the data
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${base}/mentorships`);
    const mentorships = await response.json();
    console.log(`Fetched ${mentorships.length} mentorships from API`);

    // Simulate the enrichment process like in MentorshipModal
    const enrichedMentorships = mentorships.map(mentorship => {
      // Handle both legacy and new schema  
      const sessionCount = mentorship.sessionCount ?? mentorship.totalSessions ?? 0;
      const completedSessions = mentorship.sessionsCompleted ?? mentorship.completedSessions ?? 0;
      
      return {
        ...mentorship,
        sessionCount,
        completedSessions,
        // Enrich with category if missing
        category: mentorship.category || '',
      };
    });

    console.log('Sample enriched data:', enrichedMentorships.slice(0, 3).map(m => ({
      id: m.id,
      title: m.title,
      status: m.status,
      type: m.type,
      category: m.category
    })));

    // Test multiple filter scenarios
    const testScenarios = [
      { name: 'Status: active', filters: { status: 'active' } },
      { name: 'Type: technical', filters: { type: 'technical' } },
      { name: 'Status: pending', filters: { status: 'pending' } },
      { name: 'Type: leadership', filters: { type: 'leadership' } },
      { name: 'Combined: active + technical', filters: { status: 'active', type: 'technical' } }
    ];

    // Import and test with the actual utility (can't import TS directly in Node, so we'll use a manual implementation)
    const testFilterItems = (items, filters, exactKeys = []) => {
      const exactSet = new Set(exactKeys);
      return items.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;
          
          const itemValue = item[key];
          
          if (exactSet.has(key)) {
            // Exact match (case-insensitive)
            return itemValue && itemValue.toLowerCase() === value.toLowerCase();
          }
          
          // Substring match (case-insensitive)
          return itemValue && itemValue.toLowerCase().includes(value.toLowerCase());
        });
      });
    };

    testScenarios.forEach(scenario => {
      console.log(`\n--- ${scenario.name} ---`);
      console.log('Filters:', scenario.filters);
      
      const result = testFilterItems(
        enrichedMentorships,
        scenario.filters,
        ['status', 'type', 'category']
      );
      
      console.log(`Results: ${result.length}/${enrichedMentorships.length} items`);
      
      if (result.length > 0) {
        console.log('Sample results:', result.slice(0, 3).map(r => ({
          id: r.id,
          status: r.status,
          type: r.type,
          title: r.title
        })));
      } else {
        console.log('No results - checking for issues...');
        
        // Debug empty results
        const filterKey = Object.keys(scenario.filters)[0];
        const filterValue = scenario.filters[filterKey];
        const uniqueValues = [...new Set(enrichedMentorships.map(item => item[filterKey]).filter(Boolean))];
        
        console.log(`Available ${filterKey} values:`, uniqueValues);
        console.log(`Looking for: "${filterValue}"`);
        console.log('Exact matches:', enrichedMentorships.filter(item => item[filterKey] === filterValue).length);
        console.log('Case-insensitive matches:', enrichedMentorships.filter(item => item[filterKey] && item[filterKey].toLowerCase() === filterValue.toLowerCase()).length);
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testReactFilterFlow();