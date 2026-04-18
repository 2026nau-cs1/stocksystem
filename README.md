# StockPulse

股票信息系统仓库，当前同时包含两套后端实现：

- `backend/`：TypeScript + Express
- `backend-java/`：Java 21 + Spring Boot

前端位于 `frontend/`，是一个独立的 React + Vite 应用。

## 当前代码结构

```text
.
├── backend/                  # TypeScript backend
│   ├── config/               # 常量、Passport、S3
│   ├── db/                   # Drizzle schema、连接、migrations
│   ├── middleware/           # auth / error handler
│   ├── repositories/         # 数据访问层
│   ├── routes/               # API 路由
│   ├── services/             # 阿里云行情、邮件等服务
│   ├── utils/
│   └── server.ts             # Express 入口
├── backend-java/             # Spring Boot backend
│   ├── src/main/java/com/stockpulse/backend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── src/main/resources/application.yml
├── frontend/                 # React + Vite frontend
│   ├── src/components/custom/# 业务视图
│   ├── src/components/ui/    # 通用 UI 组件
│   ├── src/contexts/         # 登录态与上下文
│   ├── src/lib/              # API 请求、主题等工具
│   ├── src/pages/
│   └── src/types/
├── drizzle.config.ts
├── package.json              # 根目录脚本：主要用于 TS 后端
└── run-dev.ps1               # 启动 Java 后端 + 前端
```

## 技术栈

### 前端

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Radix UI
- React Router

### TypeScript 后端

- Express
- TypeScript
- Drizzle ORM
- postgres
- Passport JWT / Local
- Zod

### Java 后端

- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL

## 业务模块

前后端围绕以下模块组织：

- 认证：登录、注册、当前用户、偏好设置
- 行情：指数、个股、板块、新闻、基础面、K 线、股票排行
- 自选股：分组与股票项管理
- 持仓：持仓录入、更新、删除
- 预警：预警规则与历史记录
- 反馈：用户反馈提交
- 上传：S3 预签名上传与上传记录

## 运行方式

### 1. 运行 TypeScript 后端

根目录脚本现在默认对应 `backend/server.ts`：

```powershell
cd E:\stockwork\product----main\product----main
npm install
npm run dev
```

默认端口：

- TS 后端：`http://localhost:3000`

说明：

- `backend/server.ts` 会挂载 `/api/*` 路由
- 同时会尝试托管 `frontend/dist`
- 更适合 API 开发或单独调试 TypeScript 后端

### 2. 运行前端

```powershell
cd E:\stockwork\product----main\product----main\frontend
npm install
npm run dev
```

说明：

- 前端默认走 `VITE_API_URL`，未配置时请求 `http://localhost:3000`
- 路由使用 `HashRouter`

### 3. 运行 Java 后端 + 前端

仓库根目录提供了现成脚本：

```powershell
cd E:\stockwork\product----main\product----main
.\run-dev.ps1
```

这个脚本会打开两个 PowerShell 窗口并启动：

- `backend-java`：`mvn spring-boot:run`
- `frontend`：`npm run dev`

说明：

- `run-dev.ps1` 依赖系统已安装 `mvn` 和 `npm`
- Java 后端端口由 `backend-java/src/main/resources/application.yml` 控制
- 当前配置为 `PORT` 环境变量优先，否则默认 `3000`

## 环境变量

项目依赖根目录 `.env`。从代码来看，常用变量包括：

- `PORT`
- `DATABASE_URL`
- `DB_SSL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `ALIYUN_API_APP_CODE`
- `ALIYUN_API_ENDPOINT`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `BUCKET_NAME`

建议先参考：

- `.env.example`

## 数据层

TypeScript 后端的表结构在：

- `backend/db/schema.ts`

主要表：

- `Users`
- `WatchlistGroups`
- `WatchlistItems`
- `PortfolioHoldings`
- `Alerts`
- `AlertHistory`
- `Feedbacks`
- `Uploads`

Drizzle 相关脚本：

```powershell
npm run db:push
```

## API 概览

TypeScript 后端在 `backend/server.ts` 中挂载的路由：

- `/api/auth`
- `/api/upload`
- `/api/watchlist`
- `/api/portfolio`
- `/api/alerts`
- `/api/feedback`
- `/api/market`

## 开发命令

根目录：

```powershell
npm run dev
npm run start
npm run build
npm run typecheck
npm run lint
```

前端：

```powershell
cd frontend
npm run dev
npm run build
npm run preview
npm run typecheck
npm run lint
```

## 代码说明

- 前端 API 请求集中在 `frontend/src/lib/api.ts`
- 前端主界面壳子在 `frontend/src/pages/Index.tsx`
- 登录态由 `frontend/src/contexts/AuthContext.tsx` 管理
- TS 后端入口是 `backend/server.ts`
- Java 后端入口是 `backend-java/src/main/java/com/stockpulse/backend/StockPulseApplication.java`

## 现状说明

这份仓库当前是“双后端并存”状态：

- 根目录 `package.json` 维护的是 TypeScript 后端脚本
- `run-dev.ps1` 实际启动的是 Java 后端和前端

如果你准备继续开发，最好先明确这次改动是基于哪套后端进行，避免文档、脚本和实际运行目标再次分叉。
