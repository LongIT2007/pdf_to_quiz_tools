# 🔧 Fix Sitemap 404 Error

## Vấn Đề
Sau khi deploy, sitemap.xml trả về lỗi 404 trong Google Search Console.

## Nguyên Nhân
- Rewrite rule cho `/sitemap.xml` đã bị xóa khỏi `vercel.json`
- Vercel không biết route `/sitemap.xml` đến đâu

## Giải Pháp Đã Áp Dụng

### 1. Thêm Lại Rewrite Rule
Đã thêm lại rewrite rule trong `vercel.json`:
```json
{
  "source": "/sitemap.xml",
  "destination": "/api/sitemap"
}
```

### 2. API Route Đã Sẵn Sàng
File `api/sitemap.ts` đã có sẵn và sẽ:
- Đọc file sitemap.xml từ nhiều paths
- Fallback về hardcoded sitemap nếu không tìm thấy file
- Luôn trả về XML với headers đúng

## Các Bước Tiếp Theo

### 1. Deploy Lại
```bash
git add vercel.json
git commit -m "Fix: Add sitemap.xml rewrite rule"
git push
```

### 2. Kiểm Tra Sau Khi Deploy
1. Truy cập: `https://pdf-to-quiz-tools-v2.vercel.app/sitemap.xml`
2. Nếu thấy nội dung XML → ✅ Thành công
3. Nếu vẫn 404 → Kiểm tra lại

### 3. Xóa và Gửi Lại Sitemap
1. Vào Google Search Console
2. Xóa sitemap cũ (`/sitemap.xml`)
3. Gửi lại sitemap: `sitemap.xml`
4. Đợi vài phút để Google kiểm tra lại

### 4. Kiểm Tra Headers
Đảm bảo response có headers:
- `Content-Type: application/xml; charset=utf-8`
- `Cache-Control: public, max-age=3600`

## Troubleshooting

### Nếu Vẫn 404 Sau Khi Deploy

1. **Kiểm tra API Route:**
   - Vào Vercel Dashboard
   - Xem Functions logs
   - Kiểm tra xem có lỗi không

2. **Kiểm tra File Paths:**
   - Đảm bảo `client/public/sitemap.xml` tồn tại
   - File sẽ được copy vào `dist/public/sitemap.xml` khi build

3. **Test API Route Trực Tiếp:**
   - Truy cập: `https://pdf-to-quiz-tools-v2.vercel.app/api/sitemap`
   - Nếu hoạt động → Rewrite rule có vấn đề
   - Nếu không → API route có vấn đề

4. **Kiểm Tra Vercel Config:**
   - Đảm bảo `vercel.json` được commit và push
   - Vercel sẽ tự động detect và apply config

## Alternative Solution (Nếu Vẫn Không Hoạt Động)

Nếu API route vẫn không hoạt động, có thể serve sitemap.xml trực tiếp từ static files:

1. **Đảm bảo file được copy:**
   - Vite sẽ tự động copy `client/public/sitemap.xml` → `dist/public/sitemap.xml`

2. **Xóa rewrite rule:**
   - Xóa dòng rewrite cho sitemap.xml
   - Vercel sẽ tự động serve static files từ `dist/public/`

3. **Kiểm tra lại:**
   - File phải có trong `dist/public/sitemap.xml` sau khi build

## Expected Result

Sau khi fix:
- ✅ `https://pdf-to-quiz-tools-v2.vercel.app/sitemap.xml` trả về XML
- ✅ Google Search Console có thể đọc sitemap
- ✅ Trạng thái chuyển từ "Không thể tìm nạp" → "Thành công"

## Notes

- API route approach tốt hơn vì có thể dynamic update lastmod dates
- Static file approach đơn giản hơn nhưng cần rebuild khi thay đổi
- Hiện tại đang dùng API route approach (recommended)

