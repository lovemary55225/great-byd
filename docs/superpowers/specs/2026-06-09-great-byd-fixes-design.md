# Great BYD — 修复优先方案设计

**日期**: 2026-06-09  
**范围**: P0/P1 级别 bug 修复与工程化完善  
**目标**: 让项目达到完整可用、可部署状态

---

## 1. 问题清单与修复策略

### P0 — 阻塞性问题

#### 1.1 环境变量占位符修复
- **问题**: `.env.local` 中 `DEEPL_API_KEY`、`GOOGLE_TRANSLATE_API_KEY`、`CRON_SECRET`、`NEXT_PUBLIC_GISCUS_REPO` 均为占位值
- **策略**:
  - 在 `/api/translate/route.ts` 中添加 API key 缺失时的优雅降级（返回 503 + 提示信息）
  - 在 RSS fetcher 和 cron 路由中增加同样的缺失检查
  - 保留 `.env.local` 占位符（用户可自行替换为真实 key），但代码必须能安全运行

#### 1.2 Next.js 16 Middleware → Proxy 迁移
- **问题**: `src/middleware.ts` 使用已废弃的 `middleware` 文件约定，Build 发出 deprecation warning
- **策略**:
  - 将 `src/middleware.ts` 迁移为 `src/proxy.ts`
  - 使用 Next.js 16 的 `proxy` API 重构 i18n 路由拦截逻辑
  - 保持现有功能：locale 检测、默认语言回退、`/api`/`/_next`/静态文件排除

#### 1.3 NextAuth signIn 路径适配 i18n
- **问题**: `src/lib/auth.ts` 中 `pages.signIn: '/login'` 硬编码，在多语言路由结构 `/[lang]/login` 下会跳转失败
- **策略**:
  - 将 signIn 路径改为动态获取当前 locale 的路径（如 `/{locale}/login`）
  - 或利用 Next.js redirect + middleware/proxy 自动处理未认证用户的重定向

### P1 — 功能缺陷

#### 1.4 RSS 抓取器健壮性提升
- **问题**:
  - 无重试机制，单个源失败不处理
  - slug 生成过于简单，长 URL 碰撞风险
- **策略**:
  - 给 `fetchNewsFromRSS` 添加单个源级别的 try/catch（已有）+ 重试逻辑（指数退避，最多 2 次重试）
  - slug 生成加入 hash 或 timestamp 后缀确保唯一性（如 `slug = baseSlug + '-' + shortHash(url)`）
  - 限制每源抓取条目数从 10 降到 5，降低频率压力

#### 1.5 翻译 API 缺失 key 时的优雅处理
- **问题**: `/api/translate/route.ts` 在 API key 缺失时会直接抛 500
- **策略**:
  - 路由入口处检查 `DEEPL_API_KEY` / `GOOGLE_TRANSLATE_API_KEY`
  - 若均不可用，返回 `503 Service Unavailable` + JSON `{ error: 'Translation service not configured' }`

#### 1.6 销售/充电站数据问题（暂不解决真实来源）
- **问题**: seed 数据仅为演示，无真实来源
- **策略**: 本次不引入外部数据源（超出修复范围），但为 `salesData` 和 `chargingStations` 查询添加空数据 fallback UI，避免页面报错

### P2 — 工程化

#### 1.7 Git 推送
- 将本地 6 个 commit 推送到 `origin/main`

#### 1.8 `.gitignore` 检查
- 确认 `.next/`、`tsconfig.tsbuildinfo` 已在 ignore 列表中，若缺失则补充

---

## 2. 边界与不改动的范围

- **不新增功能**: 不写后台管理、不新增页面、不改 UI 设计
- **不改数据库 schema**: 现有表结构已足够，不新增 migration
- **不替换技术栈**: 保持 Next.js 16 + next-auth + Drizzle 不变

---

## 3. 成功标准

- [ ] `npm run build` 零 warning、零 error
- [ ] 未配置 API key 时，翻译和 RSS 相关功能返回 503 而非 500
- [ ] NextAuth 未认证用户在任意语言路径下都能正确跳转登录页
- [ ] RSS 抓取器能容忍单个源失败，不中断整体流程
- [ ] 本地 6 个 commit 已推送到 origin
