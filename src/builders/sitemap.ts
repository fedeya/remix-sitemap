import { XMLBuilder } from 'fast-xml-parser';
import { cleanDoubleSlashes } from 'ufo';
import type {
  SitemapEntry,
  AlternateRef,
  News,
  Image,
  Video,
  RemixSitemapConfig
} from '../lib/types';
import { getBooleanValue, getOptionalValue } from '../utils/xml';

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
  'video:family_friendly': video.familyFriendly
    ? getBooleanValue(video.familyFriendly)
    : undefined,
  'video:restriction': getOptionalValue(video.restriction, {
    '@_relationship': video.restriction?.relationship,
    '#text': video.restriction?.countries.join(' ')
  }),
  'video:price': getOptionalValue(video.price, {
    '@_currency': video.price?.currency,
    '#text': video.price?.value
  }),
  'video:requires_subscription':
    typeof video.requiresSubscription !== 'undefined'
      ? getBooleanValue(video.requiresSubscription)
      : undefined,
  'video:platform': getOptionalValue(video.platform, {
    '@_relationship': video.platform?.relationship,
    '#text': video.platform?.content?.join(' ')
  }),
  'video:uploader': getOptionalValue(video.uploader, {
    '@_info': video.uploader?.info,
    '#text': video.uploader?.name
  }),
  'video:live':
    typeof video.live !== 'undefined' ? getBooleanValue(video.live) : undefined,
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
  url: {
    loc: cleanDoubleSlashes(entry.loc),
    lastmod: entry.lastmod,
    changefreq: entry.changefreq,
    priority: entry.priority,
    'xhtml:link': entry.alternateRefs?.map(getAlternateRef),
    'image:image': entry.images?.map(getImage),
    'news:news': entry.news?.map(getNews),
    'video:video': entry.videos?.map(getVideo)
  }
});

export type BuildSitemapUrlParams = {
  config: RemixSitemapConfig;
  entry?: SitemapEntry;
};

export function buildSitemapUrl({ config, entry }: BuildSitemapUrlParams) {
  const alternateRefs = (entry?.alternateRefs || config.alternateRefs)?.map(
    ref => ({
      ...ref,
      href: ref.absolute ? ref.href : `${ref.href}/${entry?.loc}`
    })
  );

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    processEntities: false,
    suppressEmptyNode: true
  });

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

  return builder.build(url);
}
