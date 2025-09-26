const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/mentorship/__tests__/mentorshipService.test.ts');

// Read the file  
let content = fs.readFileSync(filePath, 'utf8');

// Simple replacements first
content = content.replace(
  '../mentorshipService',
  '../services/mentorshipService'
);

content = content.replace(
  '../api',
  '@shared/services'
);

content = content.replace(
  'ApiService from \'@shared/services\'',
  '{ ApiService } from \'@shared/services\''
);

content = content.replace(
  '../mockApis',
  '../services/mockApi'
);

content = content.replace(
  '../endpoints',
  '../services/endpoints'
);

content = content.replace(
  'MENTORSHIP } from',
  'MENTORSHIP_ENDPOINTS as MENTORSHIP } from'
);

// Fix types import
content = content.replace(
  "} from '../../types';",
  "} from '../types';\nimport type {\n  ApiResponse,\n  PaginatedResponse,\n  FilterState,\n} from '@shared/types';"
);

// Add message to responses
content = content.replace(
  'success: true,\n  };',
  'success: true,\n    message: \'Operation completed successfully\',\n  };'
);

content = content.replace(
  'success: true\n  };',
  'success: true,\n    message: \'Operation completed successfully\'\n  };'
);

// Fix null to void
content = content.replace(
  'ApiResponse<null>',
  'ApiResponse<void>'
);

content = content.replace(
  'data: null',
  'data: undefined'
);

// Write back
fs.writeFileSync(filePath, content);
console.log('Applied basic fixes to mentorship test file');