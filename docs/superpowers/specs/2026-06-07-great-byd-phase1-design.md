# Great BYD - 比亚迪全球新闻聚合平台 Phase 1 设计文档

## 项目概述

一个面向全球用户的比亚迪汽车新闻数据聚合平台，采用数据驱动仪表板风格设计，支持多语言、自动新闻采集、销量数据可视化和用户讨论功能。

**核心定位：** 全球比亚迪汽车资讯的一站式入口，集新闻聚合、数据可视化、多语言翻译、社区讨论于一体。

---

## 技术栈

| 技术/服务 | 版本 | 用途 |
|-----------|------|------|
| Next.js | v15 (App Router) | 全栈框架 |
| React | v19 | UI 组件 |
| TypeScript | latest | 全类型安全 |
| Tailwind CSS | v4 | 原子化 CSS |
| shadcn/ui | latest | 数据图表、表格、卡片等 UI 组件 |
| next-intl | latest | 多语言 i18n |
| Drizzle ORM | latest | TypeScript-first ORM |
| Neon PostgreSQL | latest | Serverless 数据库 |
| Vercel | latest | 部署 + Cron Jobs |
| Recharts / Tremor | latest | 数据可视化 |
| Giscus | latest | Phase 1 评论系统 |
| rss-parser | latest | RSS 新闻采集 |
| cheerio | latest | 网页爬虫辅助 |
| DeepL API / Google Translate API | latest | 机器翻译 |

---

## 视觉设计系统（数据驱动仪表板风）

### 色彩体系

| 名称 | 值 | 用途 |
|------|-----|------|
| 背景主色 | `#0a0a0f` | 页面背景 |
| 卡片背景 | `#13131f` | 卡片、面板 |
| 边框色 | `#1e1e2e` | 分隔线、边框 |
| 主文字 | `#e2e8f0` | 正文、标题 |
| 次要文字 | `#94a3b8` | 辅助文字 |
| 强调色（BYD 红） | `#e31937` | hover、按钮、高亮 |
| 强调色（科技蓝） | `#3b82f6` | 链接、图表主色 |
| 成功绿 | `#22c55e` | 增长数据、正增长 |
| 警告黄 | `#f59e0b` | 警告、待处理 |

### 字体

- **标题：** Inter, system-ui, sans-serif
- **正文：** Inter, system-ui, sans-serif
- **数字/数据：** JetBrains Mono, monospace

### 视觉元素

- 深色主题为主，大量数据卡片
- 圆角 8-12px，现代感
- 卡片带微妙边框和 hover 阴影提升
- 数据用 KPI 大数字 + 趋势箭头展示
- 图表区域占首页 60% 以上

---

## 数据库 Schema

### news（新闻主表）

```sql
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  original_url VARCHAR(1000) NOT NULL,
  source_id INTEGER REFERENCES sources(id),
  category_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(1000),
  published_at TIMESTAMP NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  language VARCHAR(10) DEFAULT 'zh',
  is_translated BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  slug VARCHAR(500) UNIQUE
);
```

### news_translations（新闻翻译缓存）

```sql
CREATE TABLE news_translations (
  id SERIAL PRIMARY KEY,
  news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  translated_title VARCHAR(500),
  translated_summary TEXT,
  translated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(news_id, language)
);
```

### sales_data（销量数据）

```sql
CREATE TABLE sales_data (
  id SERIAL PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  vehicle_model VARCHAR(200),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  sales_count INTEGER NOT NULL,
  data_source VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### charging_stations（闪充桩进度）

```sql
CREATE TABLE charging_stations (
  id SERIAL PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  station_count INTEGER DEFAULT 0,
  target_count INTEGER,
  status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### sources（新闻来源配置）

```sql
CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  rss_url VARCHAR(1000),
  crawl_config JSONB,
  last_fetched_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  category_id INTEGER REFERENCES categories(id)
);
```

### categories（分类）

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_zh VARCHAR(100),
  name_en VARCHAR(100),
  sort_order INTEGER DEFAULT 0
);
```

---

## 页面结构与路由

| 页面 | 路由 | 核心内容 |
|------|------|----------|
| 首页/仪表板 | `/[lang]` | 销量 KPI 卡片、最新新闻瀑布流、充电站进度 |
| 新闻列表 | `/[lang]/news` | 分类筛选、分页、搜索 |
| 新闻详情 | `/[lang]/news/[slug]` | 标题、摘要、原文链接、多语言切换、Giscus 评论 |
| 数据看板 | `/[lang]/data` | 各国销量趋势图、车型排行、充电站地图 |
| 搜索 | `/[lang]/search?q=...` | 全文搜索 |
| 关于 | `/[lang]/about` | 数据来源说明、免责声明 |

**支持语言：** `zh`, `en`, `es`, `ar`, `fr`, `ru`, `pt`, `de`, `ja`, `ko`

---

## 功能模块设计

### 1. 新闻自动采集系统

**Vercel Cron Jobs 配置：**
- `fetch-news-rss`: `0 */6 * * *`（每 6 小时）
- `fetch-sales-data`: `0 2 * * *`（每天凌晨 2 点）

**采集流程：**
1. Cron 触发 `/api/cron/fetch-news`
2. 读取 `sources` 表中启用的 RSS 源
3. `rss-parser` 解析 RSS 提取新闻
4. 对新链接用 `cheerio` 爬取补充内容
5. 存入 `news` 表，生成 slug
6. 异步调用翻译 API，结果存入 `news_translations`

### 2. 多语言系统

**UI 翻译：** `next-intl` 管理 10 种语言界面文案
**新闻翻译：**
- 中文原文存入 `news`
- 机器翻译缓存到 `news_translations`
- 用户可切换原文/译文
- 翻译策略：标题 + 摘要必译，正文保留原文链接

### 3. 数据看板

| 模块 | 可视化 |
|------|--------|
| 全球销量趋势 | 折线图（月/季度切换） |
| 各国销量排行 | 横向柱状图 Top 10 |
| 车型销量排行 | 饼图 |
| 充电站进度 | 世界地图热力图 + 国家列表 |
| 技术里程碑 | 时间轴 |

### 4. 评论系统（Phase 1）

- Giscus 基于 GitHub Discussions
- 每篇新闻对应一个 Discussion
- 支持 Markdown、表情反应
- 深色主题自动适配

### 5. 全文搜索

- PostgreSQL `tsvector` + `tsquery` 全文索引
- 支持按标题、摘要、分类搜索
- 搜索结果高亮显示

---

## 性能目标

- Lighthouse 性能评分 ≥ 90
- 首屏加载时间 < 2s
- 新闻列表页使用 ISR（revalidate: 3600）
- 数据库查询使用连接池 + 缓存

---

## 目录结构

```
great-byd/
├── src/
│   ├── app/
│   │   ├── [lang]/
│   │   │   ├── page.tsx
│   │   │   ├── news/
│   │   │   ├── data/
│   │   │   ├── search/
│   │   │   └── about/
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   └── fetch-news/route.ts
│   │   │   └── translate/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── charts/
│   │   ├── news/
│   │   └── layout/
│   ├── lib/
│   │   ├── db/
│   │   ├── i18n/
│   │   └── utils.ts
│   └── types/
├── public/
├── drizzle/
├── messages/                   # next-intl 翻译文件
│   ├── zh.json
│   ├── en.json
│   └── ...
├── vercel.json
└── next.config.js
```

---

## 部署配置

### Vercel Cron Jobs（vercel.json）

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-news",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/fetch-sales",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 |
| `DEEPL_API_KEY` | DeepL 翻译 API Key |
| `GOOGLE_TRANSLATE_API_KEY` | Google 翻译 API Key |
| `CRON_SECRET` | Cron Job 鉴权密钥 |
| `NEXT_PUBLIC_GISCUS_REPO` | Giscus 仓库名 |

---

## Phase 1 上线检查清单

- [ ] 数据库 Schema 创建 + 迁移
- [ ] 首页仪表板（KPI + 新闻 + 图表）
- [ ] 新闻列表/详情页
- [ ] 数据看板（销量图表 + 充电站）
- [ ] RSS 自动采集（至少 5 个来源）
- [ ] 多语言 UI（10 种语言）
- [ ] 新闻机器翻译（标题+摘要）
- [ ] Giscus 评论集成
- [ ] 全文搜索
- [ ] Vercel 部署 + Cron Jobs 配置
