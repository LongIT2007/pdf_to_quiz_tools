# Backend API - PDF to Quiz Conversion

Backend API hoàn chỉnh cho ứng dụng chuyển đổi PDF thành bài kiểm tra (Quiz).

## 🏗️ Kiến Trúc

```
server/
├── src/
│   ├── config/          # Cấu hình (database, environment)
│   ├── controllers/     # Controllers xử lý requests
│   ├── middleware/      # Middleware (upload, error handling)
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (PDF, AI, Quiz)
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities (errors, logger, id generator)
└── index.ts            # Entry point
```

## 🚀 Tính Năng

- ✅ Upload và xử lý file PDF
- ✅ Trích xuất văn bản từ PDF
- ✅ Tạo quiz tự động từ nội dung PDF bằng AI
- ✅ Hỗ trợ nhiều loại câu hỏi (multiple-choice, true-false, fill-blank)
- ✅ Lưu trữ quiz và PDF trong database
- ✅ RESTful API đầy đủ
- ✅ Error handling và validation
- ✅ Logging system

## 📋 Yêu Cầu

- Node.js >= 18
- pnpm (hoặc npm/yarn)

## 🛠️ Cài Đặt

1. **Cài đặt dependencies:**
```bash
pnpm install
```

2. **Tạo file `.env` từ `.env.example`:**
```bash
cp .env.example .env
```

3. **Cấu hình `.env`:**
   - Đặt `OPENAI_API_KEY` nếu sử dụng OpenAI
   - Hoặc cấu hình Ollama nếu sử dụng local AI

4. **Chạy development server:**
```bash
pnpm dev:server
```

5. **Build và chạy production:**
```bash
pnpm build
pnpm start
```

## 📡 API Endpoints

### PDF Endpoints

- `POST /api/pdfs` - Upload PDF file
- `GET /api/pdfs` - Danh sách PDFs (với pagination)
- `GET /api/pdfs/:id` - Lấy thông tin PDF
- `DELETE /api/pdfs/:id` - Xóa PDF

### Quiz Endpoints

- `POST /api/quizzes/generate` - Tạo quiz từ PDF
- `GET /api/quizzes` - Danh sách quizzes
- `GET /api/quizzes/:id` - Lấy thông tin quiz
- `GET /api/quizzes/pdf/:pdfId` - Lấy tất cả quizzes của một PDF
- `DELETE /api/quizzes/:id` - Xóa quiz

### Health Check

- `GET /api/health` - Kiểm tra trạng thái API

## 📝 Ví Dụ Sử Dụng

### 1. Upload PDF

```bash
curl -X POST http://localhost:3000/api/pdfs \
  -F "file=@example.pdf"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "pdf_abc123",
    "filename": "1234567890_example.pdf",
    "originalName": "example.pdf",
    "fileSize": 123456,
    "status": "processing",
    "uploadDate": "2025-01-15T10:00:00.000Z"
  },
  "message": "PDF uploaded successfully"
}
```

### 2. Tạo Quiz từ PDF

```bash
curl -X POST http://localhost:3000/api/quizzes/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pdfId": "pdf_abc123",
    "options": {
      "questionCount": 10,
      "questionTypes": ["multiple-choice"],
      "difficulty": "medium",
      "language": "vi",
      "includeExplanations": true
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "quiz_xyz789",
    "title": "Generated Quiz",
    "questions": [
      {
        "id": "q_1",
        "question": "Câu hỏi 1?",
        "type": "multiple-choice",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Giải thích...",
        "points": 1
      }
    ],
    "metadata": {
      "totalQuestions": 10,
      "totalPoints": 10,
      "difficulty": "medium"
    }
  },
  "message": "Quiz generated successfully"
}
```

### 3. Lấy Quiz

```bash
curl http://localhost:3000/api/quizzes/quiz_xyz789
```

## 🤖 AI Configuration

### OpenAI (Mặc định)

Cấu hình trong `.env`:
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

### Ollama (Local)

Cài đặt Ollama và chạy model:
```bash
ollama serve
ollama pull llama3.2
```

Cấu hình trong `.env`:
```
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Simple Fallback

Nếu không có AI provider, hệ thống sẽ tự động sử dụng rule-based generation đơn giản.

## 🗄️ Database

Sử dụng SQLite (better-sqlite3) để lưu trữ:
- PDF documents
- Quizzes
- Quiz questions

Database được tạo tự động tại `./data/quiz.db`

## 📦 Dependencies Chính

- **express** - Web framework
- **better-sqlite3** - SQLite database
- **pdf-parse** - PDF text extraction
- **openai** - OpenAI API client
- **multer** - File upload handling
- **zod** - Schema validation
- **cors** - CORS middleware

## 🔒 Security Notes

- File upload được validate về MIME type và size
- API keys được lưu trong environment variables
- Error messages không expose thông tin nhạy cảm trong production

## 🐛 Troubleshooting

1. **Lỗi database:** Đảm bảo thư mục `./data` có quyền ghi
2. **Lỗi upload:** Kiểm tra `UPLOAD_DIR` trong `.env`
3. **Lỗi AI:** Kiểm tra API keys và network connection
4. **Port conflict:** Đổi PORT trong `.env`

## 📄 License

MIT
