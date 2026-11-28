const envUrl = process.env.SITE_URL;
const siteUrl =
  envUrl && !/localhost|127\.0\.0\.1/.test(envUrl)
    ? envUrl
    : 'https://encountermanager.com';

const PUBLIC_PAGES = {
  '/': { priority: 1.0, changefreq: 'weekly' },
  '/demo': { priority: 0.9, changefreq: 'weekly' },
  '/npc-generator': { priority: 0.9, changefreq: 'weekly' },
  '/loot-generator': { priority: 0.9, changefreq: 'weekly' },
  '/support': { priority: 0.3, changefreq: 'monthly' },
  '/privacy': { priority: 0.1, changefreq: 'yearly' },
  '/terms': { priority: 0.1, changefreq: 'yearly' },
};

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  trailingSlash: true,
  autoLastmod: true,
  sitemapSize: 7000,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    const page = PUBLIC_PAGES[path];
    if (!page) return null;

    return {
      loc: path,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: new Date().toISOString(),
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account-settings/', '/ingest/'],
      },
    ],
  },
};
