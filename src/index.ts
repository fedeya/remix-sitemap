import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './types';
import { getEntry } from './utils';

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

      return url.pathname === `/${defaultConfig.sitemapBaseFileName}.xml`;
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
    Object.keys(modules).map(key =>
      getEntry(config, key, modules, context.manifest, request)
    )
  );

  const set = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    ${urls.join('\n')}
    </urlset>
  `;

  return new Response(set, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};
