# 🔧 Sửa Lỗi DATABASE_URL

## ❌ Vấn Đề

DATABASE_URL trong Render đang là: `shinkansen.proxy.rlwy.net:27350`

Đây **KHÔNG PHẢI** connection string đầy đủ. Cần format:
```
postgresql://user:password@host:port/database
```

## ✅ Giải Pháp

### Option 1: Lấy Internal Database URL từ Railway (Khuyên dùng)

1. Vào Railway dashboard
2. Click vào **PostgreSQL service**
3. Vào tab **Variables**
4. Tìm `DATABASE_URL` (Internal)
5. Copy **toàn bộ** connection string
   - Format: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`
6. Dán vào Render Environment Variables

**QUAN TRỌNG**: Dùng **Internal Database URL**, KHÔNG dùng public endpoint!

---

### Option 2: Tạo Render PostgreSQL (Đơn giản hơn)

1. Trong Render dashboard
2. **New → PostgreSQL**
3. Đặt tên: `pdf-quiz-db`
4. Region: Same as web service
5. Plan: Free
6. Create
7. Vào PostgreSQL service → **Connections** tab
8. Copy **Internal Database URL**
9. Dán vào web service Environment Variables

---

### Option 3: Build Connection String từ Parts

Nếu Railway chỉ cho host:port, cần thêm:

Trong Render Environment Variables, thay:
```
DATABASE_URL=shinkansen.proxy.rlwy.net:27350
```

Thành format đầy đủ (cần username, password, database name):
```
DATABASE_URL=postgresql://username:password@shinkansen.proxy.rlwy.net:27350/database_name
```

**Lưu ý**: Cần username, password, và database name từ Railway!

---

## 🎯 Cách Lấy Đúng Connection String

### Từ Railway:

1. Vào PostgreSQL service
2. Tab **Variables**
3. Tìm `DATABASE_URL` hoặc `POSTGRES_URL`
4. Copy **toàn bộ** string
5. Format sẽ giống:
   ```
   postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
   ```

### Từ Render:

1. Vào PostgreSQL service
2. Tab **Connections**
3. Copy **Internal Database URL**
4. Format:
   ```
   postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/dbname
   ```

---

## ✅ Sau Khi Sửa

1. Update DATABASE_URL trong Render
2. Restart service (hoặc Render tự restart)
3. Deploy lại

---

## 🆘 Nếu Vẫn Lỗi

Kiểm tra:
- ✅ DATABASE_URL có prefix `postgresql://`
- ✅ Có username và password
- ✅ Có database name
- ✅ Port đúng (thường là 5432)
- ✅ Dùng Internal URL, không dùng public endpoint

---

## 💡 Khuyến Nghị

**Tốt nhất**: Tạo PostgreSQL trên Render luôn (cùng network, dễ connect hơn)
