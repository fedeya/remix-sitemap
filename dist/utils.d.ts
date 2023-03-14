import { AssetsManifest, RemixSitemapConfig, SitemapEntry } from './types';
export declare const getEntryXml: (config: RemixSitemapConfig, entry?: SitemapEntry) => string;
export declare const getEntry: (config: RemixSitemapConfig, key: string, modules: import("@remix-run/server-runtime/dist/routeModules").RouteModules<import("@remix-run/server-runtime/dist/routeModules").EntryRouteModule>, manifest: AssetsManifest) => Promise<string>;
