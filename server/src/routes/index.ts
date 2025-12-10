// Main routes
import { Router } from "express";
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

export default router;
