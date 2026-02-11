# --- Build Stage ---
FROM golang:1.24-alpine AS builder

WORKDIR /app

# 依存関係のキャッシュ
COPY go.mod go.sum ./
RUN go mod download

# ソースコードのコピー
COPY . .

# ビルド (CGO無効化で軽量化)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./backend/cmd/server/main.go

# --- Run Stage ---
FROM alpine:3.19

WORKDIR /app

# CA証明書 (HTTPS通信に必要)
RUN apk --no-cache add ca-certificates

# ビルドしたバイナリをコピー
COPY --from=builder /app/server .

# ポート公開 (Cloud Runのデフォルトは8080)
EXPOSE 8080

# 実行
CMD ["./server"]
