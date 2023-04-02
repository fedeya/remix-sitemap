import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './lib/types';
import { getOptionalSegmentData, getRouteData } from './utils/data';
import { getOptionalSegmentEntries } from './utils/entries';
import { isValidEntry, isValidEntryV2 } from './utils/validations';
import { buildSitemapUrl } from './builders/sitemap';

export async function sitemapResponse(
  config: RemixSitemapConfig,
  request: Request,
  context: EntryContext
) {
  const sitemap = await getSitemap({
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

export type GetSitemapParams = {
  config: RemixSitemapConfig;
  context: EntryContext;
  request: Request;
};

export async function getSitemap(params: GetSitemapParams) {
  const { config, context, request } = params;

  const routes = Object.keys(context.manifest.routes);

  const entriesPromise = routes.map(route =>
    getEntry({ route, config, context, request })
  );

  const entries = await Promise.all(entriesPromise);

  const sitemap = /* xml */ `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    ${entries.join('')}
  </urlset>
  `.trim();

  return sitemap;
}

export type GetEntryParams = GetSitemapParams & {
  route: string;
};

export async function getEntryV2(params: GetEntryParams) {
  const { route, context, request, config } = params;

  if (!isValidEntryV2(route, context)) return '';

  const { sitemapFunction, path } = getRouteData(route, context);

  const sitemap = sitemapFunction
    ? await sitemapFunction({ request, config })
    : null;

  if (sitemap) {
    if (Array.isArray(sitemap)) {
      const notExcluded = sitemap.filter(entry => !entry.exclude);

      return notExcluded
        .map(entry => buildSitemapUrl({ config, entry }))
        .join('');
    }

    if (sitemap.exclude) return '';

    return buildSitemapUrl({ config, entry: sitemap });
  }

  return buildSitemapUrl({ config, entry: { loc: path } });
}

export async function getEntry(params: GetEntryParams) {
  const { route, context, request, config } = params;

  if (config.future?.sitemapFunction) return getEntryV2(params);

  if (!isValidEntry(route, context)) return '';

  const { handle, path } = getRouteData(route, context);

  const entriesPromise = handle.generateEntries
    ? handle.generateEntries(request)
    : null;

  const segments = getOptionalSegmentData({
    config,
    context,
    route
  });

  const entries = entriesPromise ? await entriesPromise : null;

  if (segments)
    return getOptionalSegmentEntries({
      config,
      context,
      route,
      segments,
      entries
    });

  if (entries)
    return entries?.map(entry => buildSitemapUrl({ config, entry })).join('');

  return buildSitemapUrl({ config, entry: { loc: path } });
}
