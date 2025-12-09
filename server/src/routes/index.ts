// Main routes
import { Router } from "express";
import pdfRoutes from "./pdfRoutes";
import quizRoutes from "./quizRoutes";
import analysisRoutes from "./analysisRoutes";

const router = Router();

router.use("/api/pdfs", pdfRoutes);
router.use("/api/quizzes", quizRoutes);
router.use("/api/analysis", analysisRoutes);

// Health check
router.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
