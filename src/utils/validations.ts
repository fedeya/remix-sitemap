import { EntryContext } from '@remix-run/server-runtime';
import { isEqual } from 'ufo';
import { RemixSitemapConfig } from '../lib/types';
import { getRouteData } from './data';

export function isSitemapUrl(config: RemixSitemapConfig, request: Request) {
  const url = new URL(request.url);

  return isEqual(url.pathname, `/${config.sitemapBaseFileName}.xml`);
}

export const isDynamicPath = (path?: string) =>
  path?.includes(':') || path?.includes('*');

export function isValidEntry(route: string, context: EntryContext) {
  const { manifest, handle, path, module } = getRouteData(route, context);

  if (manifest.id === 'root') return false;

  if (handle.exclude) return false;

  if (!module.default && !handle.generateEntries) return false;

  if (isDynamicPath(path) && !handle.generateEntries) return false;

  return true;
}
