# Hướng Dẫn Setup Google Search Console

## Bước 1: Thêm Property

1. Truy cập: https://search.google.com/search-console
2. Click "Thêm property" (Add property)
3. Chọn **"Tiền tố URL"** (URL prefix)
4. Nhập URL: `https://pdf-to-quiz-tools-v2.vercel.app`
5. Click "TIẾP TỤC"

## Bước 2: Xác Minh Ownership

### Phương pháp: HTML tag (Khuyên dùng)

1. Chọn **"HTML tag"** trong danh sách phương thức xác minh
2. Copy đoạn code có dạng:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
   ```
3. Mở file `client/index.html`
4. Tìm dòng:
   ```html
   <!-- Google Search Console Verification -->
   <!-- TODO: Thay YOUR_VERIFICATION_CODE_HERE bằng code từ Google Search Console -->
   <!-- <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" /> -->
   ```
5. Thay thế bằng code thực tế từ Google Search Console (bỏ comment `<!-- -->`)
6. Deploy lại website lên Vercel
7. Quay lại Google Search Console và click "Xác minh" (Verify)

## Bước 3: Submit Sitemap

Sau khi xác minh thành công:

1. Vào menu bên trái, click **"Sơ đồ trang web"** (Sitemaps)
2. Nhập: `sitemap.xml`
3. Click **"Gửi"** (Submit)
4. Đợi Google crawl (có thể mất vài giờ đến vài ngày)

## Bước 4: Request Indexing

1. Vào **"Kiểm tra URL"** (URL Inspection) ở menu bên trái
2. Nhập URL trang chủ: `https://pdf-to-quiz-tools-v2.vercel.app/`
3. Click **"Kiểm tra URL"**
4. Nếu chưa được index, click **"Yêu cầu lập chỉ mục"** (Request Indexing)

## Bước 5: Xem Performance và Ranking

1. Vào **"Hiệu suất"** (Performance) ở menu bên trái
2. Xem các metrics:
   - **Vị trí trung bình** (Average Position): Ranking trung bình
   - **Số lần hiển thị** (Impressions): Số lần xuất hiện trên Google
   - **Số lần nhấp** (Clicks): Số lần người dùng click vào
   - **CTR**: Tỷ lệ click (Clicks/Impressions)

## Lưu Ý

- **Average Position** sẽ hiển thị sau khi website được index và có traffic
- Website mới cần **1-7 ngày** để Google phát hiện
- Cần **7-30 ngày** để bắt đầu có ranking
- **30-180 ngày** để có rankings ổn định

## Troubleshooting

### Nếu xác minh thất bại:
- Đảm bảo đã deploy lại website sau khi thêm meta tag
- Kiểm tra xem meta tag có đúng trong source code không (View Page Source)
- Thử phương thức xác minh khác (Google Analytics, HTML file)

### Nếu chưa có dữ liệu Performance:
- Website chưa được index
- Chưa có traffic từ Google Search
- Cần thời gian để Google thu thập dữ liệu

