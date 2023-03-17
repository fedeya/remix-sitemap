#!/usr/bin/env node
import type { EntryContext } from '@remix-run/server-runtime';
import path from 'path';
import fs from 'fs';
import { getSitemap } from '../sitemap.js';
import { readConfig } from '@remix-run/dev/dist/config';
import esbuild from 'esbuild';
import requireFromString from 'require-from-string';

import './polyfill.js';
import { getConfig } from '../lib/config.js';

const dir = path.resolve(process.cwd());

type RouteModules = EntryContext['routeModules'];

export const getRoutesAndModules = async () => {
  const config = await readConfig(process.env.REMIX_ROOT || dir);

  const routes = config.routes;

  const modules: RouteModules = {};

  console.log('🔍 Found routes: ' + Object.keys(routes).join(', '));

  const tsconfig = path.resolve(dir, 'tsconfig.json');

  const isTsProject = fs.existsSync(tsconfig);

  const plugins = isTsProject
    ? [
        (await import('@esbuild-plugins/tsconfig-paths')).TsconfigPathsPlugin({
          tsconfig
        })
      ]
    : [];

  await Promise.all(
    Object.keys(routes).map(async key => {
      const route = routes[key];

      if (key === 'root') return;

      const file = path.resolve(config.appDirectory, route.file);

      const result = await esbuild.build({
        entryPoints: [file],
        platform: 'neutral',
        format: 'cjs',
        outfile: 'out.js',
        write: false,
        bundle: true,
        packages: 'external',
        loader: {
          '.js': 'jsx'
        },
        logLevel: 'silent',
        plugins: [
          ...plugins,
          {
            name: 'clean-styles',
            setup(build) {
              build.onResolve({ filter: /\.css$/ }, args => ({
                path: args.path,
                namespace: 'clean-styles'
              }));

              build.onLoad(
                { filter: /.*/, namespace: 'clean-styles' },
                args => ({
                  contents: '',
                  loader: 'js'
                })
              );
            }
          }
        ]
      });

      const module = requireFromString(result.outputFiles[0].text);

      modules[key] = module;
    })
  );

  return {
    routes,
    modules
  };
};

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
