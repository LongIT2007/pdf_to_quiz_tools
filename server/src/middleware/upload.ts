// File upload middleware
import multer from "multer";
import { config } from "../config/env";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

// Use same logic as PDFService for consistency
// Use /tmp on production (Render, Vercel, etc.) for writable directory
// Use configured directory in development
const uploadDir = process.env.NODE_ENV === "production"
  ? (process.env.UPLOAD_DIR || "/tmp/uploads")
  : config.UPLOAD_DIR;

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  try {
    mkdirSync(uploadDir, { recursive: true });
  } catch (error: any) {
    console.error(`Failed to create upload directory: ${uploadDir}`, error);
  }
}

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = config.ALLOWED_MIME_TYPES.split(",").map((m) =>
    m.trim()
  );

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(", ")} are allowed.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(config.MAX_FILE_SIZE),
  },
});

// Multer error handler middleware
export const handleMulterError = (
  err: any,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${parseInt(config.MAX_FILE_SIZE) / 1024 / 1024}MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error: "Unexpected file field",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "File upload error",
    });
  }
  
  next();
};
