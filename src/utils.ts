import { Handle, RemixSitemapConfig, SitemapEntry } from './types';
import { cleanDoubleSlashes } from 'ufo';
import { EntryContext } from '@remix-run/server-runtime';

export const getEntryXml = (
  config: RemixSitemapConfig,
  entry?: SitemapEntry
) => {
  const alternateRefs = entry?.alternateRefs || config.alternateRefs;

  const alternateRefsXml = alternateRefs
    ?.map(
      ref => `
    <xhtml:link
      rel="alternate"
      hreflang="${ref.hreflang}"
      href="${cleanDoubleSlashes(`${ref.href}/${entry?.loc}`)}"
    />
  `
    )
    .join('');

  return `
    <url>
      <loc>${cleanDoubleSlashes(`${config.siteUrl}/${entry?.loc}`)}</loc>
      ${alternateRefsXml ? alternateRefsXml : ''}
      ${
        config.autoLastmod || entry?.lastmod
          ? `<lastmod>${entry?.lastmod ?? new Date().toISOString()}</lastmod>`
          : ''
      }
      <changefreq>${entry?.changefreq ?? config.changefreq}</changefreq>
      <priority>${entry?.priority ?? config.priority}</priority>
    </url>
  `.trim();
};

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

  if (!entry.default && !handle.generateEntries) return '';

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
    if (!entries) return getEntryXml(config, { loc: path! });

    return entries.map(entry => getEntryXml(config, entry)).join('');
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
          loc: `${parentPath}/${path}`
        });
      } else {
        return entries.map(entry =>
          getEntryXml(config, {
            ...entry,
            loc: `${parentPath}/${entry.loc}`
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

    if (fullPath && !fullPath.includes(':')) {
      finalEntry.push(
        getEntryXml(config, {
          loc: fullPath
        })
      );
    }

    if (entries) {
      entries.forEach(entry => {
        finalEntry.push(
          getEntryXml(config, {
            ...entry,
            loc: `${pathWithoutOptional}/${entry.loc}`
          })
        );
      });
    }

    return finalEntry;
  });

  return xml.flat().join('');
};
