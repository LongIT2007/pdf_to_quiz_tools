import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Plus, Trash2, Image as ImageIcon, Save, X } from "lucide-react";
import { quizAPI, imageAPI, QuizQuestion } from "@/lib/api";
import { toast } from "sonner";

interface QuestionEditor {
  id: string;
  question: string;
  type: QuizQuestion["type"];
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  points?: number;
  imageUrl?: string;
  matchingPairs?: { left: string; right: string }[];
  gaps?: { position: number; correctAnswer: string; options?: string[] }[];
}

export default function EditorQuiz() {
  const [location, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionEditor[]>([]);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const addQuestion = (type: QuizQuestion["type"]) => {
    const newQuestion: QuestionEditor = {
      id: `temp-${Date.now()}-${Math.random()}`,
      question: "",
      type,
      correctAnswer: type === "multiple-choice" ? 0 : "",
      points: 1,
      options: type === "multiple-choice" ? ["", ""] : undefined,
    };

    if (type === "matching") {
      newQuestion.matchingPairs = [{ left: "", right: "" }];
      newQuestion.correctAnswer = {};
    }

    if (type === "gap-filling") {
      newQuestion.gaps = [];
      newQuestion.correctAnswer = "";
    }

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuestionEditor>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, ""] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex);
          return {
            ...q,
            options: newOptions,
            correctAnswer:
              typeof q.correctAnswer === "number" &&
              q.correctAnswer >= newOptions.length
                ? newOptions.length - 1
                : q.correctAnswer,
          };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleImageUpload = async (questionId: string, file: File) => {
    setUploadingImage(questionId);
    try {
      const result = await imageAPI.upload(file);
      updateQuestion(questionId, { imageUrl: result.url });
      toast.success("Tải ảnh thành công");
    } catch (error: any) {
      toast.error("Lỗi tải ảnh: " + (error.message || "Lỗi không xác định"));
    } finally {
      setUploadingImage(null);
    }
  };

  const addMatchingPair = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "matching") {
          return {
            ...q,
            matchingPairs: [...(q.matchingPairs || []), { left: "", right: "" }],
          };
        }
        return q;
      })
    );
  };

  const removeMatchingPair = (questionId: string, index: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "matching") {
          const newPairs = q.matchingPairs?.filter((_, i) => i !== index) || [];
          return { ...q, matchingPairs: newPairs };
        }
        return q;
      })
    );
  };

  const updateMatchingPair = (
    questionId: string,
    index: number,
    field: "left" | "right",
    value: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "matching" && q.matchingPairs) {
          const newPairs = [...q.matchingPairs];
          newPairs[index] = { ...newPairs[index], [field]: value };
          return { ...q, matchingPairs: newPairs };
        }
        return q;
      })
    );
  };

  const addGap = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "gap-filling") {
          return {
            ...q,
            gaps: [...(q.gaps || []), { position: (q.gaps?.length || 0), correctAnswer: "" }],
          };
        }
        return q;
      })
    );
  };

  const removeGap = (questionId: string, index: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "gap-filling") {
          return {
            ...q,
            gaps: q.gaps?.filter((_, i) => i !== index) || [],
          };
        }
        return q;
      })
    );
  };

  const updateGap = (
    questionId: string,
    index: number,
    field: "correctAnswer" | "position",
    value: string | number
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "gap-filling" && q.gaps) {
          const newGaps = [...q.gaps];
          newGaps[index] = { ...newGaps[index], [field]: value };
          return { ...q, gaps: newGaps };
        }
        return q;
      })
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề quiz");
      return;
    }

    if (questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất một câu hỏi");
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error("Tất cả câu hỏi cần có nội dung");
        return;
      }

      if (q.type === "multiple-choice") {
        if (!q.options || q.options.length < 2) {
          toast.error("Câu hỏi trắc nghiệm cần ít nhất 2 đáp án");
          return;
        }
        if (q.options.some((opt) => !opt.trim())) {
          toast.error("Tất cả đáp án cần có nội dung");
          return;
        }
      }

      if (q.type === "matching") {
        if (!q.matchingPairs || q.matchingPairs.length < 2) {
          toast.error("Câu hỏi matching cần ít nhất 2 cặp");
          return;
        }
        if (q.matchingPairs.some((p) => !p.left.trim() || !p.right.trim())) {
          toast.error("Tất cả cặp matching cần có đầy đủ nội dung");
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Prepare correct answers for matching
      const processedQuestions = questions.map((q) => {
        if (q.type === "matching" && q.matchingPairs) {
          const correctAnswer: Record<string, string> = {};
          q.matchingPairs.forEach((pair, index) => {
            correctAnswer[`left-${index}`] = pair.right;
          });
          return { ...q, correctAnswer };
        }
        return q;
      });

      const quiz = await quizAPI.create({
        title,
        description: description || undefined,
        questions: processedQuestions.map((q) => ({
          ...q,
          id: undefined, // Will be generated by server
        })) as any,
      });

      toast.success("Tạo quiz thành công!");
      setLocation(`/quiz/${quiz.id}`);
    } catch (error: any) {
      toast.error("Lỗi tạo quiz: " + (error.message || "Lỗi không xác định"));
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-4xl font-bold mb-4">Soạn thảo Quiz</h1>
          <p className="text-muted-foreground text-lg">
            Tạo đề thi tiếng Anh với nhiều loại câu hỏi khác nhau
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề quiz..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả (tùy chọn)..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Câu hỏi ({questions.length})</h2>
            <div className="flex gap-2">
              <Select
                onValueChange={(value: QuizQuestion["type"]) => addQuestion(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Thêm câu hỏi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Trắc nghiệm</SelectItem>
                  <SelectItem value="fill-blank">Điền từ</SelectItem>
                  <SelectItem value="gap-filling">Điền từ (nhiều chỗ)</SelectItem>
                  <SelectItem value="matching">Nối cặp</SelectItem>
                  <SelectItem value="true-false">Đúng/Sai</SelectItem>
                  <SelectItem value="short-answer">Tự luận</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary">Câu {index + 1}</Badge>
                      <span className="text-sm font-normal text-muted-foreground">
                        {question.type === "multiple-choice" && "Trắc nghiệm"}
                        {question.type === "fill-blank" && "Điền từ"}
                        {question.type === "gap-filling" && "Điền từ (nhiều chỗ)"}
                        {question.type === "matching" && "Nối cặp"}
                        {question.type === "true-false" && "Đúng/Sai"}
                        {question.type === "short-answer" && "Tự luận"}
                      </span>
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Câu hỏi *</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, { question: e.target.value })
                    }
                    placeholder="Nhập nội dung câu hỏi..."
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Hình ảnh (tùy chọn)</Label>
                  {question.imageUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={question.imageUrl}
                        alt="Question"
                        className="max-w-full max-h-64 rounded-md border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateQuestion(question.id, { imageUrl: undefined })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`image-${question.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(question.id, file);
                        }}
                      />
                      <Label
                        htmlFor={`image-${question.id}`}
                        className="cursor-pointer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage === question.id}
                          asChild
                        >
                          <span>
                            {uploadingImage === question.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tải...
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Tải ảnh lên
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Multiple Choice Options */}
                {question.type === "multiple-choice" && (
                  <div className="space-y-4">
                    <Label>Đáp án</Label>
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === optIndex}
                          onChange={() =>
                            updateQuestion(question.id, {
                              correctAnswer: optIndex,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, optIndex, e.target.value)
                          }
                          placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                        />
                        {question.options && question.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(question.id, optIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm đáp án
                    </Button>
                  </div>
                )}

                {/* Fill Blank */}
                {question.type === "fill-blank" && (
                  <div className="space-y-2">
                    <Label>Đáp án đúng *</Label>
                    <Input
                      value={question.correctAnswer as string}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="Nhập đáp án đúng..."
                    />
                  </div>
                )}

                {/* Gap Filling */}
                {question.type === "gap-filling" && (
                  <div className="space-y-4">
                    <Label>Các chỗ trống</Label>
                    {question.gaps?.map((gap, gapIndex) => (
                      <div key={gapIndex} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={gap.position}
                          onChange={(e) =>
                            updateGap(
                              question.id,
                              gapIndex,
                              "position",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="Vị trí"
                          className="w-24"
                        />
                        <Input
                          value={gap.correctAnswer}
                          onChange={(e) =>
                            updateGap(
                              question.id,
                              gapIndex,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                          placeholder="Đáp án đúng"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGap(question.id, gapIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addGap(question.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm chỗ trống
                    </Button>
                  </div>
                )}

                {/* Matching */}
                {question.type === "matching" && (
                  <div className="space-y-4">
                    <Label>Các cặp nối</Label>
                    {question.matchingPairs?.map((pair, pairIndex) => (
                      <div key={pairIndex} className="flex items-center gap-2">
                        <Input
                          value={pair.left}
                          onChange={(e) =>
                            updateMatchingPair(
                              question.id,
                              pairIndex,
                              "left",
                              e.target.value
                            )
                          }
                          placeholder="Mục trái"
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">→</span>
                        <Input
                          value={pair.right}
                          onChange={(e) =>
                            updateMatchingPair(
                              question.id,
                              pairIndex,
                              "right",
                              e.target.value
                            )
                          }
                          placeholder="Mục phải"
                          className="flex-1"
                        />
                        {question.matchingPairs &&
                          question.matchingPairs.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeMatchingPair(question.id, pairIndex)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addMatchingPair(question.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm cặp
                    </Button>
                  </div>
                )}

                {/* True/False */}
                {question.type === "true-false" && (
                  <div className="space-y-2">
                    <Label>Đáp án đúng *</Label>
                    <Select
                      value={String(question.correctAnswer)}
                      onValueChange={(value) =>
                        updateQuestion(question.id, {
                          correctAnswer: value === "true" ? 0 : 1,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Đúng</SelectItem>
                        <SelectItem value="false">Sai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Short Answer */}
                {question.type === "short-answer" && (
                  <div className="space-y-2">
                    <Label>Đáp án mẫu</Label>
                    <Input
                      value={question.correctAnswer as string}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="Nhập đáp án mẫu..."
                    />
                  </div>
                )}

                {/* Explanation and Points */}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Giải thích (tùy chọn)</Label>
                    <Textarea
                      value={question.explanation || ""}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          explanation: e.target.value,
                        })
                      }
                      placeholder="Giải thích đáp án..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Điểm</Label>
                    <Input
                      type="number"
                      min="1"
                      value={question.points || 1}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          points: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Chưa có câu hỏi nào. Hãy thêm câu hỏi để bắt đầu!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {questions.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu Quiz
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

