import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './lib/types';
import { buildSitemap } from './builders/sitemap';

export async function sitemapResponse(
  config: RemixSitemapConfig,
  request: Request,
  context: EntryContext
) {
  const sitemap = await buildSitemap({
    config,
    context,
    request
  });

  const bytes = new TextEncoder().encode(sitemap).byteLength;

  return new Response(sitemap, {
    headers: {
      ...(config.headers || {}),
      'Content-Type': 'application/xml',
      'Content-Length': bytes.toString()
    }
  });
}
