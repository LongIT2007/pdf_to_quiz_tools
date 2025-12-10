// Quiz Model
import { getDbType, getDatabase } from "../config/database";
import { Quiz, QuizQuestion } from "../types";
import { generateQuizId, generateQuestionId } from "../utils/id";

export class QuizModel {
  static async create(quizData: Omit<Quiz, "id" | "createdAt" | "updatedAt">): Promise<Quiz> {
    const dbType = getDbType();
    const id = generateQuizId();
    const now = new Date();
    const metadata = quizData.metadata ? JSON.stringify(quizData.metadata) : null;

    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      
      // Insert quiz
      await pool.query(`
        INSERT INTO quizzes (id, title, description, pdf_id, created_at, updated_at, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        id,
        quizData.title,
        quizData.description || null,
        quizData.pdfId || null,
        now.toISOString(),
        now.toISOString(),
        metadata
      ]);

      // Insert questions
      for (let index = 0; index < quizData.questions.length; index++) {
        const question = quizData.questions[index];
        const questionId = generateQuestionId();
        
        // Prepare options JSON - includes options, matchingPairs, gaps
        let optionsJson: any = null;
        if (question.options) {
          optionsJson = question.options;
        }
        if (question.matchingPairs) {
          optionsJson = { ...(optionsJson || {}), matchingPairs: question.matchingPairs };
        }
        if (question.gaps) {
          optionsJson = { ...(optionsJson || {}), gaps: question.gaps };
        }
        const options = optionsJson ? JSON.stringify(optionsJson) : null;
        
        await pool.query(`
          INSERT INTO quiz_questions (
            id, quiz_id, question, type, options, correct_answer,
            explanation, points, question_order, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          questionId,
          id,
          question.question,
          question.type,
          options,
          typeof question.correctAnswer === 'object' ? JSON.stringify(question.correctAnswer) : String(question.correctAnswer),
          question.explanation || null,
          question.points || 1,
          index,
          question.imageUrl || null
        ]);
      }
    } else {
      const db = getDatabase();
      
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
        
        // Prepare options JSON - includes options, matchingPairs, gaps
        let optionsJson: any = null;
        if (question.options) {
          optionsJson = question.options;
        }
        if (question.matchingPairs) {
          optionsJson = { ...(optionsJson || {}), matchingPairs: question.matchingPairs };
        }
        if (question.gaps) {
          optionsJson = { ...(optionsJson || {}), gaps: question.gaps };
        }
        const options = optionsJson ? JSON.stringify(optionsJson) : null;
        
        db.prepare(`
          INSERT INTO quiz_questions (
            id, quiz_id, question, type, options, correct_answer,
            explanation, points, question_order, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          questionId,
          id,
          question.question,
          question.type,
          options,
          typeof question.correctAnswer === 'object' ? JSON.stringify(question.correctAnswer) : String(question.correctAnswer),
          question.explanation || null,
          question.points || 1,
          index,
          question.imageUrl || null
        );
      });
    }

    return {
      id,
      ...quizData,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async findById(id: string): Promise<Quiz | null> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      
      const quizResult = await pool.query("SELECT * FROM quizzes WHERE id = $1", [id]);
      if (quizResult.rows.length === 0) return null;
      
      const quizRow = quizResult.rows[0];
      const questionResult = await pool.query(
        "SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_order",
        [id]
      );
      
      const questions: QuizQuestion[] = questionResult.rows.map((row) => {
        let correctAnswer: any = row.correct_answer;
        try {
          // Try to parse as JSON for complex answer types
          const parsed = JSON.parse(row.correct_answer);
          correctAnswer = parsed;
        } catch {
          // If not JSON, handle based on question type
          if (row.type === "multiple-choice") {
            correctAnswer = Number(row.correct_answer);
          } else {
            correctAnswer = row.correct_answer;
          }
        }
        
        // Parse options JSON
        let options: string[] | undefined;
        let matchingPairs: { left: string; right: string }[] | undefined;
        let gaps: { position: number; correctAnswer: string; options?: string[] }[] | undefined;
        
        if (row.options) {
          const parsedOptions = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
          if (Array.isArray(parsedOptions)) {
            options = parsedOptions;
          } else if (typeof parsedOptions === 'object') {
            if (parsedOptions.matchingPairs) {
              matchingPairs = parsedOptions.matchingPairs;
            }
            if (parsedOptions.gaps) {
              gaps = parsedOptions.gaps;
            }
            if (Array.isArray(parsedOptions) || typeof parsedOptions[0] === 'string') {
              options = parsedOptions;
            }
          }
        }
        
        return {
          id: row.id,
          question: row.question,
          type: row.type as QuizQuestion["type"],
          options,
          correctAnswer,
          explanation: row.explanation || undefined,
          points: row.points,
          imageUrl: row.image_url || undefined,
          matchingPairs,
          gaps,
        };
      });

      return {
        id: quizRow.id,
        title: quizRow.title,
        description: quizRow.description || undefined,
        pdfId: quizRow.pdf_id || undefined,
        questions,
        createdAt: new Date(quizRow.created_at),
        updatedAt: new Date(quizRow.updated_at),
        metadata: quizRow.metadata ? (typeof quizRow.metadata === 'string' ? JSON.parse(quizRow.metadata) : quizRow.metadata) : undefined,
      };
    }
    
    const db = getDatabase();
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

  static async findAll(limit = 50, offset = 0): Promise<Quiz[]> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      
      const quizResult = await pool.query(
        "SELECT * FROM quizzes ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      
      const quizzes: Quiz[] = [];
      
      for (const quizRow of quizResult.rows) {
        const questionResult = await pool.query(
          "SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_order",
          [quizRow.id]
        );
        
        const questions: QuizQuestion[] = questionResult.rows.map((row) => ({
          id: row.id,
          question: row.question,
          type: row.type as QuizQuestion["type"],
          options: row.options ? (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) : undefined,
          correctAnswer: row.type === "multiple-choice" ? Number(row.correct_answer) : row.correct_answer,
          explanation: row.explanation || undefined,
          points: row.points,
        }));

        quizzes.push({
          id: quizRow.id,
          title: quizRow.title,
          description: quizRow.description || undefined,
          pdfId: quizRow.pdf_id || undefined,
          questions,
          createdAt: new Date(quizRow.created_at),
          updatedAt: new Date(quizRow.updated_at),
          metadata: quizRow.metadata ? (typeof quizRow.metadata === 'string' ? JSON.parse(quizRow.metadata) : quizRow.metadata) : undefined,
        });
      }
      
      return quizzes;
    }
    
    const db = getDatabase();
    const quizRows = db
      .prepare("SELECT * FROM quizzes ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .all(limit, offset) as any[];

    return quizRows.map((quizRow) => {
      const questionRows = db
        .prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order")
        .all(quizRow.id) as any[];

      const questions: QuizQuestion[] = questionRows.map((row) => {
        let correctAnswer: any = row.correct_answer;
        try {
          // Try to parse as JSON for complex answer types
          const parsed = JSON.parse(row.correct_answer);
          correctAnswer = parsed;
        } catch {
          // If not JSON, handle based on question type
          if (row.type === "multiple-choice") {
            correctAnswer = Number(row.correct_answer);
          } else {
            correctAnswer = row.correct_answer;
          }
        }
        
        return {
          id: row.id,
          question: row.question,
          type: row.type as QuizQuestion["type"],
          options: row.options ? JSON.parse(row.options) : undefined,
          correctAnswer,
          explanation: row.explanation || undefined,
          points: row.points,
          imageUrl: row.image_url || undefined,
        };
      });

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

  static async findByPDFId(pdfId: string): Promise<Quiz[]> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      
      const quizResult = await pool.query(
        "SELECT * FROM quizzes WHERE pdf_id = $1 ORDER BY created_at DESC",
        [pdfId]
      );
      
      const quizzes: Quiz[] = [];
      
      for (const quizRow of quizResult.rows) {
        const questionResult = await pool.query(
          "SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_order",
          [quizRow.id]
        );
        
        const questions: QuizQuestion[] = questionResult.rows.map((row) => ({
          id: row.id,
          question: row.question,
          type: row.type as QuizQuestion["type"],
          options: row.options ? (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) : undefined,
          correctAnswer: row.type === "multiple-choice" ? Number(row.correct_answer) : row.correct_answer,
          explanation: row.explanation || undefined,
          points: row.points,
        }));

        quizzes.push({
          id: quizRow.id,
          title: quizRow.title,
          description: quizRow.description || undefined,
          pdfId: quizRow.pdf_id || undefined,
          questions,
          createdAt: new Date(quizRow.created_at),
          updatedAt: new Date(quizRow.updated_at),
          metadata: quizRow.metadata ? (typeof quizRow.metadata === 'string' ? JSON.parse(quizRow.metadata) : quizRow.metadata) : undefined,
        });
      }
      
      return quizzes;
    }
    
    const db = getDatabase();
    const quizRows = db
      .prepare("SELECT * FROM quizzes WHERE pdf_id = ? ORDER BY created_at DESC")
      .all(pdfId) as any[];

    return quizRows.map((quizRow) => {
      const questionRows = db
        .prepare("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order")
        .all(quizRow.id) as any[];

      const questions: QuizQuestion[] = questionRows.map((row) => {
        let correctAnswer: any = row.correct_answer;
        try {
          // Try to parse as JSON for complex answer types
          const parsed = JSON.parse(row.correct_answer);
          correctAnswer = parsed;
        } catch {
          // If not JSON, handle based on question type
          if (row.type === "multiple-choice") {
            correctAnswer = Number(row.correct_answer);
          } else {
            correctAnswer = row.correct_answer;
          }
        }
        
        return {
          id: row.id,
          question: row.question,
          type: row.type as QuizQuestion["type"],
          options: row.options ? JSON.parse(row.options) : undefined,
          correctAnswer,
          explanation: row.explanation || undefined,
          points: row.points,
          imageUrl: row.image_url || undefined,
        };
      });

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

  static async delete(id: string): Promise<boolean> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      const result = await pool.query("DELETE FROM quizzes WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    }
    
    const db = getDatabase();
    const result = db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);
    return result.changes > 0;
  }

  static async count(): Promise<number> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      const result = await pool.query("SELECT COUNT(*) as count FROM quizzes");
      return parseInt(result.rows[0].count);
    }
    
    const db = getDatabase();
    const result = db.prepare("SELECT COUNT(*) as count FROM quizzes").get() as any;
    return result.count;
  }
}
