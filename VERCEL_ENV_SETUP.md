# 🔧 Thiết Lập Biến Môi Trường trên Vercel

## 📋 Biến Môi Trường Cần Thiết

Để frontend hoạt động đúng trên Vercel, bạn cần thiết lập các biến môi trường sau:

### ✅ Bắt Buộc

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

**Ví dụ:**
- Railway: `https://pdf-quiz-backend.railway.app/api`
- Render: `https://pdf-quiz-backend.onrender.com/api`
- Fly.io: `https://your-app.fly.dev/api`

---

### ⚙️ Tùy Chọn (Nếu sử dụng các tính năng này)

```bash
# Google Maps (nếu dùng Map component)
VITE_FRONTEND_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev

# OAuth (nếu dùng authentication)
VITE_OAUTH_PORTAL_URL=https://oauth-portal-url.com
VITE_APP_ID=your-app-id

# Analytics (nếu dùng Umami)
VITE_ANALYTICS_ENDPOINT=https://analytics-endpoint.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

---

## 🚀 Cách Thiết Lập trên Vercel

### Bước 1: Vào Project Settings
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Click **Settings** (Cài đặt)

### Bước 2: Thêm Environment Variables
1. Trong menu bên trái, click **Environment Variables**
2. Click **Add New** (Thêm mới)
3. Thêm từng biến:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: URL backend của bạn (ví dụ: `https://pdf-quiz-backend.railway.app/api`)
   - **Environment**: Chọn tất cả (Production, Preview, Development) hoặc chỉ Production
4. Click **Save**

### Bước 3: Redeploy
1. Sau khi thêm xong, Vercel sẽ tự động hỏi có muốn redeploy không
2. Hoặc vào tab **Deployments** → Click **⋯** → **Redeploy**

---

## 🔍 Kiểm Tra

Sau khi deploy, kiểm tra:
1. Vào deployment → **View Build Logs**
2. Tìm `VITE_API_BASE_URL` trong build logs (Vercel sẽ hiển thị nhưng ẩn giá trị)
3. Vào website → Mở Console (F12) → Kiểm tra xem API calls có đúng URL không

---

## ⚠️ Lưu Ý

1. **Prefix `VITE_`**: Tất cả biến môi trường frontend phải có prefix `VITE_` để Vite có thể inject vào build
2. **Rebuild Required**: Mỗi khi thay đổi env vars, cần rebuild để có hiệu lực
3. **Case Sensitive**: Tên biến phân biệt hoa thường
4. **No Trailing Slash**: URL không nên kết thúc bằng `/` (trừ khi cần thiết)

---

## 🐛 Troubleshooting

### Build thành công nhưng API không hoạt động?
- ✅ Kiểm tra `VITE_API_BASE_URL` đã được set chưa
- ✅ Kiểm tra backend có đang chạy không
- ✅ Kiểm tra CORS trên backend đã cấu hình đúng chưa

### Build failed với lỗi về environment variables?
- ✅ Kiểm tra tên biến có đúng prefix `VITE_` không
- ✅ Kiểm tra giá trị có hợp lệ không (không có ký tự đặc biệt)

---

## 📝 Ví Dụ Đầy Đủ

Nếu backend deploy trên Railway tại `https://pdf-quiz-backend.railway.app`:

```
VITE_API_BASE_URL=https://pdf-quiz-backend.railway.app/api
```

Sau đó trong code, `import.meta.env.VITE_API_BASE_URL` sẽ trả về giá trị này.

---

Xem thêm:
- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
