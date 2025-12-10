// Types chính cho ứng dụng PDF to Quiz

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer" | "matching" | "gap-filling";
  options?: string[]; // Cho multiple-choice
  correctAnswer: string | number | number[] | Record<string, string>; // Index cho multiple-choice, string cho fill-blank, array cho multiple correct, object cho matching
  explanation?: string;
  points?: number;
  imageUrl?: string; // URL hình ảnh cho câu hỏi
  // Cho matching questions
  matchingPairs?: { left: string; right: string }[];
  // Cho gap-filling với nhiều chỗ trống
  gaps?: { position: number; correctAnswer: string; options?: string[] }[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
  pdfId?: string;
  metadata?: {
    totalQuestions: number;
    totalPoints: number;
    difficulty?: "easy" | "medium" | "hard";
    subject?: string;
    language?: string;
  };
}

export interface PDFDocument {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  status: "processing" | "completed" | "failed";
  extractedText?: string;
  pageCount?: number;
  errorMessage?: string;
}

export interface PDFUploadRequest {
  file: Express.Multer.File;
}

export interface QuizGenerationRequest {
  pdfId: string;
  options?: {
    questionCount?: number;
    questionTypes?: QuizQuestion["type"][];
    difficulty?: "easy" | "medium" | "hard";
    language?: string;
    includeExplanations?: boolean;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
