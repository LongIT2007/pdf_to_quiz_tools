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
import { FAQ } from "@/components/FAQ";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quizzes");

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://pdf-to-quiz-tools-v2.vercel.app/#organization",
        "name": "PDF to Quiz Tools",
        "url": "https://pdf-to-quiz-tools-v2.vercel.app",
        "logo": "https://pdf-to-quiz-tools-v2.vercel.app/images/pdf-conversion-illustration.png",
        "description": "Công cụ AI chuyển đổi PDF thành bài kiểm tra trắc nghiệm tương tác. Tạo quiz từ PDF, Word, PowerPoint với nhiều loại câu hỏi khác nhau.",
        "sameAs": []
      },
      {
        "@type": "WebApplication",
        "@id": "https://pdf-to-quiz-tools-v2.vercel.app/#webapp",
        "name": "PDF to Quiz Tools",
        "url": "https://pdf-to-quiz-tools-v2.vercel.app",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Công cụ AI miễn phí chuyển đổi PDF thành bài kiểm tra trắc nghiệm tương tác. Tạo quiz từ PDF, Word, PowerPoint với nhiều loại câu hỏi khác nhau.",
        "featureList": [
          "Chuyển PDF thành quiz",
          "Tạo quiz từ Word và PowerPoint",
          "Nhiều loại câu hỏi (trắc nghiệm, tự luận)",
          "AI tự động tạo câu hỏi",
          "Miễn phí và dễ sử dụng"
        ],
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "2.0"
      },
      {
        "@type": "WebSite",
        "@id": "https://pdf-to-quiz-tools-v2.vercel.app/#website",
        "url": "https://pdf-to-quiz-tools-v2.vercel.app",
        "name": "PDF to Quiz Tools",
        "description": "Công cụ AI chuyển đổi PDF thành bài kiểm tra trắc nghiệm tương tác",
        "publisher": {
          "@id": "https://pdf-to-quiz-tools-v2.vercel.app/#organization"
        },
        "inLanguage": "vi-VN",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://pdf-to-quiz-tools-v2.vercel.app/?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://pdf-to-quiz-tools-v2.vercel.app/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang chủ",
            "item": "https://pdf-to-quiz-tools-v2.vercel.app/"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://pdf-to-quiz-tools-v2.vercel.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Làm thế nào để chuyển PDF thành quiz?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bạn chỉ cần upload file PDF lên website, chọn loại câu hỏi bạn muốn tạo (trắc nghiệm, tự luận, v.v.), và AI sẽ tự động phân tích PDF và tạo quiz cho bạn trong vài giây."
            }
          },
          {
            "@type": "Question",
            "name": "Có mất phí không?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Hoàn toàn miễn phí! Bạn có thể sử dụng tất cả các tính năng mà không cần trả phí."
            }
          },
          {
            "@type": "Question",
            "name": "Hỗ trợ những loại file nào?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Hiện tại chúng tôi hỗ trợ file PDF. Trong tương lai sẽ hỗ trợ thêm Word, PowerPoint và các định dạng khác."
            }
          },
          {
            "@type": "Question",
            "name": "Có thể tạo bao nhiêu loại câu hỏi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bạn có thể tạo nhiều loại câu hỏi khác nhau: trắc nghiệm (multiple choice), tự luận (essay), điền vào chỗ trống, và nhiều loại khác."
            }
          }
        ]
      }
    ]
  };

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
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-12 px-4 sm:px-6 overflow-x-hidden">
      <SEO
        title="PDF to Quiz Tools - Chuyển PDF thành Bài Kiểm Tra Trắc Nghiệm"
        description="Công cụ AI chuyển đổi PDF thành bài kiểm tra trắc nghiệm tương tác. Tạo quiz từ PDF, Word, PowerPoint với nhiều loại câu hỏi khác nhau. Miễn phí và dễ sử dụng."
        keywords="PDF to quiz, chuyển PDF thành quiz, tạo bài kiểm tra từ PDF, AI quiz generator, PDF to test, trắc nghiệm từ PDF, quiz maker, đề thi từ PDF"
        url={typeof window !== "undefined" ? window.location.href : ""}
        structuredData={structuredData}
      />
      <div className="container max-w-6xl mx-auto">
        {/* Hero Section với H1 cho SEO */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-2">
            PDF to Quiz Tools
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
            Chuyển đổi PDF thành bài kiểm tra trắc nghiệm với AI. Tạo quiz từ PDF, Word, PowerPoint một cách nhanh chóng và dễ dàng.
          </p>
        </div>

        {/* Features Section với H2 */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center px-2">Tính Năng Nổi Bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Dễ Dàng
                </CardTitle>
                <CardDescription>
                  Tải lên PDF và để AI tự động tạo quiz cho bạn
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Thông Minh
                </CardTitle>
                <CardDescription>
                  Sử dụng AI để tạo câu hỏi chất lượng cao tự động
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Nhiều Loại Câu Hỏi
                </CardTitle>
                <CardDescription>
                  Hỗ trợ trắc nghiệm, tự luận và nhiều định dạng khác
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 px-2">Bắt Đầu Ngay</h2>
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 flex-wrap px-2">
            <Button 
              onClick={() => setLocation("/upload")} 
              size="lg"
              className="w-full sm:w-auto flex-1 sm:flex-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Upload PDF</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            <Button
              onClick={() => setLocation("/upload/smart")}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Smart Upload (AI)</span>
              <span className="sm:hidden">Smart Upload</span>
            </Button>
            <Button
              onClick={() => setLocation("/quiz/editor")}
              size="lg"
              variant="default"
              className="w-full sm:w-auto flex-1 sm:flex-none"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Soạn Quiz Thủ Công</span>
              <span className="md:hidden">Soạn Quiz</span>
            </Button>
            {quizzes.length > 0 && (
              <Button 
                onClick={() => {
                  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
                  setLocation(`/quiz/${randomQuiz.id}`);
                }} 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto flex-1 sm:flex-none"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Quiz Ngẫu Nhiên</span>
                <span className="sm:hidden">Random</span>
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto grid grid-cols-2 p-0">
            <TabsTrigger value="quizzes" className="text-sm sm:text-base">
              <BookOpen className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Quizzes</span>
              <span className="sm:hidden">Quiz</span>
              <span className="ml-1">({quizzes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="text-sm sm:text-base">
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">PDFs</span>
              <span className="sm:hidden">PDF</span>
              <span className="ml-1">({pdfs.length})</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {pdfs.map(pdf => (
                  <Card key={pdf.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2 break-words">
                            {pdf.originalName}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
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
                            className="flex-1 text-xs sm:text-sm"
                          >
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Tạo Quiz</span>
                            <span className="sm:hidden">Tạo</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePDF(pdf.id)}
                          className="px-2 sm:px-3"
                          aria-label="Xóa PDF"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="mt-4 sm:mt-6">
            {loading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-medium mb-2">Chưa có Quiz nào</p>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-2">
                    Tạo quiz từ PDF để bắt đầu
                  </p>
                  <Button onClick={() => setLocation("/upload")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
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
                      <div key={groupName} className="space-y-3 sm:space-y-4">
                        {groupName !== "Khác" && (
                          <div className="border-b pb-2 px-2">
                            <h3 className="text-xl sm:text-2xl font-semibold text-primary capitalize">
                              {groupName}
                            </h3>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {groupQuizzes.map(quiz => (
                            <Card key={quiz.id}>
                              <CardHeader>
                                <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">
                                  {quiz.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                                  {quiz.description || "Không có mô tả"}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {quiz.questions.length} câu hỏi
                                  </Badge>
                                  {quiz.metadata?.difficulty && (
                                    <Badge className="text-xs">
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
                                    className="flex-1 text-xs sm:text-sm"
                                  >
                                    <span className="hidden sm:inline">Làm Quiz</span>
                                    <span className="sm:hidden">Làm</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setLocation(`/quiz/editor/${quiz.id}`)
                                    }
                                    className="px-2 sm:px-3"
                                    aria-label="Chỉnh sửa"
                                  >
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="px-2 sm:px-3"
                                    aria-label="Xóa"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

        {/* FAQ Section */}
        <FAQ />
      </div>
    </div>
  );
}
