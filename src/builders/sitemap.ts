import { XMLBuilder } from 'fast-xml-parser';
import { cleanDoubleSlashes } from 'ufo';
import type {
  SitemapEntry,
  AlternateRef,
  News,
  Image,
  Video,
  Config
} from '../lib/types';
import { getBooleanValue, getOptionalValue } from '../utils/xml';
import type { EntryContext } from '@remix-run/server-runtime';
import { getEntry } from '../utils/entries';
import { truthy } from '../utils/truthy';
import { chunk } from '../utils/chunk';

export const getAlternateRef = (alternateRefs: AlternateRef) => ({
  '@_rel': 'alternate',
  '@_hreflang': alternateRefs.hreflang,
  '@_href': cleanDoubleSlashes(alternateRefs.href)
});

export const getImage = (image: Image) => ({
  'image:loc': image.loc
});

export const getVideo = (video: Video) => ({
  'video:thumbnail_loc': video.thumbnailLoc,
  'video:title': video.title,
  'video:description': video.description,
  'video:content_loc': video.contentLoc,
  'video:player_loc': video.playerLoc,
  'video:duration': video.duration,
  'video:expiration_date': video.expirationDate,
  'video:rating': video.rating,
  'video:view_count': video.viewCount,
  'video:publication_date': video.publicationDate,
  'video:family_friendly': getBooleanValue(video.familyFriendly),
  'video:restriction': getOptionalValue(video.restriction, {
    '@_relationship': video.restriction?.relationship,
    '#text': video.restriction?.countries.join(' ')
  }),
  'video:price': getOptionalValue(video.price, {
    '@_currency': video.price?.currency,
    '#text': video.price?.value
  }),
  'video:requires_subscription': getBooleanValue(video.requiresSubscription),
  'video:platform': getOptionalValue(video.platform, {
    '@_relationship': video.platform?.relationship,
    '#text': video.platform?.content?.join(' ')
  }),
  'video:uploader': getOptionalValue(video.uploader, {
    '@_info': video.uploader?.info,
    '#text': video.uploader?.name
  }),
  'video:live': getBooleanValue(video.live),
  'video:tag': video.tags
});

export const getNews = (news: News) => ({
  'news:publication': {
    'news:name': news.publication.name,
    'news:language': news.publication.language
  },
  'news:publication_date': news.date,
  'news:title': news.title
});

export const getUrl = (entry: SitemapEntry) => ({
  loc: cleanDoubleSlashes(entry.loc),
  lastmod: entry.lastmod,
  changefreq: entry.changefreq,
  priority: entry.priority,
  'xhtml:link': entry.alternateRefs?.map(getAlternateRef),
  'image:image': entry.images?.map(getImage),
  'news:news': entry.news?.map(getNews),
  'video:video': entry.videos?.map(getVideo)
});

export type BuildSitemapUrlParams = {
  config: Config;
  entry?: SitemapEntry;
};

export function buildSitemapUrl({ config, entry }: BuildSitemapUrlParams) {
  const alternateRefs = (entry?.alternateRefs || config.alternateRefs)?.map(
    ref => ({
      ...ref,
      href: ref.absolute ? ref.href : `${ref.href}/${entry?.loc}`
    })
  );

  const url = getUrl({
    loc: `${config.siteUrl}/${entry?.loc}`,
    lastmod: config.autoLastmod
      ? entry?.lastmod ?? new Date().toISOString()
      : entry?.lastmod,
    changefreq: entry?.changefreq ?? config.changefreq,
    priority: entry?.priority ?? config.priority,
    alternateRefs,
    videos: entry?.videos,
    images: entry?.images,
    news: entry?.news
  });

  return url;
}

type Urlset = ReturnType<typeof buildSitemapUrl>[];

export function buildSitemapXml(urlset: Urlset, format?: boolean): string {
  const builder = new XMLBuilder({
    suppressEmptyNode: true,
    ignoreAttributes: false,
    processEntities: false,
    format
  });

  return builder.build({
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8'
    },
    urlset: {
      '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      '@_xmlns:news': 'http://www.google.com/schemas/sitemap-news/0.9',
      '@_xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
      '@_xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
      '@_xmlns:video': 'http://www.google.com/schemas/sitemap-video/1.1',
      url: urlset
    }
  });
}

export type GetSitemapParams = {
  config: Config;
  context: EntryContext;
  request: Request;
};

export async function buildSitemap(params: GetSitemapParams): Promise<string> {
  const { config, context, request } = params;

  const routes = Object.keys(context.manifest.routes);

  const entriesPromise = routes.map(route =>
    getEntry({ route, config, context, request })
  );

  const entries = (await Promise.all(entriesPromise)).flat().flat();

  return buildSitemapXml(entries.filter(truthy), config.format);
}

export async function buildSitemaps(params: GetSitemapParams) {
  const { config, context, request } = params;

  const routes = Object.keys(context.manifest.routes);

  const entriesPromise = routes.map(route =>
    getEntry({ route, config, context, request })
  );

  const entries = (await Promise.all(entriesPromise))
    .flat()
    .flat()
    .filter(truthy);

  const sitemaps = chunk(entries, config.size!);

  return sitemaps.map(urls => {
    return buildSitemapXml(urls, config.format);
  }, []);
}

export function buildSitemapIndex(sitemaps: string[], config: Config): string {
  const builder = new XMLBuilder({
    suppressEmptyNode: true,
    ignoreAttributes: false,
    processEntities: false,
    format: config.format
  });

  return builder.build({
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8'
    },
    sitemapindex: {
      '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      sitemap: sitemaps.map(sitemap => ({
        loc: cleanDoubleSlashes(`${config.siteUrl}/${sitemap}`)
      }))
    }
  });
}
