// AI Service for Quiz Generation
import { Quiz, QuizQuestion, QuizGenerationRequest } from "../types";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { InternalServerError } from "../utils/errors";

export class AIService {
  async generateQuiz(
    text: string,
    options?: QuizGenerationRequest["options"]
  ): Promise<Quiz> {
    try {
      if (config.AI_PROVIDER === "openai") {
        return await this.generateQuizWithOpenAI(text, options);
      } else if (config.AI_PROVIDER === "ollama") {
        return await this.generateQuizWithOllama(text, options);
      } else {
        // Fallback to simple rule-based generation
        return await this.generateQuizSimple(text, options);
      }
    } catch (error: any) {
      logger.error("Error generating quiz:", error);
      throw new InternalServerError(`Failed to generate quiz: ${error.message}`);
    }
  }

  private async generateQuizWithOpenAI(
    text: string,
    options?: QuizGenerationRequest["options"]
  ): Promise<Quiz> {
    if (!config.OPENAI_API_KEY) {
      logger.warn("OpenAI API key not found, falling back to simple generation");
      return await this.generateQuizSimple(text, options);
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });

    const questionCount = options?.questionCount || 10;
    const language = options?.language || "vi";
    const includeExplanations = options?.includeExplanations ?? true;

    const prompt = this.buildQuizPrompt(text, {
      questionCount,
      language,
      includeExplanations,
      questionTypes: options?.questionTypes || ["multiple-choice"],
      difficulty: options?.difficulty || "medium",
    });

    logger.info("Generating quiz with OpenAI...");

    const response = await openai.chat.completions.create({
      model: config.AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert quiz generator. Generate high-quality quiz questions from the provided text. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const quizData = JSON.parse(content);
    return this.parseAIResponse(quizData, text);
  }

  private async generateQuizWithOllama(
    text: string,
    options?: QuizGenerationRequest["options"]
  ): Promise<Quiz> {
    const questionCount = options?.questionCount || 10;
    const language = options?.language || "vi";
    const includeExplanations = options?.includeExplanations ?? true;

    const prompt = this.buildQuizPrompt(text, {
      questionCount,
      language,
      includeExplanations,
      questionTypes: options?.questionTypes || ["multiple-choice"],
      difficulty: options?.difficulty || "medium",
    });

    logger.info(`Generating quiz with Ollama (${config.OLLAMA_MODEL})...`);

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
      const quizData = JSON.parse(data.response);
      return this.parseAIResponse(quizData, text);
    } catch (error: any) {
      logger.warn(`Ollama generation failed: ${error.message}, falling back to simple generation`);
      return await this.generateQuizSimple(text, options);
    }
  }

  private async generateQuizSimple(
    text: string,
    options?: QuizGenerationRequest["options"]
  ): Promise<Quiz> {
    // Simple rule-based quiz generation as fallback
    logger.info("Generating quiz with simple rules...");

    const sentences = text
      .split(/[.!?]\s+/)
      .filter((s) => s.length > 20)
      .slice(0, options?.questionCount || 10);

    const questions: QuizQuestion[] = sentences.map((sentence, index) => {
      const words = sentence.split(/\s+/);
      const blankWord = words[Math.floor(words.length / 2)];
      const questionText = sentence.replace(blankWord, "______");

      return {
        id: `q_${index + 1}`,
        question: questionText,
        type: "fill-blank",
        correctAnswer: blankWord,
        points: 1,
      };
    });

    return {
      id: "temp_quiz",
      title: "Generated Quiz",
      description: "Quiz generated from PDF content",
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0),
        difficulty: options?.difficulty || "medium",
        language: options?.language || "vi",
      },
    };
  }

  private buildQuizPrompt(
    text: string,
    options: {
      questionCount: number;
      language: string;
      includeExplanations: boolean;
      questionTypes: QuizQuestion["type"][];
      difficulty: "easy" | "medium" | "hard";
    }
  ): string {
    const textPreview = text.substring(0, 4000); // Limit text length

    return `Generate a quiz from the following text in ${options.language} language.

Text content:
${textPreview}

Requirements:
- Generate exactly ${options.questionCount} questions
- Question types: ${options.questionTypes.join(", ")}
- Difficulty level: ${options.difficulty}
- ${options.includeExplanations ? "Include explanations for each answer" : "No explanations needed"}
- For multiple-choice questions, provide 4 options with only one correct answer

Respond with JSON in this exact format:
{
  "title": "Quiz title",
  "description": "Quiz description",
  "questions": [
    {
      "question": "Question text",
      "type": "multiple-choice",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation (if required)",
      "points": 1
    }
  ],
  "metadata": {
    "totalQuestions": ${options.questionCount},
    "totalPoints": ${options.questionCount},
    "difficulty": "${options.difficulty}",
    "language": "${options.language}"
  }
}`;
  }

  private parseAIResponse(aiData: any, sourceText: string): Quiz {
    const questions: QuizQuestion[] = (aiData.questions || []).map((q: any, index: number) => ({
      id: `q_${index + 1}`,
      question: q.question,
      type: q.type || "multiple-choice",
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points || 1,
    }));

    return {
      id: "temp_quiz",
      title: aiData.title || "Generated Quiz",
      description: aiData.description || "Quiz generated from PDF content",
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: aiData.metadata || {
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0),
        difficulty: "medium",
        language: "vi",
      },
    };
  }
}
