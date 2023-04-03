import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig, SitemapEntry } from '../lib/types';
import { getOptionalSegmentData, getRouteData } from './data';
import { buildSitemapUrl } from '../builders/sitemap';
import { isDynamicPath, isLegacyValidEntry, isValidEntry } from './validations';
import type { GetSitemapParams } from '../builders/sitemap';

export type GetEntryParams = GetSitemapParams & {
  route: string;
};

export async function getEntry(params: GetEntryParams) {
  const { route, context, request, config } = params;

  if (!isValidEntry(route, context)) return '';

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

    return buildSitemapUrl({
      config,
      entry: { ...sitemap, loc: sitemap.loc || path }
    });
  }

  return buildSitemapUrl({ config, entry: { loc: path } });
}

/**
 * @deprecated
 */
export async function getLegacyEntry(params: GetEntryParams) {
  const { route, context, request, config } = params;

  if (!isLegacyValidEntry(route, context)) return '';

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

type GetOptionalSegmentEntriesParams = {
  segments: Record<string, string[]>;
  config: RemixSitemapConfig;
  route: string;
  context: EntryContext;
  entries?: SitemapEntry[] | null;
};

export function getOptionalSegmentEntries(
  params: GetOptionalSegmentEntriesParams
) {
  const { segments, config, context, route, entries } = params;

  const { parentId, path } = getRouteData(route, context);

  const optionalPathValues = Object.keys(segments);

  const xml = optionalPathValues?.map(optionalPath => {
    const pathValues = segments[optionalPath];

    const finalEntry = pathValues?.map(value => {
      const parentPath = parentId
        ?.replace(optionalPath, value)
        .split('/')
        .splice(1)
        .join('/');

      if (!entries) {
        return buildSitemapUrl({
          config,
          entry: {
            loc: `${parentPath}/${path}`
          }
        });
      } else {
        return entries?.map(entry =>
          buildSitemapUrl({
            config,
            entry: {
              ...entry,
              loc: `${parentPath}/${entry.loc}`
            }
          })
        );
      }
    });

    const pathWithoutOptional = parentId
      ?.replace(optionalPath, '')
      .split('/')
      .splice(1)
      .join('/');

    const fullPath = `${pathWithoutOptional}/${path}`;

    if (fullPath && !isDynamicPath(fullPath)) {
      finalEntry.push(
        buildSitemapUrl({
          config,
          entry: {
            loc: fullPath
          }
        })
      );
    }

    entries?.forEach(entry => {
      finalEntry.push(
        buildSitemapUrl({
          config,
          entry: {
            ...entry,
            loc: `${pathWithoutOptional}/${entry.loc}`
          }
        })
      );
    });

    return finalEntry;
  });

  return xml.flat().join('');
}
