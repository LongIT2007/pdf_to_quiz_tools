// Error handling middleware
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import multer from "multer";

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    logger.error("Multer error:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Unknown error - log full details
  logger.error("Unhandled error:", err);
  logger.error("Error stack:", err.stack);
  logger.error("Request path:", req.path);
  logger.error("Request method:", req.method);
  
  res.status(500).json({
    success: false,
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { 
      details: err.message,
      stack: err.stack 
    }),
  });
}
