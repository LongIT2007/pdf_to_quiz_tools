# 🔗 Hướng Dẫn Lấy DATABASE_URL từ Railway

## 📋 Các Bước Chi Tiết

### Bước 1: Vào Railway Dashboard
1. Đăng nhập https://railway.app
2. Chọn project có PostgreSQL

### Bước 2: Vào PostgreSQL Service
1. Click vào service **Postgres** (có icon database)
2. Bạn sẽ thấy các tabs: Deployments, Database, Backups, **Variables**, Metrics, Settings

### Bước 3: Lấy DATABASE_URL
1. Click tab **Variables**
2. Tìm biến `DATABASE_URL` hoặc `POSTGRES_URL` hoặc `POSTGRES_PRIVATE_URL`
3. Click vào biến đó để xem giá trị
4. Copy **TOÀN BỘ** connection string

### Bước 4: Format Đúng

Connection string sẽ có format:
```
postgresql://postgres:your_password@containers-us-west-xxx.railway.app:5432/railway
```

Hoặc:
```
postgresql://postgres:xxxxx@shinkansen.proxy.rlwy.net:27350/railway
```

**QUAN TRỌNG**: 
- ✅ Phải có prefix `postgresql://`
- ✅ Phải có username và password
- ✅ Phải có database name ở cuối

### Bước 5: Paste vào Render

1. Vào Render dashboard
2. Vào web service
3. Tab **Environment**
4. Tìm hoặc tạo `DATABASE_URL`
5. Paste connection string đầy đủ
6. Save
7. Restart service

---

## 🎯 Nếu Không Tìm Thấy DATABASE_URL

### Cách 1: Tạo từ Connection Info

Nếu chỉ có:
- Host: `shinkansen.proxy.rlwy.net`
- Port: `27350`
- User: `postgres`
- Password: (từ Railway Variables → `POSTGRES_PASSWORD`)
- Database: `railway` (mặc định)

Format:
```
postgresql://postgres:PASSWORD@shinkansen.proxy.rlwy.net:27350/railway
```

### Cách 2: Dùng Railway CLI

```bash
railway variables
```

---

## ✅ Verify Connection String

Connection string đúng phải:
- Bắt đầu với `postgresql://` hoặc `postgres://`
- Có format: `postgresql://user:pass@host:port/dbname`
- Không có khoảng trắng
- Password có thể chứa ký tự đặc biệt (cần URL encode nếu cần)

---

## 🆘 Troubleshooting

### "ECONNREFUSED"
- ✅ Kiểm tra DATABASE_URL format
- ✅ Verify host và port đúng
- ✅ Đảm bảo dùng Internal URL (Railway), không dùng public endpoint

### "Authentication failed"
- ✅ Kiểm tra username và password
- ✅ Password có thể cần URL encode

### "Database does not exist"
- ✅ Kiểm tra database name ở cuối connection string
