import { cleanDoubleSlashes } from 'ufo';
import type {
  SitemapEntry,
  AlternateRef,
  RemixSitemapConfig
} from '~/lib/types';

export const getAlternateRefXml = (alternateRefs: AlternateRef) => /* xml */ `
  <xhtml:link
    rel="alternate"
    hreflang="${alternateRefs.hreflang}"
    href="${cleanDoubleSlashes(alternateRefs.href)}"
  />
`;

export const getAlternateRefsXml = (alternateRefs: AlternateRef[]) =>
  alternateRefs.map(getAlternateRefXml).join('');

export const getUrlXml = (url: SitemapEntry) => /* xml */ `
  <url>
    <loc>${cleanDoubleSlashes(url.loc)}</loc>
    ${getAlternateRefsXml(url.alternateRefs ?? [])}
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>
`;

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
