# ⚡ Hướng Dẫn Cấu Hình Vercel

## 📋 Cài Đặt Trên Trang Vercel

### 1. **Framework Preset** 
👉 **Chọn: `Vite`**

(Vercel sẽ tự detect, nhưng nếu chưa, chọn "Vite" từ dropdown)

---

### 2. **Root Directory**
👉 **Để TRỐNG** (không điền gì) hoặc **`./`**

Vì `vite.config.ts` đã cấu hình `root: "client"` rồi, nên build từ repo root sẽ tự động tìm đúng thư mục.

**HOẶC** nếu muốn rõ ràng hơn:
- **Root Directory:** `client`

---

### 3. **Build Command**
👉 Tùy theo Root Directory:

**Nếu Root Directory = TRỐNG:**
```
pnpm install && pnpm exec vite build
```

**Nếu Root Directory = `client`:**
```
pnpm install && vite build
```

**HOẶC đơn giản hơn, để Vercel tự detect:**
- Để trống (Vercel sẽ đọc từ `vercel.json`)

---

### 4. **Output Directory**
👉 **`dist/public`**

(Nếu Root Directory = `client`, thì dùng: `../dist/public`)

---

### 5. **Install Command**
👉 **`pnpm install`**

Hoặc để Vercel tự detect.

---

### 6. **Environment Variables** (Quan trọng!)
Click vào phần **Environment Variables** và thêm:

```
Key: VITE_API_BASE_URL
Value: https://your-backend.railway.app/api
```

(Thay `your-backend.railway.app` bằng URL backend của bạn từ Railway)

---

## ✅ Cấu Hình Khuyến Nghị

Dựa vào `vercel.json` đã có, bạn nên:

### Option 1: Để Vercel tự detect (Khuyên dùng)

1. **Framework Preset:** `Vite` (hoặc để Auto-detect)
2. **Root Directory:** Để TRỐNG
3. **Build Command:** Để TRỐNG (Vercel đọc từ `vercel.json`)
4. **Output Directory:** `dist/public`
5. **Install Command:** `pnpm install`

**Lý do:** File `vercel.json` đã có sẵn cấu hình đúng, Vercel sẽ tự đọc.

### Option 2: Cấu hình thủ công

1. **Framework Preset:** `Vite`
2. **Root Directory:** `client`
3. **Build Command:** `pnpm install && vite build`
4. **Output Directory:** `dist` (vì vite build trong client/ sẽ output vào client/dist, nhưng vite.config set outDir là dist/public từ root)
5. **Install Command:** `pnpm install`

---

## 🎯 Khuyến Nghị Cuối Cùng

**Cách đơn giản nhất:**

1. ✅ **Framework Preset:** Chọn `Vite`
2. ✅ **Root Directory:** Để **TRỐNG**
3. ✅ **Build Command:** Để **TRỐNG** (hoặc `pnpm install && pnpm exec vite build`)
4. ✅ **Output Directory:** `dist/public`
5. ✅ **Install Command:** `pnpm install`
6. ✅ **Environment Variables:** 
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

Sau đó click **Deploy**!

---

## 🆘 Nếu Build Fail

Nếu build fail, thử:

1. **Root Directory:** `client`
2. **Build Command:** `cd .. && pnpm install && pnpm exec vite build`
3. **Output Directory:** `dist/public`

Hoặc kiểm tra logs trong Vercel để xem lỗi cụ thể.

---

## 📝 Lưu Ý

- File `vercel.json` đã có sẵn, Vercel sẽ ưu tiên đọc file này
- Nếu cấu hình trong UI khác với `vercel.json`, UI sẽ override
- Đảm bảo đã có Environment Variable `VITE_API_BASE_URL` trước khi deploy
