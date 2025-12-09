import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Download,
} from "lucide-react";
import { quizAPI, Quiz, QuizQuestion } from "@/lib/api";
import { toast } from "sonner";

interface ViewQuizProps {
  params?: { id?: string };
}

export default function ViewQuiz(props: ViewQuizProps) {
  const [location, setLocation] = useLocation();
  // Get quizId from route params or URL
  const quizId = props.params?.id || location.split("/quiz/")[1]?.split("?")[0];

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const quizData = await quizAPI.getById(quizId!);
      setQuiz(quizData);
    } catch (err: any) {
      setError(err.message || "Không thể tải quiz");
      toast.error("Lỗi: " + (err.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: any) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      const correctAnswer = q.correctAnswer;

      if (q.type === "multiple-choice") {
        if (userAnswer === correctAnswer) correctCount++;
      } else {
        if (String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase()) {
          correctCount++;
        }
      }
    });

    const totalScore = (correctCount / quiz.questions.length) * 100;
    setScore(totalScore);
    setShowResults(true);
    toast.success(`Hoàn thành! Điểm số: ${totalScore.toFixed(1)}%`);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const isCorrect = (question: QuizQuestion) => {
    const userAnswer = selectedAnswers[question.id];
    const correctAnswer = question.correctAnswer;

    if (question.type === "multiple-choice") {
      return userAnswer === correctAnswer;
    }
    return String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || "Quiz không tồn tại"}</AlertDescription>
          </Alert>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/quizzes")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-muted-foreground text-lg">{quiz.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Badge variant="secondary">
              {quiz.questions.length} câu hỏi
            </Badge>
            {quiz.metadata?.difficulty && (
              <Badge>
                Độ khó: {quiz.metadata.difficulty === "easy" ? "Dễ" : 
                        quiz.metadata.difficulty === "medium" ? "Trung bình" : "Khó"}
              </Badge>
            )}
            {quiz.metadata?.totalPoints && (
              <Badge variant="outline">
                Tổng điểm: {quiz.metadata.totalPoints}
              </Badge>
            )}
          </div>
        </div>

        {showResults && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Kết quả
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-5xl font-bold mb-2">{score.toFixed(1)}%</div>
                <p className="text-muted-foreground">
                  {Math.round((score / 100) * quiz.questions.length)} / {quiz.questions.length} câu đúng
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleReset} variant="outline">
                  Làm lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <Card key={question.id} className="relative">
              {showResults && (
                <div className="absolute top-4 right-4">
                  {isCorrect(question) ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="flex-1">{question.question}</span>
                </CardTitle>
                {question.points && (
                  <CardDescription>
                    Điểm: {question.points}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {question.type === "multiple-choice" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isSelected = selectedAnswers[question.id] === optIndex;
                      const isCorrectAnswer = question.correctAnswer === optIndex;
                      const showCorrect = showResults && isCorrectAnswer;
                      const showWrong = showResults && isSelected && !isCorrectAnswer;

                      return (
                        <Button
                          key={optIndex}
                          variant={isSelected ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleAnswerSelect(question.id, optIndex)}
                          disabled={showResults}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                            {showWrong && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}

                {question.type === "fill-blank" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={selectedAnswers[question.id] || ""}
                      onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                      disabled={showResults}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="Nhập câu trả lời..."
                    />
                    {showResults && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Đáp án đúng: </span>
                        <span className="font-semibold">{question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                )}

                {question.type === "true-false" && (
                  <div className="flex gap-4">
                    {["Đúng", "Sai"].map((option, optIndex) => {
                      const isSelected = selectedAnswers[question.id] === optIndex;
                      return (
                        <Button
                          key={optIndex}
                          variant={isSelected ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => handleAnswerSelect(question.id, optIndex)}
                          disabled={showResults}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {showResults && question.explanation && (
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>{question.explanation}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!showResults && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
              size="lg"
            >
              Nộp bài
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
