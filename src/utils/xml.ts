import { cleanDoubleSlashes } from 'ufo';
import type {
  SitemapEntry,
  AlternateRef,
  RemixSitemapConfig
} from '~/lib/types';
import xml from 'xml';
import { truthy } from './truthy';

export const getAlternateRef = (alternateRefs: AlternateRef) => ({
  'xhtml:link': {
    _attr: {
      rel: 'alternate',
      hreflang: alternateRefs.hreflang,
      href: cleanDoubleSlashes(alternateRefs.href)
    }
  }
});

export const getUrlXml = (entry: SitemapEntry) =>
  xml({
    url: [
      {
        loc: cleanDoubleSlashes(entry.loc)
      },
      entry.lastmod && {
        lastmod: entry.lastmod
      },
      entry.changefreq && {
        changefreq: entry.changefreq
      },
      entry.priority && {
        priority: entry.priority
      },
      ...(entry.alternateRefs || []).map(getAlternateRef)
    ].filter(truthy)
  });

export type GetEntryXmlParams = {
  config: RemixSitemapConfig;
  entry?: SitemapEntry;
};

export function getEntryXml({ config, entry }: GetEntryXmlParams) {
  const alternateRefs = (entry?.alternateRefs || config.alternateRefs)?.map(
    ref => ({
      ...ref,
      href: `${ref.href}/${entry?.loc}`
    })
  );

  return getUrlXml({
    loc: `${config.siteUrl}/${entry?.loc}`,
    lastmod: config.autoLastmod
      ? entry?.lastmod ?? new Date().toISOString()
      : entry?.lastmod,
    changefreq: entry?.changefreq ?? config.changefreq,
    priority: entry?.priority ?? config.priority,
    alternateRefs
  });
}
