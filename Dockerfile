FROM node:20-slim

WORKDIR /app

# 預先安裝 pnpm
RUN npm install -g pnpm
