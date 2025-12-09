# 🔧 Sửa Lỗi PostgreSQL - Models Cần Update

## ❌ Vấn Đề Hiện Tại

Khi deploy với PostgreSQL trên Render, lỗi:
```
Error: Use getPostgresPool() for PostgreSQL
```

## ✅ Nguyên Nhân

1. Models đang dùng SQLite API (`db.prepare()`) - synchronous
2. PostgreSQL cần async API (`pool.query()`)
3. Default export trong `database.ts` execute ngay khi import

## ✅ Đã Sửa

1. ✅ Sửa default export để không execute ngay (lazy loading)
2. ✅ Bắt đầu update PDFModel để hỗ trợ cả SQLite và PostgreSQL
3. ✅ Tạo PDFModel-pg.ts (PostgreSQL version)

## 🚧 Cần Hoàn Thiện

Models cần được update để:
- ✅ PDFModel: Đã bắt đầu, cần hoàn thiện tất cả methods
- ❌ QuizModel: Cần update tương tự
- ❌ Services: Cần update để handle async methods

## 🎯 Giải Pháp Tạm Thời (Để Deploy Nhanh)

**Option 1: Dùng SQLite trên Render**
- Set `DATABASE_TYPE=sqlite` trong Render env vars
- Render sẽ tạo file SQLite (tuy nhiên sẽ mất khi restart)

**Option 2: Hoàn thiện PostgreSQL support**
- Update tất cả models để async với PostgreSQL
- Update services để await các method calls

## 📝 Các File Cần Sửa

1. `server/src/models/PDFModel.ts` - Đang sửa
2. `server/src/models/QuizModel.ts` - Cần sửa
3. `server/src/services/PDFService.ts` - Cần await model methods
4. `server/src/services/QuizService.ts` - Cần await model methods
5. `server/src/controllers/PDFController.ts` - Cần await service methods
6. `server/src/controllers/QuizController.ts` - Cần await service methods

## ⚠️ Lưu Ý

Việc migrate từ SQLite sang PostgreSQL cần:
- Thay đổi từ sync sang async
- Update tất cả method signatures
- Sửa SQL queries (SQLite `?` → PostgreSQL `$1, $2`)
- Test kỹ với cả hai database types

---

**Hiện tại:** Đã sửa cơ bản để không crash khi import. Cần hoàn thiện models để hỗ trợ đầy đủ PostgreSQL.
