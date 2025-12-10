// Image Routes
import { Router, Request } from "express";
import { uploadImage, imageUploadDir } from "../middleware/uploadImage";
import { APIResponse } from "../types";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Helper function to get base URL
function getBaseUrl(req: Request): string {
  // Use BASE_URL or APP_URL from env if available (preferred for production)
  const baseUrl = config.BASE_URL || config.APP_URL;
  if (baseUrl) {
    return baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  
  // Fallback to request protocol and host
  // Handle proxy headers (X-Forwarded-Proto, X-Forwarded-Host) for services like Render
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
  
  // Ensure https in production
  const finalProtocol = process.env.NODE_ENV === 'production' && !req.get('x-forwarded-proto') 
    ? 'https' 
    : protocol;
  
  return `${finalProtocol}://${host}`;
}

// Upload image endpoint
router.post("/upload", uploadImage.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      } as APIResponse);
    }

    // Return full URL with hostname for production, relative URL for development
    const baseUrl = getBaseUrl(req);
    const imageUrl = `${baseUrl}/api/images/${req.file.filename}`;
    
    logger.info(`Image uploaded: ${imageUrl}`);
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
      },
      message: "Image uploaded successfully",
    } as APIResponse);
  } catch (error: any) {
    logger.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload image",
    } as APIResponse);
  }
});

// Serve uploaded images
router.get("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(imageUploadDir, filename);
    res.sendFile(filePath);
  } catch (error: any) {
    logger.error("Error serving image:", error);
    res.status(404).json({
      success: false,
      error: "Image not found",
    } as APIResponse);
  }
});

export default router;

