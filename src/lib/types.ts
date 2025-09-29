import { AppLoadContext } from "@remix-run/server-runtime";

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
   * @default 'sitemap'
   */
  sitemapBaseFileName?: string;

  /**
   * Format the sitemap.
   */
  format?: boolean;

  /**
   * the xhtml:link properties.
   */
  alternateRefs?: AlternateRef[];

  /**
   * @deprecated not used anymore in sitemap function
   */
  optionalSegments?: Record<string, string[]>;

  /**
   * The directory where the sitemap will be generated.
   */
  outDir?: string;

  /**
   * Generate robots.txt file.
   * @default false
   */
  generateRobotsTxt?: boolean;

  /**
   * Generate sitemap index file.
   * @default true
   */
  generateIndexSitemap?: boolean;

  /**
   * Size limit of each sitemap file.
   */
  size?: number;

  /**
   * Options for robots.txt generation.
   */
  robotsTxtOptions?: RobotsTxtOptions;

  /**
   * Headers to be added to the sitemap response.
   */
  headers?: HeadersInit;

  /**
   * Limit the number of routes processed at a time
   */
  rateLimit?: number;

  /**
   * The cache to use.
   */
  cache?: Cache;

  /**
   * Exclusions to apply.
   */
  exclusions?: RegExp[];
}

export interface Cache {
  get(): Promise<string | null>;
  set(sitemap: string): Promise<void>;
}

export type Config = RemixSitemapConfig;

export interface SitemapEntry {
  loc: string;
  changefreq?: ChangeFreq;
  priority?: Priority;
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
  restriction?: {
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
  requiresSubscription?: boolean;
  price?: {
    currency: string;
    value: number;
  };
  uploader?: {
    name: string;
    info?: string;
  };
  platform?: {
    relationship: 'allow' | 'deny';
    content: string[];
  };
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
  /**
   * The URL of the alternate reference.
   */
  href: string;

  /**
   * The language of the alternate reference.
   */
  hreflang: string;

  /**
   * If true, the href is not relative to loc.
   * @default false
   */
  absolute?: boolean;
}

/**
 * @deprecated Use SitemapFunction instead.
 */
export interface SitemapHandle {
  sitemap?: Handle;
}

export interface Handle {
  values?: string[];

  /**
   * If true, the handle will be excluded from the sitemap.
   * @default false
   */
  exclude?: boolean;

  generateEntries?(request: Request): Promise<SitemapEntry[]>;

  /**
   * If true, the handle will generate entries for optional segments.
   * @default true
   */
  addOptionalSegments?: boolean;
}

export interface RobotsTxtOptions {
  policies?: Policy[];
  additionalSitemaps?: string[];
}

export type Policy = {
  /**
   * The paths to allow.
   */
  allow?: string | string[];

  /**
   * The paths to disallow.
   */
  disallow?: string | string[];

  /**
   * The user agent to apply the policy to.
   */
  userAgent: string;
};

export interface SitemapArgs {
  config: Config;
  request: Request;
  context: AppLoadContext;
}

export type SitemapDefinition =
  | ({ exclude?: boolean } & Omit<SitemapEntry, 'loc'> & { loc?: string })
  | ({ exclude?: boolean } & SitemapEntry)[];

export type SitemapFunction = (
  args: SitemapArgs
) => Promise<SitemapDefinition> | SitemapDefinition;

export interface RouteModule {
  default?: unknown;
  sitemap?: SitemapFunction;
}

export interface RemixRoute {
  path?: string;
  id: string;
  parentId?: string;
  index?: boolean;
  module: RouteModule;
}

export type RouteManifest = Omit<RemixRoute, 'module'>;

export type Routes = Record<string, RemixRoute>;

export interface EntryContext {
  routeModules: Record<string, RouteModule>;
  manifest: {
    routes: Record<string, RouteManifest>;
  };
}
