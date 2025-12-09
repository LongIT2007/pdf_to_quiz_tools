// Database configuration - Supports both SQLite and PostgreSQL
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const dbType = process.env.DATABASE_TYPE || "sqlite";

let sqliteDb: Database.Database | null = null;

// SQLite initialization
function initializeSQLite() {
  const dbDir = join(process.cwd(), "data");
  const dbPath = join(dbDir, "quiz.db");

  // Tạo thư mục data nếu chưa tồn tại
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new Database(dbPath);

  // Enable foreign keys
  sqliteDb.pragma("foreign_keys = ON");

  return sqliteDb;
}

// Initialize tables for SQLite
export async function initializeDatabase() {
  if (dbType === "postgres") {
    // PostgreSQL initialization is handled in database-pg.ts
    const { initializePostgresDatabase } = await import("./database-pg");
    return await initializePostgresDatabase();
  }

  // SQLite initialization
  if (!sqliteDb) {
    sqliteDb = initializeSQLite();
  }

  // PDF Documents table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS pdf_documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'processing',
      extracted_text TEXT,
      page_count INTEGER,
      error_message TEXT
    )
  `);

  // Quizzes table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      pdf_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT,
      FOREIGN KEY (pdf_id) REFERENCES pdf_documents(id) ON DELETE SET NULL
    )
  `);

  // Quiz Questions table
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question TEXT NOT NULL,
      type TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      points INTEGER DEFAULT 1,
      question_order INTEGER NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS idx_quizzes_pdf_id ON quizzes(pdf_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON pdf_documents(status);
  `);

  console.log("SQLite database initialized successfully");
}

// Get database instance
export function getDatabase() {
  if (dbType === "postgres") {
    throw new Error("Use getPostgresPool() for PostgreSQL");
  }

  if (!sqliteDb) {
    sqliteDb = initializeSQLite();
  }

  return sqliteDb;
}

export function getDbType() {
  return dbType;
}

// For backward compatibility - lazy evaluation
// Don't execute immediately, only when accessed
let _defaultDb: any = null;

function getDefaultDatabase() {
  if (_defaultDb) return _defaultDb;
  
  if (dbType === "postgres") {
    // For PostgreSQL, models will use getPostgresPool() directly
    // This default export is only for SQLite
    throw new Error(
      "Cannot use default database export with PostgreSQL. " +
      "Use getPostgresPool() from database-pg.ts instead."
    );
  }
  
  _defaultDb = getDatabase();
  return _defaultDb;
}

// Export getter function that lazily loads database
// This prevents immediate execution on import
export default {
  get prepare() {
    return getDefaultDatabase().prepare.bind(getDefaultDatabase());
  },
  get exec() {
    return getDefaultDatabase().exec.bind(getDefaultDatabase());
  },
};
