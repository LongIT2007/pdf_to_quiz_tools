# 🌐 Render.com - Cấu Hình Chi Tiết

## ✅ Các Mục Cần Chọn/Điền

Dựa vào màn hình bạn đang thấy:

### 1. **Name**
👉 **Để nguyên**: `pdf_to_quiz_tools`
- Hoặc đổi thành: `pdf-quiz-backend` (dễ nhớ hơn)
- Không quan trọng lắm, có thể đổi sau

### 2. **Language**
👉 **Đã đúng**: `Node` ✅
- Không cần đổi

### 3. **Branch**
👉 **Đã đúng**: `main` ✅
- Không cần đổi

### 4. **Region**
👉 **Chọn**: 
- Nếu ở Việt Nam: **`Singapore (Southeast Asia)`** (gần nhất)
- Hoặc **`Virginia (US East)`** (ổn định, nhiều người dùng)

### 5. **Root Directory**
👉 **Để TRỐNG** (không điền gì)
- Vì project của bạn không phải monorepo phức tạp
- Render sẽ chạy từ repo root

### 6. **Build Command**
👉 **Đổi thành**:
```
pnpm install && pnpm build
```

**HOẶC** giữ nguyên:
```
pnpm install --frozen-lockfile && pnpm run build
```

(Cả hai đều được, `--frozen-lockfile` an toàn hơn)

### 7. **Start Command**
👉 **Đổi thành**:
```
pnpm start
```

**HOẶC** giữ nguyên:
```
pnpm run start
```

(Cả hai đều được)

### 8. **Instance Type**
👉 **Chọn**: `Free`
- ✅ Đủ để test và demo
- ⚠️ Sẽ sleep sau 15 phút không dùng
- Nếu muốn không sleep: chọn **Starter ($7/tháng)**

---

## 🎯 Khuyến Nghị Cuối Cùng

**Cấu hình đề xuất:**

1. **Name**: `pdf-quiz-backend` (dễ nhớ)
2. **Language**: `Node` ✅
3. **Branch**: `main` ✅
4. **Region**: `Singapore (Southeast Asia)` (gần Việt Nam nhất)
5. **Root Directory**: (để trống)
6. **Build Command**: `pnpm install && pnpm build`
7. **Start Command**: `pnpm start`
8. **Instance Type**: `Free` (hoặc `Starter` nếu muốn không sleep)

---

## ⚠️ Quan Trọng - Sau Khi Create Service

Sau khi click **Create Web Service**, bạn CẦN:

1. Vào **Environment** tab
2. Thêm các Environment Variables:

```
NODE_ENV=production
PORT=10000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_TYPE=postgres
DATABASE_URL=<sẽ thêm sau khi tạo PostgreSQL>
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

**Lưu ý**: `PORT=10000` - Render yêu cầu port từ env var!

---

## 🗄️ Trước Khi Deploy - Tạo PostgreSQL

Trước khi deploy backend, nên tạo PostgreSQL database trước:

1. **New → PostgreSQL**
2. Name: `pdf-quiz-db`
3. Region: Same as web service
4. Plan: Free
5. Create
6. Copy Internal Database URL
7. Dán vào `DATABASE_URL` trong Environment Variables

---

## ✅ Checklist

- [ ] Name: `pdf-quiz-backend`
- [ ] Language: `Node`
- [ ] Branch: `main`
- [ ] Region: `Singapore` hoặc `Virginia`
- [ ] Root Directory: (trống)
- [ ] Build Command: `pnpm install && pnpm build`
- [ ] Start Command: `pnpm start`
- [ ] Instance Type: `Free`
- [ ] Đã tạo PostgreSQL database
- [ ] Đã thêm Environment Variables
- [ ] Click **Create Web Service**!

---

Sau đó click **Create Web Service** và chờ deploy! 🚀
