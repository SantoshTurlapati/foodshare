import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Server Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: 'Image size exceeds the 5MB limit.' });
      return;
    }
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }

  if (err && err.message && err.message.includes('image formats')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again later.'
  });
}
