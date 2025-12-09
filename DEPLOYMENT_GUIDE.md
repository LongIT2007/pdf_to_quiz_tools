# 🚀 Hướng Dẫn Deploy PDF to Quiz Tools

## 📋 Tổng Quan

Hướng dẫn chi tiết để deploy ứng dụng PDF to Quiz lên các nền tảng cloud phổ biến.

---

## 🌐 Đề Xuất Cloud Platform

### Backend Deployment

#### 1. **Railway.app** ⭐ (Khuyên dùng)
- ✅ Dễ sử dụng, hỗ trợ tốt Node.js
- ✅ Tích hợp PostgreSQL
- ✅ Auto-deploy từ GitHub
- ✅ Free tier: $5 credit/tháng
- 🌐 https://railway.app

#### 2. **Render.com**
- ✅ Free tier cho static sites
- ✅ Hỗ trợ Docker
- ✅ Auto SSL
- ⚠️ Free tier có giới hạn (sleep sau 15 phút không dùng)
- 🌐 https://render.com

#### 3. **Fly.io**
- ✅ Performance tốt
- ✅ Global edge network
- ✅ Free tier hào phóng
- 🌐 https://fly.io

#### 4. **Vercel** (Chỉ cho frontend hoặc serverless)
- ✅ Tốt nhất cho frontend
- ⚠️ Giới hạn với backend phức tạp
- 🌐 https://vercel.com

### Database Cloud

#### 1. **Supabase** ⭐ (Khuyên dùng)
- ✅ PostgreSQL managed
- ✅ Free tier: 500MB database
- ✅ API tự động
- ✅ Dashboard dễ dùng
- 🌐 https://supabase.com

#### 2. **Neon**
- ✅ Serverless PostgreSQL
- ✅ Free tier: 0.5GB storage
- ✅ Auto-scaling
- 🌐 https://neon.tech

#### 3. **PlanetScale**
- ✅ MySQL serverless
- ✅ Branch database
- ✅ Free tier tốt
- 🌐 https://planetscale.com

#### 4. **Railway PostgreSQL**
- ✅ Tích hợp sẵn với Railway
- ✅ Dễ setup
- 🌐 https://railway.app

---

## 🎯 Option 1: Deploy với Railway.app (Khuyên dùng)

### Bước 1: Chuẩn bị

1. Tạo tài khoản tại https://railway.app
2. Cài đặt Railway CLI (optional):
```bash
npm i -g @railway/cli
railway login
```

### Bước 2: Setup Database (PostgreSQL)

1. Vào Railway dashboard
2. New Project → Add PostgreSQL
3. Copy connection string (sẽ cần cho .env)

### Bước 3: Setup Backend

1. New Service → Deploy from GitHub repo
2. Chọn repository của bạn
3. Railway sẽ tự detect và build

4. Thêm Environment Variables:
```
NODE_ENV=production
PORT=3000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_URL=${{Postgres.DATABASE_URL}}
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

5. Thêm Build Command (nếu cần):
```bash
pnpm install && pnpm build
```

6. Thêm Start Command:
```bash
pnpm start
```

### Bước 4: Setup Storage (cho file uploads)

1. Railway → Add Service → Volume
2. Mount path: `/tmp/uploads`
3. Hoặc dùng cloud storage (S3, Cloudinary)

### Bước 5: Deploy Frontend (Vercel)

1. Tạo account tại https://vercel.com
2. Import GitHub repository
3. Root Directory: `/client`
4. Build Command: `cd client && pnpm install && pnpm build`
5. Output Directory: `dist`
6. Environment Variables:
```
VITE_API_BASE_URL=https://your-railway-backend.railway.app/api
```

---

## 🎯 Option 2: Deploy với Render.com

### Backend Setup

1. Tạo account tại https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Cấu hình:
   - **Name**: pdf-quiz-backend
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Free hoặc Starter ($7/tháng)

5. Environment Variables:
```
NODE_ENV=production
PORT=10000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_URL=<từ PostgreSQL service>
UPLOAD_DIR=/tmp/uploads
```

6. Tạo PostgreSQL Database:
   - New → PostgreSQL
   - Copy Internal Database URL

### Frontend Setup (Render)

1. New → Static Site
2. Connect repository
3. Build Command: `cd client && pnpm install && pnpm build`
4. Publish Directory: `client/dist`
5. Environment Variables:
```
VITE_API_BASE_URL=https://pdf-quiz-backend.onrender.com/api
```

---

## 🎯 Option 3: Deploy với Supabase (Database) + Vercel (Frontend) + Railway (Backend)

### Bước 1: Setup Supabase Database

1. Tạo project tại https://supabase.com
2. Vào Settings → Database
3. Copy Connection String (URI format)
4. Tạo tables (chạy SQL migration)

### Bước 2: Update Database Code

Cần chuyển từ SQLite sang PostgreSQL. Tạo migration script:

```sql
-- Supabase SQL Editor
CREATE TABLE IF NOT EXISTS pdf_documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'processing',
  extracted_text TEXT,
  page_count INTEGER,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  pdf_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  FOREIGN KEY (pdf_id) REFERENCES pdf_documents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  question_order INTEGER NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quizzes_pdf_id ON quizzes(pdf_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON pdf_documents(status);
```

### Bước 3: Update Backend Code

Cần cập nhật `server/src/config/database.ts` để hỗ trợ PostgreSQL:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
```

### Bước 4: Deploy Backend (Railway)

Giống như Option 1, nhưng dùng `DATABASE_URL` từ Supabase.

### Bước 5: Deploy Frontend (Vercel)

Giống như Option 1.

---

## 📦 Cập Nhật Code để Hỗ Trợ PostgreSQL

Cần tạo file hỗ trợ cả SQLite và PostgreSQL:

```typescript
// server/src/config/database.ts
import Database from "better-sqlite3";
import { Pool } from 'pg';

const dbType = process.env.DATABASE_TYPE || 'sqlite';

if (dbType === 'postgres') {
  // PostgreSQL setup
  export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  export default pool;
} else {
  // SQLite setup (existing code)
  // ...
}
```

---

## 🔐 Environment Variables Checklist

### Backend (.env)
- ✅ `NODE_ENV=production`
- ✅ `PORT=3000` (hoặc port được assign bởi cloud)
- ✅ `OPENAI_API_KEY=sk-proj-...`
- ✅ `AI_PROVIDER=openai`
- ✅ `DATABASE_URL=postgresql://...` (nếu dùng PostgreSQL)
- ✅ `UPLOAD_DIR=/tmp/uploads` (hoặc cloud storage)

### Frontend (.env)
- ✅ `VITE_API_BASE_URL=https://your-backend.com/api`

---

## 🗄️ File Storage Options

Vì cloud platforms có ephemeral storage, cần dùng:

### Option 1: Cloud Storage
- **AWS S3** (hoặc S3-compatible)
- **Cloudinary**
- **Supabase Storage**

### Option 2: Database Storage
- Lưu file binary trong PostgreSQL (tốt cho file nhỏ)

### Option 3: External Volume
- Railway Volumes
- Fly.io Volumes

---

## 📝 Checklist Deploy

- [ ] Tạo tài khoản cloud platform
- [ ] Setup database (PostgreSQL)
- [ ] Cấu hình environment variables
- [ ] Update code cho PostgreSQL (nếu cần)
- [ ] Setup file storage
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test API endpoints
- [ ] Cấu hình domain (optional)
- [ ] Setup SSL/HTTPS (auto với hầu hết platforms)

---

## 🚨 Lưu Ý Bảo Mật

1. **⚠️ QUAN TRỌNG**: API key trong file này đã bị expose. Hãy:
   - Xoá và tạo API key mới tại https://platform.openai.com/api-keys
   - Không commit `.env` vào Git
   - Dùng environment variables của cloud platform

2. **Database Security**:
   - Sử dụng connection pooling
   - Enable SSL cho production
   - Restrict database access

3. **API Security**:
   - Thêm rate limiting
   - CORS configuration
   - API authentication (optional)

---

## 🆘 Troubleshooting

### Backend không start
- Kiểm tra logs trong cloud dashboard
- Verify environment variables
- Kiểm tra build command

### Database connection failed
- Kiểm tra `DATABASE_URL`
- Verify SSL settings
- Kiểm tra network/firewall

### File upload không hoạt động
- Kiểm tra `UPLOAD_DIR` permissions
- Dùng cloud storage thay vì local storage

### Frontend không kết nối backend
- Kiểm tra `VITE_API_BASE_URL`
- Verify CORS settings
- Kiểm tra network requests trong browser console

---

## 📚 Tài Liệu Tham Khảo

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs

---

## 🎉 Sau Khi Deploy

1. Test API: `https://your-backend.com/api/health`
2. Test frontend: `https://your-frontend.com`
3. Upload PDF và tạo quiz để verify

Chúc bạn deploy thành công! 🚀
