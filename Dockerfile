# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# ===============================
# Dependencies 阶段 - 安装所有依赖
# ===============================
FROM base AS deps

# 安装生产和开发依赖
RUN pnpm install --frozen-lockfile

# ===============================
# Builder 阶段 - 构建应用
# ===============================
FROM base AS builder
WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码和配置文件
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN pnpm build

# ===============================
# Production 阶段 - 运行时镜像
# ===============================
FROM base AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 public 文件夹
COPY --from=builder /app/public ./public

# 设置正确的权限并复制构建产物
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 package.json 用于生产依赖
COPY --from=builder /app/package.json ./package.json

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动应用
CMD ["node", "server.js"]