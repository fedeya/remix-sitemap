import { getRouteData } from './data';
import { buildSitemapUrl } from '../builders/sitemap';
import { isValidEntry } from './validations';
import type { GetSitemapParams } from '../builders/sitemap';

export type GetEntryParams = GetSitemapParams & {
  route: string;
};

export async function getEntry(params: GetEntryParams) {
  const { route, context, request, config, appContext } = params;

  if (!isValidEntry(route, context)) return null;

  const { sitemapFunction, path } = getRouteData(route, context);

  const sitemap = sitemapFunction
    ? await sitemapFunction({ request, config, context: appContext })
    : null;

  if (sitemap) {
    if (Array.isArray(sitemap)) {
      const notExcluded = sitemap.filter(entry => !entry.exclude);

      return notExcluded.map(entry => buildSitemapUrl({ config, entry }));
    }

    if (sitemap.exclude) return null;

    return buildSitemapUrl({
      config,
      entry: { ...sitemap, loc: sitemap.loc || path! }
    });
  }

  return buildSitemapUrl({ config, entry: { loc: path! } });
}
