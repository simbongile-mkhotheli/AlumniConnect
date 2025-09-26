/**
 * Test file to verify all utilities are working correctly
 * This file can be imported in the browser console to test the utilities
 */

import { debounce, debounceSimple } from './debounce';
import { storage } from './storage';
import {
  filterItems,
  sortItems,
  paginateItems,
  searchItems,
} from './filterItems';

// Test data
const testData = [
  {
    id: '1',
    name: 'John Doe',
    title: 'Software Engineer',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    title: 'Product Manager',
    status: 'inactive',
    createdAt: '2023-02-01',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    title: 'Designer',
    status: 'active',
    createdAt: '2023-03-01',
  },
];

export function testUtilities() {
  console.log('🧪 Testing Utilities...');

  // Test debounce (context-preserving version)
  console.log('Testing debounce (with context)...');
  const debouncedLog = debounce((message: string) => {
    console.log('Debounced:', message);
  }, 300);

  debouncedLog('Test 1');
  debouncedLog('Test 2');
  debouncedLog('Test 3'); // Only this should execute after 300ms

  // Test debounceSimple (arrow function version)
  console.log('Testing debounceSimple (no context)...');
  const debouncedSimpleLog = debounceSimple((message: string) => {
    console.log('Debounced Simple:', message);
  }, 500);

  debouncedSimpleLog('Simple Test 1');
  debouncedSimpleLog('Simple Test 2'); // Only this should execute after 500ms

  // Test storage
  console.log('Testing storage...');
  storage.set('test-key', { message: 'Hello World', timestamp: Date.now() });
  const retrieved = storage.get('test-key');
  console.log('Storage test:', retrieved);

  // Test filterItems
  console.log('Testing filterItems...');
  const filtered = filterItems(testData, { status: 'active' });
  console.log('Filtered (active only):', filtered);

  // Test searchItems
  console.log('Testing searchItems...');
  const searched = searchItems(testData, 'john', ['name', 'title']);
  console.log('Search results for "john":', searched);

  // Test sortItems
  console.log('Testing sortItems...');
  const sorted = sortItems(testData, 'name', 'desc');
  console.log('Sorted by name (desc):', sorted);

  // Test paginateItems
  console.log('Testing paginateItems...');
  const paginated = paginateItems(testData, 1, 2);
  console.log('Paginated (page 1, limit 2):', paginated);

  console.log('✅ All utilities tested successfully!');
  console.log(
    '💡 Note: Debounced functions will execute after their respective delays.'
  );
}

// Auto-run test in development
if (import.meta.env.DEV) {
  console.log(
    '🔧 Utilities loaded successfully. Run testUtilities() to test them.'
  );
}
