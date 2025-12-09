# 📚 PDF to Quiz - Ứng Dụng Hoàn Chỉnh

## 🎉 Giới Thiệu

Ứng dụng web hoàn chỉnh để chuyển đổi file PDF thành bài kiểm tra (Quiz) tự động bằng AI.

## ✨ Tính Năng

### 📤 Upload PDF
- Drag & drop hoặc click để upload
- Validate file type và size
- Progress bar khi upload
- Tự động xử lý và trích xuất text

### 🎯 Tạo Quiz
- Cấu hình số lượng câu hỏi
- Chọn độ khó (Dễ/Trung bình/Khó)
- Chọn loại câu hỏi:
  - Trắc nghiệm (Multiple Choice)
  - Đúng/Sai (True/False)
  - Điền vào chỗ trống (Fill in the Blank)
  - Câu hỏi ngắn (Short Answer)
- Chọn ngôn ngữ (Tiếng Việt/English)
- Tùy chọn bao gồm giải thích

### 📝 Làm Quiz
- Hiển thị câu hỏi đẹp mắt
- Chọn đáp án dễ dàng
- Submit và xem kết quả
- Tính điểm tự động
- Hiển thị câu đúng/sai
- Xem giải thích (nếu có)
- Làm lại quiz

### 📊 Quản Lý
- Dashboard với tabs PDFs và Quizzes
- Xem danh sách tất cả PDFs
- Xem danh sách tất cả Quizzes
- Xóa PDF/Quiz
- Status badges (Processing, Completed, Failed)

---

## 🏗️ Kiến Trúc

### Frontend
- **Framework**: React + TypeScript
- **UI Library**: shadcn/ui (Radix UI)
- **Routing**: Wouter
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js + Express
- **Database**: SQLite (dev) / PostgreSQL (production)
- **PDF Processing**: pdf-parse
- **AI**: OpenAI GPT-4o-mini / Ollama
- **File Upload**: Multer

---

## 🚀 Cách Sử Dụng

### 1. Upload PDF
1. Vào trang chủ (Dashboard)
2. Click "Upload PDF"
3. Kéo thả file PDF hoặc click để chọn
4. Chờ upload và xử lý hoàn tất

### 2. Tạo Quiz
1. Trong Dashboard, chọn PDF đã upload
2. Click "Tạo Quiz"
3. Cấu hình:
   - Số lượng câu hỏi (1-50)
   - Độ khó
   - Loại câu hỏi
   - Ngôn ngữ
   - Có giải thích không
4. Click "Tạo Quiz"
5. Chờ AI tạo quiz (có thể mất 1-2 phút)

### 3. Làm Quiz
1. Từ Dashboard, chọn quiz muốn làm
2. Đọc câu hỏi và chọn đáp án
3. Click "Nộp bài" khi hoàn thành
4. Xem kết quả:
   - Điểm số (%)
   - Câu đúng/sai
   - Giải thích (nếu có)
5. Click "Làm lại" để thử lại

---

## 🔗 API Endpoints

### PDF
- `POST /api/pdfs` - Upload PDF
- `GET /api/pdfs` - Danh sách PDFs
- `GET /api/pdfs/:id` - Chi tiết PDF
- `DELETE /api/pdfs/:id` - Xóa PDF

### Quiz
- `POST /api/quizzes/generate` - Tạo quiz từ PDF
- `GET /api/quizzes` - Danh sách quizzes
- `GET /api/quizzes/:id` - Chi tiết quiz
- `GET /api/quizzes/pdf/:pdfId` - Quizzes của PDF
- `DELETE /api/quizzes/:id` - Xóa quiz

---

## 📁 Cấu Trúc Project

```
pdf_to_quiz_tools/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── pages/      # Các trang (Dashboard, Upload, CreateQuiz, ViewQuiz)
│   │   ├── components/ # UI components
│   │   ├── lib/        # Utilities (API client)
│   │   └── ...
│   └── ...
├── server/              # Backend Express app
│   ├── src/
│   │   ├── config/     # Database, env config
│   │   ├── controllers/# API handlers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic (PDF, AI, Quiz)
│   │   └── ...
│   └── ...
└── ...
```

---

## 🔧 Cấu Hình

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
AI_PROVIDER=openai
OPENAI_API_KEY=your-api-key
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://...
```

---

## 📚 Tài Liệu

- `README_BACKEND.md` - Backend API documentation
- `DEPLOYMENT_GUIDE.md` - Hướng dẫn deploy
- `FRONTEND_FEATURES.md` - Tính năng frontend
- `DEPLOY_RENDER.md` - Deploy backend lên Render
- `VERCEL_SETUP_GUIDE.md` - Deploy frontend lên Vercel

---

## 🎯 Workflow

```
1. Upload PDF
   ↓
2. PDF Processing (extract text)
   ↓
3. Configure Quiz Options
   ↓
4. Generate Quiz với AI
   ↓
5. View & Take Quiz
   ↓
6. View Results
```

---

## ✅ Sẵn Sàng Sử Dụng!

Ứng dụng đã hoàn chỉnh với:
- ✅ Backend API đầy đủ
- ✅ Frontend UI đẹp mắt
- ✅ Tích hợp AI để tạo quiz
- ✅ Hỗ trợ nhiều loại câu hỏi
- ✅ Quản lý PDFs và Quizzes

Chỉ cần deploy và sử dụng! 🚀
