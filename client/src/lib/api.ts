// API Client
import axios from "axios";

// Normalize API_BASE_URL - remove trailing /api if present for axios baseURL
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/api\/?$/, ''); // Remove trailing /api
const AXIOS_BASE_URL = `${API_BASE_URL}/api`; // Always add /api for axios

const api = axios.create({
  baseURL: AXIOS_BASE_URL,
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
  type: "multiple-choice" | "true-false" | "fill-blank" | "short-answer" | "matching" | "gap-filling";
  options?: string[];
  correctAnswer: string | number | number[] | Record<string, string>;
  explanation?: string;
  points?: number;
  imageUrl?: string;
  matchingPairs?: { left: string; right: string }[];
  gaps?: { position: number; correctAnswer: string; options?: string[] }[];
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

  create: async (quizData: Omit<Quiz, "id" | "createdAt" | "updatedAt">): Promise<Quiz> => {
    const response = await api.post<APIResponse<Quiz>>("/quizzes/create", quizData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create quiz");
    }
    return response.data.data!;
  },

  update: async (id: string, quizData: Partial<Omit<Quiz, "id" | "createdAt" | "updatedAt">>): Promise<Quiz> => {
    const response = await api.put<APIResponse<Quiz>>(`/quizzes/${id}`, quizData);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update quiz");
    }
    return response.data.data!;
  },
};

// Image API
export const imageAPI = {
  // Direct upload to Cloudinary (much faster - uploads directly from browser)
  uploadDirect: async (
    file: File,
    config: {
      cloudName: string;
      uploadPreset?: string;
      uploadUrl: string;
      timestamp?: number;
      signature?: string;
      apiKey?: string;
    }
  ): Promise<{ url: string; filename: string; size: number }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "quiz-images");
    
    // Use unsigned preset if available (simplest)
    if (config.uploadPreset) {
      formData.append("upload_preset", config.uploadPreset);
    } else if (config.signature && config.timestamp && config.apiKey) {
      // Use signed upload
      formData.append("api_key", config.apiKey);
      formData.append("timestamp", config.timestamp.toString());
      formData.append("signature", config.signature);
    }
    
    // Add transformations as separate parameters (Cloudinary prefers this format)
    formData.append("quality", "auto:good");
    formData.append("fetch_format", "auto");

    const response = await fetch(config.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || "Failed to upload image to Cloudinary");
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      filename: result.secure_url,
      size: file.size,
    };
  },

  // Get upload configuration for direct upload
  getUploadConfig: async (): Promise<{ 
    useDirectUpload: boolean; 
    cloudName?: string; 
    uploadPreset?: string; 
    uploadUrl?: string;
    timestamp?: number;
    signature?: string;
    apiKey?: string;
  }> => {
    const response = await api.get<APIResponse<{ 
      useDirectUpload: boolean; 
      cloudName?: string; 
      uploadPreset?: string; 
      uploadUrl?: string;
      timestamp?: number;
      signature?: string;
      apiKey?: string;
    }>>(
      "/images/upload/config"
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to get upload config");
    }

    return response.data.data || { useDirectUpload: false };
  },

  upload: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
    // Try direct upload first if available (much faster - uploads directly from browser to Cloudinary)
    try {
      const uploadConfig = await imageAPI.getUploadConfig();
      if (uploadConfig.useDirectUpload && uploadConfig.cloudName && uploadConfig.uploadUrl) {
        return await imageAPI.uploadDirect(file, {
          cloudName: uploadConfig.cloudName,
          uploadPreset: uploadConfig.uploadPreset,
          uploadUrl: uploadConfig.uploadUrl,
          timestamp: uploadConfig.timestamp,
          signature: uploadConfig.signature,
          apiKey: uploadConfig.apiKey,
        });
      }
    } catch (error: any) {
      console.warn("Direct upload failed, falling back to server upload:", error.message);
      // Continue to fallback
    }

    // Fallback to server upload (slower but works if Cloudinary not configured)
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post<APIResponse<{ url: string; filename: string; size: number }>>(
      "/images/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to upload image");
    }

    return response.data.data!;
  },

  getUrl: (filename: string): string => {
    // Use normalized API_BASE_URL (without /api)
    const baseUrl = API_BASE_URL || window.location.origin;
    
    // If filename is already a full URL, return it
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
      return filename;
    }
    
    // If filename starts with /, it's already a path
    if (filename.startsWith("/")) {
      return `${baseUrl}${filename}`;
    }
    
    // Otherwise, construct full URL with /api/images/
    return `${baseUrl}/api/images/${filename}`;
  },
  
  // Helper to ensure URL is absolute (useful for images in HTML content)
  ensureAbsoluteUrl: (url: string): string => {
    if (!url) return url;
    
    // If already absolute (including Cloudinary URLs), return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    
    // If starts with /, make it absolute using base URL
    if (url.startsWith("/")) {
      const baseUrl = API_BASE_URL || window.location.origin;
      return `${baseUrl}${url}`;
    }
    
    // Otherwise return as is (might be a data URL or something else)
    return url;
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

// PDF Analysis API
export interface AnalysisResult {
  hasQuestions: boolean;
  hasAnswers: boolean;
  questions: string[];
  answers: string[];
  questionAnswerPairs?: Array<{ question: string; answer: string; options?: string[] }>;
  documentType: "mixed" | "questions-only" | "answers-only" | "unknown";
  sourcePDFs?: string[];
}

export const analysisAPI = {
  analyzePDF: async (pdfId: string): Promise<AnalysisResult> => {
    const response = await api.post<APIResponse<AnalysisResult>>(`/analysis/analyze/${pdfId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to analyze PDF");
    }
    return response.data.data!;
  },

  analyzeMultiplePDFs: async (pdfIds: string[]): Promise<AnalysisResult> => {
    const response = await api.post<APIResponse<AnalysisResult>>("/analysis/analyze-multiple", {
      pdfIds,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to analyze PDFs");
    }
    return response.data.data!;
  },

  generateQuizFromAnalysis: async (
    pdfId: string | undefined,
    pdfIds: string[] | undefined,
    options?: any
  ): Promise<Quiz> => {
    const response = await api.post<APIResponse<Quiz>>("/analysis/generate-from-analysis", {
      pdfId,
      pdfIds,
      options,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to generate quiz");
    }
    return response.data.data!;
  },
};

export default api;
