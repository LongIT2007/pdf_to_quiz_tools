# ⚡ Vercel Setup - Hướng Dẫn Nhanh

## 🎯 Cấu Hình Trên Trang Vercel

Dựa vào màn hình bạn đang thấy, hãy chọn như sau:

### ✅ Các Mục Cần Chọn:

1. **Framework Preset**
   - 👉 **Chọn: `Vite`** 
   - (Thay vì "Other")

2. **Root Directory**
   - 👉 **Để: `client`**
   - (Đã đúng rồi)

3. **Build Command**
   - 👉 **Đổi thành: `pnpm install && vite build`**
   - (Thay vì `pnpm install && pnpm build`)

4. **Output Directory**
   - 👉 **Đổi thành: `dist/public`**
   - (Như hiện tại đã đúng)

5. **Install Command**
   - 👉 **Giữ: `pnpm install`**
   - (Đã đúng)

6. **Environment Variables** (Quan trọng!)
   - Click vào phần này
   - Add:
     ```
     Key: VITE_API_BASE_URL
     Value: https://your-backend.railway.app/api
     ```
   - (Thay URL bằng backend URL từ Railway)

---

## 🔍 Giải Thích

- **Framework Preset = Vite**: Vercel sẽ optimize cho Vite
- **Root Directory = client**: Vì frontend code nằm trong thư mục `client/`
- **Build Command**: Chỉ build frontend, không build backend server
- **Output Directory = dist/public**: Nơi Vite output files

---

## ✅ Sau Khi Cấu Hình Xong

Click nút **Deploy** màu xám ở dưới cùng!

---

## 🆘 Nếu Build Fail

Kiểm tra logs, có thể cần:
- **Build Command:** `cd .. && pnpm install && cd client && vite build`
- Hoặc thử không set Root Directory (để trống)
