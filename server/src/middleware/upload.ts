// File upload middleware
import multer from "multer";
import { config } from "../config/env";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const uploadDir = config.UPLOAD_DIR;

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
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
