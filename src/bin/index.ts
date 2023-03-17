#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { getSitemap } from '../sitemap';
import { getRoutesAndModules } from './routes';

import './polyfill';
import { getConfig } from '../lib/config';

const dir = path.resolve(process.cwd());

const findConfig = () => {
  const configPath = path.join(dir, 'remix-sitemap.config.js');

  if (fs.existsSync(configPath)) return configPath;
};

async function main() {
  const configPath = findConfig();

  if (!configPath) {
    console.error('❌ No config file found');
    return;
  }

  console.log('🔍 Found config file:', configPath);

  const configFile = await import(configPath);

  const config = getConfig(configFile);

  console.log('🔍 Generating sitemap...');

  const { routes, modules } = await getRoutesAndModules();

  const sitemap = await getSitemap({
    config,
    context: {
      routeModules: modules,
      manifest: {
        routes
      }
    } as any,
    request: {} as any
  });

  fs.writeFileSync(
    path.join(dir, config.outDir, `${config.sitemapBaseFileName}.xml`),
    sitemap
  );

  console.log('✨ Sitemap generated successfully');
}

main();
