// Image upload middleware
import multer from "multer";
import { config } from "../config/env";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { CloudinaryService } from "../services/CloudinaryService";

const uploadDir = process.env.NODE_ENV === "production"
  ? (process.env.UPLOAD_DIR || "/tmp/uploads/images")
  : join(config.UPLOAD_DIR, "images");

// Ensure upload directory exists (only if not using Cloudinary)
if (!CloudinaryService.isConfigured() && !existsSync(uploadDir)) {
  try {
    mkdirSync(uploadDir, { recursive: true });
  } catch (error: any) {
    console.error(`Failed to create image upload directory: ${uploadDir}`, error);
  }
}

// Use memory storage for Cloudinary, disk storage for local
const storage = CloudinaryService.isConfigured()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'image-' + uniqueSuffix + '-' + file.originalname);
      },
    });

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.`));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const imageUploadDir = uploadDir;

