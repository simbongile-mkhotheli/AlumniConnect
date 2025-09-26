const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/events/__tests__/eventsService.test.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix patterns for ApiResponse<Event[]> with missing message
const patterns = [
  {
    search: /const eventsResponse: ApiResponse<Event\[\]> = \{\s*data: \[mockEvent\],\s*success: true,\s*\};/g,
    replace: `const eventsResponse: ApiResponse<Event[]> = {
        data: [mockEvent],
        success: true,
        message: 'Events retrieved successfully',
      };`
  },
  {
    search: /const bulkResponse: ApiResponse<any> = \{\s*data: \{ processed: (\d+), success: (\d+), failed: (\d+) \},\s*success: true,\s*\};/g,
    replace: `const bulkResponse: ApiResponse<any> = {
        data: { processed: $1, success: $2, failed: $3 },
        success: true,
        message: 'Bulk operation completed',
      };`
  },
  {
    search: /const bulkResponse: ApiResponse<any> = \{\s*data: \{ processed: (\d+) \},\s*success: true,\s*\};/g,
    replace: `const bulkResponse: ApiResponse<any> = {
        data: { processed: $1 },
        success: true,
        message: 'Bulk operation completed',
      };`
  }
];

// Apply all patterns
patterns.forEach(pattern => {
  content = content.replace(pattern.search, pattern.replace);
});

// Write back
fs.writeFileSync(filePath, content);

console.log('Fixed API response objects in events test file');