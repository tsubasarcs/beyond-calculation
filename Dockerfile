FROM node:20-slim

WORKDIR /app

# 預先安裝 pnpm
RUN npm install -g pnpm

# 設定容器啟動時的指令
# CMD ["sh", "-c", "pnpm install && pnpm dev"] 