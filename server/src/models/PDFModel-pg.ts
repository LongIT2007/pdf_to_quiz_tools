// PDF Document Model - PostgreSQL version
import { Pool } from "pg";
import { PDFDocument } from "../types";
import { generatePDFId } from "../utils/id";

export class PDFModelPG {
  constructor(private pool: Pool) {}

  async create(pdfData: Omit<PDFDocument, "id" | "uploadDate">): Promise<PDFDocument> {
    const id = generatePDFId();
    const uploadDate = new Date();

    const result = await this.pool.query(`
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
    return this.mapRowToPDF(row);
  }

  async findById(id: string): Promise<PDFDocument | null> {
    const result = await this.pool.query(
      "SELECT * FROM pdf_documents WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToPDF(result.rows[0]);
  }

  async findAll(limit = 50, offset = 0): Promise<PDFDocument[]> {
    const result = await this.pool.query(
      "SELECT * FROM pdf_documents ORDER BY upload_date DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    return result.rows.map(row => this.mapRowToPDF(row));
  }

  async update(id: string, updates: Partial<PDFDocument>): Promise<PDFDocument | null> {
    const updatesList: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      updatesList.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.extractedText !== undefined) {
      updatesList.push(`extracted_text = $${paramIndex++}`);
      values.push(updates.extractedText);
    }
    if (updates.pageCount !== undefined) {
      updatesList.push(`page_count = $${paramIndex++}`);
      values.push(updates.pageCount);
    }
    if (updates.errorMessage !== undefined) {
      updatesList.push(`error_message = $${paramIndex++}`);
      values.push(updates.errorMessage);
    }

    if (updatesList.length === 0) return this.findById(id);

    values.push(id);
    await this.pool.query(
      `UPDATE pdf_documents SET ${updatesList.join(", ")} WHERE id = $${paramIndex}`,
      values
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM pdf_documents WHERE id = $1",
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  async count(): Promise<number> {
    const result = await this.pool.query("SELECT COUNT(*) as count FROM pdf_documents");
    return parseInt(result.rows[0].count);
  }

  private mapRowToPDF(row: any): PDFDocument {
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
}
