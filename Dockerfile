FROM node:20-slim

WORKDIR /app

# 設定 host 為 0.0.0.0 讓容器可以對外提供服務
ENV HOST=0.0.0.0
