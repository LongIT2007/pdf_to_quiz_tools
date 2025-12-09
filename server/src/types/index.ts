// Types chính cho ứng dụng PDF to Quiz

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer";
  options?: string[]; // Cho multiple-choice
  correctAnswer: string | number; // Index cho multiple-choice hoặc answer cho các loại khác
  explanation?: string;
  points?: number;
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
