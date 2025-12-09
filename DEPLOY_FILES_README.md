# 📦 Các File Deploy - Hướng Dẫn Sử Dụng

## 📋 Danh Sách File

### Railway.app

1. **railway.json** ⭐
   - Cấu hình chính cho Railway
   - Định nghĩa build và deploy commands

2. **Procfile**
   - Alternative configuration
   - Railway sẽ dùng nếu không có railway.json

3. **railway.toml**
   - Alternative TOML format
   - Railway sẽ tự detect

4. **.nixpacks.toml**
   - Nixpacks builder configuration
   - Định nghĩa build environment

### Vercel

1. **vercel.json** ⭐
   - Cấu hình chính cho Vercel
   - Định nghĩa build settings và rewrites

2. **.vercelignore**
   - Files/folders không deploy lên Vercel
   - Giúp giảm kích thước deployment

---

## 🚂 Railway Deployment

Railway sẽ tự động detect và sử dụng các file sau (theo thứ tự ưu tiên):

1. `railway.json` (ưu tiên cao nhất)
2. `railway.toml`
3. `.nixpacks.toml`
4. `Procfile`
5. Auto-detect từ `package.json`

### Cách sử dụng:

1. Push code lên GitHub
2. Railway → New Project → Deploy from GitHub
3. Railway tự động detect và deploy
4. Không cần cấu hình thêm (file đã có sẵn)

---

## ⚡ Vercel Deployment

Vercel sẽ sử dụng:

1. **vercel.json** - Cấu hình chính
2. **.vercelignore** - Loại trừ files không cần

### Cách sử dụng:

1. Vào https://vercel.com
2. Import GitHub repository
3. Vercel tự detect `vercel.json`
4. Chọn **Root Directory**: `client`
5. Deploy!

**Lưu ý**: 
- Vercel chỉ deploy frontend (thư mục `client`)
- Backend chạy trên Railway

---

## 🔧 Cấu Hình Chi Tiết

### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health"
  }
}
```

### vercel.json

```json
{
  "buildCommand": "cd client && pnpm install && pnpm build",
  "outputDirectory": "client/dist",
  "framework": "vite"
}
```

---

## ✅ Checklist Trước Khi Deploy

- [x] File `railway.json` đã có
- [x] File `Procfile` đã có
- [x] File `vercel.json` đã có
- [x] File `.vercelignore` đã có
- [ ] Code đã push lên GitHub
- [ ] Environment variables đã cấu hình
- [ ] Database đã setup (PostgreSQL)

---

## 🚀 Quick Deploy

### Railway (Backend)

```bash
# 1. Push code
git add .
git commit -m "Ready for deployment"
git push

# 2. Railway auto-deploy từ GitHub
# Vào railway.app → New Project → Deploy from GitHub
```

### Vercel (Frontend)

```bash
# 1. Vào vercel.com
# 2. Import repository
# 3. Settings:
#    - Root Directory: client
#    - Build Command: (tự detect từ vercel.json)
# 4. Add Environment Variable:
#    VITE_API_BASE_URL=https://your-backend.railway.app/api
# 5. Deploy!
```

---

## 🆘 Troubleshooting

### Railway không detect build command
- Kiểm tra `railway.json` đã commit chưa
- Verify `package.json` có script `build` và `start`
- Check Railway logs

### Vercel build fails
- Kiểm tra `vercel.json` syntax
- Verify root directory = `client`
- Check build logs trong Vercel dashboard

### Frontend không kết nối backend
- Verify `VITE_API_BASE_URL` trong Vercel env vars
- Kiểm tra CORS settings
- Test backend API trước

---

## 📚 Tài Liệu

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Nixpacks Docs: https://nixpacks.com/docs

Chúc deploy thành công! 🎉
