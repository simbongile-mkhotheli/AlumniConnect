// Quick test to check mentorship filter debugging
// This script can be used to manually test filters

const testFilters = async () => {
  console.log('Testing mentorship filters...');
  
  // Test the filter endpoint directly
  try {
  const base = process.env.API_BASE_URL || 'http://localhost:4000/api';
  const response = await fetch(`${base}/mentorships`);
    const mentorships = await response.json();
    console.log('Fetched mentorships:', {
      count: mentorships.length,
      sample: mentorships.slice(0, 3).map(m => ({
        id: m.id,
        title: m.title,
        category: m.category,
        status: m.status,
        type: m.type
      }))
    });

    // Test local filtering logic with Node.js
    const fs = require('fs');
    const path = require('path');
    
    // Read the filter utility directly from the TypeScript file as text
    const utilPath = path.join(__dirname, 'src', 'utils', 'filterItems.ts');
    const utilContent = fs.readFileSync(utilPath, 'utf8');
    
    // For now, let's implement a simple version of the filter logic to test
    const testFilter = (items, filters, exactKeys = []) => {
      console.log('Testing filter with:', { filters, exactKeys });
      
      return items.filter(item => {
        const passes = Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;
          
          const itemValue = item[key];
          console.log(`Checking ${key}: item="${itemValue}" filter="${value}" exact=${exactKeys.includes(key)}`);
          
          if (exactKeys.includes(key)) {
            return itemValue && itemValue.toLowerCase() === value.toLowerCase();
          }
          
          return itemValue && itemValue.toLowerCase().includes(value.toLowerCase());
        });
        
        if (passes) {
          console.log('Item passed:', item.id, item.title);
        }
        
        return passes;
      });
    };
    
    // Test with type filter (should have matches)
    console.log('\n=== Testing TYPE filter ===');
    const typeFiltered = testFilter(
      mentorships,
      { type: 'technical' },
      ['type', 'status', 'category']
    );
    
    console.log('Type filter result:', {
      originalCount: mentorships.length,
      filteredCount: typeFiltered.length,
      availableTypes: [...new Set(mentorships.map(m => m.type).filter(Boolean))]
    });

    // Test with status filter
    console.log('\n=== Testing STATUS filter ===');
    const statusFiltered = testFilter(
      mentorships,
      { status: 'active' },
      ['type', 'status', 'category']
    );
    
    console.log('Status filter result:', {
      originalCount: mentorships.length,
      filteredCount: statusFiltered.length,
      availableStatuses: [...new Set(mentorships.map(m => m.status).filter(Boolean))]
    });

  } catch (error) {
    console.error('Filter test failed:', error);
  }
};

// Run the test
testFilters();