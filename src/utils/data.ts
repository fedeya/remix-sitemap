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

  const defaultHandle = {
    ...(handle.sitemap || {}),
    addOptionalSegments: handle.sitemap?.addOptionalSegments ?? true
  };

  const path = manifest.index ? '' : manifest.path ?? '';

  const parents = manifest.id?.split('/').slice(0, -1);

  const parentId = parents.join('/');

  return {
    manifest,
    module,
    modules: context.routeModules,
    handle: defaultHandle,
    sitemapFunction: module?.sitemap,
    path,
    parents,
    parentId
  };
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

  if (!handle.addOptionalSegments || !parents || parents.length <= 1)
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
