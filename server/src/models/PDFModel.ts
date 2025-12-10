// PDF Document Model
import { getDbType } from "../config/database";
import { PDFDocument } from "../types";
import { generatePDFId } from "../utils/id";

export class PDFModel {
  static async create(pdfData: Omit<PDFDocument, "id" | "uploadDate">): Promise<PDFDocument> {
    const id = generatePDFId();
    const uploadDate = new Date();
    const dbType = getDbType();

    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
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
    const { getDatabase } = await import("../config/database");
    const db = getDatabase();
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

  static async findById(id: string): Promise<PDFDocument | null> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      const result = await pool.query("SELECT * FROM pdf_documents WHERE id = $1", [id]);
      
      if (result.rows.length === 0) return null;
      
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
    
    const { getDatabase } = await import("../config/database");
    const db = getDatabase();
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

  static async findAll(limit = 50, offset = 0): Promise<PDFDocument[]> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      const result = await pool.query(
        "SELECT * FROM pdf_documents ORDER BY upload_date DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      
      return result.rows.map((row) => ({
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
    
    const { getDatabase } = await import("../config/database");
    const db = getDatabase();
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

  static async update(id: string, updates: Partial<PDFDocument>): Promise<PDFDocument | null> {
    const dbType = getDbType();
    const updatesList: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      if (dbType === "postgres") {
        updatesList.push(`status = $${updatesList.length + 1}`);
      } else {
        updatesList.push("status = ?");
      }
      values.push(updates.status);
    }
    if (updates.extractedText !== undefined) {
      if (dbType === "postgres") {
        updatesList.push(`extracted_text = $${updatesList.length + 1}`);
      } else {
        updatesList.push("extracted_text = ?");
      }
      values.push(updates.extractedText);
    }
    if (updates.pageCount !== undefined) {
      if (dbType === "postgres") {
        updatesList.push(`page_count = $${updatesList.length + 1}`);
      } else {
        updatesList.push("page_count = ?");
      }
      values.push(updates.pageCount);
    }
    if (updates.errorMessage !== undefined) {
      if (dbType === "postgres") {
        updatesList.push(`error_message = $${updatesList.length + 1}`);
      } else {
        updatesList.push("error_message = ?");
      }
      values.push(updates.errorMessage);
    }

    if (updatesList.length === 0) return await this.findById(id);

    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      values.push(id);
      const query = `UPDATE pdf_documents SET ${updatesList.join(", ")} WHERE id = $${values.length}`;
      await pool.query(query, values);
    } else {
      const { getDatabase } = await import("../config/database");
      const db = getDatabase();
      values.push(id);
      db.prepare(`UPDATE pdf_documents SET ${updatesList.join(", ")} WHERE id = ?`).run(...values);
    }

    return await this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      const result = await pool.query("DELETE FROM pdf_documents WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    }
    
    const { getDatabase } = await import("../config/database");
    const db = getDatabase();
    const result = db.prepare("DELETE FROM pdf_documents WHERE id = ?").run(id);
    return result.changes > 0;
  }

  static async count(): Promise<number> {
    const dbType = getDbType();
    
    if (dbType === "postgres") {
      const { getPostgresPool } = await import("../config/database-pg");
      const pool = getPostgresPool();
      const result = await pool.query("SELECT COUNT(*) as count FROM pdf_documents");
      return parseInt(result.rows[0].count);
    }
    
    const { getDatabase } = await import("../config/database");
    const db = getDatabase();
    const result = db.prepare("SELECT COUNT(*) as count FROM pdf_documents").get() as any;
    return result.count;
  }
}
