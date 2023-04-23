import fs from 'fs';
import path from 'path';
import { buildSitemapIndex } from '../builders/sitemap';
import type { getConfig } from '../lib/config';
import { getRobots } from '../robots';

const dir = process.cwd();

type Config = ReturnType<typeof getConfig>;

export function createIndexSitemapFile(
  sitemap: string | string[],
  config: Config
) {
  const sitemaps = Array.isArray(sitemap)
    ? sitemap.map((_, index) => `${config.sitemapBaseFileName}-${index}.xml`)
    : [`${config.sitemapBaseFileName}-0.xml`];

  const sitemapIndex = buildSitemapIndex(sitemaps, config);

  fs.writeFileSync(path.join(dir, config.outDir, 'sitemap.xml'), sitemapIndex);
}

export function createSitemapFiles(sitemap: string | string[], config: Config) {
  if (Array.isArray(sitemap)) {
    sitemap.forEach((content, index) => {
      fs.writeFileSync(
        path.join(
          dir,
          config.outDir,
          `${config.sitemapBaseFileName}-${index}.xml`
        ),
        content
      );
    });
  } else {
    const filename = config.generateIndexSitemap
      ? `${config.sitemapBaseFileName}-0.xml`
      : `${config.sitemapBaseFileName}.xml`;

    fs.writeFileSync(path.join(dir, config.outDir, filename), sitemap);
  }
}

export function createRobotsFile(config: Config) {
  const robots = getRobots(config);

  fs.writeFileSync(path.join(dir, config.outDir, 'robots.txt'), robots);
}

export function deleteOldSitemaps(config: Config) {
  const files = fs.readdirSync(path.join(dir, config.outDir));

  const sitemaps = files.filter(file =>
    file.startsWith(config.sitemapBaseFileName)
  );

  sitemaps.forEach(sitemap => {
    fs.unlinkSync(path.join(dir, config.outDir, sitemap));
  });
}
