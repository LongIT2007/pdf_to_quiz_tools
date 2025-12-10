// PDF Routes
import { Router } from "express";
import { PDFController } from "../controllers/PDFController";
import { upload, handleMulterError } from "../middleware/upload";

const router = Router();
const pdfController = new PDFController();

router.post("/", upload.single("file"), handleMulterError, pdfController.uploadPDF);
router.get("/", pdfController.listPDFs);
router.get("/:id", pdfController.getPDF);
router.delete("/:id", pdfController.deletePDF);

export default router;
