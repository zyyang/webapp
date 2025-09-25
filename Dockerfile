# ------- 依赖阶段 -------
FROM node:22-alpine AS deps


# 声明全部 NEXT_PUBLIC 变量（无默认值，强制外部传入）
ARG NEXT_PUBLIC_APP_ID
ARG NEXT_PUBLIC_APP_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CORP_ID
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_GROUP_NAME
ARG NEXT_PUBLIC_ROLE_NAME

ENV NEXT_PUBLIC_APP_ID=$NEXT_PUBLIC_APP_ID \
    NEXT_PUBLIC_APP_KEY=$NEXT_PUBLIC_APP_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_CORP_ID=$NEXT_PUBLIC_CORP_ID \
    NEXT_PUBLIC_CLIENT_ID=$NEXT_PUBLIC_CLIENT_ID \
    NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE \
    NEXT_PUBLIC_GROUP_NAME=$NEXT_PUBLIC_GROUP_NAME \
    NEXT_PUBLIC_ROLE_NAME=$NEXT_PUBLIC_ROLE_NAME


# 安装并启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# 国内镜像 + 缓存预热 → 显著提速
RUN pnpm config set registry https://registry.npmmirror.com && \
    pnpm fetch --registry https://registry.npmmirror.com && \
    pnpm install --offline --frozen-lockfile

# ------- 构建阶段 -------
FROM deps AS builder
WORKDIR /app
# 已存在 node_modules，直接拷贝源码
COPY . .
RUN pnpm build

# ------- 运行阶段 -------
FROM node:22-alpine AS runner
# 安装 pnpm（可选，仅用于紧急情况调试）
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 拷贝产物
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
