#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { getSitemap } from '../sitemap';
import { getRoutesAndModules } from './routes';
import { getConfig } from '../lib/config';
import { getRobots } from '../robots';

import './polyfill';
import type { EntryContext } from '@remix-run/server-runtime';

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
    } as unknown as EntryContext,
    request: {} as unknown as Request
  });

  if (config.generateRobotsTxt) {
    const robots = getRobots(config);

    if (robots) {
      fs.writeFileSync(path.join(dir, config.outDir, 'robots.txt'), robots);

      console.log('✨ Robots.txt generated successfully');
    }
  }

  fs.writeFileSync(
    path.join(dir, config.outDir, `${config.sitemapBaseFileName}.xml`),
    sitemap
  );

  console.log('✨ Sitemap generated successfully');
}

main();
