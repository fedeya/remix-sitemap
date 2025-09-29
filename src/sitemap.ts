import type { RemixSitemapConfig, EntryContext } from './lib/types';
import { buildSitemap } from './builders/sitemap';
import { AppLoadContext } from '@remix-run/server-runtime';

export async function sitemapResponse(
  config: RemixSitemapConfig,
  request: Request,
  context: EntryContext,
  appContext: AppLoadContext,
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
    request,
    appContext,
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
