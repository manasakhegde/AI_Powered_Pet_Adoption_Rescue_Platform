# ── Stage 1: Build ──
FROM node:18-alpine AS builder

WORKDIR /build
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# ── Stage 2: Runtime (serve static build) ──
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve@14
COPY --from=builder /build/build ./build

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
