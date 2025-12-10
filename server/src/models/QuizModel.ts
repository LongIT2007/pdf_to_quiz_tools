// Quiz Model
import { getDbType, getDatabase } from "../config/database";
import { Quiz, QuizQuestion } from "../types";
import { generateQuizId, generateQuestionId } from "../utils/id";

// Get database instance
function getDb() {
  const dbType = getDbType();
  
  if (dbType === "postgres") {
    // PostgreSQL requires async, but this model uses sync methods
    // For now, throw error to indicate async is needed
    throw new Error("QuizModel with PostgreSQL requires async methods. Use async version.");
  }
  
  return getDatabase();
}

export class QuizModel {
  static create(quizData: Omit<Quiz, "id" | "createdAt" | "updatedAt">): Quiz {
    const db = getDb();
    const id = generateQuizId();
    const now = new Date();
    const metadata = quizData.metadata ? JSON.stringify(quizData.metadata) : null;

    // Insert quiz
    db.prepare(`
      INSERT INTO quizzes (id, title, description, pdf_id, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      quizData.title,
      quizData.description || null,
      quizData.pdfId || null,
      now.toISOString(),
      now.toISOString(),
      metadata
    );

    // Insert questions
    quizData.questions.forEach((question, index) => {
      const questionId = generateQuestionId();
      const options = question.options ? JSON.stringify(question.options) : null;
      
      db.prepare(`
        INSERT INTO quiz_questions (
          id, quiz_id, question, type, options, correct_answer,
          explanation, points, question_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        questionId,
        id,
        question.question,
        question.type,
        options,
        String(question.correctAnswer),
        question.explanation || null,
        question.points || 1,
        index
      );
    });

    return {
      id,
      ...quizData,
      createdAt: now,
      updatedAt: now,
    };
  }

  static findById(id: string): Quiz | null {
    const db = getDb();
    const quizRow = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(id) as any;
    
    if (!quizRow) return null;

    const questionRows = db
      .prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order")
      .all(id) as any[];

    const questions: QuizQuestion[] = questionRows.map((row) => ({
      id: row.id,
      question: row.question,
      type: row.type as QuizQuestion["type"],
      options: row.options ? JSON.parse(row.options) : undefined,
      correctAnswer: row.type === "multiple-choice" ? Number(row.correct_answer) : row.correct_answer,
      explanation: row.explanation || undefined,
      points: row.points,
    }));

    return {
      id: quizRow.id,
      title: quizRow.title,
      description: quizRow.description || undefined,
      pdfId: quizRow.pdf_id || undefined,
      questions,
      createdAt: new Date(quizRow.created_at),
      updatedAt: new Date(quizRow.updated_at),
      metadata: quizRow.metadata ? JSON.parse(quizRow.metadata) : undefined,
    };
  }

  static findAll(limit = 50, offset = 0): Quiz[] {
    const db = getDb();
    const quizRows = db
      .prepare("SELECT * FROM quizzes ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .all(limit, offset) as any[];

    return quizRows.map((quizRow) => {
      const questionRows = db
        .prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order")
        .all(quizRow.id) as any[];

      const questions: QuizQuestion[] = questionRows.map((row) => ({
        id: row.id,
        question: row.question,
        type: row.type as QuizQuestion["type"],
        options: row.options ? JSON.parse(row.options) : undefined,
        correctAnswer: row.type === "multiple-choice" ? Number(row.correct_answer) : row.correct_answer,
        explanation: row.explanation || undefined,
        points: row.points,
      }));

      return {
        id: quizRow.id,
        title: quizRow.title,
        description: quizRow.description || undefined,
        pdfId: quizRow.pdf_id || undefined,
        questions,
        createdAt: new Date(quizRow.created_at),
        updatedAt: new Date(quizRow.updated_at),
        metadata: quizRow.metadata ? JSON.parse(quizRow.metadata) : undefined,
      };
    });
  }

  static findByPDFId(pdfId: string): Quiz[] {
    const db = getDb();
    const quizRows = db
      .prepare("SELECT * FROM quizzes WHERE pdf_id = ? ORDER BY created_at DESC")
      .all(pdfId) as any[];

    return quizRows.map((quizRow) => {
      const questionRows = db
        .prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order")
        .all(quizRow.id) as any[];

      const questions: QuizQuestion[] = questionRows.map((row) => ({
        id: row.id,
        question: row.question,
        type: row.type as QuizQuestion["type"],
        options: row.options ? JSON.parse(row.options) : undefined,
        correctAnswer: row.type === "multiple-choice" ? Number(row.correct_answer) : row.correct_answer,
        explanation: row.explanation || undefined,
        points: row.points,
      }));

      return {
        id: quizRow.id,
        title: quizRow.title,
        description: quizRow.description || undefined,
        pdfId: quizRow.pdf_id || undefined,
        questions,
        createdAt: new Date(quizRow.created_at),
        updatedAt: new Date(quizRow.updated_at),
        metadata: quizRow.metadata ? JSON.parse(quizRow.metadata) : undefined,
      };
    });
  }

  static delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);
    return result.changes > 0;
  }

  static count(): number {
    const db = getDb();
    const result = db.prepare("SELECT COUNT(*) as count FROM quizzes").get() as any;
    return result.count;
  }
}
