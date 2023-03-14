import type { EntryContext } from '@remix-run/server-runtime';
import type { RemixSitemapConfig } from './types';
export type { SitemapHandle, RemixSitemapConfig } from './types';
export declare const createSitemapGenerator: (config: RemixSitemapConfig) => {
    sitemap: (request: Request, context: EntryContext) => Promise<Response>;
    isSitemapUrl(request: Request): boolean;
};
