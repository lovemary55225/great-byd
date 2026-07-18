# Great BYD 修复优先方案实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 P0/P1 级别问题，消除 build warning，提升核心功能健壮性，使项目达到完整可用状态。

**Architecture:** 保守修复策略，不引入新技术栈。Next.js 16 `middleware` → `proxy` 文件迁移；API 路由增加前置环境检查；RSS 抓取增加唯一 slug 和边界保护。

**Tech Stack:** Next.js 16.2.7, React 19, next-intl 4.13.0, Drizzle ORM, next-auth 4.24.14, Node.js 18+

---

## 文件变更总览

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/proxy.ts` | 新建 | 替代 `src/middleware.ts`，使用 `proxy` 文件约定 |
| `src/middleware.ts` | 删除 | Next.js 16 已弃用 |
| `src/app/api/translate/route.ts` | 修改 | 增加 API key 缺失检查，返回 503 |
| `src/lib/news/fetcher.ts` | 修改 | 增强 slug 唯一性，减少每源条目数 10→5 |
| `src/app/api/cron/fetch-news/route.ts` | 修改 | 增加环境变量缺失检查 |
| `.gitignore` | 验证/修改 | 确保 `.next/` 和 `*.tsbuildinfo` 已忽略 |

---

### Task 1: Middleware → Proxy 迁移

**Files:**
- Create: `src/proxy.ts`
- Delete: `src/middleware.ts`

- [ ] **Step 1: 创建 `src/proxy.ts`**

内容与原 `src/middleware.ts` 完全一致，仅文件名变更：

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

- [ ] **Step 2: 删除 `src/middleware.ts`**

```bash
rm src/middleware.ts
```

- [ ] **Step 3: Build 验证无 deprecation warning**

```bash
npm run build
```

**Expected:** Build 成功，终端不再出现 `The "middleware" file convention is deprecated` 警告。

- [ ] **Step 4: Commit**

```bash
git add src/proxy.ts src/middleware.ts
git commit -m "fix(proxy): migrate deprecated middleware.ts to proxy.ts"
```

---

### Task 2: 翻译 API 增加 API key 缺失保护

**Files:**
- Modify: `src/app/api/translate/route.ts`

- [ ] **Step 1: 在路由入口增加 API key 可用性检查**

修改后的完整文件内容：

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { news, newsTranslations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

function isTranslationServiceAvailable(): boolean {
  return Boolean(
    process.env.DEEPL_API_KEY && process.env.DEEPL_API_KEY !== 'your-deepl-api-key'
  );
}

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
  if (!isTranslationServiceAvailable()) {
    return NextResponse.json(
      { error: 'Translation service not configured' },
      { status: 503 }
    );
  }

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
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    const [translation] = await db.insert(newsTranslations).values({
      newsId,
      language: targetLang,
      translatedTitle,
      translatedSummary,
    }).returning();

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**关键变更点：**
- 新增 `isTranslationServiceAvailable()` 检查 `DEEPL_API_KEY` 是否存在且不是占位符
- 路由入口若不可用，返回 **503**（服务不可用）而非 500
- 翻译失败时返回 **502**（上游错误）而非 500
- 增加 `console.error` 便于调试

- [ ] **Step 2: Build 验证**

```bash
npm run build
```

**Expected:** Build 成功，无 TypeScript 错误。

- [ ] **Step 3: Commit**

```bash
git add src/app/api/translate/route.ts
git commit -m "fix(translate): add API key availability check, return 503 when unconfigured"
```

---

### Task 3: RSS 抓取器健壮性增强

**Files:**
- Modify: `src/lib/news/fetcher.ts`

- [ ] **Step 1: 修改 `src/lib/news/fetcher.ts`**

修改后的完整文件内容：

```typescript
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { db } from '@/lib/db';
import { news, sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { autoClassify } from './classifier';
import crypto from 'crypto';

const rssParser = new Parser();

async function extractArticleContent(url: string) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer, header, aside').remove();

    // Try to find main content
    const content = $('article').text() || $('main').text() || $('.content').text() || $('p').text();
    const image = $('article img').first().attr('src') || $('main img').first().attr('src') || $('meta[property="og:image"]').attr('content');

    return {
      content: content.trim().slice(0, 2000),
      image: image || null,
    };
  } catch (error) {
    return { content: null, image: null };
  }
}

function generateUniqueSlug(url: string, title: string): string {
  const base = url.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 80);
  const hash = crypto.createHash('md5').update(url + title).digest('hex').slice(0, 8);
  return `${base}-${hash}`;
}

export async function fetchNewsFromRSS() {
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.isActive, true),
  });

  const results = [];

  for (const source of activeSources) {
    if (!source.rssUrl) continue;

    try {
      const feed = await rssParser.parseURL(source.rssUrl);

      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue;

        const slug = generateUniqueSlug(item.link, item.title);

        const existing = await db.query.news.findFirst({
          where: eq(news.slug, slug),
        });

        if (existing) continue;

        // Extract additional content if summary is missing
        let summary = item.contentSnippet?.slice(0, 500) || null;
        let imageUrl = null;

        if (!summary && item.link) {
          const extracted = await extractArticleContent(item.link);
          summary = extracted.content?.slice(0, 500) || null;
          imageUrl = extracted.image;
        }

        const newArticle = await db.insert(news).values({
          title: item.title,
          summary,
          originalUrl: item.link,
          sourceId: source.id,
          categoryId: source.categoryId || autoClassify(item.title, summary) || 1,
          imageUrl: imageUrl || item.enclosure?.url || null,
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

**关键变更点：**
- 新增 `generateUniqueSlug(url, title)`：使用 URL + title 的 MD5 hash（前8位）作为后缀，确保不同文章不会碰撞；base 长度从 100 缩减到 80，为 hash 留出空间
- 每源抓取条目数从 **10 降至 5**，降低对新源和边缘 case 的暴露面
- 导入 `crypto` 模块（Node.js 内置）

- [ ] **Step 2: Build 验证**

```bash
npm run build
```

**Expected:** Build 成功，无 TypeScript 错误。

- [ ] **Step 3: Commit**

```bash
git add src/lib/news/fetcher.ts
git commit -m "fix(fetcher): add unique slug with hash, reduce per-source items 10→5"
```

---

### Task 4: Cron 路由增加环境检查

**Files:**
- Modify: `src/app/api/cron/fetch-news/route.ts`

- [ ] **Step 1: 修改 cron 路由**

修改后的完整文件内容：

```typescript
import { NextResponse } from 'next/server';
import { fetchNewsFromRSS } from '@/lib/news/fetcher';

function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://...');
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const articles = await fetchNewsFromRSS();
    return NextResponse.json({ success: true, fetched: articles.length });
  } catch (error) {
    console.error('Cron fetch-news error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
```

**关键变更点：**
- 新增 `isDatabaseConfigured()` 检查（简单的占位符检测）
- 数据库未配置时返回 **503** 而非在 `fetchNewsFromRSS` 中抛未处理异常
- 增加 `console.error` 便于 Vercel 日志调试

- [ ] **Step 2: Build 验证**

```bash
npm run build
```

**Expected:** Build 成功，无 TypeScript 错误。

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/fetch-news/route.ts
git commit -m "fix(cron): add database configuration check, return 503 when unconfigured"
```

---

### Task 5: `.gitignore` 完整性验证

**Files:**
- Verify: `.gitignore`

- [ ] **Step 1: 检查 `.gitignore` 是否已包含关键规则**

当前 `.gitignore` 内容（节选）：
```
# next.js
/.next/
/out/

# typescript
*.tsbuildinfo
next-env.d.ts
```

**Expected:** `.next/`、`*.tsbuildinfo`、`.env*` 均已存在。若缺失则补充。

- [ ] **Step 2: （若无需修改）标记完成；若需修改则 commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore"
```

---

### Task 6: 推送代码到 origin

- [ ] **Step 1: 推送本地 commit**

```bash
git push origin main
```

**Expected:** 6 个原有 commit + 本次新增 commit 成功推送到 `origin/main`。

- [ ] **Step 2: 验证远程状态**

```bash
git log origin/main --oneline -5
```

**Expected:** 输出与本地 `git log --oneline -5` 一致。

---

## 自我审查清单

### 1. Spec 覆盖率

| Spec 要求 | 对应 Task |
|-----------|-----------|
| Middleware deprecation warning | Task 1 |
| 翻译 API key 缺失检查 | Task 2 |
| RSS slug 碰撞 + 条目数 | Task 3 |
| Cron 路由环境检查 | Task 4 |
| `.gitignore` 完整 | Task 5 |
| Git push | Task 6 |

**覆盖率:** 100%，无遗漏。

### 2. Placeholder 扫描

- 无 "TBD" / "TODO" / "implement later"
- 所有代码块包含完整可运行代码
- 所有命令包含具体路径和预期输出

### 3. 类型一致性

- `generateUniqueSlug` 签名：`(url: string, title: string) => string`，Task 3 中使用一致
- `isTranslationServiceAvailable` / `isDatabaseConfigured` 均返回 `boolean`，使用一致
- HTTP 状态码：503 用于未配置，502 用于上游失败，500 用于内部错误，使用一致

### 4. 范围检查

- 无新增页面、无 UI 改动、无 schema 变更
- 纯修复 + 工程化，符合设计方案的"修复优先"策略
