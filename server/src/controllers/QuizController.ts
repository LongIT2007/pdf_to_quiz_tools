// Quiz Controller
import { Request, Response } from "express";
import { QuizService } from "../services/QuizService";
import { APIResponse, QuizGenerationRequest } from "../types";
import { logger } from "../utils/logger";

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  generateQuiz = async (req: Request, res: Response<APIResponse>) => {
    try {
      const request: QuizGenerationRequest = {
        pdfId: req.body.pdfId,
        options: req.body.options,
      };

      if (!request.pdfId) {
        return res.status(400).json({
          success: false,
          error: "PDF ID is required",
        });
      }

      const quiz = await this.quizService.generateQuiz(request);

      res.status(201).json({
        success: true,
        data: quiz,
        message: "Quiz generated successfully",
      });
    } catch (error: any) {
      logger.error("Error generating quiz:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to generate quiz",
      });
    }
  };

  getQuiz = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { id } = req.params;
      const quiz = await this.quizService.getQuiz(id);

      res.json({
        success: true,
        data: quiz,
      });
    } catch (error: any) {
      logger.error("Error getting quiz:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to get quiz",
      });
    }
  };

  listQuizzes = async (req: Request, res: Response<APIResponse>) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.quizService.listQuizzes(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Error listing quizzes:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to list quizzes",
      });
    }
  };

  getQuizzesByPDF = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { pdfId } = req.params;
      const quizzes = await this.quizService.getQuizzesByPDF(pdfId);

      res.json({
        success: true,
        data: quizzes,
      });
    } catch (error: any) {
      logger.error("Error getting quizzes by PDF:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to get quizzes",
      });
    }
  };

  deleteQuiz = async (req: Request, res: Response<APIResponse>) => {
    try {
      const { id } = req.params;
      await this.quizService.deleteQuiz(id);

      res.json({
        success: true,
        message: "Quiz deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting quiz:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Failed to delete quiz",
      });
    }
  };
}
