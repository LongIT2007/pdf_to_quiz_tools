// Image Routes
import { Router } from "express";
import { uploadImage, imageUploadDir } from "../middleware/uploadImage";
import { APIResponse } from "../types";
import { logger } from "../utils/logger";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Upload image endpoint
router.post("/upload", uploadImage.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      } as APIResponse);
    }

    // Return relative URL path that can be served statically
    // In production, you might want to upload to S3 or similar
    const imageUrl = `/api/images/${req.file.filename}`;
    
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

