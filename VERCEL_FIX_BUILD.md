# 🔧 Sửa Lỗi Vercel Build

## ❌ Vấn Đề

Vercel đang cố build cả backend server, gây lỗi:
```
Error: Command failed: esbuild server/index.ts
```

## ✅ Nguyên Nhân

1. Script `build` trong `package.json` build cả frontend và backend
2. Vercel chỉ cần build frontend (static files)
3. Backend deploy trên Render, không deploy trên Vercel

## ✅ Giải Pháp

### Đã Tạo Script Build Riêng

1. ✅ Thêm script `build:client` - chỉ build frontend
2. ✅ Update `vercel.json` để dùng `build:client`
3. ✅ Vercel sẽ chỉ build frontend

### Scripts Trong package.json:

- `build` - Build cả frontend và backend (cho production)
- `build:client` - Chỉ build frontend (cho Vercel)
- `build:server` - Chỉ build backend (cho Render)

---

## 🎯 Vercel Configuration

File `vercel.json` đã được update:
```json
{
  "buildCommand": "pnpm install && pnpm run build:client",
  "outputDirectory": "dist/public",
  ...
}
```

---

## ✅ Sau Khi Sửa

1. ✅ Commit và push code mới
2. ✅ Vercel sẽ tự động deploy lại
3. ✅ Build sẽ chỉ build frontend

---

## 🆘 Nếu Vẫn Lỗi

Kiểm tra trong Vercel dashboard:
1. **Settings → Build & Development Settings**
2. **Build Command** phải là: `pnpm install && pnpm run build:client`
3. **Output Directory** phải là: `dist/public`
4. **Root Directory** để trống (hoặc `.`)

---

## 📝 Lưu Ý

- ✅ Frontend deploy trên Vercel
- ✅ Backend deploy trên Render
- ✅ Chỉ build frontend trên Vercel
