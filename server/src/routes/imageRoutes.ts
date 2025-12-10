// Image Routes
import { Router, Request } from "express";
import { uploadImage, imageUploadDir } from "../middleware/uploadImage";
import { CloudinaryService } from "../services/CloudinaryService";
import { APIResponse } from "../types";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { existsSync } from "fs";
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

// Get Cloudinary upload URL (for direct client upload - faster)
router.get("/upload/config", async (req, res) => {
  try {
    if (!CloudinaryService.isConfigured()) {
      return res.json({
        success: true,
        data: {
          useDirectUpload: false,
        },
      } as APIResponse);
    }

    const cloudName = config.CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = config.CLOUDINARY_UPLOAD_PRESET;
    
    // If unsigned preset is configured, use direct upload
    if (uploadPreset) {
      return res.json({
        success: true,
        data: {
          useDirectUpload: true,
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        },
        message: "Direct upload configured",
      } as APIResponse);
    }
    
    // Otherwise, generate signed upload parameters
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "quiz-images",
      },
      config.CLOUDINARY_API_SECRET!
    );
    
    res.json({
      success: true,
      data: {
        useDirectUpload: true,
        cloudName: cloudName,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        timestamp: timestamp,
        signature: signature,
        apiKey: config.CLOUDINARY_API_KEY,
      },
      message: "Signed upload URL generated",
    } as APIResponse);
  } catch (error: any) {
    logger.error("Error generating upload config:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate upload config",
    } as APIResponse);
  }
});

// Upload image endpoint (fallback if direct upload not available)
router.post("/upload", uploadImage.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      } as APIResponse);
    }

    let imageUrl: string;
    let filename: string;

    // Upload to Cloudinary if configured, otherwise use local storage
    if (CloudinaryService.isConfigured()) {
      // Upload to Cloudinary via server
      const buffer = req.file.buffer || Buffer.from([]);
      imageUrl = await CloudinaryService.uploadImage(buffer, req.file.originalname);
      filename = imageUrl; // Use Cloudinary URL as filename identifier
      
      logger.info(`Image uploaded to Cloudinary via server: ${imageUrl}`);
    } else {
      // Use local storage
      const baseUrl = getBaseUrl(req);
      imageUrl = `${baseUrl}/api/images/${req.file.filename}`;
      filename = req.file.filename;
      
      logger.info(`Image uploaded locally: ${imageUrl}`);
    }
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: filename,
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

// Serve uploaded images (only for local storage, Cloudinary images are served directly)
router.get("/:filename", async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    
    // If filename is a Cloudinary URL (starts with http:// or https://), redirect to it
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return res.redirect(filename);
    }
    
    // If Cloudinary is configured, we shouldn't serve local files (they're in memory only)
    if (CloudinaryService.isConfigured()) {
      return res.status(404).json({
        success: false,
        error: "Image not found. Using Cloudinary storage.",
      } as APIResponse);
    }
    
    // Otherwise, serve from local storage
    const filePath = path.join(imageUploadDir, filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Image not found",
      } as APIResponse);
    }
    
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

