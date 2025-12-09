# ⚠️ Railway Free Tier - Giải Pháp Thay Thế

## ❌ Vấn Đề

Railway free tier hiện tại chỉ cho phép deploy **databases**, không thể deploy **web services/backend**.

Thông báo: "Your account is on a limited plan and can only deploy databases. Upgrade your plan"

## ✅ Giải Pháp Thay Thế

### Option 1: Render.com (Khuyên dùng - Free Tier Tốt)

Render có free tier tốt cho backend:

1. **Đăng ký**: https://render.com
2. **New → Web Service**
3. **Connect GitHub repository**
4. Cấu hình:
   - **Name**: `pdf-quiz-backend`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: **Free** (hoặc Starter $7/tháng)

5. **Environment Variables**:
```
NODE_ENV=production
PORT=10000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_TYPE=postgres
DATABASE_URL=<từ PostgreSQL service>
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

6. **Add PostgreSQL Database**:
   - Render → New → PostgreSQL
   - Copy connection string vào `DATABASE_URL`

**Lưu ý**: Free tier sẽ "sleep" sau 15 phút không dùng, lần request đầu tiên sẽ chậm.

---

### Option 2: Fly.io (Free Tier Hào Phóng)

1. **Cài đặt Fly CLI**:
```bash
# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

2. **Login và Deploy**:
```bash
fly auth login
fly launch
```

3. **Cấu hình** (tự động tạo `fly.toml`)

**Ưu điểm**: Free tier tốt, không sleep

---

### Option 3: Railway Pro Plan ($5/tháng)

Nếu muốn tiếp tục dùng Railway:
- Upgrade lên **Pro Plan: $5/tháng**
- Hoặc dùng trial credits (nếu có)

---

### Option 4: Vercel + Serverless Functions

Chuyển backend sang Vercel Serverless Functions (phức tạp hơn, cần refactor code)

---

## 🎯 Khuyến Nghị

**Cho free tier:**
1. **Backend**: Render.com
2. **Database**: Render PostgreSQL (hoặc Railway PostgreSQL - vẫn free)
3. **Frontend**: Vercel

**Cho production:**
1. **Backend**: Railway Pro ($5/tháng) hoặc Render Starter ($7/tháng)
2. **Database**: Railway PostgreSQL hoặc Supabase
3. **Frontend**: Vercel

---

## 📝 Hướng Dẫn Render.com Chi Tiết

Xem file `DEPLOY_RENDER.md` (sẽ tạo tiếp)
