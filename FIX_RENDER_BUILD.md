# 🔧 Sửa Lỗi Render Build - pnpm-lock.yaml

## ❌ Vấn Đề

Lỗi khi deploy trên Render:
```
specifiers in the lockfile don't match specs in package.json
```

## ✅ Nguyên Nhân

File `pnpm-lock.yaml` không khớp với `package.json` vì:
- `package.json` đã được cập nhật với các dependencies mới (pg, better-sqlite3, openai, pdf-parse, cors, multer, v.v.)
- `pnpm-lock.yaml` chưa được cập nhật tương ứng

## ✅ Giải Pháp

Đã chạy `pnpm install` để regenerate `pnpm-lock.yaml` và push lên GitHub.

## 🚀 Bước Tiếp Theo

1. ✅ Lockfile đã được commit và push
2. Render sẽ tự động trigger deploy mới
3. Hoặc vào Render dashboard → **Manual Deploy** → **Clear build cache & deploy**

## 🔍 Kiểm Tra

Sau khi deploy lại, build sẽ thành công vì:
- ✅ `pnpm-lock.yaml` đã khớp với `package.json`
- ✅ Tất cả dependencies đã được resolve đúng

## 🆘 Nếu Vẫn Lỗi

1. Vào Render service → **Settings**
2. **Clear build cache**
3. **Manual Deploy** lại

Hoặc thử đổi Build Command:
```
pnpm install && pnpm build
```

(Thay vì dùng `--frozen-lockfile`)

---

## ✅ Đã Sửa

- ✅ Chạy `pnpm install` để update lockfile
- ✅ Commit `pnpm-lock.yaml`
- ✅ Push lên GitHub

Render sẽ tự động deploy lại! 🚀
