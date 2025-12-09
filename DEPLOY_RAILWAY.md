# 🚂 Deploy với xx.app - Hướng Dẫn Chi Tiết

## ✅ Khuyên Dùng: Railway.app

Railway là lựa chọn tốt nhất vì:
- ✅ Dễ sử dụng
- ✅ Auto-deploy từ GitHub
- ✅ Tích hợp PostgreSQL
- ✅ Free tier: $5/tháng
- ✅ Performance tốt

---

## 📋 Bước 1: Chuẩn Bị Repository

1. Đảm bảo code đã push lên GitHub
2. Tạo file `railway.json` (optional):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. Tạo file `Procfile` (alternative):

```
web: pnpm start
```

---

## 🗄️ Bước 2: Setup PostgreSQL Database

1. Đăng nhập https://railway.app
2. **New Project**
3. **Add Service** → **Database** → **PostgreSQL**
4. Railway tự động tạo database
5. Vào PostgreSQL service → **Variables** tab
6. Copy `DATABASE_URL` (sẽ dùng sau)

---

## ⚙️ Bước 3: Setup Backend Service

1. Trong project → **New Service**
2. **Deploy from GitHub repo**
3. Chọn repository của bạn
4. Railway auto-detect Node.js

### Environment Variables

Vào Backend service → **Variables** → Add:

```
NODE_ENV=production
PORT=3000
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini
DATABASE_URL=${{Postgres.DATABASE_URL}}
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=application/pdf
```

⚠️ **Lưu ý**: Dùng `${{Postgres.DATABASE_URL}}` để tự động reference PostgreSQL service.

### Settings

- **Root Directory**: `/` (hoặc để trống)
- **Build Command**: `pnpm install && pnpm build` (auto-detect)
- **Start Command**: `pnpm start`

---

## 📝 Bước 4: Update Code cho PostgreSQL

Cần cập nhật database code. Tạo file mới:

```typescript
// server/src/config/database-pg.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

export default pool;
```

Và update `server/src/config/database.ts` để hỗ trợ cả SQLite và PostgreSQL.

---

## 🌐 Bước 5: Setup Custom Domain (Optional)

1. Backend service → **Settings** → **Networking**
2. Generate domain hoặc add custom domain
3. Copy domain URL để dùng cho frontend

---

## 🎨 Bước 6: Deploy Frontend (Vercel)

1. Đăng nhập https://vercel.com
2. **Add New Project**
3. Import GitHub repository
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `cd client && pnpm install && pnpm build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `pnpm install`

5. **Environment Variables**:
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

6. **Deploy**

---

## ✅ Bước 7: Verify

1. Check backend health:
```bash
curl https://your-backend.railway.app/api/health
```

2. Test upload PDF (dùng Postman hoặc curl)

3. Test frontend tại URL Vercel

---

## 🎯 Railway Pricing

- **Hobby Plan**: $5 credit/tháng (đủ cho small apps)
- **Pro Plan**: $20/tháng (không giới hạn credit)
- **Team Plan**: $20/user/tháng

Với free tier, bạn có thể chạy backend + database nhỏ.

---

## 🆘 Troubleshooting

### Build fails
- Kiểm tra `package.json` scripts
- Verify Node.js version trong Railway
- Check build logs

### Database connection fails
- Verify `DATABASE_URL` variable
- Check PostgreSQL service đang running
- Kiểm tra SSL settings

### API không accessible
- Kiểm tra Networking settings
- Verify PORT variable
- Check service logs

---

## 📚 Tài Liệu

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

Chúc deploy thành công! 🚀
