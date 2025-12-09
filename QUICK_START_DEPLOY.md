# ⚡ Quick Start - Deploy trong 5 phút

## 🎯 Cách Nhanh Nhất: Railway + Vercel

### Backend (Railway)

1. **Đăng ký**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Chọn repo → Railway auto-deploy
4. **Add PostgreSQL** service
5. Thêm Environment Variables trong Backend service:

```env
NODE_ENV=production
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL=${{Postgres.DATABASE_URL}}
UPLOAD_DIR=/tmp/uploads
```

6. Copy backend URL (ví dụ: `xxx.railway.app`)

### Frontend (Vercel)

1. **Đăng ký**: https://vercel.com
2. **New Project** → Import GitHub repo
3. Settings:
   - Root Directory: `client`
   - Build Command: `cd client && pnpm install && pnpm build`
4. Environment Variable:
```
VITE_API_BASE_URL=https://xxx.railway.app/api
```
5. **Deploy**

### ✅ Xong!

Frontend: `https://your-project.vercel.app`  
Backend: `https://xxx.railway.app`

---

## 🗄️ Database Options

**Tùy chọn 1**: Railway PostgreSQL (dễ nhất)  
**Tùy chọn 2**: Supabase (free tier tốt)  
**Tùy chọn 3**: Neon (serverless PostgreSQL)

---

## ⚠️ Lưu Ý

1. Đổi OpenAI API key sau khi deploy (key này đã bị expose)
2. Cần update code để hỗ trợ PostgreSQL (hiện đang dùng SQLite)
3. File upload cần cloud storage (S3, Cloudinary) cho production

---

Chi tiết xem: `DEPLOYMENT_GUIDE.md`
