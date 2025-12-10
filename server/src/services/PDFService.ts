// PDF Processing Service
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { Readable } from "stream";
import pdf from "pdf-parse";
import { PDFDocument } from "../types";
import { PDFModel } from "../models/PDFModel";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { NotFoundError, InternalServerError } from "../utils/errors";

export class PDFService {
  private uploadDir: string;

  constructor() {
    // Use /tmp on production (Render, Vercel, etc.) for writable directory
    // Use configured directory in development
    if (process.env.NODE_ENV === "production") {
      this.uploadDir = process.env.UPLOAD_DIR || "/tmp/uploads";
    } else {
      this.uploadDir = config.UPLOAD_DIR;
    }
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    try {
      if (!existsSync(this.uploadDir)) {
        mkdirSync(this.uploadDir, { recursive: true });
        logger.info(`Created upload directory: ${this.uploadDir}`);
      } else {
        logger.info(`Upload directory exists: ${this.uploadDir}`);
      }
      
      // Test write permissions
      const testFile = join(this.uploadDir, ".test-write");
      try {
        writeFileSync(testFile, "test");
        unlinkSync(testFile);
        logger.info(`Upload directory is writable: ${this.uploadDir}`);
      } catch (writeTestError: any) {
        logger.error(`Upload directory is NOT writable: ${this.uploadDir}`, writeTestError);
        throw new Error(`Cannot write to upload directory: ${writeTestError.message}`);
      }
    } catch (error: any) {
      logger.error(`Failed to setup upload directory: ${this.uploadDir}`, error);
      throw error;
    }
  }

  async savePDF(file: Express.Multer.File): Promise<PDFDocument> {
    try {
      logger.info(`Starting PDF save: ${file.originalname}, size: ${file.size}`);
      
      const filename = `${Date.now()}_${file.originalname}`;
      const filePath = join(this.uploadDir, filename);

      logger.info(`Upload directory: ${this.uploadDir}`);
      logger.info(`File path: ${filePath}`);

      // Try to write file
      try {
        writeFileSync(filePath, file.buffer);
        logger.info(`File written successfully: ${filePath}`);
      } catch (writeError: any) {
        logger.error("Error writing file:", writeError);
        logger.error("Write error details:", {
          code: writeError.code,
          errno: writeError.errno,
          path: writeError.path,
        });
        throw new InternalServerError(`Failed to write file: ${writeError.message}`);
      }

      // Try to save to database
      logger.info("Saving PDF to database...");
      let pdfDoc;
      try {
        pdfDoc = await PDFModel.create({
          filename,
          originalName: file.originalname,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          status: "processing",
        });
        logger.info(`PDF saved to database: ${pdfDoc.id}`);
      } catch (dbError: any) {
        logger.error("Error saving to database:", dbError);
        logger.error("Database error details:", {
          message: dbError.message,
          code: dbError.code,
          stack: dbError.stack,
        });
        // Try to clean up file if database insert failed
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
            logger.info("Cleaned up file after database error");
          }
        } catch (cleanupError) {
          logger.error("Error cleaning up file:", cleanupError);
        }
        throw new InternalServerError(`Failed to save PDF to database: ${dbError.message}`);
      }

      logger.success(`PDF saved: ${pdfDoc.id} - ${file.originalname}`);

      // Process PDF asynchronously
      this.processPDF(pdfDoc.id).catch(async (error) => {
        logger.error(`Failed to process PDF ${pdfDoc.id}:`, error);
        await PDFModel.update(pdfDoc.id, {
          status: "failed",
          errorMessage: error.message,
        });
      });

      return pdfDoc;
    } catch (error: any) {
      logger.error("Error saving PDF:", error);
      logger.error("Full error stack:", error.stack);
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError(`Failed to save PDF: ${error.message}`);
    }
  }

  async processPDF(pdfId: string): Promise<void> {
    const pdfDoc = await PDFModel.findById(pdfId);
    if (!pdfDoc) {
      throw new NotFoundError("PDF document");
    }

    try {
      logger.info(`Processing PDF: ${pdfId}`);

      // Read PDF file
      const fs = await import("fs");
      const pdfBuffer = await fs.promises.readFile(pdfDoc.filePath);

      // Parse PDF
      const pdfData = await pdf(pdfBuffer);

      // Update PDF document with extracted text
      await PDFModel.update(pdfId, {
        status: "completed",
        extractedText: pdfData.text,
        pageCount: pdfData.numpages,
      });

      logger.success(`PDF processed: ${pdfId} - ${pdfData.numpages} pages`);
    } catch (error: any) {
      logger.error(`Error processing PDF ${pdfId}:`, error);
      await PDFModel.update(pdfId, {
        status: "failed",
        errorMessage: error.message,
      });
      throw error;
    }
  }

  async getPDFText(pdfId: string): Promise<string> {
    const pdfDoc = await PDFModel.findById(pdfId);
    if (!pdfDoc) {
      throw new NotFoundError("PDF document");
    }

    if (pdfDoc.status !== "completed" || !pdfDoc.extractedText) {
      throw new InternalServerError("PDF is still processing or processing failed");
    }

    return pdfDoc.extractedText;
  }

  async getPDF(pdfId: string): Promise<PDFDocument> {
    const pdfDoc = await PDFModel.findById(pdfId);
    if (!pdfDoc) {
      throw new NotFoundError("PDF document");
    }
    return pdfDoc;
  }

  async deletePDF(pdfId: string): Promise<void> {
    const pdfDoc = await PDFModel.findById(pdfId);
    if (!pdfDoc) {
      throw new NotFoundError("PDF document");
    }

    // Delete file
    if (existsSync(pdfDoc.filePath)) {
      unlinkSync(pdfDoc.filePath);
    }

    // Delete from database
    await PDFModel.delete(pdfId);
    logger.info(`PDF deleted: ${pdfId}`);
  }

  async listPDFs(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const pdfs = await PDFModel.findAll(limit, offset);
    const total = await PDFModel.count();

    return {
      data: pdfs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
