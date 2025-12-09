# 🔗 Cách Lấy Backend URL để Thiết Lập Frontend

## 📍 Tổng Quan

Frontend (Vercel) cần biết địa chỉ backend (Railway/Render) để gọi API. Bạn cần lấy **Public URL** của backend và set vào biến môi trường `VITE_API_BASE_URL`.

---

## 🚂 Railway.app (Backend)

### Bước 1: Lấy Public URL
1. Đăng nhập vào [Railway Dashboard](https://railway.app/dashboard)
2. Chọn project backend của bạn
3. Click vào service backend (có thể tên là `pdf-quiz-backend` hoặc tương tự)
4. Vào tab **Settings** (Cài đặt)
5. Scroll xuống phần **Networking** (Mạng)
6. Tìm **Public Domain** hoặc **Generate Domain**
7. URL sẽ có dạng: `https://your-app-name.railway.app`

### Bước 2: Thêm `/api` vào cuối
Backend URL thường là: `https://your-app-name.railway.app/api`

**Ví dụ:**
- Domain: `pdf-quiz-backend.railway.app`
- API Base URL: `https://pdf-quiz-backend.railway.app/api`

---

## 🌐 Render.com (Backend)

### Bước 1: Lấy Public URL
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com)
2. Chọn service backend của bạn
3. Ở trang **Overview**, bạn sẽ thấy **URL** ở đầu trang
4. URL sẽ có dạng: `https://your-app-name.onrender.com`

### Bước 2: Thêm `/api` vào cuối
**Ví dụ:**
- Domain: `pdf-quiz-backend.onrender.com`
- API Base URL: `https://pdf-quiz-backend.onrender.com/api`

---

## ☁️ Fly.io (Backend)

### Bước 1: Lấy Public URL
1. Chạy lệnh: `flyctl status` hoặc `fly status`
2. Hoặc vào [Fly.io Dashboard](https://fly.io/dashboard)
3. Chọn app → URL sẽ hiển thị
4. URL có dạng: `https://your-app-name.fly.dev`

### Bước 2: Thêm `/api` vào cuối
**Ví dụ:**
- Domain: `pdf-quiz-backend.fly.dev`
- API Base URL: `https://pdf-quiz-backend.fly.dev/api`

---

## ✅ Thiết Lập trên Vercel (Frontend)

### Bước 1: Vào Project Settings
1. Đăng nhập [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project frontend
3. Click **Settings**

### Bước 2: Thêm Environment Variable
1. Menu bên trái → **Environment Variables**
2. Click **Add New**
3. Nhập:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: URL backend bạn đã lấy ở trên + `/api`
     - Railway: `https://your-app.railway.app/api`
     - Render: `https://your-app.onrender.com/api`
     - Fly.io: `https://your-app.fly.dev/api`
   - **Environment**: Chọn **Production** (và Preview nếu muốn)

### Bước 3: Redeploy
1. Sau khi save, Vercel sẽ hỏi có muốn redeploy không
2. Click **Redeploy** hoặc vào **Deployments** → **Redeploy**

---

## 🔍 Kiểm Tra Backend URL Có Đúng Không?

### Cách 1: Thử trong Browser
Mở URL này trong browser:
```
https://your-backend-url.com/api/health
```

Nếu thấy response như:
```json
{
  "success": true,
  "message": "API is running"
}
```
→ ✅ Backend đang hoạt động!

### Cách 2: Dùng curl (Terminal)
```bash
curl https://your-backend-url.com/api/health
```

### Cách 3: Kiểm tra trong Frontend
1. Mở website frontend (Vercel)
2. Mở Console (F12)
3. Vào Network tab
4. Thử upload PDF hoặc tạo quiz
5. Xem request URL có đúng backend URL không

---

## 📝 Ví Dụ Đầy Đủ

### Scenario 1: Backend trên Railway
```
Backend URL: https://pdf-quiz-backend.railway.app
API Base URL: https://pdf-quiz-backend.railway.app/api

→ Set trên Vercel:
VITE_API_BASE_URL=https://pdf-quiz-backend.railway.app/api
```

### Scenario 2: Backend trên Render
```
Backend URL: https://pdf-quiz-backend.onrender.com
API Base URL: https://pdf-quiz-backend.onrender.com/api

→ Set trên Vercel:
VITE_API_BASE_URL=https://pdf-quiz-backend.onrender.com/api
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **HTTPS Required**: Đảm bảo URL có `https://` (không dùng `http://`)
2. **No Trailing Slash**: Không kết thúc bằng `/` (trừ khi backend yêu cầu)
3. **CORS**: Backend phải cấu hình CORS để cho phép frontend gọi API
4. **Environment**: Set env var cho đúng environment (Production/Preview/Development)

---

## 🐛 Troubleshooting

### Frontend không kết nối được backend?
- ✅ Kiểm tra backend có đang chạy không (thử `/api/health`)
- ✅ Kiểm tra `VITE_API_BASE_URL` đã được set chưa
- ✅ Kiểm tra CORS trên backend đã cấu hình đúng chưa
- ✅ Kiểm tra network tab trong browser console để xem lỗi cụ thể

### Backend trả về CORS error?
Backend cần cấu hình CORS để cho phép frontend domain. Kiểm tra file `server/index.ts` có middleware CORS chưa.

---

## 📚 Tài Liệu Tham Khảo

- [Railway Networking Docs](https://docs.railway.app/deploy/exposing-your-app)
- [Render Public Networking](https://render.com/docs/networking)
- [Fly.io Networking](https://fly.io/docs/networking/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
