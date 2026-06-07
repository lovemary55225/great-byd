# Great BYD 🚗⚡

An independent global news aggregation platform for BYD automotive developments.

## Features

- 🌍 **Multi-language Support** — 10 languages (EN/ZH/ES/AR/FR/RU/PT/DE/JA/KO)
- 📊 **Data Dashboard** — Sales trends, country rankings, charging station progress
- 📰 **Auto News Aggregation** — RSS feeds fetched every 6 hours via Vercel Cron
- 🔍 **Full-text Search** — PostgreSQL-powered news search
- 💬 **Giscus Comments** — Community discussions on every article
- 🤖 **Auto Translation** — DeepL-powered title & summary translation

## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Neon PostgreSQL + Drizzle ORM
- **i18n:** next-intl
- **Charts:** Recharts
- **Deployment:** Vercel

## Quick Start

```bash
npm install
npx drizzle-kit migrate
npm run db:seed
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
DEEPL_API_KEY=your-deepl-key
GOOGLE_TRANSLATE_API_KEY=your-google-key
CRON_SECRET=random-secret
NEXT_PUBLIC_GISCUS_REPO=your-username/great-byd
```
