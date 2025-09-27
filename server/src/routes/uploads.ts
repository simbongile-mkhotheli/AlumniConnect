import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateAdmin } from '../middleware/auth';
import { fileUploadSchema } from '../schemas/validation';

export const uploadsRouter = Router();

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv'
];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// File size limits (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB for images

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Secure filename generation
const generateSecureFilename = (originalname: string, mimetype: string): string => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname).toLowerCase();
  
  // Validate extension matches mimetype
  const expectedExts: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'], 
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv']
  };
  
  const validExts = expectedExts[mimetype] || [];
  if (!validExts.includes(ext)) {
    throw new Error(`File extension ${ext} does not match mimetype ${mimetype}`);
  }
  
  return `${timestamp}_${randomBytes}${ext}`;
};

// Multer configuration with security checks
const storage = multer.memoryStorage(); // Store in memory for security scanning

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check if file type is allowed
    if (!ALL_ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} not allowed`));
    }
    
    // Check filename for dangerous patterns
    if (/[<>:"\/\\|?*\x00-\x1f]/.test(file.originalname)) {
      return cb(new Error('Filename contains invalid characters'));
    }
    
    // Check for executable extensions
    const ext = path.extname(file.originalname).toLowerCase();
    const dangerousExts = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.js', '.vbs', '.jar'];
    if (dangerousExts.includes(ext)) {
      return cb(new Error('Executable files are not allowed'));
    }
    
    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Max 5 files per request
    fields: 10,
    fieldNameSize: 50,
    fieldSize: 1024 * 100, // 100KB for text fields
  }
});

// Security scanner for file content
const scanFileContent = (buffer: Buffer, mimetype: string): boolean => {
  // Check for malicious patterns in file headers
  const header = buffer.subarray(0, 512).toString('hex');
  
  // Check for embedded scripts or malicious content
  const maliciousPatterns = [
    '3c7363726970743e', // <script>
    '6a617661736372697074', // javascript
    '766273637269707473', // vbscript  
    '3c696672616d65', // <iframe
    '3c656d626564', // <embed
    '3c6f626a656374' // <object
  ];
  
  for (const pattern of maliciousPatterns) {
    if (header.includes(pattern)) {
      return false;
    }
  }
  
  // Validate file signatures for images
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    const signatures: Record<string, string[]> = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'image/gif': ['474946383761', '474946383961'],
      'image/webp': ['52494646']
    };
    
    const expectedSigs = signatures[mimetype];
    if (expectedSigs) {
      const fileSignature = header.substring(0, 12);
      const isValid = expectedSigs.some(sig => fileSignature.startsWith(sig));
      if (!isValid) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Upload single file endpoint
 */
uploadsRouter.post('/single', authenticateAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: 'NO_FILE'
      });
    }
    
    const file = req.file;
    
    // Validate file with Zod schema
    try {
      fileUploadSchema.parse({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        error: 'VALIDATION_ERROR',
        details: validationError
      });
    }
    
    // Scan file content for malicious patterns
    if (!scanFileContent(file.buffer, file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File content validation failed',
        error: 'MALICIOUS_CONTENT'
      });
    }
    
    // Generate secure filename
    const secureFilename = generateSecureFilename(file.originalname, file.mimetype);
    const filepath = path.join(UPLOAD_DIR, secureFilename);
    
    // Write file to disk
    await fs.promises.writeFile(filepath, file.buffer);
    
    // Log upload for audit trail
    console.log(`File uploaded: ${secureFilename} by ${req.user?.email || 'unknown'}`);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: secureFilename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof multer.MulterError) {
      let message = 'Upload failed';
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = 'File too large';
      } else if (error.code === 'LIMIT_FILE_COUNT') {
        message = 'Too many files';
      }
      
      return res.status(400).json({
        success: false,
        message,
        error: error.code
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: 'UPLOAD_ERROR'
    });
  }
});

/**
 * Upload multiple files endpoint
 */
uploadsRouter.post('/multiple', authenticateAdmin, upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
        error: 'NO_FILES'
      });
    }
    
    const uploadedFiles = [];
    const errors = [];
    
    for (const file of files) {
      try {
        // Validate each file
        fileUploadSchema.parse({
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        
        // Scan content
        if (!scanFileContent(file.buffer, file.mimetype)) {
          errors.push({
            filename: file.originalname,
            error: 'Malicious content detected'
          });
          continue;
        }
        
        // Generate secure filename and save
        const secureFilename = generateSecureFilename(file.originalname, file.mimetype);
        const filepath = path.join(UPLOAD_DIR, secureFilename);
        
        await fs.promises.writeFile(filepath, file.buffer);
        
        uploadedFiles.push({
          filename: secureFilename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        });
        
      } catch (fileError) {
        errors.push({
          filename: file.originalname,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }
    
    console.log(`Batch upload: ${uploadedFiles.length} files uploaded, ${errors.length} errors by ${req.user?.email || 'unknown'}`);
    
    res.json({
      success: errors.length === 0,
      message: `${uploadedFiles.length} files uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      data: {
        uploaded: uploadedFiles,
        errors: errors,
        uploadedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Batch upload error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Batch upload failed',
      error: 'BATCH_UPLOAD_ERROR'
    });
  }
});

/**
 * Get file endpoint (with access control)
 */
uploadsRouter.get('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename format (prevent directory traversal)
    if (!/^[0-9]+_[a-f0-9]{16}\.[a-z0-9]+$/.test(filename)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename format',
        error: 'INVALID_FILENAME'
      });
    }
    
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        error: 'FILE_NOT_FOUND'
      });
    }
    
    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Stream file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('File serve error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: 'FILE_SERVE_ERROR'
    });
  }
});