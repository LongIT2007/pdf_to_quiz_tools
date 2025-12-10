// PDF Document Model
import { getDbType } from "../config/database";
import { PDFDocument } from "../types";
import { generatePDFId } from "../utils/id";

// Get database instance
function getDb() {
  const dbType = getDbType();
  
  if (dbType === "postgres") {
    // Import PostgreSQL pool
    const { getPostgresPool } = require("../config/database-pg");
    return getPostgresPool();
  }
  
  // Import SQLite database
  const { getDatabase } = require("../config/database");
  return getDatabase();
}

export class PDFModel {
  static async create(pdfData: Omit<PDFDocument, "id" | "uploadDate">): Promise<PDFDocument> {
    const id = generatePDFId();
    const uploadDate = new Date();
    const dbType = getDbType();

    if (dbType === "postgres") {
      const pool = getDb();
      const result = await pool.query(`
        INSERT INTO pdf_documents (
          id, filename, original_name, file_path, file_size, mime_type,
          upload_date, status, extracted_text, page_count, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        id,
        pdfData.filename,
        pdfData.originalName,
        pdfData.filePath,
        pdfData.fileSize,
        pdfData.mimeType,
        uploadDate.toISOString(),
        pdfData.status || "processing",
        pdfData.extractedText || null,
        pdfData.pageCount || null,
        pdfData.errorMessage || null,
      ]);

      const row = result.rows[0];
      return {
        id: row.id,
        filename: row.filename,
        originalName: row.original_name,
        filePath: row.file_path,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        uploadDate: new Date(row.upload_date),
        status: row.status,
        extractedText: row.extracted_text,
        pageCount: row.page_count,
        errorMessage: row.error_message,
      };
    }

    // SQLite path
    const db = getDb();
    db.prepare(`
      INSERT INTO pdf_documents (
        id, filename, original_name, file_path, file_size, mime_type,
        upload_date, status, extracted_text, page_count, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      pdfData.filename,
      pdfData.originalName,
      pdfData.filePath,
      pdfData.fileSize,
      pdfData.mimeType,
      uploadDate.toISOString(),
      pdfData.status || "processing",
      pdfData.extractedText || null,
      pdfData.pageCount || null,
      pdfData.errorMessage || null
    );

    return {
      id,
      ...pdfData,
      uploadDate,
    };
  }

  static findById(id: string): PDFDocument | null {
    const db = getDb();
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      // PostgreSQL requires async, but this method is called synchronously
      // For now, throw error to indicate async is needed
      throw new Error("findById with PostgreSQL requires async. Use async version.");
    }
    
    const row = db.prepare("SELECT * FROM pdf_documents WHERE id = ?").get(id) as any;
    
    if (!row) return null;

    return {
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      uploadDate: new Date(row.upload_date),
      status: row.status,
      extractedText: row.extracted_text,
      pageCount: row.page_count,
      errorMessage: row.error_message,
    };
  }

  static findAll(limit = 50, offset = 0): PDFDocument[] {
    const db = getDb();
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      // PostgreSQL requires async, but this method is called synchronously
      // For now, throw error to indicate async is needed
      throw new Error("findAll with PostgreSQL requires async. Use async version.");
    }
    
    const rows = db
      .prepare("SELECT * FROM pdf_documents ORDER BY upload_date DESC LIMIT ? OFFSET ?")
      .all(limit, offset) as any[];

    return rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      uploadDate: new Date(row.upload_date),
      status: row.status,
      extractedText: row.extracted_text,
      pageCount: row.page_count,
      errorMessage: row.error_message,
    }));
  }

  static update(id: string, updates: Partial<PDFDocument>): PDFDocument | null {
    const db = getDb();
    const dbType = getDbType();
    const updatesList: string[] = [];
    const values: any[] = [];

    if (dbType === "postgres") {
      // PostgreSQL requires async, but this method is called synchronously
      // For now, throw error to indicate async is needed
      throw new Error("update with PostgreSQL requires async. Use async version.");
    }

    if (updates.status !== undefined) {
      updatesList.push("status = ?");
      values.push(updates.status);
    }
    if (updates.extractedText !== undefined) {
      updatesList.push("extracted_text = ?");
      values.push(updates.extractedText);
    }
    if (updates.pageCount !== undefined) {
      updatesList.push("page_count = ?");
      values.push(updates.pageCount);
    }
    if (updates.errorMessage !== undefined) {
      updatesList.push("error_message = ?");
      values.push(updates.errorMessage);
    }

    if (updatesList.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE pdf_documents SET ${updatesList.join(", ")} WHERE id = ?`).run(...values);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const db = getDb();
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      // PostgreSQL requires async, but this method is called synchronously
      // For now, throw error to indicate async is needed
      throw new Error("delete with PostgreSQL requires async. Use async version.");
    }
    
    const result = db.prepare("DELETE FROM pdf_documents WHERE id = ?").run(id);
    return result.changes > 0;
  }

  static count(): number {
    const db = getDb();
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      // PostgreSQL requires async, but this method is called synchronously
      // For now, throw error to indicate async is needed
      throw new Error("count with PostgreSQL requires async. Use async version.");
    }
    
    const result = db.prepare("SELECT COUNT(*) as count FROM pdf_documents").get() as any;
    return result.count;
  }
}
