-- PostgreSQL Migration Script
-- Run this in your PostgreSQL database (Supabase, Neon, Railway, etc.)

-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS pdf_documents CASCADE;

-- Create pdf_documents table
CREATE TABLE pdf_documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'processing',
  extracted_text TEXT,
  page_count INTEGER,
  error_message TEXT
);

-- Create quizzes table
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pdf_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  FOREIGN KEY (pdf_id) REFERENCES pdf_documents(id) ON DELETE SET NULL
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  question_order INTEGER NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_quizzes_pdf_id ON quizzes(pdf_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_pdf_documents_status ON pdf_documents(status);
CREATE INDEX idx_pdf_documents_upload_date ON pdf_documents(upload_date);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at);

-- Add comments for documentation
COMMENT ON TABLE pdf_documents IS 'Stores uploaded PDF files and their extracted text';
COMMENT ON TABLE quizzes IS 'Stores generated quizzes from PDF documents';
COMMENT ON TABLE quiz_questions IS 'Stores individual questions for each quiz';
