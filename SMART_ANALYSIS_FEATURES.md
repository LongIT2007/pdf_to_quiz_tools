# 🧠 Smart PDF Analysis - Tính Năng AI Thông Minh

## ✨ Tính Năng Mới

### 🎯 AI Tự Động Nhận Diện Câu Hỏi và Đáp Án

Hệ thống AI có thể:

1. **Đọc và phân tích PDF**
   - Trích xuất text từ PDF
   - Nhận diện câu hỏi
   - Nhận diện đáp án
   - Phân loại loại tài liệu

2. **Tự động ghép câu hỏi với đáp án**
   - Nếu có trong cùng file: tự động tách và ghép
   - Nếu có trong file khác: tự động ghép từ nhiều file

3. **Tạo quiz với đáp án chính xác**
   - Sử dụng đáp án đã nhận diện
   - Không cần AI generate đáp án
   - Đảm bảo độ chính xác cao

---

## 📋 Các Trường Hợp Hỗ Trợ

### Trường Hợp 1: 1 File Chứa Cả Đề và Đáp Án

**Ví dụ:**
- File PDF có phần "Câu hỏi" và phần "Đáp án"
- Hoặc câu hỏi kèm đáp án ngay sau đó

**Cách sử dụng:**
1. Vào **Smart Upload**
2. Chọn tab **1 File (Đề + Đáp Án)**
3. Upload file PDF
4. AI tự động phân tích và tách đề/đáp án

---

### Trường Hợp 2: Nhiều Files (1 Đề + Nhiều Đáp Án)

**Ví dụ:**
- File 1: `De_thi.pdf` (chỉ có câu hỏi)
- File 2: `Dap_an.pdf` (chỉ có đáp án)
- File 3: `Dap_an_chi_tiet.pdf` (đáp án chi tiết)

**Cách sử dụng:**
1. Vào **Smart Upload**
2. Chọn tab **Nhiều Files (Tách Biệt)**
3. Upload tất cả files cùng lúc
4. AI tự động:
   - Nhận diện file nào là đề
   - Nhận diện file nào là đáp án
   - Ghép câu hỏi với đáp án đúng

---

## 🤖 Cách AI Hoạt Động

### Bước 1: Phân Tích PDF
```
AI đọc text → Tìm patterns:
- Câu hỏi: số thứ tự, dấu hỏi, "Câu hỏi"
- Đáp án: "Đáp án", "Key", A/B/C/D, v.v.
```

### Bước 2: Nhận Diện Loại Tài Liệu
```
- "mixed": Có cả đề và đáp án
- "questions-only": Chỉ có đề
- "answers-only": Chỉ có đáp án
- "unknown": Không xác định
```

### Bước 3: Ghép Câu Hỏi-Đáp Án
```
- Nếu có trong cùng file: match theo thứ tự hoặc patterns
- Nếu có trong file khác: match bằng AI understanding
```

### Bước 4: Tạo Quiz
```
- Sử dụng câu hỏi đã nhận diện
- Sử dụng đáp án đã nhận diện
- Tạo quiz với đáp án chính xác 100%
```

---

## 🔌 API Endpoints Mới

### 1. Phân Tích 1 PDF
```http
POST /api/analysis/analyze/:pdfId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasQuestions": true,
    "hasAnswers": true,
    "questions": ["Câu 1...", "Câu 2..."],
    "answers": ["Đáp án 1", "Đáp án 2"],
    "questionAnswerPairs": [
      {
        "question": "Câu hỏi...",
        "answer": "Đáp án",
        "options": ["A", "B", "C", "D"]
      }
    ],
    "documentType": "mixed"
  }
}
```

### 2. Phân Tích Nhiều PDFs
```http
POST /api/analysis/analyze-multiple
Body: { "pdfIds": ["id1", "id2", "id3"] }
```

### 3. Tạo Quiz Từ Phân Tích
```http
POST /api/analysis/generate-from-analysis
Body: {
  "pdfId": "id" hoặc "pdfIds": ["id1", "id2"],
  "options": { ... }
}
```

---

## 🎨 Frontend Pages

### 1. Smart Upload (`/upload/smart`)
- Tab 1: Upload 1 file (đề + đáp án)
- Tab 2: Upload nhiều files (tách biệt)
- Auto-redirect sau khi upload

### 2. Smart Create Quiz (`/quiz/smart-create`)
- Hiển thị kết quả phân tích
- Show số lượng câu hỏi/đáp án tìm thấy
- Show số cặp Q&A đã ghép
- Generate quiz với 1 click

---

## ✅ Ưu Điểm

1. **Độ chính xác cao**: Sử dụng đáp án thực tế từ PDF
2. **Tự động hóa**: Không cần manual matching
3. **Linh hoạt**: Hỗ trợ nhiều định dạng PDF
4. **Thông minh**: AI hiểu context và match đúng

---

## 🔄 Workflow

```
1. Upload PDF(s)
   ↓
2. PDF Processing (extract text)
   ↓
3. AI Analysis (detect questions & answers)
   ↓
4. Auto Matching (pair Q&A)
   ↓
5. Generate Quiz với đáp án chính xác
   ↓
6. Ready to use!
```

---

## 📝 Lưu Ý

- AI cần thời gian để phân tích (10-30 giây)
- Kết quả phụ thuộc vào chất lượng PDF
- Nếu PDF scan (hình ảnh), cần OCR trước
- Độ chính xác cao nhất với PDF có text rõ ràng

---

Xem `README_APP.md` để biết cách sử dụng chi tiết!
