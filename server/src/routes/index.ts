// Main routes
import { Router } from "express";
import { fileURLToPath } from "url";
import path from "path";
import { readFileSync } from "fs";
import pdfRoutes from "./pdfRoutes";
import quizRoutes from "./quizRoutes";
import analysisRoutes from "./analysisRoutes";
import imageRoutes from "./imageRoutes";

const router = Router();

router.use("/api/pdfs", pdfRoutes);
router.use("/api/quizzes", quizRoutes);
router.use("/api/analysis", analysisRoutes);
router.use("/api/images", imageRoutes);

// Health check
router.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Serve sitemap.xml
router.get("/sitemap.xml", (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sitemapPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "client",
      "public",
      "sitemap.xml"
    );
    const sitemapContent = readFileSync(sitemapPath, "utf-8");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(sitemapContent);
  } catch (error) {
    console.error("Error serving sitemap.xml:", error);
    res.status(500).send("Error loading sitemap");
  }
});

// Serve robots.txt
router.get("/robots.txt", (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const robotsPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "client",
      "public",
      "robots.txt"
    );
    const robotsContent = readFileSync(robotsPath, "utf-8");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(robotsContent);
  } catch (error) {
    console.error("Error serving robots.txt:", error);
    res.status(500).send("Error loading robots.txt");
  }
});

export default router;
