const categoryKeywords: Record<number, string[]> = {
  1: ['launch', 'new model', 'debut', ' unveil', 'revealed', 'song', 'seal', 'atto', 'tang', 'han', 'qin', 'dolphin', 'seagull'], // new-car
  2: ['sales', 'sold', 'delivery', 'monthly', 'quarterly', 'market share', 'best seller'], // sales
  3: ['blade', 'battery', 'dm-i', 'e-platform', 'technology', 'innovation', 'patent', ' charging'], // technology
  4: ['charging station', 'supercharger', 'plug', 'infrastructure', 'charger'], // charging
  5: ['overseas', 'export', 'europe', 'thailand', 'brazil', 'indonesia', 'turkey', 'mexico', 'australia'], // overseas
};

export function autoClassify(title: string, summary: string | null): number | null {
  const text = (title + ' ' + (summary || '')).toLowerCase();

  for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return parseInt(categoryId);
    }
  }

  return null;
}
