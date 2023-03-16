#!/usr/bin/env node
import path from 'path';
import type { RemixSitemapConfig } from '../lib/types';
import type { EntryContext } from '@remix-run/server-runtime';
import { getSitemap } from '../sitemap';
import fs from 'fs/promises';

const dir = process.cwd();

type RoutesManifest = EntryContext['manifest']['routes'];

type RouteModules = EntryContext['routeModules'];

const getAllRouteModules = (routes: RoutesManifest) => {
  const modules: RouteModules = {};

  Object.keys(routes).forEach(route => {
    const routeManifest = routes[route];

    modules[routeManifest.id] =
      routeManifest.module as unknown as RouteModules[string];
  });

  return modules;
};

async function main() {
  const config = require(path.join(
    dir,
    'remix-sitemap.config.js'
  )) as RemixSitemapConfig;

  const defaultConfig = {
    ...config,
    autoLastmod: config.autoLastmod ?? true,
    changefreq: config.changefreq ?? 'daily',
    priority: config.priority ?? 0.7,
    sitemapBaseFileName: config.sitemapBaseFileName ?? 'sitemap',
    sourceDir: config.sourceDir ?? 'build',
    outDir: config.outDir ?? 'public'
  };

  const buildPath = path.join(dir, defaultConfig.sourceDir);

  const build = require(buildPath);

  const modules = getAllRouteModules(build.routes);

  const sitemap = await getSitemap({
    config: defaultConfig,
    context: {
      routeModules: modules,
      manifest: {
        routes: build.routes
      }
    } as any,
    request: {} as any
  });

  await fs.writeFile(
    path.join(
      dir,
      defaultConfig.outDir,
      `${defaultConfig.sitemapBaseFileName}.xml`
    ),
    sitemap
  );

  console.log('sitemap generated successfully :D');
}

main();
