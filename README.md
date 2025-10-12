# Image SaaS

一个基于 Next.js 构建的现代化图片处理 SaaS 平台，提供图片上传、存储、处理和 API 服务。

## ✨ 功能特性

### 🖼️ 图片处理

- **实时图片变换**: 支持尺寸调整、旋转等操作
- **格式优化**: 自动转换为 WebP 格式以获得最佳性能
- **缓存优化**: 内置 CDN 缓存策略，提升访问速度

### 📁 文件管理

- **多文件上传**: 支持拖拽上传和批量文件处理
- **分片上传**: 大文件自动分片上传，提升上传稳定性
- **文件预览**: 实时预览上传进度和文件内容

### 🔐 多租户架构

- **应用隔离**: 每个用户可创建多个独立应用
- **API 密钥管理**: 为每个应用生成独立的 API 密钥
- **权限控制**: 基于 JWT 的安全认证机制

### ☁️ 存储配置

- **S3 兼容**: 支持 AWS S3 及兼容的对象存储服务
- **多存储源**: 每个应用可配置独立的存储后端
- **灵活配置**: 支持自定义 endpoint、region 等参数

## 🛠️ 技术栈

### 前端

- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无障碍的 UI 组件库
- **tRPC** - 端到端类型安全的 API

### 后端

- **Next.js API Routes** - 服务端 API
- **Drizzle ORM** - 类型安全的数据库 ORM
- **PostgreSQL** - 关系型数据库
- **NextAuth.js** - 身份认证解决方案

### 文件处理

- **Sharp** - 高性能图片处理库
- **AWS SDK** - S3 对象存储集成
- **Uppy** - 现代化文件上传组件

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- S3 兼容的对象存储服务

### 安装依赖

```bash
pnpm install
```

### 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/image_sass"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 其他配置...
```

### 数据库迁移

```bash
# 开发环境
pnpm run push:dev

# 生产环境
pnpm run push:prod
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 API 使用

### 图片处理 API

```
GET /image/{fileId}?width=300&rotate=90
```

支持的查询参数：

- `width`: 图片宽度（默认 250px）
- `rotate`: 旋转角度（0-360度）

### 文件上传 API

使用 API 密钥进行身份验证：

```bash
curl -X POST \
  -H "api-Key: your-api-key" \
  -F "file=@image.jpg" \
  https://your-domain.com/api/upload
```

## 🏗️ 项目结构

```
src/app/
├── api/                 # API 路由
├── auth/               # 身份认证页面
├── dashboard/          # 仪表板界面
├── image/              # 图片处理路由
├── components/         # 可复用组件
├── server/             # 服务端代码
│   ├── db/            # 数据库配置和模型
│   └── routes/        # tRPC 路由定义
└── utils/              # 工具函数
```

## 🔧 开发命令

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```
