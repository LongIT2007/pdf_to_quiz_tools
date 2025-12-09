// PDF Analysis Routes
import { Router } from "express";
import { PDFAnalysisController } from "../controllers/PDFAnalysisController";

const router = Router();
const analysisController = new PDFAnalysisController();

router.post("/analyze/:pdfId", analysisController.analyzePDF);
router.post("/analyze-multiple", analysisController.analyzeMultiplePDFs);
router.post("/generate-from-analysis", analysisController.generateQuizFromAnalysis);

export default router;
