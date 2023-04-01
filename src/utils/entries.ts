import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig, SitemapEntry } from '../lib/types';
import { getRouteData } from './data';
import { buildSitemapUrl } from '../builders/sitemap';
import { isDynamicPath } from './validations';

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
