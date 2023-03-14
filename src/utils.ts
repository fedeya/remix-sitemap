import {
  AssetsManifest,
  Handle,
  RemixSitemapConfig,
  RouteModules,
  SitemapEntry
} from './types';
import { cleanDoubleSlashes } from 'ufo';

export const getEntryXml = (
  config: RemixSitemapConfig,
  entry?: SitemapEntry
) => `
  <url>
    <loc>${cleanDoubleSlashes(`${config.siteUrl}/${entry?.route}`)}</loc>
    ${
      config.autoLastmod || entry?.lastmod
        ? `<lastmod>${entry?.lastmod ?? new Date().toISOString()}</lastmod>`
        : ''
    }
    <changefreq>${entry?.changefreq ?? config.changefreq}</changefreq>
    <priority>${entry?.priority ?? config.priority}</priority>
  </url>
`;

export const getEntry = async (
  config: RemixSitemapConfig,
  key: string,
  modules: RouteModules,
  manifest: AssetsManifest,
  request: Request
) => {
  const routeManifest = manifest.routes[key];

  if (routeManifest.id === 'root') return '';

  const entry = modules[key];

  const handle: Handle = entry.handle?.sitemap || {};

  if (handle.exclude) return '';

  const parents = routeManifest.parentId?.split('/');

  const path = routeManifest.index ? '' : routeManifest.path;

  if (path?.includes(':') && !handle.generateEntries) return '';

  const optionalPathValues: Record<string, string[]> = {};

  if (parents && parents.length > 1) {
    parents?.forEach((partialId, index) => {
      if (index === 0) return [];

      const parentId = new Array(index)
        .fill(1)
        .map((_, i) => parents[i])
        .concat(partialId)
        .join('/');

      const module = modules[parentId];

      const handle: Handle = module?.handle?.sitemap || {};

      if (handle.values) {
        optionalPathValues[partialId] = handle.values;
      }
    });
  }

  const optionalPaths = Object.keys(optionalPathValues);

  const entries = handle.generateEntries
    ? await handle.generateEntries(request)
    : null;

  if (optionalPaths.length === 0) {
    if (!entries) return getEntryXml(config, { route: path });

    return entries.map(entry => getEntryXml(config, entry)).join(`\n`);
  }

  const xml = optionalPaths.map(optionalPath => {
    const pathValues = optionalPathValues[optionalPath];

    const finalEntry = pathValues.map(value => {
      const parentPath = routeManifest.parentId
        ?.replace(optionalPath, value)
        .split('/');

      parentPath?.shift();

      const joinedPath = parentPath?.join('/');

      if (!entries) {
        return getEntryXml(config, {
          route: `${joinedPath}/${path}`
        });
      } else {
        return entries
          .map(entry =>
            getEntryXml(config, {
              ...entry,
              route: `${joinedPath}/${entry.route}`
            })
          )
          .join('\n');
      }
    });

    const pathWithoutOptional = routeManifest.parentId
      ?.replace(optionalPath, '')
      .split('/');

    pathWithoutOptional?.shift();

    const joinedPathWithoutOptional = pathWithoutOptional?.join('/');

    const fullPath = `${joinedPathWithoutOptional}/${path}`;

    if (fullPath && !fullPath.includes(':')) {
      finalEntry.push(
        getEntryXml(config, {
          route: `${joinedPathWithoutOptional}/${path}`
        })
      );
    }

    return finalEntry.join(`\n`);
  });

  return xml.join('\n');
};
