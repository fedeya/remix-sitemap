type ChangeFreq =
  | 'never'
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly'
  | 'always';

type Priority = 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export interface RemixSitemapConfig {
  /**
   * The base URL of your site.
   */
  siteUrl: string;

  /**
   * Add <lastmod/> property.
   * @default true
   */
  autoLastmod?: boolean;

  /**
   * Change frequency of all pages.
   * @default 'daily'
   */
  changefreq?: ChangeFreq;

  /**
   * Priority of all pages.
   * @default 0.7
   */
  priority?: Priority;

  /**
   * The base file name of the sitemap.
   */
  sitemapBaseFileName?: string;

  alternateRefs?: AlternateRef[];

  optionalSegments?: Record<string, string[]>;

  /**
   * Headers to be added to the sitemap response.
   */
  headers?: HeadersInit;
}

export interface SitemapEntry {
  loc: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
  alternateRefs?: AlternateRef[];
  images?: Image[];
  news?: News[];
  videos?: Video[];
}

export interface Video {
  thumbnailLoc: string;
  title: string;
  description: string;
  contentLoc: string;
  playerLoc: string;

  restriction: {
    relationship: 'allow' | 'deny';
    countries: string[];
  };
  duration?: number;
  expirationDate?: string | Date;
  rating?: number;
  viewCount?: number;
  publicationDate?: string | Date;
  familyFriendly?: boolean;
  tags?: string[];
  galleryTitle?: string;
  requiresSubscription?: boolean;
  price?: {
    currency: string;
    value: number;
  };
  uploader?: {
    name: string;
    info?: string;
  };
  platform?: string;
  live?: boolean;
}

export interface Image {
  loc: string;
}

export interface News {
  title: string;
  date: string | Date;
  publication: {
    name: string;
    language: string;
  };
}

export interface AlternateRef {
  href: string;
  hreflang: string;
}

export interface SitemapHandle {
  sitemap?: Handle;
}

export interface Handle {
  values?: string[];
  exclude?: boolean;
  generateEntries?(request: Request): Promise<SitemapEntry[]>;
  addOptionalSegments?: boolean;
}
