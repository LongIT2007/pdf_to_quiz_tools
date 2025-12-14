import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import routes from "./src/routes/index";
import { errorHandler } from "./src/middleware/errorHandler";
import { initializeDatabase } from "./src/config/database";
import { config } from "./src/config/env";
import { logger } from "./src/utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize database
  try {
    await initializeDatabase();
    logger.success("Database initialized");
  } catch (error: any) {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
  }

  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(cors());
  // Increase body size limit for large file uploads (100MB)
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));
  
  // Increase timeout for large file uploads (10 minutes)
  server.timeout = 10 * 60 * 1000; // 10 minutes

  // API Routes
  app.use(routes);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle sitemap.xml and robots.txt explicitly with correct content type
  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.sendFile(path.join(staticPath, "sitemap.xml"));
  });

  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.sendFile(path.join(staticPath, "robots.txt"));
  });

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
    // Skip static files that should be served directly
    if (req.path === "/sitemap.xml" || req.path === "/robots.txt") {
      return next();
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const port = parseInt(config.PORT) || 3000;

  server.listen(port, () => {
    logger.success(`🚀 Server running on http://localhost:${port}/`);
    logger.info(`📚 API available at http://localhost:${port}/api`);
    logger.info(`📊 Health check: http://localhost:${port}/api/health`);
    logger.info(`📁 Environment: ${config.NODE_ENV}`);
    logger.info(`🤖 AI Provider: ${config.AI_PROVIDER}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
}

startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});