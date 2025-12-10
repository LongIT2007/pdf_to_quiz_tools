// Cloudinary Service
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/env";
import { logger } from "../utils/logger";

let cloudinaryConfigured = false;

// Configure Cloudinary
export function configureCloudinary() {
  if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
      secure: true,
    });
    cloudinaryConfigured = true;
    logger.success("Cloudinary configured successfully");
  } else {
    cloudinaryConfigured = false;
    logger.warn("Cloudinary credentials not found. Image uploads will use local storage.");
  }
}

// Initialize on import
configureCloudinary();

export class CloudinaryService {
  static async uploadImage(buffer: Buffer, filename: string): Promise<string> {
    // If Cloudinary is not configured, throw error
    if (!CloudinaryService.isConfigured()) {
      throw new Error("Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Empty buffer provided for upload");
    }

    return new Promise((resolve, reject) => {
      const publicId = `quiz-images/quiz-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "quiz-images", // Organize images in a folder
          public_id: publicId,
          transformation: [
            { quality: "auto:good" }, // Auto optimize quality
            { fetch_format: "auto" }, // Auto format (webp when possible)
          ],
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            logger.error("Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            logger.success(`Image uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result.secure_url);
          } else {
            reject(new Error("Upload failed: No result from Cloudinary"));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  static async deleteImage(publicId: string): Promise<void> {
    if (!CloudinaryService.isConfigured()) {
      throw new Error("Cloudinary is not configured");
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error("Cloudinary delete error:", error);
      throw error;
    }
  }

  static isConfigured(): boolean {
    return cloudinaryConfigured;
  }
}

