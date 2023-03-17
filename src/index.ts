import type { EntryContext } from '@remix-run/server-runtime';
import type { Config } from './lib/types';
import { sitemapResponse } from './sitemap';
import { isSitemapUrl } from './utils/validations';
import { getConfig } from './lib/config';

export { SitemapHandle, RemixSitemapConfig, Config } from './lib/types';

export const createSitemapGenerator = (config: Config) => {
  const defaultConfig = getConfig(config);

  return {
    sitemap: (request: Request, context: EntryContext) =>
      sitemapResponse(defaultConfig, request, context),

    isSitemapUrl: (request: Request) => isSitemapUrl(defaultConfig, request)
  };
};
