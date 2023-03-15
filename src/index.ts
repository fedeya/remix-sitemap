import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './lib/types';
import { sitemapResponse } from './sitemap';
import { isSitemapUrl } from './utils/validations';

export { SitemapHandle, RemixSitemapConfig } from '~/lib/types';

export const createSitemapGenerator = (config: RemixSitemapConfig) => {
  const defaultConfig = {
    ...config,
    autoLastmod: config.autoLastmod ?? true,
    changefreq: config.changefreq ?? 'daily',
    priority: config.priority ?? 0.7,
    sitemapBaseFileName: config.sitemapBaseFileName ?? 'sitemap'
  };

  return {
    sitemap: (request: Request, context: EntryContext) =>
      sitemapResponse(defaultConfig, request, context),

    isSitemapUrl: (request: Request) => isSitemapUrl(defaultConfig, request)
  };
};
