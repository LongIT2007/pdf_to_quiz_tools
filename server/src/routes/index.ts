// Main routes
import { Router } from "express";
import pdfRoutes from "./pdfRoutes";
import quizRoutes from "./quizRoutes";

const router = Router();

router.use("/api/pdfs", pdfRoutes);
router.use("/api/quizzes", quizRoutes);

// Health check
router.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
