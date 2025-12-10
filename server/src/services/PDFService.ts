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
    this.uploadDir = config.UPLOAD_DIR;
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
      logger.info(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async savePDF(file: Express.Multer.File): Promise<PDFDocument> {
    try {
      const filename = `${Date.now()}_${file.originalname}`;
      const filePath = join(this.uploadDir, filename);

      writeFileSync(filePath, file.buffer);

      const pdfDoc = await PDFModel.create({
        filename,
        originalName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: "processing",
      });

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
