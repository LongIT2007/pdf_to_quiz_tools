# 🌐 Deploy Backend với Render.com

## ✅ Tại Sao Chọn Render?

- ✅ Free tier cho web services (không như Railway)
- ✅ Dễ sử dụng
- ✅ Auto-deploy từ GitHub
- ✅ Tích hợp PostgreSQL
- ⚠️ Free tier sẽ "sleep" sau 15 phút không dùng

---

## 📋 Bước 1: Đăng Ký và Setup

1. Đăng ký tại: https://render.com
2. **Connect GitHub account**
3. Verify email

---

## 🗄️ Bước 2: Setup PostgreSQL Database

1. **New → PostgreSQL**
2. Đặt tên: `pdf-quiz-db`
3. **Plan**: Free (hoặc Starter)
4. **Region**: Chọn gần bạn nhất
5. **Create Database**
6. Chờ database được tạo (1-2 phút)
7. Vào database → **Connections** → Copy **Internal Database URL**
   - Format: `postgresql://user:password@host:port/dbname`

---

## ⚙️ Bước 3: Deploy Backend Service

1. **New → Web Service**
2. **Connect GitHub repository**
3. Chọn repository: `pdf_to_quiz_tools`
4. **Configure Service**:

### Basic Settings:
- **Name**: `pdf-quiz-backend`
- **Region**: Same as database
- **Branch**: `main`
- **Root Directory**: (để trống - repo root)

### Build & Deploy:
- **Runtime**: `Node`
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### Plan:
- **Free** (có thể sleep) hoặc **Starter** ($7/tháng - không sleep)

---

## 🔐 Bước 4: Environment Variables

Vào service → **Environment** tab → Add:

```
NODE_ENV=production
PORT=10000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:port/dbname
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

**Lưu ý**: 
- `PORT=10000` - Render yêu cầu port từ env var
- `DATABASE_URL` - Dán Internal Database URL từ Bước 2

---

## 📝 Bước 5: Update Code cho Render

Cần đảm bảo server lắng nghe đúng port:

Kiểm tra `server/index.ts` đã đọc từ `process.env.PORT` chưa. Nếu chưa, đảm bảo:

```typescript
const port = parseInt(config.PORT) || 3000;
```

---

## 🚀 Bước 6: Deploy

1. Click **Create Web Service**
2. Render sẽ tự động:
   - Clone code
   - Install dependencies
   - Build
   - Deploy
3. Chờ 3-5 phút
4. Service sẽ có URL: `https://pdf-quiz-backend.onrender.com`

---

## ✅ Bước 7: Verify

1. Test health check:
```bash
curl https://pdf-quiz-backend.onrender.com/api/health
```

2. Phải thấy:
```json
{"success":true,"message":"API is running"}
```

---

## 🔗 Bước 8: Cập Nhật Frontend (Vercel)

1. Vào Vercel project
2. **Settings → Environment Variables**
3. Update `VITE_API_BASE_URL`:
```
https://pdf-quiz-backend.onrender.com/api
```
4. Redeploy frontend

---

## ⚠️ Lưu Ý Render Free Tier

### Sleep Mode:
- Service sẽ "sleep" sau 15 phút không có request
- Request đầu tiên sau khi sleep sẽ mất ~30-60 giây để wake up
- Các request tiếp theo sẽ bình thường

### Giải pháp:
1. Upgrade lên Starter ($7/tháng) - không sleep
2. Dùng service như Pingdom/UptimeRobot để ping định kỳ
3. Chấp nhận delay lần đầu

---

## 🆘 Troubleshooting

### Build Fails:
- Kiểm tra `package.json` có script `build` và `start`
- Verify Node.js version (Render dùng Node 18+)
- Check build logs trong Render dashboard

### Database Connection Fails:
- Verify `DATABASE_URL` đúng
- Check database đang running
- Ensure SSL mode (Render PostgreSQL tự động)

### Service Không Start:
- Check `PORT` env var
- Verify start command
- Check logs trong Render dashboard

---

## 💰 Pricing

- **Free**: Web service + PostgreSQL (có sleep)
- **Starter**: $7/tháng mỗi service (không sleep, tốt hơn)
- **Pro**: $25/tháng (cho teams)

---

## 📚 Tài Liệu

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com

---

Chúc deploy thành công! 🚀
