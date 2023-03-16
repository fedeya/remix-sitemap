import { cleanDoubleSlashes } from 'ufo';
import type {
  SitemapEntry,
  AlternateRef,
  News,
  Image,
  Video,
  RemixSitemapConfig
} from '../lib/types';
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

export const getImage = (image: Image) => ({
  'image:image': [
    {
      'image:loc': image.loc
    }
  ]
});

export const getNews = (news: News) => ({
  'news:news': [
    {
      'news:publication': [
        {
          'news:name': news.publication.name
        },
        {
          'news:language': news.publication.language
        }
      ]
    },
    {
      'news:publication_date': news.date
    },
    {
      'news:title': news.title
    }
  ]
});

export const getVideo = (video: Video) => ({
  'video:video': [
    {
      'video:thumbnail_loc': video.thumbnailLoc
    },
    {
      'video:title': video.title
    },
    {
      'video:description': video.description
    },
    {
      'video:content_loc': video.contentLoc
    },
    {
      'video:player_loc': video.playerLoc
    },
    video.duration && {
      'video:duration': video.duration
    },
    video.expirationDate && {
      'video:expiration_date': video.expirationDate
    },
    video.rating && {
      'video:rating': video.rating
    },
    video.viewCount && {
      'video:view_count': video.viewCount
    },
    video.publicationDate && {
      'video:publication_date': video.publicationDate
    },
    typeof video.familyFriendly !== 'undefined' && {
      'video:family_friendly': video.familyFriendly ? 'yes' : 'no'
    },
    video.restriction && {
      'video:restriction': [
        {
          _attr: {
            relationship: video.restriction?.relationship
          }
        },
        video.restriction?.countries.join(' ')
      ]
    },
    video.price && {
      'video:price': [
        {
          _attr: {
            currency: video.price?.currency
          }
        },
        video.price?.value
      ]
    },
    typeof video.requiresSubscription !== 'undefined' && {
      'video:requires_subscription': video.requiresSubscription ? 'yes' : 'no'
    },
    video.uploader && {
      'video:uploader': [
        {
          _attr: {
            info: video.uploader?.info
          }
        },
        video.uploader?.name
      ]
    },
    typeof video.live !== 'undefined' && {
      'video:live': video.live ? 'yes' : 'no'
    },
    ...(video.tags || []).map(tag => ({
      'video:tag': tag
    }))
  ].filter(truthy)
});

export const getUrlXml = (entry: SitemapEntry) => {
  const url = [
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
    ...(entry.alternateRefs || []).map(getAlternateRef),
    ...(entry.images || []).map(getImage),
    ...(entry.news || []).map(getNews),
    ...(entry.videos || []).map(getVideo)
  ].filter(truthy);

  return xml({ url }, { indent: '  ' });
};

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
    alternateRefs,
    videos: entry?.videos,
    images: entry?.images,
    news: entry?.news
  });
}
