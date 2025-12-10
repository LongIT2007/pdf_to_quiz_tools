// Quiz Routes
import { Router } from "express";
import { QuizController } from "../controllers/QuizController";

const router = Router();
const quizController = new QuizController();

router.post("/generate", quizController.generateQuiz);
router.post("/create", quizController.createManualQuiz);
router.put("/:id", quizController.updateQuiz);
router.get("/", quizController.listQuizzes);
router.get("/pdf/:pdfId", quizController.getQuizzesByPDF);
router.get("/:id", quizController.getQuiz);
router.delete("/:id", quizController.deleteQuiz);

export default router;
