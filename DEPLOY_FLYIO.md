# 🪂 Deploy Backend với Fly.io

## ✅ Tại Sao Chọn Fly.io?

- ✅ Free tier hào phóng (3 shared-cpu VMs)
- ✅ Không sleep như Render
- ✅ Global edge network
- ✅ Performance tốt
- ✅ Docker-based

---

## 📋 Bước 1: Cài Đặt Fly CLI

### Windows (PowerShell):
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Mac/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify:
```bash
fly version
```

---

## 🔐 Bước 2: Login

```bash
fly auth login
```

Sẽ mở browser để login.

---

## 🚀 Bước 3: Tạo Fly App

```bash
# Trong thư mục project
fly launch
```

Fly sẽ hỏi:
- **App name**: (để tự động hoặc đặt tên)
- **Region**: Chọn gần bạn (ví dụ: `sin` - Singapore, `hkg` - Hong Kong)
- **PostgreSQL**: Chọn `Yes` để tạo database
- **Redis**: `No`
- **Deploy now**: `No` (sẽ config trước)

---

## 📝 Bước 4: Tạo Dockerfile (Nếu chưa có)

Fly cần Dockerfile. Tạo file `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

---

## ⚙️ Bước 5: Cấu Hình fly.toml

Fly đã tạo `fly.toml`, sửa lại:

```toml
app = "your-app-name"
primary_region = "sin"

[build]

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services]]
  protocol = "tcp"
  internal_port = 3000

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

---

## 🔐 Bước 6: Set Secrets (Environment Variables)

```bash
fly secrets set NODE_ENV=production
fly secrets set AI_PROVIDER=openai
fly secrets set OPENAI_API_KEY=your-openai-api-key-here
fly secrets set AI_MODEL=gpt-4o-mini
fly secrets set DATABASE_TYPE=postgres
fly secrets set UPLOAD_DIR=/tmp/uploads
fly secrets set MAX_FILE_SIZE=10485760
fly secrets set ALLOWED_MIME_TYPES=application/pdf
```

### Database URL:
Nếu tạo PostgreSQL qua Fly:
```bash
fly postgres connect
# Copy connection string
fly secrets set DATABASE_URL=postgresql://...
```

---

## 🗄️ Bước 7: Setup PostgreSQL (Nếu chưa)

```bash
fly postgres create --name pdf-quiz-db --region sin
fly postgres attach pdf-quiz-db
```

---

## 🚀 Bước 8: Deploy

```bash
fly deploy
```

Fly sẽ:
- Build Docker image
- Deploy lên Fly platform
- Cung cấp URL: `https://your-app-name.fly.dev`

---

## ✅ Bước 9: Verify

```bash
curl https://your-app-name.fly.dev/api/health
```

---

## 🔗 Bước 10: Update Frontend

Update `VITE_API_BASE_URL` trong Vercel:
```
https://your-app-name.fly.dev/api
```

---

## 💰 Pricing

- **Free**: 3 shared-cpu VMs, 3GB storage, 160GB outbound transfer
- **Paid**: $1.94/tháng cho mỗi VM (nếu cần thêm)

---

## 🆘 Troubleshooting

### Deploy Fails:
```bash
fly logs
```

### Check Status:
```bash
fly status
```

### SSH vào VM:
```bash
fly ssh console
```

---

## 📚 Tài Liệu

- Fly Docs: https://fly.io/docs
- Fly Community: https://community.fly.io

Chúc deploy thành công! 🚀
