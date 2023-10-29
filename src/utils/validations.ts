import { isEqual } from 'ufo';
import type { RemixSitemapConfig, EntryContext } from '../lib/types';
import { getRouteData } from './data';

export function isSitemapUrl(config: RemixSitemapConfig, request: Request) {
  const url = new URL(request.url);

  return isEqual(url.pathname, `/${config.sitemapBaseFileName}.xml`);
}

export const isDynamicPath = (path?: string) =>
  path?.includes(':') || path?.includes('*');

export const isRobotsUrl = (request: Request) => {
  const url = new URL(request.url);

  return isEqual(url.pathname, `/robots.txt`);
};

export function isValidEntry(route: string, context: EntryContext) {
  const { manifest, path, module, sitemapFunction } = getRouteData(
    route,
    context
  );

  if (manifest.id === 'root') return false;

  if (typeof path === 'undefined' && !sitemapFunction) return false;

  if (!module.default && !sitemapFunction) return false;

  if (isDynamicPath(path) && !sitemapFunction) return false;

  return true;
}
