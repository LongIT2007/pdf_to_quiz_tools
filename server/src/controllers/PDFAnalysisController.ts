// PDF Analysis Controller
import { Request, Response } from "express";
import { PDFAnalysisService } from "../services/PDFAnalysisService";
import { PDFService } from "../services/PDFService";
import { APIResponse } from "../types";
import { logger } from "../utils/logger";

export class PDFAnalysisController {
  private analysisService: PDFAnalysisService;
  private pdfService: PDFService;

  constructor() {
    this.analysisService = new PDFAnalysisService();
    this.pdfService = new PDFService();
  }

  analyzePDF = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { pdfId } = req.params;

      if (!pdfId) {
        return res.status(400).json({
          success: false,
          error: "PDF ID is required",
        });
      }

      // Get PDF text
      const pdfText = await this.pdfService.getPDFText(pdfId);

      // Analyze PDF
      const analysis = await this.analysisService.analyzePDF(pdfText);

      res.json({
        success: true,
        data: analysis,
        message: "PDF analyzed successfully",
      });
    } catch (error: any) {
      logger.error("Error analyzing PDF:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to analyze PDF",
      });
    }
  };

  analyzeMultiplePDFs = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { pdfIds } = req.body;

      if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "PDF IDs array is required",
        });
      }

      // Get all PDFs text
      const pdfTexts = await Promise.all(
        pdfIds.map((id: string) => this.pdfService.getPDFText(id))
      );

      const combinedText = pdfTexts.join("\n\n---\n\n");

      // Analyze combined text
      const analysis = await this.analysisService.analyzePDF(combinedText);

      res.json({
        success: true,
        data: {
          ...analysis,
          sourcePDFs: pdfIds,
        },
        message: "Multiple PDFs analyzed successfully",
      });
    } catch (error: any) {
      logger.error("Error analyzing multiple PDFs:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to analyze PDFs",
      });
    }
  };

  generateQuizFromAnalysis = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { pdfId, pdfIds, options } = req.body;

      let analysis;

      if (pdfIds && Array.isArray(pdfIds) && pdfIds.length > 0) {
        // Multiple PDFs
        const pdfTexts = await Promise.all(
          pdfIds.map((id: string) => this.pdfService.getPDFText(id))
        );
        const combinedText = pdfTexts.join("\n\n---\n\n");
        analysis = await this.analysisService.analyzePDF(combinedText);
      } else if (pdfId) {
        // Single PDF
        const pdfText = await this.pdfService.getPDFText(pdfId);
        analysis = await this.analysisService.analyzePDF(pdfText);
      } else {
        return res.status(400).json({
          success: false,
          error: "Either pdfId or pdfIds is required",
        });
      }

      // Generate quiz from analysis
      const quiz = await this.analysisService.generateQuizFromAnalysis(analysis, options);

      // Save quiz to database
      const { QuizModel } = await import("../models/QuizModel");
      
      // Check database type and use appropriate method
      const { getDbType } = await import("../config/database");
      const dbType = getDbType();
      
      let savedQuiz: Quiz;
      
      if (dbType === "postgres") {
        // For PostgreSQL, we need async model methods
        // For now, use the sync version (will need to update models)
        savedQuiz = QuizModel.create({
          ...quiz,
          pdfId: pdfId || pdfIds?.[0],
        });
      } else {
        // SQLite - use sync create
        savedQuiz = QuizModel.create({
          ...quiz,
          pdfId: pdfId || pdfIds?.[0],
        });
      }

      res.status(201).json({
        success: true,
        data: savedQuiz,
        message: "Quiz generated from PDF analysis successfully",
      });
    } catch (error: any) {
      logger.error("Error generating quiz from analysis:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to generate quiz",
      });
    }
  };
}
