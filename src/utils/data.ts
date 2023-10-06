import type { EntryContext } from '@remix-run/server-runtime';
import type { SitemapFunction } from '../lib/types';

export function getRouteData(route: string, context: EntryContext) {
  const manifest = context.manifest.routes[route];

  const module = context.routeModules[
    route
  ] as (typeof context.routeModules)[string] & { sitemap?: SitemapFunction };

  const path = getFullPath(route, context.manifest.routes);

  const parents = manifest.id?.split('/').slice(0, -1);

  const parentId = parents.join('/');

  return {
    manifest,
    module,
    modules: context.routeModules,
    sitemapFunction: module?.sitemap,
    path,
    parents,
    parentId
  };
}

export function getFullPath(
  route: string,
  routes: Record<string, { parentId?: string; path?: string; index?: boolean }>
): string | undefined {
  const manifest = routes[route];

  if (manifest.index) {
    const parent = getFullPath(manifest.parentId || 'root', routes);

    // return empty path for (pathless layout/root layout) with index route
    if (!manifest.path && !parent) return '';

    if (manifest.path && parent) return `${parent}/${manifest.path}`;

    return manifest.path;
  }

  if (!manifest.parentId || manifest.parentId === 'root' || !manifest.path)
    return manifest.path;

  const parent = getFullPath(manifest.parentId, routes);

  if (parent) return `${parent}/${manifest.path}`;

  return manifest.path;
}
