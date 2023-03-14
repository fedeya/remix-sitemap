import type { EntryContext } from '@remix-run/server-runtime';

export interface RemixSitemapConfig {
  siteUrl: string;
  autoLastmod?: boolean;
  changefreq?: string;
  priority?: number;
  sitemapBaseFileName?: string;
  optionalPathValues?: Record<string, string[]>;
}

export type RouteModules = EntryContext['routeModules'];

export type AssetsManifest = EntryContext['manifest'];

export interface SitemapEntry {
  route?: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

export interface SitemapHandle {
  sitemap?: Handle;
}

export interface Handle {
  values?: string[];
  exclude?: boolean;
  generateEntries?(request: Request): Promise<SitemapEntry[]>;
}
