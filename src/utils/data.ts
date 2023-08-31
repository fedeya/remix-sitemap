import type { EntryContext } from '@remix-run/server-runtime';
import type {
  Handle,
  RemixSitemapConfig,
  SitemapFunction,
  SitemapHandle
} from '../lib/types';

export function getRouteData(route: string, context: EntryContext) {
  const manifest = context.manifest.routes[route];

  const module = context.routeModules[
    route
  ] as (typeof context.routeModules)[string] & { sitemap?: SitemapFunction };

  const handle: SitemapHandle = module?.handle || {};

  console.log(context.manifest.routes);

  const defaultHandle = handle.sitemap
    ? {
        ...(handle.sitemap || {}),
        addOptionalSegments: handle.sitemap?.addOptionalSegments ?? true
      }
    : undefined;

  const path = getFullPath(route, context.manifest.routes);

  const parents = manifest.id?.split('/').slice(0, -1);

  const parentId = parents.join('/');

  return {
    manifest,
    module,
    modules: context.routeModules,
    /**
     * @deprecated
     */
    handle: defaultHandle,
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

    // check for pathless layout with index route or root parent
    if (!manifest.path && !parent) return '';

    if (manifest.path) {
      if (parent) {
        return `${parent}/${manifest.path}`;
      }

      return manifest.path;
    }

    return undefined;
  }

  if (!manifest.parentId || manifest.parentId === 'root' || !manifest.path)
    return manifest.path;

  const parent = getFullPath(manifest.parentId, routes);

  if (parent) {
    return `${parent}/${manifest.path}`;
  }

  return manifest.path;
}

type GetOptionalSegmentDataParams = {
  route: string;
  context: EntryContext;
  config: RemixSitemapConfig;
};

export function getOptionalSegmentData(params: GetOptionalSegmentDataParams) {
  const { route, config, context } = params;

  const { parents, handle, modules } = getRouteData(route, context);

  const values: Record<string, string[]> = {};

  if (!handle?.addOptionalSegments || !parents || parents.length <= 1)
    return null;

  parents.forEach((partialId, index) => {
    if (index === 0) return [];

    const parentId = new Array(index)
      .fill(1)
      .map((_, i) => parents[i])
      .concat(partialId)
      .join('/');

    const module = modules[parentId];

    const handle: Handle = module?.handle?.sitemap || {};

    const handleValues =
      handle.values || (config.optionalSegments || {})[partialId];

    if (handleValues) values[partialId] = handleValues;
  });

  return Object.keys(values).length > 0 ? values : null;
}
