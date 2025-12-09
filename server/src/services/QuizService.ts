// Quiz Service
import { Quiz, QuizGenerationRequest } from "../types";
import { QuizModel } from "../models/QuizModel";
import { PDFService } from "./PDFService";
import { AIService } from "./AIService";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class QuizService {
  private pdfService: PDFService;
  private aiService: AIService;

  constructor() {
    this.pdfService = new PDFService();
    this.aiService = new AIService();
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<Quiz> {
    // Get PDF text
    const pdfText = await this.pdfService.getPDFText(request.pdfId);

    // Generate quiz using AI
    const quiz = await this.aiService.generateQuiz(pdfText, request.options);

    // Save quiz to database
    const savedQuiz = QuizModel.create({
      ...quiz,
      pdfId: request.pdfId,
    });

    logger.success(`Quiz generated: ${savedQuiz.id} from PDF: ${request.pdfId}`);

    return savedQuiz;
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    const quiz = QuizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }
    return quiz;
  }

  async listQuizzes(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const quizzes = QuizModel.findAll(limit, offset);
    const total = QuizModel.count();

    return {
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuizzesByPDF(pdfId: string): Promise<Quiz[]> {
    // Verify PDF exists
    await this.pdfService.getPDF(pdfId);
    
    return QuizModel.findByPDFId(pdfId);
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quiz = QuizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundError("Quiz");
    }
    QuizModel.delete(quizId);
    logger.info(`Quiz deleted: ${quizId}`);
  }
}
