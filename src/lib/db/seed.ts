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
    { name: 'Electrek', rssUrl: 'https://electrek.co/feed/', categoryId: 1, isActive: true },
    { name: 'InsideEVs', rssUrl: 'https://insideevs.com/rss.xml', categoryId: 3, isActive: true },
    { name: 'CleanTechnica', rssUrl: 'https://cleantechnica.com/feed/', categoryId: 3, isActive: true },
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
