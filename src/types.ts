export interface RemixSitemapConfig {
  siteUrl: string;
  autoLastmod?: boolean;
  changefreq?:
    | 'never'
    | 'yearly'
    | 'monthly'
    | 'weekly'
    | 'daily'
    | 'hourly'
    | 'always';
  priority?: 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
  sitemapBaseFileName?: string;
  alternateRefs?: AlternateRef[];
  optionalSegments?: Record<string, string[]>;
  headers?: Headers | Record<string, string>;
}

export interface SitemapEntry {
  loc: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
  alternateRefs?: AlternateRef[];
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
