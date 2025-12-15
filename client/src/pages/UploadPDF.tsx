import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { pdfAPI } from "@/lib/api";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

export default function UploadPDF() {
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedPDF, setUploadedPDF] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Chỉ chấp nhận file PDF");
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("File quá lớn. Kích thước tối đa là 100MB");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
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
      setUploadedPDF(pdf);
      
      toast.success("Upload PDF thành công!");
      
      // Redirect to quiz generation after 2 seconds
      setTimeout(() => {
        setLocation(`/quiz/create?pdfId=${pdf.id}`);
      }, 2000);
    } catch (err: any) {
      clearInterval(progressInterval);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <SEO
        title="Upload PDF - Tải Lên PDF và Tạo Quiz | PDF to Quiz Tools"
        description="Tải lên file PDF và tạo bài kiểm tra trắc nghiệm tự động. Hỗ trợ file PDF lên đến 100MB. Tạo quiz từ PDF một cách nhanh chóng và dễ dàng."
        keywords="upload PDF, tải lên PDF, tạo quiz từ PDF, PDF to quiz upload"
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Tải Lên PDF và Tạo Quiz</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Tải lên file PDF để bắt đầu tạo bài kiểm tra trắc nghiệm tự động
          </p>
          <p className="text-sm text-muted-foreground">
            Hỗ trợ file PDF • Tối đa 100MB • Tạo quiz tự động với AI
          </p>
        </div>

        {/* Hướng dẫn sử dụng */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Hướng Dẫn Sử Dụng</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bước 1: Tải Lên PDF</CardTitle>
                <CardDescription>
                  Chọn file PDF từ máy tính của bạn hoặc kéo thả vào đây
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bước 2: Chọn Loại Quiz</CardTitle>
                <CardDescription>
                  Chọn loại câu hỏi bạn muốn tạo (trắc nghiệm, tự luận, v.v.)
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bước 3: Hoàn Thành</CardTitle>
                <CardDescription>
                  AI sẽ tự động tạo quiz cho bạn. Chỉ cần đợi vài giây!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle>Chọn file PDF</CardTitle>
            <CardDescription>
              Kéo thả file vào đây hoặc click để chọn file
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {uploadedPDF && (
              <Alert className="mb-4 border-green-500">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Upload thành công! Đang chuyển đến trang tạo quiz...
                </AlertDescription>
              </Alert>
            )}

            {!uploadedPDF && (
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                {isUploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                    <div>
                      <p className="text-lg font-medium mb-2">Đang upload...</p>
                      <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium mb-2">
                        Kéo thả file PDF vào đây
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        hoặc click để chọn file
                      </p>
                      <Button type="button">Chọn File</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hỗ trợ: PDF • Tối đa 100MB
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
