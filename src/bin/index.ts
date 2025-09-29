#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { buildSitemap, buildSitemaps } from '../builders/sitemap';
import { getRoutesAndModules } from './routes';
import { getConfig } from '../lib/config';

import './polyfill';
import {
  createIndexSitemapFile,
  createRobotsFile,
  createSitemapFiles,
  deleteOldSitemaps
} from './files';
import { pathToFileURL } from 'url';

const findConfig = () => {
  const configPath = path.resolve(process.cwd(), 'remix-sitemap.config.js');

  if (fs.existsSync(configPath)) return pathToFileURL(configPath).toString();
};

async function main() {
  const configPath = findConfig();

  if (!configPath) {
    console.error('❌ No config file found');
    return;
  }

  console.log('🔍 Found config file:', configPath);

  const { default: configFile } = await import(configPath);

  const config = getConfig(configFile);

  console.log('🔍 Generating sitemap...');

  const { routes, modules } = await getRoutesAndModules();

  const params = {
    config,
    context: {
      routeModules: modules,
      manifest: {
        routes
      }
    },
    request: {} as unknown as Request,
    appContext: {},
  };

  const isSplitted = config.size && config.size > 0;

  const sitemap = isSplitted
    ? await buildSitemaps(params)
    : await buildSitemap(params);

  if (config.generateRobotsTxt) {
    createRobotsFile(config);
  }

  deleteOldSitemaps(config);

  if (config.generateIndexSitemap) {
    createIndexSitemapFile(sitemap, config);
  }

  createSitemapFiles(sitemap, config);

  console.log('✨ Sitemap generated successfully');
}

main();
