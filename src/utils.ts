import { Handle, RemixSitemapConfig, SitemapEntry } from './types';
import { cleanDoubleSlashes } from 'ufo';
import { EntryContext } from '@remix-run/server-runtime';

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
  context: EntryContext,
  request: Request
) => {
  const routeManifest = context.manifest.routes[key];

  if (routeManifest.id === 'root') return '';

  const modules = context.routeModules;

  const entry = modules[key];

  const sitemapHandle: Handle = entry?.handle?.sitemap || {};

  const handle: Handle = {
    ...sitemapHandle,
    addOptionalSegments: sitemapHandle.addOptionalSegments ?? true
  };

  if (handle.exclude) return '';

  const parents = routeManifest.id?.split('/').slice(0, -1);

  const parentId = parents.join('/');

  const path = routeManifest.index ? '' : routeManifest.path;

  if (path?.includes(':') && !handle.generateEntries) return '';

  const optionalPathValues: Record<string, string[]> = {};

  if (handle.addOptionalSegments && parents && parents.length > 1) {
    parents?.forEach((partialId, index) => {
      if (index === 0) return [];

      const parentId = new Array(index)
        .fill(1)
        .map((_, i) => parents[i])
        .concat(partialId)
        .join('/');

      const module = modules[parentId];

      const handle: Handle = module?.handle?.sitemap || {};

      const values =
        handle.values || (config.optionalSegments || {})[partialId];

      if (values) optionalPathValues[partialId] = values;
    });
  }

  const optionalPaths = Object.keys(optionalPathValues);

  const entries = handle.generateEntries
    ? await handle.generateEntries(request)
    : null;

  if (optionalPaths.length === 0) {
    if (!entries) return getEntryXml(config, { route: path! });

    return entries.map(entry => getEntryXml(config, entry)).join(`\n`);
  }

  const xml = optionalPaths.map(optionalPath => {
    const pathValues = optionalPathValues[optionalPath];

    const finalEntry = pathValues.map(value => {
      const parentPath = parentId
        ?.replace(optionalPath, value)
        .split('/')
        .splice(1)
        .join('/');

      if (!entries) {
        return getEntryXml(config, {
          route: `${parentPath}/${path}`
        });
      } else {
        return entries
          .map(entry =>
            getEntryXml(config, {
              ...entry,
              route: `${parentPath}/${entry.route}`
            })
          )
          .join('\n');
      }
    });

    const pathWithoutOptional = parentId
      ?.replace(optionalPath, '')
      .split('/')
      .splice(1)
      .join('/');

    const fullPath = `${pathWithoutOptional}/${path}`;

    if (fullPath && !fullPath.includes(':')) {
      finalEntry.push(
        getEntryXml(config, {
          route: fullPath
        })
      );
    }

    if (entries) {
      entries.forEach(entry => {
        finalEntry.push(
          getEntryXml(config, {
            ...entry,
            route: `${pathWithoutOptional}/${entry.route}`
          })
        );
      });
    }

    return finalEntry.join(`\n`);
  });

  return xml.join('\n');
};
