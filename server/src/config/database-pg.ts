// PostgreSQL database configuration
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!pool) {
    let connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for PostgreSQL');
    }

    // Fix: If DATABASE_URL doesn't have protocol, try to construct it
    // This handles cases where only host:port is provided
    if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
      // Try to construct from parts
      const dbUser = process.env.DB_USER || process.env.POSTGRES_USER || 'postgres';
      const dbPassword = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '';
      const dbHost = connectionString.includes(':') 
        ? connectionString.split(':')[0] 
        : connectionString;
      const dbPort = connectionString.includes(':')
        ? connectionString.split(':')[1]
        : '5432';
      const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || 'railway';
      
      connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
      
      console.warn('⚠️  DATABASE_URL format incorrect, constructed from parts. Please use full connection string!');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function initializePostgresDatabase() {
  const pool = getPostgresPool();
  
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pdf_documents (
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
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        pdf_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        FOREIGN KEY (pdf_id) REFERENCES pdf_documents(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
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
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quizzes_pdf_id ON quizzes(pdf_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON pdf_documents(status)
    `);

    console.log("PostgreSQL database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize PostgreSQL database:", error);
    throw error;
  }
}

export default getPostgresPool;
