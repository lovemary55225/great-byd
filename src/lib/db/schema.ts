import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

export const newsRelations = relations(news, ({ one }) => ({
  category: one(categories, {
    fields: [news.categoryId],
    references: [categories.id],
  }),
  source: one(sources, {
    fields: [news.sourceId],
    references: [sources.id],
  }),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  category: one(categories, {
    fields: [sources.categoryId],
    references: [categories.id],
  }),
  news: many(news),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  news: many(news),
  sources: many(sources),
}));
