// API Client
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface PDFDocument {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  status: "processing" | "completed" | "failed";
  extractedText?: string;
  pageCount?: number;
  errorMessage?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer";
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
  pdfId?: string;
  metadata?: {
    totalQuestions: number;
    totalPoints: number;
    difficulty?: "easy" | "medium" | "hard";
    subject?: string;
    language?: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// PDF API
export const pdfAPI = {
  upload: async (file: File): Promise<PDFDocument> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<APIResponse<PDFDocument>>("/pdfs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to upload PDF");
    }

    return response.data.data!;
  },

  getAll: async (page = 1, limit = 20) => {
    const response = await api.get<APIResponse>(`/pdfs?page=${page}&limit=${limit}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch PDFs");
    }
    return response.data.data;
  },

  getById: async (id: string): Promise<PDFDocument> => {
    const response = await api.get<APIResponse<PDFDocument>>(`/pdfs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch PDF");
    }
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<APIResponse>(`/pdfs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete PDF");
    }
  },
};

// Quiz API
export const quizAPI = {
  generate: async (
    pdfId: string,
    options?: {
      questionCount?: number;
      questionTypes?: QuizQuestion["type"][];
      difficulty?: "easy" | "medium" | "hard";
      language?: string;
      includeExplanations?: boolean;
    }
  ): Promise<Quiz> => {
    const response = await api.post<APIResponse<Quiz>>("/quizzes/generate", {
      pdfId,
      options,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to generate quiz");
    }

    return response.data.data!;
  },

  getAll: async (page = 1, limit = 20) => {
    const response = await api.get<APIResponse>(`/quizzes?page=${page}&limit=${limit}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch quizzes");
    }
    return response.data.data;
  },

  getById: async (id: string): Promise<Quiz> => {
    const response = await api.get<APIResponse<Quiz>>(`/quizzes/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch quiz");
    }
    return response.data.data!;
  },

  getByPDFId: async (pdfId: string): Promise<Quiz[]> => {
    const response = await api.get<APIResponse<Quiz[]>>(`/quizzes/pdf/${pdfId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch quizzes");
    }
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<APIResponse>(`/quizzes/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete quiz");
    }
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get<APIResponse>("/health");
    return response.data.success;
  } catch {
    return false;
  }
};

export default api;
