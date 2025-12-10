import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  BookOpen,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  Edit,
} from "lucide-react";
import { pdfAPI, quizAPI, PDFDocument, Quiz } from "@/lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pdfs");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pdfsData, quizzesData] = await Promise.all([
        pdfAPI.getAll(1, 20),
        quizAPI.getAll(1, 20),
      ]);
      setPdfs(pdfsData?.data || []);
      setQuizzes(quizzesData?.data || []);
    } catch (err: any) {
      toast.error("Lỗi khi tải dữ liệu: " + (err.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePDF = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa PDF này?")) return;

    try {
      await pdfAPI.delete(id);
      setPdfs((prev) => prev.filter((p) => p.id !== id));
      toast.success("Xóa PDF thành công");
    } catch (err: any) {
      toast.error("Lỗi khi xóa: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa quiz này?")) return;

    try {
      await quizAPI.delete(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Xóa quiz thành công");
    } catch (err: any) {
      toast.error("Lỗi khi xóa: " + (err.message || "Lỗi không xác định"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Hoàn thành
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Đang xử lý
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Thất bại
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Quản lý PDFs và Quizzes của bạn
          </p>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <Button onClick={() => setLocation("/upload")} size="lg">
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF
          </Button>
          <Button onClick={() => setLocation("/upload/smart")} size="lg" variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Smart Upload (AI)
          </Button>
          <Button onClick={() => setLocation("/quiz/editor")} size="lg" variant="default">
            <BookOpen className="w-4 h-4 mr-2" />
            Soạn Quiz Thủ Công
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pdfs">
              <FileText className="w-4 h-4 mr-2" />
              PDFs ({pdfs.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <BookOpen className="w-4 h-4 mr-2" />
              Quizzes ({quizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdfs" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : pdfs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Chưa có PDF nào</p>
                  <p className="text-muted-foreground mb-4">
                    Upload PDF đầu tiên để bắt đầu
                  </p>
                  <Button onClick={() => setLocation("/upload")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDF
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pdfs.map((pdf) => (
                  <Card key={pdf.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {pdf.originalName}
                          </CardTitle>
                          <CardDescription>
                            {(pdf.fileSize / 1024).toFixed(2)} KB
                            {pdf.pageCount && ` • ${pdf.pageCount} trang`}
                          </CardDescription>
                        </div>
                        {getStatusBadge(pdf.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {pdf.status === "completed" && (
                          <Button
                            size="sm"
                            onClick={() => setLocation(`/quiz/create?pdfId=${pdf.id}`)}
                            className="flex-1"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Tạo Quiz
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePDF(pdf.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Chưa có Quiz nào</p>
                  <p className="text-muted-foreground mb-4">
                    Tạo quiz từ PDF để bắt đầu
                  </p>
                  <Button onClick={() => setLocation("/upload")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                      <CardDescription>
                        {quiz.description || "Không có mô tả"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">
                          {quiz.questions.length} câu hỏi
                        </Badge>
                        {quiz.metadata?.difficulty && (
                          <Badge>
                            {quiz.metadata.difficulty === "easy" ? "Dễ" :
                             quiz.metadata.difficulty === "medium" ? "Trung bình" : "Khó"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setLocation(`/quiz/${quiz.id}`)}
                          className="flex-1"
                        >
                          Làm Quiz
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLocation(`/quiz/editor/${quiz.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
