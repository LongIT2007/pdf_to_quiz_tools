import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Shuffle,
} from "lucide-react";
import { pdfAPI, quizAPI, PDFDocument, Quiz } from "@/lib/api";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quizzes");

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
      toast.error(
        "Lỗi khi tải dữ liệu: " + (err.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePDF = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa PDF này?")) return;

    try {
      await pdfAPI.delete(id);
      setPdfs(prev => prev.filter(p => p.id !== id));
      toast.success("Xóa PDF thành công");
    } catch (err: any) {
      toast.error("Lỗi khi xóa: " + (err.message || "Lỗi không xác định"));
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa quiz này?")) return;

    try {
      await quizAPI.delete(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      toast.success("Xóa quiz thành công");
    } catch (err: any) {
      toast.error("Lỗi khi xóa: " + (err.message || "Lỗi không xác định"));
    }
  };

  // Parse quiz title to extract group, type, and test number
  const parseQuizTitle = (title: string) => {
    // Pattern: "Test {number} {type} ({group})"
    // Examples:
    // - "Test 1 Reading (B1 Preliminary 1)"
    // - "Test 1 Listening (b1_preliminary_2_for_the_revised_2020_exam)"

    const testMatch = title.match(/Test\s+(\d+)/i);
    const testNumber = testMatch ? parseInt(testMatch[1], 10) : 0;

    // Extract type (Reading, Listening, etc.)
    let type = "";
    if (title.match(/\bReading\b/i)) type = "Reading";
    else if (title.match(/\bListening\b/i)) type = "Listening";
    else if (title.match(/\bWriting\b/i)) type = "Writing";
    else if (title.match(/\bSpeaking\b/i)) type = "Speaking";
    else type = "Other";

    // Extract group (content in parentheses)
    const groupMatch = title.match(/\(([^)]+)\)/);
    const group = groupMatch ? groupMatch[1] : "";

    return { testNumber, type, group, originalTitle: title };
  };

  // Sort quizzes: group -> type (Reading first) -> test number
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    const parsedA = parseQuizTitle(a.title);
    const parsedB = parseQuizTitle(b.title);

    // 1. Sort by group (alphabetically)
    if (parsedA.group !== parsedB.group) {
      return parsedA.group.localeCompare(parsedB.group);
    }

    // 2. Within same group, sort by type (Reading, Listening, Writing, Speaking, Other)
    const typeOrder: Record<string, number> = {
      Reading: 1,
      Listening: 2,
      Writing: 3,
      Speaking: 4,
      Other: 5,
    };
    const typeA = typeOrder[parsedA.type] || 99;
    const typeB = typeOrder[parsedB.type] || 99;
    if (typeA !== typeB) {
      return typeA - typeB;
    }

    // 3. Within same group and type, sort by test number
    if (parsedA.testNumber !== parsedB.testNumber) {
      return parsedA.testNumber - parsedB.testNumber;
    }

    // 4. Fallback to original title
    return parsedA.originalTitle.localeCompare(parsedB.originalTitle);
  });

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
    <div className="min-h-screen bg-background py-12 px-4 ">
      <SEO
        title="Dashboard - Quản lý PDFs và Quizzes | PDF to Quiz Tools"
        description="Quản lý tất cả PDFs và Quizzes của bạn. Upload PDF, tạo quiz từ PDF, và quản lý bài kiểm tra của bạn."
        keywords="dashboard, quản lý quiz, quản lý PDF, PDF to quiz dashboard"
        url={typeof window !== "undefined" ? window.location.href : ""}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "PDF to Quiz Tools Dashboard",
          "description": "Quản lý PDFs và Quizzes",
          "applicationCategory": "EducationalApplication",
          "operatingSystem": "Web",
        }}
      />
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
          <Button
            onClick={() => setLocation("/upload/smart")}
            size="lg"
            variant="outline"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Smart Upload (AI)
          </Button>
          <Button
            onClick={() => setLocation("/quiz/editor")}
            size="lg"
            variant="default"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Soạn Quiz Thủ Công
          </Button>
          {quizzes.length > 0 && (
            <Button 
              onClick={() => {
                const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
                setLocation(`/quiz/${randomQuiz.id}`);
              }} 
              size="lg" 
              variant="secondary"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Quiz Ngẫu Nhiên
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="quizzes">
              <BookOpen className="w-4 h-4 mr-2" />
              Quizzes ({quizzes.length})
            </TabsTrigger>
            <TabsTrigger value="pdfs">
              <FileText className="w-4 h-4 mr-2" />
              PDFs ({pdfs.length})
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
                {pdfs.map(pdf => (
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
                            onClick={() =>
                              setLocation(`/quiz/create?pdfId=${pdf.id}`)
                            }
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
              <div className="space-y-6">
                {(() => {
                  // Group quizzes by group name
                  const grouped: Record<string, Quiz[]> = {};
                  sortedQuizzes.forEach(quiz => {
                    const parsed = parseQuizTitle(quiz.title);
                    const groupKey = parsed.group || "Khác";
                    if (!grouped[groupKey]) {
                      grouped[groupKey] = [];
                    }
                    grouped[groupKey].push(quiz);
                  });

                  return Object.entries(grouped).map(
                    ([groupName, groupQuizzes]) => (
                      <div key={groupName} className="space-y-4">
                        {groupName !== "Khác" && (
                          <div className="border-b pb-2">
                            <h3 className="text-2xl font-semibold text-primary capitalize">
                              {groupName}
                            </h3>
                          </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          {groupQuizzes.map(quiz => (
                            <Card key={quiz.id}>
                              <CardHeader>
                                <CardTitle className="text-lg mb-2">
                                  {quiz.title}
                                </CardTitle>
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
                                      {quiz.metadata.difficulty === "easy"
                                        ? "Dễ"
                                        : quiz.metadata.difficulty === "medium"
                                          ? "Trung bình"
                                          : "Khó"}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      setLocation(`/quiz/${quiz.id}`)
                                    }
                                    className="flex-1"
                                  >
                                    Làm Quiz
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setLocation(`/quiz/editor/${quiz.id}`)
                                    }
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
                      </div>
                    )
                  );
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
