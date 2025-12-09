import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Zap, Users, Lightbulb } from "lucide-react";
import { useState } from "react";
import "@/custom.css";

interface Tool {
  id: string;
  name: string;
  url: string;
  type: string;
  features: string[];
  free: boolean;
  automatic: boolean;
  quality: "Cao" | "Trung" | "Thấp";
  ease: "Cao" | "Trung" | "Thấp";
  description: string;
}

const tools: Tool[] = [
  {
    id: "smallpdf",
    name: "SmallPDF Question Generator",
    url: "https://smallpdf.com/vi/question-generator",
    type: "Công cụ AI",
    features: ["Tạo từ PDF", "Tạo từ Word", "Tạo từ PowerPoint", "AI tự động"],
    free: true,
    automatic: true,
    quality: "Cao",
    ease: "Cao",
    description: "Công cụ tạo bài kiểm tra tự động từ file PDF sử dụng AI, nhanh chóng và dễ sử dụng.",
  },
  {
    id: "examica",
    name: "Examica AI Test Generator",
    url: "https://examica.io/vi/trinh-tao-de-thi/",
    type: "Nền tảng AI",
    features: ["Nhiều loại câu hỏi", "Phân tích hiệu suất", "Tạo nhanh", "AI tự động"],
    free: true,
    automatic: true,
    quality: "Cao",
    ease: "Cao",
    description: "Nền tảng AI chuyên biệt tạo đề thi với nhiều loại câu hỏi khác nhau.",
  },
  {
    id: "quizzy",
    name: "Quizzy",
    url: "https://quizzy.vn/",
    type: "Nền tảng AI",
    features: ["Tạo từ PDF", "Tạo từ URL", "Đa ngôn ngữ", "Tích hợp LMS"],
    free: true,
    automatic: true,
    quality: "Trung",
    ease: "Cao",
    description: "Tạo quiz từ văn bản, PDF hoặc URL với hỗ trợ nhiều ngôn ngữ.",
  },
  {
    id: "pdftoquiz",
    name: "PDF to Quiz",
    url: "https://www.pdftoquiz.com/",
    type: "Công cụ chuyên",
    features: ["Chuyên PDF", "Drag-and-drop", "Chia sẻ dễ dàng", "Nhúng được"],
    free: true,
    automatic: true,
    quality: "Trung",
    ease: "Cao",
    description: "Công cụ chuyên dụng chuyển PDF thành quiz tương tác với giao diện đơn giản.",
  },
  {
    id: "magicform",
    name: "MagicForm PDF to Quiz",
    url: "https://www.magicform.app/tools/pdf-to-quiz",
    type: "Công cụ trực tuyến",
    features: ["Không cần đăng ký", "Tải file hoặc URL", "Tạo tức thì", "Miễn phí"],
    free: true,
    automatic: true,
    quality: "Trung",
    ease: "Cao",
    description: "Công cụ miễn phí không cần đăng ký, tạo quiz từ PDF ngay lập tức.",
  },
  {
    id: "azota",
    name: "Azota",
    url: "https://docs.azota.vn/docs/huong-dan-su-dung/de-thi/tao-de-thi-tu-upload-file/",
    type: "Nền tảng LMS",
    features: ["Quản lý lớp", "Chấm điểm tự động", "Theo dõi tiến độ", "Báo cáo chi tiết"],
    free: true,
    automatic: false,
    quality: "Cao",
    ease: "Trung",
    description: "Nền tảng quản lý học tập tích hợp với tính năng tạo đề thi từ file.",
  },
  {
    id: "msforms",
    name: "Microsoft Forms",
    url: "https://forms.microsoft.com/",
    type: "Công cụ Microsoft",
    features: ["Tích hợp Office 365", "Chấm điểm tự động", "Phân tích kết quả", "Bảo mật cao"],
    free: true,
    automatic: false,
    quality: "Cao",
    ease: "Trung",
    description: "Công cụ Microsoft tích hợp sâu với Office 365, bảo mật cao.",
  },
  {
    id: "canva",
    name: "Canva Quiz Maker",
    url: "https://www.canva.com/vi_vn/thiet-ke/quiz-trac-nghiem/",
    type: "Công cụ thiết kế",
    features: ["Mẫu đẹp", "Tùy chỉnh dễ", "Chia sẻ dễ dàng", "Thiết kế chuyên"],
    free: true,
    automatic: false,
    quality: "Cao",
    ease: "Cao",
    description: "Công cụ thiết kế với mẫu chuyên nghiệp, dễ tùy chỉnh giao diện.",
  },
  {
    id: "revision",
    name: "Revision.ai",
    url: "https://www.revision.ai/",
    type: "Công cụ chuyên",
    features: ["Chuyên slide", "Hỗ trợ PDF", "Tạo nhanh", "Miễn phí 3 file"],
    free: true,
    automatic: true,
    quality: "Trung",
    ease: "Cao",
    description: "Công cụ chuyên biệt chuyển slide bài giảng thành quiz.",
  },
  {
    id: "quizizz",
    name: "Quizizz",
    url: "https://quizizz.com/",
    type: "Nền tảng học tập",
    features: ["Chế độ game", "Theo dõi tiến độ", "Tích hợp lớp học", "Gamified"],
    free: true,
    automatic: false,
    quality: "Cao",
    ease: "Trung",
    description: "Nền tảng học tập gamified với chế độ chơi game hấp dẫn.",
  },
  {
    id: "googleforms",
    name: "Google Forms",
    url: "https://forms.google.com/",
    type: "Công cụ Google",
    features: ["Miễn phí", "Tích hợp Google", "Chấm điểm tự động", "Phân tích kết quả"],
    free: true,
    automatic: false,
    quality: "Cao",
    ease: "Cao",
    description: "Công cụ Google miễn phí tích hợp sâu với Google Workspace.",
  },
  {
    id: "kahoot",
    name: "Kahoot!",
    url: "https://kahoot.com/",
    type: "Nền tảng học tập",
    features: ["Chế độ game", "Tương tác thời gian thực", "Báo cáo chi tiết", "Gamified"],
    free: true,
    automatic: false,
    quality: "Cao",
    ease: "Trung",
    description: "Nền tảng học tập gamified với tương tác thời gian thực cao.",
  },
  {
    id: "minitool",
    name: "MiniTool AI Test Generator",
    url: "https://minitoolai.com/vi/ai-test-generator/",
    type: "Công cụ AI",
    features: ["Tạo từ PDF", "Tạo từ Word", "Miễn phí", "Nhanh chóng"],
    free: true,
    automatic: true,
    quality: "Trung",
    ease: "Cao",
    description: "Công cụ AI miễn phí tạo đề thi nhanh chóng từ PDF và Word.",
  },
  {
    id: "mapify",
    name: "Mapify ChatPDF",
    url: "https://mapify.so/vi/tools/chatpdf",
    type: "Công cụ AI",
    features: ["Chat với PDF", "Sơ đồ tư duy", "Tóm tắt", "Trích xuất thông tin"],
    free: true,
    automatic: false,
    quality: "Trung",
    ease: "Cao",
    description: "Công cụ AI đa năng cho PDF, không chuyên về tạo quiz.",
  },
];

const qualityColors = {
  "Cao": "bg-green-100 text-green-800",
  "Trung": "bg-yellow-100 text-yellow-800",
  "Thấp": "bg-red-100 text-red-800",
};

const easeColors = {
  "Cao": "bg-blue-100 text-blue-800",
  "Trung": "bg-purple-100 text-purple-800",
  "Thấp": "bg-gray-100 text-gray-800",
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "quality" | "ease">("name");

  const categories = ["Công cụ AI", "Nền tảng LMS", "Công cụ chuyên", "Công cụ thiết kế"];
  
  let filteredTools = selectedCategory 
    ? tools.filter(tool => tool.type === selectedCategory)
    : tools;

  filteredTools = filteredTools.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "quality") {
      const qualityOrder = { "Cao": 3, "Trung": 2, "Thấp": 1 };
      return qualityOrder[b.quality] - qualityOrder[a.quality];
    }
    if (sortBy === "ease") {
      const easeOrder = { "Cao": 3, "Trung": 2, "Thấp": 1 };
      return easeOrder[b.ease] - easeOrder[a.ease];
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url('/images/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 container py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="hero-title text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Tìm Công Cụ Chuyển PDF Thành Bài Kiểm Tra
            </h1>
            <p className="hero-description text-xl text-muted-foreground mb-8 leading-relaxed">
              Khám phá 15 công cụ và nền tảng hàng đầu giúp bạn chuyển đổi tệp PDF thành bài kiểm tra trắc nghiệm tương tác chỉ trong vài giây.
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Khám Phá Công Cụ
              </Button>
              <Button size="lg" variant="outline">
                Xem So Sánh
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="feature-card border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-3" />
              <CardTitle>Nhanh Chóng & Tự Động</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hầu hết công cụ sử dụng AI để tạo bài kiểm tra tự động chỉ trong vài giây.
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-3" />
              <CardTitle>Cho Mọi Đối Tượng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Từ giáo viên, học sinh đến tổ chức giáo dục, có công cụ phù hợp cho tất cả.
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Lightbulb className="w-8 h-8 text-primary mb-3" />
              <CardTitle>Tính Năng Phong Phú</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Từ chấm điểm tự động đến gamification, mỗi công cụ có điểm mạnh riêng.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tools Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Danh Sách Công Cụ</h2>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                Tất Cả ({tools.length})
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2 mb-8">
            <span className="text-sm text-muted-foreground pt-2">Sắp xếp:</span>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              onClick={() => setSortBy("name")}
              size="sm"
            >
              Tên
            </Button>
            <Button
              variant={sortBy === "quality" ? "default" : "outline"}
              onClick={() => setSortBy("quality")}
              size="sm"
            >
              Chất Lượng
            </Button>
            <Button
              variant={sortBy === "ease" ? "default" : "outline"}
              onClick={() => setSortBy("ease")}
              size="sm"
            >
              Dễ Sử Dụng
            </Button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTools.map(tool => (
            <Card key={tool.id} className="tool-card border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription>{tool.type}</CardDescription>
                  </div>
                  {tool.free && (
                    <Badge variant="secondary" className="ml-2">Miễn Phí</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground mb-2">Tính Năng:</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map(feature => (
                      <Badge key={feature} variant="outline" className="feature-badge text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Chất Lượng</p>
                    <Badge className={qualityColors[tool.quality]}>
                      {tool.quality}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Dễ Sử Dụng</p>
                    <Badge className={easeColors[tool.ease]}>
                      {tool.ease}
                    </Badge>
                  </div>
                </div>

                {/* Automatic indicator */}
                {tool.automatic && (
                  <div className="flex items-center gap-2 text-sm text-green-700 mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tự Động Tạo Câu Hỏi</span>
                  </div>
                )}

                {/* Link */}
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Truy Cập Công Cụ
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">So Sánh Công Cụ Hàng Đầu</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Công Cụ</th>
                <th className="text-left py-3 px-4 font-semibold">Loại</th>
                <th className="text-center py-3 px-4 font-semibold">Miễn Phí</th>
                <th className="text-center py-3 px-4 font-semibold">Tự Động</th>
                <th className="text-center py-3 px-4 font-semibold">Chất Lượng</th>
                <th className="text-center py-3 px-4 font-semibold">Dễ Sử Dụng</th>
              </tr>
            </thead>
            <tbody>
              {tools.slice(0, 8).map(tool => (
                <tr key={tool.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{tool.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{tool.type}</td>
                  <td className="py-3 px-4 text-center">
                    {tool.free ? <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" /> : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {tool.automatic ? <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" /> : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={qualityColors[tool.quality]} variant="outline">
                      {tool.quality}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={easeColors[tool.ease]} variant="outline">
                      {tool.ease}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Sẵn Sàng Bắt Đầu?</CardTitle>
            <CardDescription className="text-base">
              Chọn công cụ phù hợp nhất với nhu cầu của bạn và bắt đầu chuyển đổi PDF thành bài kiểm tra ngay hôm nay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Khám Phá Tất Cả Công Cụ
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 PDF to Quiz Tools Finder. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
}
