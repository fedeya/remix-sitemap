import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './types';
import { getEntry } from './utils';
import { isEqual } from 'ufo';

export type { SitemapHandle, RemixSitemapConfig } from './types';

export const createSitemapGenerator = (config: RemixSitemapConfig) => {
  const defaultConfig: RemixSitemapConfig = {
    ...config,
    autoLastmod: config.autoLastmod ?? true,
    changefreq: config.changefreq ?? 'daily',
    priority: config.priority ?? 0.7,
    sitemapBaseFileName: config.sitemapBaseFileName ?? 'sitemap'
  };

  return {
    sitemap: (request: Request, context: EntryContext) =>
      sitemapGenerator(defaultConfig, request, context),

    isSitemapUrl(request: Request) {
      const url = new URL(request.url);

      return isEqual(url.pathname, `/${defaultConfig.sitemapBaseFileName}.xml`);
    }
  };
};

const sitemapGenerator = async (
  config: RemixSitemapConfig,
  request: Request,
  context: EntryContext
) => {
  const modules = context.routeModules;

  const urls = await Promise.all(
    Object.keys(modules).map(key => getEntry(config, key, context, request))
  );

  const set = `
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    ${urls.join('')}
  </urlset>
  `.trim();

  const bytes = new TextEncoder().encode(set).byteLength;

  const headers = new Headers(config.headers);

  headers.set('Content-Type', 'application/xml');
  headers.set('Content-Length', bytes.toString());

  return new Response(set, {
    headers
  });
};
