# 🔐 Cấu Hình Environment Variables

## 📝 Backend (.env)

Tạo file `.env` trong root directory với nội dung:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf

# AI Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini

# Database Configuration
# For local development: use SQLite
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/quiz.db

# For cloud deployment: use PostgreSQL
# DATABASE_TYPE=postgres
# DATABASE_URL=postgresql://user:password@host:port/database
```

### ⚠️ LƯU Ý QUAN TRỌNG

**API Key này đã bị expose công khai. Sau khi deploy, bạn CẦN:**
1. Vào https://platform.openai.com/api-keys
2. Xoá key cũ và tạo key mới
3. Cập nhật key mới vào environment variables của cloud platform

---

## 🎨 Frontend (client/.env)

Tạo file `client/.env` với nội dung:

```env
# API Base URL
# Development
VITE_API_BASE_URL=http://localhost:3000/api

# Production - Replace with your deployed backend URL
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## ☁️ Cloud Platform Environment Variables

### Railway.app

Vào Backend service → **Variables** → Add:

```
NODE_ENV=production
PORT=3000
AI_PROVIDER=openai
OPENAI_API_KEY=<your-new-api-key>
AI_MODEL=gpt-4o-mini
DATABASE_TYPE=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

### Vercel (Frontend)

Vào Project → **Settings** → **Environment Variables**:

```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

---

## 🔄 Migration từ SQLite sang PostgreSQL

Khi deploy lên cloud, hệ thống sẽ tự động detect `DATABASE_TYPE=postgres` và sử dụng PostgreSQL.

**Không cần thay đổi code**, chỉ cần:
1. Thêm PostgreSQL service (Railway/Supabase)
2. Set `DATABASE_TYPE=postgres`
3. Set `DATABASE_URL` với connection string
