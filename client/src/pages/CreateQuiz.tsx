import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, FileText, ArrowLeft } from "lucide-react";
import { pdfAPI, quizAPI, QuizQuestion } from "@/lib/api";
import { toast } from "sonner";

export default function CreateQuiz() {
  const [location, setLocation] = useLocation();
  // Get pdfId from URL query params
  const pdfId = new URLSearchParams(window.location.search).get("pdfId");

  const [pdf, setPdf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz generation options
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionTypes, setQuestionTypes] = useState<QuizQuestion["type"][]>(["multiple-choice"]);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [language, setLanguage] = useState("vi");

  useEffect(() => {
    if (!pdfId) {
      setError("Không tìm thấy PDF ID");
      setLoading(false);
      return;
    }

    loadPDF();
  }, [pdfId]);

  const loadPDF = async () => {
    try {
      const pdfData = await pdfAPI.getById(pdfId!);
      setPdf(pdfData);

      if (pdfData.status === "failed") {
        setError("PDF xử lý thất bại: " + (pdfData.errorMessage || "Lỗi không xác định"));
      } else if (pdfData.status === "processing") {
        // Poll until processing completes
        const interval = setInterval(async () => {
          try {
            const updated = await pdfAPI.getById(pdfId!);
            setPdf(updated);
            if (updated.status !== "processing") {
              clearInterval(interval);
              if (updated.status === "failed") {
                setError("PDF xử lý thất bại");
              }
            }
          } catch (err) {
            clearInterval(interval);
          }
        }, 2000);

        return () => clearInterval(interval);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!pdfId || pdf?.status !== "completed") {
      toast.error("PDF chưa sẵn sàng để tạo quiz");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const quiz = await quizAPI.generate(pdfId, {
        questionCount,
        questionTypes,
        difficulty,
        language,
        includeExplanations,
      });

      toast.success("Tạo quiz thành công!");
      setLocation(`/quiz/${quiz.id}`);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo quiz");
      toast.error("Tạo quiz thất bại: " + (err.message || "Lỗi không xác định"));
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestionType = (type: QuizQuestion["type"]) => {
    setQuestionTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/pdfs")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tạo Quiz từ PDF</h1>
          <p className="text-muted-foreground text-lg">
            Cấu hình và tạo bài kiểm tra tự động từ PDF
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {pdf && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {pdf.originalName}
              </CardTitle>
              <CardDescription>
                Kích thước: {(pdf.fileSize / 1024).toFixed(2)} KB
                {pdf.pageCount && ` • ${pdf.pageCount} trang`}
                {pdf.status === "processing" && " • Đang xử lý..."}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {pdf?.status === "processing" && (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              PDF đang được xử lý. Vui lòng đợi...
            </AlertDescription>
          </Alert>
        )}

        {pdf?.status === "completed" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Cấu hình Quiz
              </CardTitle>
              <CardDescription>
                Tùy chỉnh các thông số để tạo quiz phù hợp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="questionCount">Số lượng câu hỏi</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                />
              </div>

              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setDifficulty(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Loại câu hỏi</Label>
                <div className="space-y-2">
                  {[
                    "multiple-choice",
                    "true-false",
                    "fill-blank",
                    "short-answer",
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={questionTypes.includes(type as QuizQuestion["type"])}
                        onCheckedChange={() =>
                          toggleQuestionType(type as QuizQuestion["type"])
                        }
                      />
                      <Label
                        htmlFor={type}
                        className="font-normal cursor-pointer"
                      >
                        {type === "multiple-choice" && "Trắc nghiệm"}
                        {type === "true-false" && "Đúng/Sai"}
                        {type === "fill-blank" && "Điền vào chỗ trống"}
                        {type === "short-answer" && "Câu hỏi ngắn"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ngôn ngữ</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explanations"
                  checked={includeExplanations}
                  onCheckedChange={(checked) =>
                    setIncludeExplanations(checked === true)
                  }
                />
                <Label htmlFor="explanations" className="font-normal cursor-pointer">
                  Bao gồm giải thích đáp án
                </Label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || questionTypes.length === 0}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
