import { useState, useEffect, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Download,
  Edit,
  ArrowUp,
  Pencil,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import { quizAPI, imageAPI, Quiz, QuizQuestion } from "@/lib/api";
import { toast } from "sonner";
import { DrawingToolbar } from "@/components/DrawingToolbar";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { SEO } from "@/components/SEO";

// Helper to ensure image URLs in HTML are absolute
function ensureAbsoluteImageUrls(html: string): string {
  if (!html) return html;

  // Replace relative image URLs with absolute ones
  return html.replace(/src="(\/api\/images\/[^"]+)"/g, (match, path) => {
    const absoluteUrl = imageAPI.ensureAbsoluteUrl(path);
    return `src="${absoluteUrl}"`;
  });
}

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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>(
    {}
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  // Drawing tools state
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#ef4444");
  const [drawingTool, setDrawingTool] = useState<"pen" | "eraser" | "underline">("pen");
  const [clearTrigger, setClearTrigger] = useState(0);
  const quizContainerRef = useRef<HTMLDivElement>(null);
  
  // Image zoom state - store zoom level and position for images in HTML content
  // Use image src as key to persist across re-renders
  const htmlImageZoomDataRef = useRef<Map<string, { zoom: number; x: number; y: number }>>(new Map());

  // Setup zoom and pan for images in HTML content
  const setupHTMLImageZoomPan = () => {
    if (!quizContainerRef.current) return;

    const images = quizContainerRef.current.querySelectorAll('img:not(.zoomable-image-wrapper img)');
    images.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      
      // Skip if already wrapped
      if (imageElement.parentElement?.classList.contains('zoomable-image-wrapper') ||
          imageElement.closest('.zoomable-image-container')) {
        // Restore zoom state if already wrapped
        const imageSrc = imageElement.src;
        const existingData = htmlImageZoomDataRef.current.get(imageSrc);
        if (existingData && (existingData.zoom !== 100 || existingData.x !== 0 || existingData.y !== 0)) {
          const container = imageElement.closest('.zoomable-image-container') as HTMLElement;
          const transformDiv = container?.querySelector('.zoomable-image-transform') as HTMLElement;
          const zoomLabel = container?.querySelector('.zoomable-image-controls span') as HTMLElement;
          const zoomOutBtn = container?.querySelector('.zoomable-image-controls button:first-child') as HTMLButtonElement;
          const zoomInBtn = container?.querySelector('.zoomable-image-controls button:nth-child(3)') as HTMLButtonElement;
          const controls = container?.querySelector('.zoomable-image-controls') as HTMLElement;
          
          if (transformDiv) {
            // Ensure controls are hidden by default and show on hover
            if (controls) {
              controls.style.opacity = '0';
              controls.style.transition = 'opacity 0.2s ease-in-out';
            }
            transformDiv.style.transform = `scale(${existingData.zoom / 100}) translate(${existingData.x / (existingData.zoom / 100)}px, ${existingData.y / (existingData.zoom / 100)}px)`;
            if (zoomLabel) {
              zoomLabel.textContent = `${Math.round(existingData.zoom)}%`;
            }
            if (container) {
              container.style.cursor = existingData.zoom > 100 ? 'grab' : 'default';
            }
            if (zoomOutBtn) {
              zoomOutBtn.disabled = existingData.zoom <= 50;
            }
            if (zoomInBtn) {
              zoomInBtn.disabled = existingData.zoom >= 300;
            }
          }
        }
        return;
      }

      // Skip if it's inside a ZoomableImage component
      if (imageElement.closest('[class*="zoomable"]')) {
        return;
      }

      // Use image src as stable identifier
      const imageSrc = imageElement.src;
      // Initialize zoom data if not exists, or restore existing
      if (!htmlImageZoomDataRef.current.has(imageSrc)) {
        htmlImageZoomDataRef.current.set(imageSrc, { zoom: 100, x: 0, y: 0 });
      }
      const data = htmlImageZoomDataRef.current.get(imageSrc)!;

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'zoomable-image-wrapper relative inline-block my-2';
      wrapper.style.cssText = 'max-width: 100%; position: relative; display: inline-block;';

      // Create container for image
      const container = document.createElement('div');
      container.className = 'zoomable-image-container relative overflow-hidden rounded-md border bg-gray-50';
      container.style.cssText = `
        min-height: 100px;
        max-height: 600px;
        cursor: default;
        position: relative;
      `;

      // Wrap image
      imageElement.parentNode?.insertBefore(wrapper, imageElement);
      wrapper.appendChild(container);
      container.appendChild(imageElement);

      // Update image styles
      imageElement.style.cssText = `
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
        display: block;
        user-select: none;
        pointer-events: none;
      `;

      // Create image transform div
      const transformDiv = document.createElement('div');
      transformDiv.className = 'zoomable-image-transform';
      transformDiv.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: center;
        transition: transform 0.1s ease-out;
        min-height: 100px;
      `;
      container.insertBefore(transformDiv, imageElement);
      transformDiv.appendChild(imageElement);

      // Create controls
      const controls = document.createElement('div');
      controls.className = 'zoomable-image-controls absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg z-10';
      controls.style.cssText = 'pointer-events: auto; opacity: 0; transition: opacity 0.2s ease-in-out;';
      container.appendChild(controls);
      
      // Show controls on hover
      container.addEventListener('mouseenter', () => {
        controls.style.opacity = '1';
      });
      
      container.addEventListener('mouseleave', () => {
        controls.style.opacity = '0';
      });

      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.className = 'h-7 w-7 p-0 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50';
      zoomOutBtn.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>';
      zoomOutBtn.title = 'Thu nhỏ';
      controls.appendChild(zoomOutBtn);

      const zoomLabel = document.createElement('span');
      zoomLabel.className = 'text-xs font-medium min-w-[45px] text-center px-1';
      zoomLabel.textContent = '100%';
      controls.appendChild(zoomLabel);

      const zoomInBtn = document.createElement('button');
      zoomInBtn.className = 'h-7 w-7 p-0 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50';
      zoomInBtn.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>';
      zoomInBtn.title = 'Phóng to';
      controls.appendChild(zoomInBtn);

      const separator = document.createElement('div');
      separator.className = 'h-4 w-px bg-gray-300 mx-1';
      controls.appendChild(separator);

      const resetBtn = document.createElement('button');
      resetBtn.className = 'h-7 w-7 p-0 flex items-center justify-center hover:bg-gray-100 rounded';
      resetBtn.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
      resetBtn.title = 'Đặt lại';
      controls.appendChild(resetBtn);

      // State
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };
      // data is already defined above using imageSrc as key

      // Update transform
      const updateTransform = () => {
        // Update ref data to persist zoom state
        htmlImageZoomDataRef.current.set(imageSrc, { ...data });
        transformDiv.style.transform = `scale(${data.zoom / 100}) translate(${data.x / (data.zoom / 100)}px, ${data.y / (data.zoom / 100)}px)`;
        zoomLabel.textContent = `${Math.round(data.zoom)}%`;
        container.style.cursor = data.zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default';
        zoomOutBtn.disabled = data.zoom <= 50;
        zoomInBtn.disabled = data.zoom >= 300;
      };
      
      // Restore zoom state if exists
      if (data.zoom !== 100 || data.x !== 0 || data.y !== 0) {
        updateTransform();
      }

      // Wheel handler
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -10 : 10;
        data.zoom = Math.max(50, Math.min(300, data.zoom + delta));
        if (data.zoom === 100) {
          data.x = 0;
          data.y = 0;
        }
        updateTransform();
      };

      // Mouse handlers
      const handleMouseDown = (e: MouseEvent) => {
        if (data.zoom > 100 && e.button === 0) {
          e.preventDefault();
          e.stopPropagation();
          isDragging = true;
          dragStart = { x: e.clientX - data.x, y: e.clientY - data.y };
          container.style.cursor = 'grabbing';
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && data.zoom > 100) {
          e.preventDefault();
          e.stopPropagation();
          data.x = e.clientX - dragStart.x;
          data.y = e.clientY - dragStart.y;
          updateTransform();
        }
      };

      const handleMouseUp = () => {
        isDragging = false;
        if (data.zoom > 100) {
          container.style.cursor = 'grab';
        } else {
          container.style.cursor = 'default';
        }
      };

      // Button handlers
      zoomOutBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data.zoom = Math.max(50, data.zoom - 25);
        if (data.zoom === 100) {
          data.x = 0;
          data.y = 0;
        }
        updateTransform();
      };

      zoomInBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data.zoom = Math.min(300, data.zoom + 25);
        updateTransform();
      };

      resetBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data.zoom = 100;
        data.x = 0;
        data.y = 0;
        updateTransform();
      };

      // Attach event listeners
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);

      // Initial update
      updateTransform();
    });
  };

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  // Setup zoom/pan for HTML images after quiz loads or updates
  // Don't re-run on selectedAnswers change to preserve zoom state
  useEffect(() => {
    if (quiz && quizContainerRef.current) {
      setTimeout(() => {
        setupHTMLImageZoomPan();
      }, 100);
    }
  }, [quiz, showResults]);
  
  // Also setup when content changes but preserve zoom state
  useEffect(() => {
    if (quiz && quizContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setupHTMLImageZoomPan();
      });
    }
  }, [selectedAnswers]);

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
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let correctCount = 0;
    quiz.questions.forEach(q => {
      const userAnswer = selectedAnswers[q.id];
      const correctAnswer = q.correctAnswer;

      if (q.type === "multiple-choice") {
        if (userAnswer === correctAnswer) correctCount++;
      } else if (q.type === "matching") {
        // Compare matching answers
        if (
          typeof correctAnswer === "object" &&
          typeof userAnswer === "object"
        ) {
          const correct = correctAnswer as Record<string, string>;
          const user = userAnswer as Record<string, string>;
          let allCorrect = true;
          Object.keys(correct).forEach(key => {
            if (correct[key] !== user[key]) {
              allCorrect = false;
            }
          });
          if (allCorrect) correctCount++;
        }
      } else if (q.type === "gap-filling" && q.gaps) {
        // Check all gaps are filled correctly
        let allCorrect = true;
        if (typeof userAnswer === "object") {
          q.gaps.forEach((gap, index) => {
            const userGapAnswer = (userAnswer as any)[index];
            if (
              String(userGapAnswer || "")
                .toLowerCase()
                .trim() !== String(gap.correctAnswer).toLowerCase().trim()
            ) {
              allCorrect = false;
            }
          });
        } else {
          allCorrect = false;
        }
        if (allCorrect) correctCount++;
      } else {
        if (
          String(userAnswer).toLowerCase().trim() ===
          String(correctAnswer).toLowerCase().trim()
        ) {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleClearDrawing = () => {
    setClearTrigger(prev => prev + 1);
  };

  const isCorrect = (question: QuizQuestion) => {
    const userAnswer = selectedAnswers[question.id];
    const correctAnswer = question.correctAnswer;

    if (question.type === "multiple-choice") {
      return userAnswer === correctAnswer;
    }

    if (question.type === "matching") {
      if (typeof correctAnswer === "object" && typeof userAnswer === "object") {
        const correct = correctAnswer as Record<string, string>;
        const user = userAnswer as Record<string, string>;
        return Object.keys(correct).every(key => correct[key] === user[key]);
      }
      return false;
    }

    if (question.type === "gap-filling" && question.gaps) {
      if (typeof userAnswer === "object") {
        return question.gaps.every((gap, index) => {
          const userGapAnswer = (userAnswer as any)[index];
          return (
            String(userGapAnswer || "")
              .toLowerCase()
              .trim() === String(gap.correctAnswer).toLowerCase().trim()
          );
        });
      }
      return false;
    }

    return (
      String(userAnswer || "")
        .toLowerCase()
        .trim() === String(correctAnswer).toLowerCase().trim()
    );
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
    <div className="min-h-screen bg-background py-12 px-4 relative">
      {/* Drawing Toolbar */}
      {!showResults && (
        <DrawingToolbar
          onColorChange={setDrawingColor}
          onToolChange={setDrawingTool}
          onClear={handleClearDrawing}
          onToggleDrawing={() => setDrawingEnabled(!drawingEnabled)}
          currentColor={drawingColor}
          currentTool={drawingTool}
          drawingEnabled={drawingEnabled}
        />
      )}
      
      {quiz && (
        <SEO
          title={`${quiz.title} - PDF to Quiz Tools`}
          description={quiz.description || `Làm bài kiểm tra: ${quiz.title} với ${quiz.questions.length} câu hỏi. ${quiz.metadata?.difficulty ? `Độ khó: ${quiz.metadata.difficulty}` : ''}`}
          keywords={`quiz, bài kiểm tra, ${quiz.title}, trắc nghiệm, đề thi, PDF to quiz`}
          url={typeof window !== "undefined" ? window.location.href : ""}
          type="article"
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Quiz",
            "name": quiz.title,
            "description": quiz.description || quiz.title,
            "questionCount": quiz.questions.length,
            "educationalLevel": quiz.metadata?.difficulty || "Intermediate",
            "inLanguage": quiz.metadata?.language || "vi",
          }}
        />
      )}
      
      <div className="container max-w-4xl mx-auto relative" ref={quizContainerRef}>
        {/* Drawing Canvas Overlay - inside container to scroll with content */}
        {!showResults && drawingEnabled && (
          <DrawingCanvas
            color={drawingColor}
            tool={drawingTool}
            onClear={handleClearDrawing}
            clearTrigger={clearTrigger}
            containerRef={quizContainerRef}
          />
        )}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setLocation("/quizzes")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button
            onClick={() => setLocation(`/quiz/editor/${quiz.id}`)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-muted-foreground text-lg">
                  {quiz.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Badge variant="secondary">{quiz.questions.length} câu hỏi</Badge>
            {quiz.metadata?.difficulty && (
              <Badge>
                Độ khó:{" "}
                {quiz.metadata.difficulty === "easy"
                  ? "Dễ"
                  : quiz.metadata.difficulty === "medium"
                    ? "Trung bình"
                    : "Khó"}
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
                <div className="text-5xl font-bold mb-2">
                  {score.toFixed(1)}%
                </div>
                <p className="text-muted-foreground">
                  {Math.round((score / 100) * quiz.questions.length)} /{" "}
                  {quiz.questions.length} câu đúng
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
                  <div
                    className="flex-1 prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:block [&_img]:my-2"
                    dangerouslySetInnerHTML={{
                      __html: ensureAbsoluteImageUrls(question.question),
                    }}
                  />
                </CardTitle>
                {question.points && (
                  <CardDescription>Điểm: {question.points}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display image if available */}
                {question.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="max-w-full max-h-96 object-contain rounded-md border"
                    />
                  </div>
                )}
                {question.type === "multiple-choice" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isSelected =
                        selectedAnswers[question.id] === optIndex;
                      const isCorrectAnswer =
                        question.correctAnswer === optIndex;
                      const showCorrect = showResults && isCorrectAnswer;
                      const showWrong =
                        showResults && isSelected && !isCorrectAnswer;

                      return (
                        <Button
                          key={optIndex}
                          variant={isSelected ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() =>
                            handleAnswerSelect(question.id, optIndex)
                          }
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
                      onChange={e =>
                        handleAnswerSelect(question.id, e.target.value)
                      }
                      disabled={showResults}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="Nhập câu trả lời..."
                    />
                    {showResults && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Đáp án đúng:{" "}
                        </span>
                        <span className="font-semibold">
                          {typeof question.correctAnswer === 'string' || typeof question.correctAnswer === 'number' 
                            ? question.correctAnswer 
                            : JSON.stringify(question.correctAnswer)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {question.type === "true-false" && (
                  <div className="flex gap-4">
                    {["Đúng", "Sai"].map((option, optIndex) => {
                      const isSelected =
                        selectedAnswers[question.id] === optIndex;
                      return (
                        <Button
                          key={optIndex}
                          variant={isSelected ? "default" : "outline"}
                          className="flex-1"
                          onClick={() =>
                            handleAnswerSelect(question.id, optIndex)
                          }
                          disabled={showResults}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {question.type === "matching" && (
                  <div className="space-y-4">
                    {question.matchingPairs &&
                    question.matchingPairs.length > 0 ? (
                      <div className="space-y-3">
                        {question.matchingPairs.map((pair, pairIndex) => {
                          // Lấy tất cả các đáp án từ options (nếu có)
                          // Nếu không có options, tự động tạo danh sách A-H (mặc định 8 đáp án)
                          let availableOptions: string[] = [];

                          if (question.options && question.options.length > 0) {
                            // Dùng options đã nhập
                            availableOptions = question.options;
                          } else {
                            // Tự động tạo A-H (mặc định 8 đáp án)
                            // Hoặc có thể tạo dựa trên số matching pairs, nhưng tối đa 8 (A-H)
                            const numOptions = Math.max(
                              8,
                              question.matchingPairs?.length || 8
                            );
                            availableOptions = Array.from(
                              { length: Math.min(numOptions, 8) },
                              (_, i) => String.fromCharCode(65 + i) // A, B, C, D, E, F, G, H
                            );
                          }

                          // Lấy đáp án đúng cho cặp này
                          const correctAnswerKey = `left-${pairIndex}`;
                          const correctAnswer =
                            typeof question.correctAnswer === "object" &&
                            question.correctAnswer !== null &&
                            !Array.isArray(question.correctAnswer)
                              ? (
                                  question.correctAnswer as Record<
                                    string,
                                    string
                                  >
                                )[correctAnswerKey]
                              : null;

                          // Kiểm tra xem đáp án người dùng chọn có đúng không
                          const userAnswer =
                            selectedAnswers[question.id]?.[correctAnswerKey];
                          const isCorrect = userAnswer === correctAnswer;

                          return (
                            <div key={pairIndex} className="space-y-2">
                              <div className="flex items-center gap-3 p-3 border rounded-md">
                                <span className="font-medium flex-1">
                                  {pair.left}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <Select
                                  value={
                                    selectedAnswers[question.id]?.[
                                      `left-${pairIndex}`
                                    ] || ""
                                  }
                                  onValueChange={value => {
                                    const current =
                                      selectedAnswers[question.id] || {};
                                    handleAnswerSelect(question.id, {
                                      ...current,
                                      [`left-${pairIndex}`]: value,
                                    });
                                  }}
                                  disabled={showResults}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Chọn đáp án..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableOptions.map((option, idx) => (
                                      <SelectItem key={idx} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {showResults && correctAnswer && (
                                <div className="text-sm pl-3">
                                  <span className="text-muted-foreground">
                                    Đáp án đúng:{" "}
                                  </span>
                                  <span className="font-semibold">
                                    {correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        Chưa có cặp matching nào
                      </div>
                    )}
                  </div>
                )}

                {question.type === "gap-filling" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {question.gaps?.map((gap, gapIndex) => (
                        <div key={gapIndex} className="space-y-2">
                          <Label>Chỗ trống ở vị trí {gap.position}</Label>
                          <Input
                            value={
                              selectedAnswers[question.id]?.[gapIndex] || ""
                            }
                            onChange={e => {
                              const current =
                                selectedAnswers[question.id] || {};
                              handleAnswerSelect(question.id, {
                                ...current,
                                [gapIndex]: e.target.value,
                              });
                            }}
                            disabled={showResults}
                            placeholder="Nhập từ cần điền..."
                          />
                          {showResults && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Đáp án:{" "}
                              </span>
                              <span className="font-semibold">
                                {gap.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === "short-answer" && (
                  <div className="space-y-2">
                    <Textarea
                      value={selectedAnswers[question.id] || ""}
                      onChange={e =>
                        handleAnswerSelect(question.id, e.target.value)
                      }
                      disabled={showResults}
                      placeholder="Nhập câu trả lời..."
                      rows={4}
                    />
                    {showResults && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Đáp án mẫu:{" "}
                        </span>
                        <span className="font-semibold">
                          {typeof question.correctAnswer === 'string' || typeof question.correctAnswer === 'number' 
                            ? question.correctAnswer 
                            : JSON.stringify(question.correctAnswer)}
                        </span>
                      </div>
                    )}
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
            <Button onClick={handleSubmit} size="lg">
              Nộp bài
            </Button>
          </div>
        )}

        {/* Scroll to Top Button - chỉ hiển thị sau khi nộp bài */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={scrollToTop}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
