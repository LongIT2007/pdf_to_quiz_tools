// PDF Analysis Service - Smart Question/Answer Detection
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { Quiz, QuizQuestion } from "../types";

export interface PDFAnalysisResult {
  hasQuestions: boolean;
  hasAnswers: boolean;
  questions: string[];
  answers: string[];
  questionAnswerPairs?: Array<{ question: string; answer: string; options?: string[] }>;
  documentType: "mixed" | "questions-only" | "answers-only" | "unknown";
}

export class PDFAnalysisService {
  async analyzePDF(text: string): Promise<PDFAnalysisResult> {
    try {
      if (config.AI_PROVIDER === "openai") {
        return await this.analyzeWithOpenAI(text);
      } else if (config.AI_PROVIDER === "ollama") {
        return await this.analyzeWithOllama(text);
      } else {
        return this.analyzeSimple(text);
      }
    } catch (error: any) {
      logger.error("Error analyzing PDF:", error);
      return this.analyzeSimple(text);
    }
  }

  private async analyzeWithOpenAI(text: string): Promise<PDFAnalysisResult> {
    if (!config.OPENAI_API_KEY) {
      return this.analyzeSimple(text);
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });

    const prompt = this.buildAnalysisPrompt(text);

    logger.info("Analyzing PDF with OpenAI for questions and answers...");

    const response = await openai.chat.completions.create({
      model: config.AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing educational documents. Identify questions, answers, and match them correctly. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const analysis = JSON.parse(content);
    return this.parseAnalysisResponse(analysis);
  }

  private async analyzeWithOllama(text: string): Promise<PDFAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(text);

    logger.info(`Analyzing PDF with Ollama (${config.OLLAMA_MODEL})...`);

    try {
      const response = await fetch(`${config.OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          format: "json",
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(data.response);
      return this.parseAnalysisResponse(analysis);
    } catch (error: any) {
      logger.warn(`Ollama analysis failed: ${error.message}, falling back to simple analysis`);
      return this.analyzeSimple(text);
    }
  }

  private analyzeSimple(text: string): PDFAnalysisResult {
    // Simple rule-based analysis
    const lines = text.split(/\n+/).filter((line) => line.trim().length > 10);
    
    const questions: string[] = [];
    const answers: string[] = [];
    const pairs: Array<{ question: string; answer: string; options?: string[] }> = [];

    // Look for question patterns
    lines.forEach((line, index) => {
      // Question patterns: numbers, question marks, "Câu", etc.
      if (
        /^\d+[\.\)]\s/.test(line) ||
        /[?？]$/.test(line) ||
        /^(Câu|Question|Câu hỏi)/i.test(line)
      ) {
        questions.push(line);
      }

      // Answer patterns: "Đáp án", "Answer", letters (A, B, C, D), etc.
      if (
        /^(Đáp án|Answer|Đáp|Key)/i.test(line) ||
        /^[A-D][\.\)]\s/.test(line) ||
        /^(Correct|Đúng)/i.test(line)
      ) {
        answers.push(line);
      }
    });

    // Try to match questions with answers
    questions.forEach((q, qIndex) => {
      const answerIndex = answers[qIndex] || answers[0];
      if (answerIndex) {
        pairs.push({
          question: q,
          answer: answerIndex,
        });
      }
    });

    return {
      hasQuestions: questions.length > 0,
      hasAnswers: answers.length > 0,
      questions,
      answers,
      questionAnswerPairs: pairs.length > 0 ? pairs : undefined,
      documentType:
        questions.length > 0 && answers.length > 0
          ? "mixed"
          : questions.length > 0
          ? "questions-only"
          : answers.length > 0
          ? "answers-only"
          : "unknown",
    };
  }

  private buildAnalysisPrompt(text: string): string {
    const textPreview = text.substring(0, 6000); // Limit text length

    return `Analyze this PDF content and identify questions and answers. The document may contain:
1. Questions only
2. Answers only  
3. Both questions and answers (mixed)
4. Questions with multiple choice options

PDF Content:
${textPreview}

Please analyze and return JSON with this structure:
{
  "hasQuestions": boolean,
  "hasAnswers": boolean,
  "questions": ["question 1", "question 2", ...],
  "answers": ["answer 1", "answer 2", ...],
  "questionAnswerPairs": [
    {
      "question": "question text",
      "answer": "correct answer",
      "options": ["option A", "option B", "option C", "option D"] // if multiple choice
    }
  ],
  "documentType": "mixed" | "questions-only" | "answers-only" | "unknown"
}

Rules:
- Identify all questions (look for question marks, numbered items, "Câu hỏi", etc.)
- Identify all answers (look for "Đáp án", answer keys, correct answers)
- If questions and answers are in same document, match them correctly
- Extract multiple choice options if present
- Return empty arrays if nothing found`;
  }

  private parseAnalysisResponse(aiData: any): PDFAnalysisResult {
    return {
      hasQuestions: aiData.hasQuestions || false,
      hasAnswers: aiData.hasAnswers || false,
      questions: aiData.questions || [],
      answers: aiData.answers || [],
      questionAnswerPairs: aiData.questionAnswerPairs || [],
      documentType: aiData.documentType || "unknown",
    };
  }

  async generateQuizFromAnalysis(
    analysis: PDFAnalysisResult,
    options?: {
      questionCount?: number;
      language?: string;
    }
  ): Promise<Quiz> {
    const { default: AIService } = await import("./AIService");
    const aiService = new AIService();

    // If we have question-answer pairs, create quiz directly
    if (analysis.questionAnswerPairs && analysis.questionAnswerPairs.length > 0) {
      const questions: QuizQuestion[] = analysis.questionAnswerPairs.slice(0, options?.questionCount || 10).map((pair, index) => {
        if (pair.options && pair.options.length >= 2) {
          // Multiple choice
          const correctIndex = pair.options.findIndex((opt: string) =>
            opt.toLowerCase().includes(pair.answer.toLowerCase())
          );

          return {
            id: `q_${index + 1}`,
            question: pair.question,
            type: "multiple-choice",
            options: pair.options,
            correctAnswer: correctIndex >= 0 ? correctIndex : 0,
            points: 1,
          };
        } else {
          // Fill in the blank or short answer
          return {
            id: `q_${index + 1}`,
            question: pair.question,
            type: "fill-blank",
            correctAnswer: pair.answer,
            points: 1,
          };
        }
      });

      return {
        id: "temp_quiz",
        title: "Quiz từ PDF",
        description: "Quiz được tạo tự động từ phân tích PDF",
        questions,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          totalQuestions: questions.length,
          totalPoints: questions.length,
          difficulty: "medium",
          language: options?.language || "vi",
        },
      };
    }

    // If only questions or answers, use AI to generate quiz
    const content = analysis.hasQuestions
      ? `Questions:\n${analysis.questions.join("\n\n")}`
      : analysis.hasAnswers
      ? `Answers:\n${analysis.answers.join("\n\n")}`
      : "";

    return await aiService.generateQuiz(content, options);
  }
}
