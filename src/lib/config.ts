import type { Config } from './types';

export const getConfig = (config: Config) => {
  return {
    ...config,
    autoLastmod: config.autoLastmod ?? true,
    changefreq: config.changefreq ?? 'daily',
    priority: config.priority ?? 0.7,
    sitemapBaseFileName: config.sitemapBaseFileName ?? 'sitemap',
    outDir: config.outDir ?? 'public',
    robotsTxtOptions: {
      ...(config.robotsTxtOptions || {}),
      policies: config.robotsTxtOptions?.policies ?? [
        {
          userAgent: '*',
          allow: '/'
        }
      ]
    }
  };
};
