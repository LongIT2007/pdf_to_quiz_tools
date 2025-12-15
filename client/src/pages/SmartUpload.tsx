import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Brain,
  FileStack,
} from "lucide-react";
import { pdfAPI } from "@/lib/api";
import { toast } from "sonner";

export default function SmartUpload() {
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedPDFs, setUploadedPDFs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"single" | "multiple">("single");
  
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  const handleSingleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleMultipleFilesSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedPDFs([]);

    try {
      const uploaded: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} không phải file PDF`);
          continue;
        }
        
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`${file.name} quá lớn (>100MB)`);
          continue;
        }

        // Upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const fileProgress = ((i + 1) / files.length) * 100;
            return Math.min(fileProgress, prev + 5);
          });
        }, 200);

        try {
          const pdf = await pdfAPI.upload(file);
          uploaded.push(pdf);
          setUploadedPDFs([...uploaded]);
        } catch (err: any) {
          toast.error(`Lỗi upload ${file.name}: ${err.message}`);
        } finally {
          clearInterval(progressInterval);
        }
      }

      setUploadProgress(100);
      
      if (uploaded.length > 0) {
        toast.success(`Upload thành công ${uploaded.length} file!`);
        
        // Auto-analyze and create quiz
        setTimeout(() => {
          const pdfIds = uploaded.map(p => p.id);
          setLocation(`/quiz/smart-create?pdfIds=${pdfIds.join(",")}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Chỉ chấp nhận file PDF");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File quá lớn. Kích thước tối đa là 100MB");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const pdf = await pdfAPI.upload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedPDFs([pdf]);
      
      toast.success("Upload PDF thành công!");
      
      // Auto-analyze
      setTimeout(() => {
        setLocation(`/quiz/smart-create?pdfId=${pdf.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Lỗi khi upload PDF");
      toast.error("Upload thất bại: " + (err.message || "Lỗi không xác định"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, mode: "single" | "multiple") => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(f => f.type === "application/pdf");
    
    if (pdfFiles.length === 0) {
      setError("Không có file PDF nào");
      return;
    }

    if (mode === "single" && pdfFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(pdfFiles[0]);
      singleFileInputRef.current!.files = dataTransfer.files;
      singleFileInputRef.current!.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (mode === "multiple") {
      const dataTransfer = new DataTransfer();
      pdfFiles.forEach(file => dataTransfer.items.add(file));
      multipleFileInputRef.current!.files = dataTransfer.files;
      multipleFileInputRef.current!.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Smart PDF Upload</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4 px-2">
            AI tự động nhận diện câu hỏi và đáp án từ PDF
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-3 sm:mt-4 px-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              <FileText className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">1 file: Tự động tách đề và đáp án</span>
              <span className="sm:hidden">1 file: Tự động tách</span>
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              <FileStack className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Nhiều file: Tự động ghép đề và đáp án</span>
              <span className="sm:hidden">Nhiều file: Tự động ghép</span>
            </Badge>
          </div>
        </div>

        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle>Chọn chế độ upload</CardTitle>
            <CardDescription>
              Upload 1 file hoặc nhiều file, AI sẽ tự động phân tích
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "single" | "multiple")}>
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="single" className="text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">1 File (Đề + Đáp Án)</span>
                  <span className="sm:hidden">1 File</span>
                </TabsTrigger>
                <TabsTrigger value="multiple" className="text-xs sm:text-sm">
                  <FileStack className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Nhiều Files (Tách Biệt)</span>
                  <span className="sm:hidden">Nhiều Files</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <div
                  className="border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center hover:border-primary transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "single")}
                  onClick={() => singleFileInputRef.current?.click()}
                >
                  <input
                    ref={singleFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleSingleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />

                  {isUploading && uploadedPDFs.length === 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-spin text-primary" />
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">Đang upload...</p>
                        <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
                      </div>
                    </div>
                  ) : uploadedPDFs.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-600" />
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">Upload thành công!</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Đang phân tích PDF với AI...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">
                          Kéo thả 1 file PDF vào đây
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                          File có thể chứa cả đề và đáp án
                        </p>
                        <Button type="button" size="lg" className="w-full sm:w-auto">
                          Chọn File
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI sẽ tự động tách đề và đáp án
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="multiple">
                <div
                  className="border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center hover:border-primary transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "multiple")}
                  onClick={() => multipleFileInputRef.current?.click()}
                >
                  <input
                    ref={multipleFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handleMultipleFilesSelect}
                    className="hidden"
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <div className="space-y-3 sm:space-y-4">
                      <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-spin text-primary" />
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">
                          Đang upload {uploadedPDFs.length > 0 ? `${uploadedPDFs.length} file` : "files"}...
                        </p>
                        <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">{uploadProgress.toFixed(0)}%</p>
                        {uploadedPDFs.length > 0 && (
                          <div className="mt-3 sm:mt-4 space-y-2 flex flex-wrap justify-center gap-2">
                            {uploadedPDFs.map((pdf) => (
                              <Badge key={pdf.id} variant="secondary" className="text-xs break-all max-w-full">
                                {pdf.originalName}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : uploadedPDFs.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-600" />
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">
                          Upload thành công {uploadedPDFs.length} file!
                        </p>
                        <div className="space-y-2 mt-3 sm:mt-4 flex flex-wrap justify-center gap-2">
                          {uploadedPDFs.map((pdf) => (
                            <Badge key={pdf.id} variant="secondary" className="text-xs break-all max-w-full">
                              {pdf.originalName}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
                          Đang phân tích với AI...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <FileStack className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-base sm:text-lg font-medium mb-2">
                          Kéo thả nhiều file PDF vào đây
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                          Có thể là: 1 file đề + nhiều file đáp án
                        </p>
                        <Button type="button" size="lg" className="w-full sm:w-auto">
                          Chọn Nhiều Files
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI sẽ tự động nhận diện và ghép đề với đáp án
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Alert className="mt-4 sm:mt-6">
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-sm sm:text-base">
            <strong>Chế độ thông minh:</strong> AI sẽ tự động phân tích PDF và:
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
              <li>Nhận diện câu hỏi trong file</li>
              <li>Nhận diện đáp án (có thể trong cùng file hoặc file khác)</li>
              <li>Ghép câu hỏi với đáp án đúng</li>
              <li>Tự động tạo quiz với đáp án chính xác</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="mt-6 sm:mt-8 text-center">
          <Button variant="outline" onClick={() => setLocation("/")} className="w-full sm:w-auto">
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
