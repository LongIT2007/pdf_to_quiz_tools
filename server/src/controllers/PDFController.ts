// PDF Controller
import { Request, Response } from "express";
import { PDFService } from "../services/PDFService";
import { APIResponse } from "../types";
import { logger } from "../utils/logger";

export class PDFController {
  private pdfService: PDFService;

  constructor() {
    this.pdfService = new PDFService();
  }

  uploadPDF = async (req: Request, res: Response<APIResponse>) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      logger.info(`Uploading PDF: ${req.file.originalname}, size: ${req.file.size} bytes`);
      const pdf = await this.pdfService.savePDF(req.file);

      res.status(201).json({
        success: true,
        data: pdf,
        message: "PDF uploaded successfully",
      });
    } catch (error: any) {
      logger.error("Error uploading PDF:", error);
      logger.error("Error stack:", error.stack);
      logger.error("Error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
      });
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to upload PDF",
        ...(process.env.NODE_ENV === "development" && { 
          details: error.stack,
          code: error.code 
        }),
      });
    }
  };

  getPDF = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { id } = req.params;
      const pdf = await this.pdfService.getPDF(id);

      res.json({
        success: true,
        data: pdf,
      });
    } catch (error: any) {
      logger.error("Error getting PDF:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to get PDF",
      });
    }
  };

  listPDFs = async (req: Request, res: Response<APIResponse>) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.pdfService.listPDFs(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Error listing PDFs:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to list PDFs",
      });
    }
  };

  deletePDF = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { id } = req.params;
      await this.pdfService.deletePDF(id);

      res.json({
        success: true,
        message: "PDF deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting PDF:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to delete PDF",
      });
    }
  };
}
