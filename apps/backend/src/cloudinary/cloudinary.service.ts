import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    // Check file size (limit to 5MB max to save free tier storage/bandwidth)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WEBP, GIF, and SVG are allowed.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'corpass',
          // Auto-optimization settings to save free tier bandwidth and transformations
          transformation: [
            { quality: 'auto' }, // Selects best compression/quality trade-off
            { fetch_format: 'auto' }, // Automatically delivers WebP/AVIF if browser supports it
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Upload file directly from memory stream
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
