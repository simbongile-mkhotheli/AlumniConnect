import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export interface FileUploadRequest extends AuthRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}