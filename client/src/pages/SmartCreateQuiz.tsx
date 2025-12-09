import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  FileText,
  ArrowLeft,
  Brain,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { pdfAPI, analysisAPI } from "@/lib/api";
import { toast } from "sonner";

import type { AnalysisResult } from "@/lib/api";

export default function SmartCreateQuiz() {
  const [location, setLocation] = useLocation();
  
  // Get PDF IDs from URL
  const searchParams = new URLSearchParams(window.location.search);
  const pdfId = searchParams.get("pdfId");
  const pdfIdsParam = searchParams.get("pdfIds");
  const pdfIds = pdfIdsParam ? pdfIdsParam.split(",") : pdfId ? [pdfId] : [];

  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pdfIds.length === 0) {
      setError("Không tìm thấy PDF ID");
      setLoading(false);
      return;
    }

    loadPDFs();
  }, [pdfIds.join(",")]);

  const loadPDFs = async () => {
    try {
      const pdfsData = await Promise.all(
        pdfIds.map((id) => pdfAPI.getById(id))
      );
      
      // Check if all PDFs are ready
      const allReady = pdfsData.every((pdf) => pdf.status === "completed");
      const hasFailed = pdfsData.some((pdf) => pdf.status === "failed");

      setPdfs(pdfsData);

      if (hasFailed) {
        setError("Một số PDF xử lý thất bại");
      } else if (allReady) {
        // Auto-analyze when all PDFs are ready
        analyzePDFs();
      } else {
        // Poll until ready
        const interval = setInterval(async () => {
          try {
            const updated = await Promise.all(
              pdfIds.map((id) => pdfAPI.getById(id))
            );
            setPdfs(updated);
            
            const allReady = updated.every((pdf) => pdf.status === "completed");
            if (allReady) {
              clearInterval(interval);
              analyzePDFs();
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

  const analyzePDFs = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      let analysisResult: AnalysisResult;

      if (pdfIds.length === 1) {
        // Single PDF analysis
        analysisResult = await analysisAPI.analyzePDF(pdfIds[0]);
      } else {
        // Multiple PDFs analysis
        analysisResult = await analysisAPI.analyzeMultiplePDFs(pdfIds);
      }

      setAnalysis(analysisResult);
      toast.success("Phân tích PDF thành công!");
    } catch (err: any) {
      setError(err.message || "Lỗi khi phân tích PDF");
      toast.error("Phân tích thất bại: " + (err.message || "Lỗi không xác định"));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!analysis) return;

    setGenerating(true);
    setError(null);

    try {
      const quiz = await analysisAPI.generateQuizFromAnalysis(
        pdfIds.length === 1 ? pdfIds[0] : undefined,
        pdfIds.length > 1 ? pdfIds : undefined,
        {
          questionCount: analysis.questionAnswerPairs?.length || 10,
          language: "vi",
        }
      );

      toast.success("Tạo quiz thành công!");
      setLocation(`/quiz/${quiz.id}`);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo quiz");
      toast.error("Tạo quiz thất bại: " + (err.message || "Lỗi không xác định"));
    } finally {
      setGenerating(false);
    }
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
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Smart Quiz Generation</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI đã phân tích PDF và sẵn sàng tạo quiz
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* PDFs Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Files đã upload ({pdfs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{pdf.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(pdf.fileSize / 1024).toFixed(2)} KB
                      {pdf.pageCount && ` • ${pdf.pageCount} trang`}
                    </p>
                  </div>
                  {pdf.status === "completed" && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Sẵn sàng
                    </Badge>
                  )}
                  {pdf.status === "processing" && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Đang xử lý
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Status */}
        {analyzing && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Đang phân tích PDF với AI...</p>
              <p className="text-sm text-muted-foreground mt-2">
                AI đang nhận diện câu hỏi và đáp án
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && !analyzing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Kết Quả Phân Tích
              </CardTitle>
              <CardDescription>
                AI đã phân tích và tìm thấy:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Loại tài liệu</p>
                  <p className="font-semibold">
                    {analysis.documentType === "mixed" && "Đề + Đáp án"}
                    {analysis.documentType === "questions-only" && "Chỉ có đề"}
                    {analysis.documentType === "answers-only" && "Chỉ có đáp án"}
                    {analysis.documentType === "unknown" && "Không xác định"}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Câu hỏi tìm thấy</p>
                  <p className="font-semibold text-2xl">{analysis.questions.length}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Đáp án tìm thấy</p>
                  <p className="font-semibold text-2xl">{analysis.answers.length}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cặp Q&A đã ghép</p>
                  <p className="font-semibold text-2xl">
                    {analysis.questionAnswerPairs?.length || 0}
                  </p>
                </div>
              </div>

              {analysis.questionAnswerPairs && analysis.questionAnswerPairs.length > 0 && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <strong>Thành công!</strong> AI đã tự động nhận diện và ghép{" "}
                    {analysis.questionAnswerPairs.length} cặp câu hỏi - đáp án.
                    Quiz sẽ được tạo với đáp án chính xác.
                  </AlertDescription>
                </Alert>
              )}

              {(!analysis.questionAnswerPairs || analysis.questionAnswerPairs.length === 0) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Không tìm thấy cặp câu hỏi-đáp án. AI sẽ tạo quiz từ nội dung tổng quát.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerateQuiz}
                disabled={generating}
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
                    Tạo Quiz Từ Phân Tích
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {!analysis && !analyzing && pdfs.every((p) => p.status === "completed") && (
          <Card>
            <CardContent className="py-12 text-center">
              <Button onClick={analyzePDFs} size="lg">
                <Brain className="w-4 h-4 mr-2" />
                Bắt Đầu Phân Tích PDF
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
