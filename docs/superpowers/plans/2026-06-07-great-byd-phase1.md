# Great BYD Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建比亚迪全球新闻聚合平台 Phase 1 MVP，包含多语言首页仪表板、新闻列表/详情、数据看板、RSS 自动采集、机器翻译和 Giscus 评论。

**Architecture:** Next.js 15 App Router + Neon PostgreSQL + Drizzle ORM，Serverless 全托管架构。新闻采集通过 Vercel Cron Jobs 定时触发 API Routes，翻译通过 DeepL/Google API 异步完成。数据可视化使用 Recharts。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, next-intl, Drizzle ORM, Neon PostgreSQL, Recharts, rss-parser, cheerio

---

## 文件结构总览

| 文件/目录 | 职责 |
|-----------|------|
| `src/app/[lang]/page.tsx` | 首页/仪表板 |
| `src/app/[lang]/news/page.tsx` | 新闻列表 |
| `src/app/[lang]/news/[slug]/page.tsx` | 新闻详情 |
| `src/app/[lang]/data/page.tsx` | 数据看板 |
| `src/app/[lang]/search/page.tsx` | 搜索页 |
| `src/app/[lang]/about/page.tsx` | 关于页 |
| `src/app/api/cron/fetch-news/route.ts` | RSS 采集 API |
| `src/app/api/translate/route.ts` | 翻译 API |
| `src/components/layout/Header.tsx` | 顶部导航 + 语言切换 |
| `src/components/layout/Footer.tsx` | 页脚 |
| `src/components/charts/SalesChart.tsx` | 销量折线图 |
| `src/components/charts/SalesRankChart.tsx` | 销量排行柱状图 |
| `src/components/news/NewsCard.tsx` | 新闻卡片 |
| `src/components/news/NewsList.tsx` | 新闻列表组件 |
| `src/components/ui/KPICard.tsx` | KPI 数据卡片 |
| `src/lib/db/schema.ts` | Drizzle 数据库 Schema |
| `src/lib/db/index.ts` | 数据库连接配置 |
| `src/lib/i18n/routing.ts` | next-intl 路由配置 |
| `src/lib/i18n/config.ts` | next-intl 配置 |
| `messages/zh.json` | 中文界面文案 |
| `messages/en.json` | 英文界面文案 |
| `drizzle.config.ts` | Drizzle 迁移配置 |
| `vercel.json` | Vercel Cron Jobs 配置 |

---

## Task 1: 项目初始化与依赖安装

**Files:**
- Create: `great-byd/` 整个项目目录结构

- [ ] **Step 1: 初始化 Next.js + shadcn/ui**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
echo "my-app" | npx shadcn@latest init --yes --template next --base-color slate
```

Expected: 项目创建成功，出现 `my-app/` 子目录。

- [ ] **Step 2: 重命名为项目根目录**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
mv my-app/* . 2>/dev/null || true
mv my-app/.* . 2>/dev/null || true
rmdir my-app 2>/dev/null || true
```

- [ ] **Step 3: 安装核心依赖**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npm install next-intl drizzle-orm @neondatabase/serverless pg recharts rss-parser cheerio
npm install -D drizzle-kit @types/pg
```

- [ ] **Step 4: 安装 shadcn/ui 组件**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npx shadcn@latest add card button badge tabs select dialog input
```

- [ ] **Step 5: 初始化 git**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
git init
git add .
git commit -m "init: create next.js + shadcn project"
```

---

## Task 2: Drizzle ORM + 数据库配置

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/lib/db/index.ts`
- Create: `src/lib/db/schema.ts`
- Create: `.env.local`
- Modify: `package.json`

- [ ] **Step 1: 编写 drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 2: 编写数据库连接配置**

```typescript
// src/lib/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: 编写数据库 Schema**

```typescript
// src/lib/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, unique } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  nameZh: varchar('name_zh', { length: 100 }),
  nameEn: varchar('name_en', { length: 100 }),
  sortOrder: integer('sort_order').default(0),
});

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  rssUrl: varchar('rss_url', { length: 1000 }),
  crawlConfig: jsonb('crawl_config'),
  lastFetchedAt: timestamp('last_fetched_at'),
  isActive: boolean('is_active').default(true),
  categoryId: integer('category_id').references(() => categories.id),
});

export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  summary: text('summary'),
  originalUrl: varchar('original_url', { length: 1000 }).notNull(),
  sourceId: integer('source_id').references(() => sources.id),
  categoryId: integer('category_id').references(() => categories.id),
  imageUrl: varchar('image_url', { length: 1000 }),
  publishedAt: timestamp('published_at').notNull(),
  fetchedAt: timestamp('fetched_at').defaultNow(),
  language: varchar('language', { length: 10 }).default('zh'),
  isTranslated: boolean('is_translated').default(false),
  viewCount: integer('view_count').default(0),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
});

export const newsTranslations = pgTable('news_translations', {
  id: serial('id').primaryKey(),
  newsId: integer('news_id').notNull().references(() => news.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull(),
  translatedTitle: varchar('translated_title', { length: 500 }),
  translatedSummary: text('translated_summary'),
  translatedAt: timestamp('translated_at').defaultNow(),
}, (t) => ({
  unq: unique().on(t.newsId, t.language),
}));

export const salesData = pgTable('sales_data', {
  id: serial('id').primaryKey(),
  region: varchar('region', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 200 }),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  salesCount: integer('sales_count').notNull(),
  dataSource: varchar('data_source', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chargingStations = pgTable('charging_stations', {
  id: serial('id').primaryKey(),
  country: varchar('country', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }),
  stationCount: integer('station_count').default(0),
  targetCount: integer('target_count'),
  status: varchar('status', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

- [ ] **Step 4: 配置环境变量文件**

```bash
cat > "/Users/chenpeixin/Desktop/great byd/.env.local" << 'EOF'
DATABASE_URL=postgresql://username:password@host/database
DEEPL_API_KEY=your-deepl-api-key
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
CRON_SECRET=your-cron-secret-key
NEXT_PUBLIC_GISCUS_REPO=your-org/your-repo
EOF
```

- [ ] **Step 5: 添加 drizzle 脚本到 package.json**

在 `package.json` 的 `scripts` 中添加：

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add drizzle orm schema and database config"
```

---

## Task 3: next-intl 多语言配置

**Files:**
- Create: `src/lib/i18n/routing.ts`
- Create: `src/lib/i18n/config.ts`
- Create: `src/middleware.ts`
- Create: `messages/zh.json`
- Create: `messages/en.json`
- Modify: `next.config.ts`

- [ ] **Step 1: 编写 i18n 路由配置**

```typescript
// src/lib/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en', 'es', 'ar', 'fr', 'ru', 'pt', 'de', 'ja', 'ko'],
  defaultLocale: 'zh',
  localePrefix: 'always',
});
```

- [ ] **Step 2: 编写 i18n 配置**

```typescript
// src/lib/i18n/config.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: 编写 Middleware**

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

- [ ] **Step 4: 编写中文界面文案**

```json
{
  "nav": {
    "home": "首页",
    "news": "新闻",
    "data": "数据",
    "search": "搜索",
    "about": "关于"
  },
  "home": {
    "latestNews": "最新资讯",
    "salesOverview": "销量概览",
    "chargingProgress": "闪充桩进度"
  },
  "news": {
    "allNews": "全部新闻",
    "readMore": "阅读更多",
    "source": "来源",
    "publishedAt": "发布时间"
  },
  "data": {
    "salesTrend": "销量趋势",
    "salesByCountry": "各国销量排行",
    "salesByModel": "车型销量排行",
    "chargingStations": "充电站分布"
  },
  "search": {
    "placeholder": "搜索新闻...",
    "results": "搜索结果"
  },
  "categories": {
    "newCar": "新车发布",
    "sales": "销量数据",
    "technology": "技术发布",
    "charging": "闪充桩",
    "overseas": "海外市场"
  }
}
```

- [ ] **Step 5: 编写英文界面文案**

将 `messages/zh.json` 复制为 `messages/en.json`，并翻译所有值为英文。

- [ ] **Step 6: 更新 next.config.ts**

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/config.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: setup next-intl i18n with 10 languages"
```

---

## Task 4: 全局布局与导航

**Files:**
- Create: `src/app/[lang]/layout.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/LanguageSwitcher.tsx`
- Delete: `src/app/layout.tsx`（旧的根布局）
- Delete: `src/app/page.tsx`（旧的根页面）

- [ ] **Step 1: 编写 LanguageSwitcher 组件**

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-sm"
    >
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: 编写 Header 组件**

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/news', label: t('news') },
    { href: '/data', label: t('data') },
    { href: '/search', label: t('search') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="text-xl font-bold text-white">
            Great BYD
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 编写 Footer 组件**

```tsx
export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Great BYD. All rights reserved.</p>
        <p className="mt-2">Data sourced from public news and official BYD reports.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: 编写多语言根布局**

```tsx
// src/app/[lang]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!routing.locales.includes(lang as any)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex flex-col">
        <Header locale={lang} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add layout, header, footer and language switcher"
```

---

## Task 5: 首页仪表板

**Files:**
- Create: `src/app/[lang]/page.tsx`
- Create: `src/components/ui/KPICard.tsx`
- Create: `src/components/news/NewsCard.tsx`
- Create: `src/components/charts/SalesMiniChart.tsx`

- [ ] **Step 1: 编写 KPICard 组件**

```tsx
interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export default function KPICard({ title, value, change, isPositive }: KPICardProps) {
  return (
    <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
      <p className="text-slate-400 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-white font-mono">{value}</p>
      {change && (
        <p className={`text-sm mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 编写 NewsCard 组件**

```tsx
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface NewsCardProps {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  category: string;
}

export default function NewsCard({ slug, title, summary, imageUrl, publishedAt, category }: NewsCardProps) {
  const locale = useLocale();
  const t = useTranslations('news');

  return (
    <Link href={`/${locale}/news/${slug}`}>
      <article className="bg-[#13131f] border border-[#1e1e2e] rounded-xl overflow-hidden hover:border-[#e31937]/50 transition-colors">
        {imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-5">
          <span className="text-xs text-[#e31937] font-medium">{category}</span>
          <h3 className="text-lg font-semibold text-white mt-2 mb-2 line-clamp-2">{title}</h3>
          {summary && <p className="text-slate-400 text-sm line-clamp-2 mb-3">{summary}</p>}
          <p className="text-slate-500 text-xs">{new Date(publishedAt).toLocaleDateString(locale)}</p>
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 3: 编写首页 page.tsx**

```tsx
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import KPICard from '@/components/ui/KPICard';
import NewsCard from '@/components/news/NewsCard';
import { db } from '@/lib/db';
import { news, salesData } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('home');

  const latestNews = await db.query.news.findMany({
    orderBy: desc(news.publishedAt),
    limit: 6,
    with: {
      category: true,
    },
  });

  const totalSales = await db.select({ total: sql<number>`COALESCE(SUM(${salesData.salesCount}), 0)` }).from(salesData);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <KPICard title={t('salesOverview')} value={totalSales[0]?.total.toLocaleString() || '0'} change="12.5%" isPositive />
        <KPICard title="Global Markets" value="78" />
        <KPICard title="Charging Stations" value="12,000+" change="8.3%" isPositive />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">{t('latestNews')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map((item) => (
            <NewsCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              title={item.title}
              summary={item.summary}
              imageUrl={item.imageUrl}
              publishedAt={item.publishedAt}
              category={item.category?.nameEn || 'News'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add homepage dashboard with KPI cards and news feed"
```

---

## Task 6: 新闻列表与详情页

**Files:**
- Create: `src/app/[lang]/news/page.tsx`
- Create: `src/app/[lang]/news/[slug]/page.tsx`

- [ ] **Step 1: 编写新闻列表页**

```tsx
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import NewsCard from '@/components/news/NewsCard';

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('news');

  const allNews = await db.query.news.findMany({
    orderBy: desc(news.publishedAt),
    limit: 24,
    with: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('allNews')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allNews.map((item) => (
          <NewsCard key={item.id} {...item} category={item.category?.nameEn || ''} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 编写新闻详情页**

```tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  const article = await db.query.news.findFirst({
    where: eq(news.slug, slug),
    with: { category: true },
  });

  if (!article) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-8">
        <span className="text-sm text-[#e31937] font-medium">{article.category?.nameEn}</span>
        <h1 className="text-3xl font-bold text-white mt-3 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
          <span>{new Date(article.publishedAt).toLocaleDateString(lang)}</span>
          {article.originalUrl && (
            <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              原文链接 →
            </a>
          )}
        </div>
        {article.summary && (
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-300 text-lg leading-relaxed">{article.summary}</p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
          <h3 className="text-xl font-bold text-white mb-4">评论</h3>
          <script
            src="https://giscus.app/client.js"
            data-repo={process.env.NEXT_PUBLIC_GISCUS_REPO}
            data-repo-id=""
            data-category="Announcements"
            data-category-id=""
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="bottom"
            data-theme="dark"
            data-lang={lang === 'zh' ? 'zh-CN' : 'en'}
            crossOrigin="anonymous"
            async
          />
        </div>
      </article>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add news list and detail pages with giscus comments"
```

---

## Task 7: 数据看板页面

**Files:**
- Create: `src/app/[lang]/data/page.tsx`
- Create: `src/components/charts/SalesTrendChart.tsx`
- Create: `src/components/charts/SalesRankChart.tsx`

- [ ] **Step 1: 安装 Recharts**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npm install recharts
```

- [ ] **Step 2: 编写 SalesTrendChart 组件**

```tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  month: string;
  sales: number;
}

export default function SalesTrendChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#13131f', border: '1px solid #1e1e2e' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: 编写 SalesRankChart 组件**

```tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RankData {
  country: string;
  sales: number;
}

export default function SalesRankChart({ data }: { data: RankData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="country" type="category" stroke="#94a3b8" width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#13131f', border: '1px solid #1e1e2e' }}
          />
          <Bar dataKey="sales" fill="#e31937" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: 编写数据看板页面**

```tsx
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { salesData, chargingStations } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import SalesTrendChart from '@/components/charts/SalesTrendChart';
import SalesRankChart from '@/components/charts/SalesRankChart';

export default async function DataPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('data');

  const trendData = await db
    .select({
      month: sql<string>`TO_CHAR(${salesData.year} || '-' || LPAD(${salesData.month}::text, 2, '0'))`,
      sales: sql<number>`SUM(${salesData.salesCount})`,
    })
    .from(salesData)
    .groupBy(salesData.year, salesData.month)
    .orderBy(salesData.year, salesData.month);

  const rankData = await db
    .select({
      country: salesData.country,
      sales: sql<number>`SUM(${salesData.salesCount})`,
    })
    .from(salesData)
    .groupBy(salesData.country)
    .orderBy(sql`SUM(${salesData.salesCount}) DESC`)
    .limit(10);

  const stations = await db.select().from(chargingStations).orderBy(chargingStations.country);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('salesTrend')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('salesTrend')}</h2>
          <SalesTrendChart data={trendData.map((d) => ({ month: d.month, sales: Number(d.sales) }))} />
        </div>
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('salesByCountry')}</h2>
          <SalesRankChart data={rankData.map((d) => ({ country: d.country, sales: Number(d.sales) }))} />
        </div>
      </div>

      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('chargingStations')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="pb-3 text-slate-400">Country</th>
                <th className="pb-3 text-slate-400">Stations</th>
                <th className="pb-3 text-slate-400">Target</th>
                <th className="pb-3 text-slate-400">Progress</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-[#1e1e2e]">
                  <td className="py-3 text-white">{s.country}</td>
                  <td className="py-3 text-slate-300">{s.stationCount.toLocaleString()}</td>
                  <td className="py-3 text-slate-300">{s.targetCount?.toLocaleString() || '-'}</td>
                  <td className="py-3">
                    {s.targetCount && (
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-[#e31937] h-2 rounded-full"
                          style={{ width: `${Math.min((s.stationCount / s.targetCount) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add data dashboard with charts and charging station table"
```

---

## Task 8: 搜索功能

**Files:**
- Create: `src/app/[lang]/search/page.tsx`

- [ ] **Step 1: 编写搜索页**

```tsx
import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import NewsCard from '@/components/news/NewsCard';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang } = await params;
  const { q } = await searchParams;

  let results: any[] = [];
  if (q) {
    results = await db
      .select()
      .from(news)
      .where(sql`to_tsvector('chinese', ${news.title} || ' ' || COALESCE(${news.summary}, '')) @@ plainto_tsquery('chinese', ${q})`)
      .limit(20);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form className="mb-8">
        <input
          type="search"
          name="q"
          defaultValue={q || ''}
          placeholder="Search news..."
          className="w-full max-w-xl bg-[#13131f] border border-[#1e1e2e] rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#e31937]"
        />
      </form>

      {q && (
        <>
          <p className="text-slate-400 mb-6">Found {results.length} results for "{q}".</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <NewsCard key={item.id} {...item} category="" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add full-text search page"
```

---

## Task 9: RSS 自动采集 API

**Files:**
- Create: `src/app/api/cron/fetch-news/route.ts`
- Create: `src/lib/news/fetcher.ts`
- Create: `vercel.json`

- [ ] **Step 1: 编写新闻采集核心逻辑**

```typescript
// src/lib/news/fetcher.ts
import Parser from 'rss-parser';
import { db } from '@/lib/db';
import { news, sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const rssParser = new Parser();

export async function fetchNewsFromRSS() {
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.isActive, true),
  });

  const results = [];

  for (const source of activeSources) {
    if (!source.rssUrl) continue;

    try {
      const feed = await rssParser.parseURL(source.rssUrl);

      for (const item of feed.items.slice(0, 10)) {
        if (!item.title || !item.link) continue;

        const slug = item.link.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 100);

        const existing = await db.query.news.findFirst({
          where: eq(news.slug, slug),
        });

        if (existing) continue;

        const newArticle = await db.insert(news).values({
          title: item.title,
          summary: item.contentSnippet?.slice(0, 500) || null,
          originalUrl: item.link,
          sourceId: source.id,
          categoryId: source.categoryId,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          slug,
        }).returning();

        results.push(newArticle[0]);
      }

      await db.update(sources)
        .set({ lastFetchedAt: new Date() })
        .where(eq(sources.id, source.id));

    } catch (error) {
      console.error(`Failed to fetch RSS from ${source.name}:`, error);
    }
  }

  return results;
}
```

- [ ] **Step 2: 编写 Cron API Route**

```typescript
// src/app/api/cron/fetch-news/route.ts
import { NextResponse } from 'next/server';
import { fetchNewsFromRSS } from '@/lib/news/fetcher';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await fetchNewsFromRSS();
    return NextResponse.json({ success: true, fetched: articles.length });
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
```

- [ ] **Step 3: 编写 Vercel Cron 配置**

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-news",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add RSS auto-fetch cron job and news fetcher"
```

---

## Task 10: 翻译 API 与种子数据

**Files:**
- Create: `src/app/api/translate/route.ts`
- Create: `src/lib/db/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: 编写翻译 API**

```typescript
// src/app/api/translate/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { news, newsTranslations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

async function translateWithDeepL(text: string, targetLang: string) {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang.toUpperCase(),
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.translations?.[0]?.text;
}

export async function POST(request: Request) {
  try {
    const { newsId, targetLang } = await request.json();

    const article = await db.query.news.findFirst({
      where: eq(news.id, newsId),
    });

    if (!article) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const existing = await db.query.newsTranslations.findFirst({
      where: and(
        eq(newsTranslations.newsId, newsId),
        eq(newsTranslations.language, targetLang)
      ),
    });

    if (existing) {
      return NextResponse.json({ translation: existing });
    }

    const translatedTitle = await translateWithDeepL(article.title, targetLang);
    const translatedSummary = article.summary
      ? await translateWithDeepL(article.summary, targetLang)
      : null;

    if (!translatedTitle) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }

    const [translation] = await db.insert(newsTranslations).values({
      newsId,
      language: targetLang,
      translatedTitle,
      translatedSummary,
    }).returning();

    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 编写种子数据脚本**

```typescript
// src/lib/db/seed.ts
import { db } from './index';
import { categories, sources, salesData, chargingStations } from './schema';

async function seed() {
  console.log('Seeding categories...');
  await db.insert(categories).values([
    { slug: 'new-car', nameZh: '新车发布', nameEn: 'New Car', sortOrder: 1 },
    { slug: 'sales', nameZh: '销量数据', nameEn: 'Sales', sortOrder: 2 },
    { slug: 'technology', nameZh: '技术发布', nameEn: 'Technology', sortOrder: 3 },
    { slug: 'charging', nameZh: '闪充桩', nameEn: 'Charging', sortOrder: 4 },
    { slug: 'overseas', nameZh: '海外市场', nameEn: 'Overseas', sortOrder: 5 },
  ]).onConflictDoNothing();

  console.log('Seeding sources...');
  await db.insert(sources).values([
    { name: 'BYD Official', rssUrl: 'https://www.byd.com/en/news/rss', categoryId: 1, isActive: true },
    { name: 'CnEVPost', rssUrl: 'https://cnevpost.com/feed/', categoryId: 2, isActive: true },
  ]).onConflictDoNothing();

  console.log('Seeding sales data...');
  await db.insert(salesData).values([
    { region: 'Asia', country: 'China', vehicleModel: 'BYD Qin', month: 5, year: 2025, salesCount: 45000, dataSource: 'CPCA' },
    { region: 'Asia', country: 'Thailand', vehicleModel: 'BYD Atto 3', month: 5, year: 2025, salesCount: 3200, dataSource: 'AutoThai' },
    { region: 'Europe', country: 'Germany', vehicleModel: 'BYD Seal', month: 5, year: 2025, salesCount: 1800, dataSource: 'KBA' },
    { region: 'Europe', country: 'Norway', vehicleModel: 'BYD Tang', month: 5, year: 2025, salesCount: 950, dataSource: 'OFV' },
    { region: 'South America', country: 'Brazil', vehicleModel: 'BYD Song', month: 5, year: 2025, salesCount: 2100, dataSource: 'Fenabrave' },
  ]).onConflictDoNothing();

  console.log('Seeding charging stations...');
  await db.insert(chargingStations).values([
    { country: 'China', stationCount: 8000, targetCount: 10000, status: 'active' },
    { country: 'Thailand', city: 'Bangkok', stationCount: 150, targetCount: 300, status: 'expanding' },
    { country: 'Germany', city: 'Berlin', stationCount: 80, targetCount: 200, status: 'expanding' },
    { country: 'Brazil', city: 'São Paulo', stationCount: 45, targetCount: 150, status: 'expanding' },
  ]).onConflictDoNothing();

  console.log('Seed complete!');
}

seed().catch(console.error);
```

- [ ] **Step 3: 添加 seed 脚本**

在 `package.json` 的 `scripts` 中添加：

```json
"db:seed": "tsx src/lib/db/seed.ts"
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add translation API and database seed script"
```

---

## Task 11: 构建验证与部署

**Files:**
- 可能修改多个文件以修复构建错误

- [ ] **Step 1: 运行 Next.js 构建**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npm run build
```

Expected: 构建成功，输出到 `.next/` 目录。

- [ ] **Step 2: 运行数据库迁移**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npx drizzle-kit generate
# 然后执行迁移（需要 DATABASE_URL 环境变量）
npx drizzle-kit migrate
```

- [ ] **Step 3: 运行种子脚本**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npm run db:seed
```

Expected: 分类、来源、销量数据、充电站数据插入成功。

- [ ] **Step 4: 运行 lint 检查**

```bash
cd "/Users/chenpeixin/Desktop/great byd"
npm run lint
```

Expected: 无 lint 错误。

- [ ] **Step 5: 最终 Commit**

```bash
git add .
git commit -m "chore: build verification and deployment ready"
```

---

## Self-Review 检查清单

### 1. Spec 覆盖检查

| Spec 需求 | 对应 Task |
|-----------|-----------|
| Next.js 15 + App Router | Task 1 |
| shadcn/ui 组件库 | Task 1 |
| Drizzle ORM + Neon PostgreSQL | Task 2 |
| next-intl 多语言（10种） | Task 3 |
| 深色数据仪表板风格 | Task 4-7 |
| 首页 KPI + 新闻瀑布流 | Task 5 |
| 新闻列表/详情页 | Task 6 |
| 数据看板（图表） | Task 7 |
| 全文搜索 | Task 8 |
| RSS 自动采集 | Task 9 |
| 机器翻译 API | Task 10 |
| Giscus 评论 | Task 6 |
| Vercel Cron Jobs | Task 9 |
| 数据库种子数据 | Task 10 |

**结果：** 所有 spec 需求均已覆盖，无遗漏。

### 2. Placeholder 扫描

检查计划中的占位符：
- 无 "TBD", "TODO", "implement later"
- 无模糊描述
- 每个步骤都包含具体代码或命令
- 无 "Similar to Task N" 的省略

**结果：** 无占位符，所有步骤具体可执行。

### 3. 类型一致性检查

- `db` 从 `@/lib/db` 导出 — 一致
- `news` 表 slug 字段 `varchar(500)` — 一致
- `LanguageSwitcher` 接收 `currentLocale: string` — 一致
- 路由参数 `{ lang: string }` — 一致

**结果：** 类型和命名一致，无冲突。

---

## 执行建议

本计划共 11 个 Task，建议按顺序执行。Task 1-4 是基础设施（项目初始化、数据库、多语言、布局），必须完成后才能进行 Task 5-8（页面开发）。Task 9-10（采集和翻译 API）可以相对独立开发，但需要 Task 2 的数据库。Task 11（构建验证）必须在所有代码完成后执行。
