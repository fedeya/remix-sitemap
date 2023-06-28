import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './lib/types';
import { buildSitemap } from './builders/sitemap';

export async function sitemapResponse(
  config: RemixSitemapConfig,
  request: Request,
  context: EntryContext
) {
  const { cache } = config;

  if (cache) {
    const cached = await cache.get();

    if (cached) {
      const bytes = new TextEncoder().encode(cached).byteLength;

      return new Response(cached, {
        headers: {
          ...(config.headers || {}),
          'Content-Type': 'application/xml',
          'Content-Length': bytes.toString()
        }
      });
    }
  }

  const sitemap = await buildSitemap({
    config,
    context,
    request
  });

  if (cache) await cache.set(sitemap);

  const bytes = new TextEncoder().encode(sitemap).byteLength;

  return new Response(sitemap, {
    headers: {
      ...(config.headers || {}),
      'Content-Type': 'application/xml',
      'Content-Length': bytes.toString()
    }
  });
}
