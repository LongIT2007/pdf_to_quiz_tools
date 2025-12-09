// Database adapter - supports both SQLite and PostgreSQL
import { getDbType } from "./database";

let sqliteDb: any = null;
let postgresPool: any = null;

async function getDbAdapter() {
  const dbType = getDbType();

  if (dbType === "postgres") {
    if (!postgresPool) {
      const { getPostgresPool } = await import("./database-pg");
      postgresPool = getPostgresPool();
    }

    // Return PostgreSQL adapter
    return {
      prepare: (sql: string) => {
        // Convert SQLite style queries to PostgreSQL
        const pgSql = sql.replace(/\?/g, (_, offset, str) => {
          const before = str.substring(0, offset);
          const paramIndex = (before.match(/\?/g) || []).length + 1;
          return `$${paramIndex}`;
        });

        return {
          run: async (...args: any[]) => {
            const result = await postgresPool.query(pgSql, args);
            return { changes: result.rowCount || 0, lastInsertRowid: null };
          },
          get: async (...args: any[]) => {
            const result = await postgresPool.query(pgSql, args);
            return result.rows[0] || null;
          },
          all: async (...args: any[]) => {
            const result = await postgresPool.query(pgSql, args);
            return result.rows;
          },
        };
      },
      exec: async (sql: string) => {
        await postgresPool.query(sql);
      },
    };
  }

  // SQLite adapter
  if (!sqliteDb) {
    const { getDatabase } = await import("./database");
    sqliteDb = getDatabase();
  }

  return sqliteDb;
}

// Synchronous version for SQLite (backward compatibility)
function getDbSync() {
  const dbType = getDbType();

  if (dbType === "postgres") {
    throw new Error("Cannot use synchronous database access with PostgreSQL. Use async methods.");
  }

  if (!sqliteDb) {
    const { getDatabase } = require("./database");
    sqliteDb = getDatabase();
  }

  return sqliteDb;
}

export { getDbAdapter, getDbSync };
