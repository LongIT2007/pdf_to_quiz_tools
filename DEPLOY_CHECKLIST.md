# ✅ Checklist Deploy - Step by Step

## 📋 Trước Khi Deploy

### 1. Kiểm Tra Files
- [x] `railway.json` ✅
- [x] `Procfile` ✅
- [x] `vercel.json` ✅
- [x] `.vercelignore` ✅
- [x] `.gitignore` (đã update) ✅

### 2. Commit và Push Code
```bash
git add .
git commit -m "Ready for deployment - Railway & Vercel"
git push origin main
```

---

## 🚂 Railway (Backend) - Bước 1-5

### Bước 1: Tạo Account
- [ ] Đăng ký tại https://railway.app
- [ ] Verify email

### Bước 2: Tạo PostgreSQL Database
- [ ] Click **New Project**
- [ ] Click **Add Service** → **Database** → **PostgreSQL**
- [ ] Chờ database được tạo
- [ ] Copy `DATABASE_URL` từ Variables tab (sẽ dùng sau)

### Bước 3: Deploy Backend
- [ ] Trong project → **New Service**
- [ ] **Deploy from GitHub repo**
- [ ] Chọn repository của bạn
- [ ] Railway tự động detect `railway.json`

### Bước 4: Cấu Hình Environment Variables
Vào Backend service → **Variables** → Thêm:

```
NODE_ENV=production
PORT=3000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_TYPE=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

⚠️ **Lưu ý**: `${{Postgres.DATABASE_URL}}` tự động reference PostgreSQL service.

### Bước 5: Verify Backend
- [ ] Chờ deploy hoàn tất (3-5 phút)
- [ ] Vào **Settings** → **Networking** → Copy domain URL
- [ ] Test: `https://your-backend.railway.app/api/health`
- [ ] Phải thấy: `{"success":true,"message":"API is running"}`

**Lưu backend URL này để dùng cho frontend!**

---

## ⚡ Vercel (Frontend) - Bước 6-9

### Bước 6: Tạo Account
- [ ] Đăng ký tại https://vercel.com
- [ ] Connect với GitHub account

### Bước 7: Import Project
- [ ] Click **Add New Project**
- [ ] Chọn repository từ GitHub
- [ ] Click **Import**

### Bước 8: Cấu Hình Project
**Framework Preset:** Vite (tự động detect)

**Environment Variables:**
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```
(Thay `your-backend.railway.app` bằng URL từ Bước 5)

**Settings tự động từ vercel.json:**
- Build Command: `pnpm install && pnpm build`
- Output Directory: `dist/public`
- ✅ Không cần thay đổi gì!

### Bước 9: Deploy
- [ ] Click **Deploy**
- [ ] Chờ build (2-3 phút)
- [ ] Copy production URL (ví dụ: `your-project.vercel.app`)

---

## ✅ Kiểm Tra Cuối Cùng

### Backend
- [ ] Health check: `https://your-backend.railway.app/api/health` ✅
- [ ] API docs: Xem `README_BACKEND.md`

### Frontend
- [ ] Truy cập: `https://your-project.vercel.app`
- [ ] Frontend load thành công
- [ ] Kiểm tra console (F12) không có lỗi CORS

### Integration
- [ ] Test upload PDF (nếu có UI)
- [ ] Test tạo quiz
- [ ] Verify database connection

---

## 🔐 Bảo Mật - QUAN TRỌNG!

### ⚠️ Phải Làm Ngay Sau Deploy:

1. **Đổi OpenAI API Key:**
   - Vào https://platform.openai.com/api-keys
   - Xóa key cũ (đã bị expose)
   - Tạo key mới
   - Update trong Railway Environment Variables

2. **Bảo Mật Database:**
   - Không commit `.env` files
   - Sử dụng Railway variables
   - Enable SSL (Railway tự động)

---

## 🆘 Nếu Gặp Lỗi

### Railway Build Fails
- Kiểm tra logs trong Railway dashboard
- Verify `package.json` có script `build` và `start`
- Check Node.js version compatibility

### Vercel Build Fails
- Kiểm tra build logs
- Verify `vercel.json` syntax
- Check `dist/public` folder được tạo

### Frontend Không Kết Nối Backend
- Verify `VITE_API_BASE_URL` đúng
- Kiểm tra CORS settings
- Test backend API trước

### Database Connection Fails
- Verify `DATABASE_URL` trong Railway
- Check PostgreSQL service đang running
- Run migration SQL nếu cần

---

## 📞 Hỗ Trợ

Xem các file documentation:
- `DEPLOY_FILES_README.md` - Chi tiết về files
- `DEPLOYMENT_GUIDE.md` - Hướng dẫn đầy đủ
- `DEPLOY_RAILWAY.md` - Railway specific
- `README_BACKEND.md` - API documentation

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả checklist, bạn có:
- ✅ Backend chạy trên Railway
- ✅ Frontend chạy trên Vercel
- ✅ Database PostgreSQL trên Railway
- ✅ API hoạt động
- ✅ Application deploy thành công!

**URLs của bạn:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.railway.app`
- API: `https://your-backend.railway.app/api`

Chúc mừng! 🚀🎊
