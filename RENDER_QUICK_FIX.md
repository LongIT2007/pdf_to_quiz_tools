# ⚡ Render Quick Fix - Deploy Ngay

## 🚨 Vấn Đề

Models chưa hoàn toàn hỗ trợ PostgreSQL, cần thời gian để migrate đầy đủ.

## ✅ Giải Pháp Tạm Thời - Deploy Ngay

### Option 1: Dùng SQLite Tạm Thời (Khuyên dùng)

Trong Render Environment Variables, **XÓA** hoặc **KHÔNG SET**:
- `DATABASE_TYPE`

Hoặc set:
```
DATABASE_TYPE=sqlite
```

**Lưu ý**: SQLite trên Render sẽ lưu file, nhưng có thể mất khi container restart. Đủ để test và demo.

---

### Option 2: Hoàn Thiện PostgreSQL Support

Cần thời gian để:
1. Update tất cả models (PDFModel, QuizModel) để async
2. Update services để await methods
3. Update controllers để await services
4. Test kỹ

---

## 🎯 Khuyến Nghị

**Ngay bây giờ:**
1. ✅ Deploy với SQLite (Option 1)
2. ✅ Test toàn bộ tính năng
3. ✅ Sau đó migrate sang PostgreSQL (Option 2)

---

## 📝 Render Environment Variables (SQLite)

```
NODE_ENV=production
PORT=10000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
# DATABASE_TYPE=sqlite (hoặc không set)
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

**Không cần:**
- `DATABASE_TYPE` (default là sqlite)
- `DATABASE_URL` (không cần với SQLite)

---

## 🚀 Sau Khi Deploy

1. Test API: `https://your-app.onrender.com/api/health`
2. Test upload PDF
3. Test generate quiz

Nếu mọi thứ hoạt động, sau đó mới migrate sang PostgreSQL!

---

Xem `FIX_POSTGRES_ERROR.md` để biết cách hoàn thiện PostgreSQL support.
