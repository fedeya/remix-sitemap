import type { Config, Routes, EntryContext } from './lib/types';
import { sitemapResponse, experimental_sitemapResponse } from './sitemap';
import { isSitemapUrl, isRobotsUrl } from './utils/validations';
import { getConfig } from './lib/config';
import { robotsResponse } from './robots';

export {
  SitemapHandle,
  RemixSitemapConfig,
  Config,
  SitemapFunction,
  SitemapArgs
} from './lib/types';

export const createSitemapGenerator = (config: Config) => {
  const defaultConfig = getConfig(config);

  return {
    sitemap: (request: Request, context: EntryContext) => {
      if (isSitemapUrl(defaultConfig, request)) {
        return sitemapResponse(defaultConfig, request, context);
      }

      if (defaultConfig.generateRobotsTxt && isRobotsUrl(request)) {
        return robotsResponse(defaultConfig);
      }
    },

    robots: () => robotsResponse(defaultConfig),

    experimental_sitemap: (request: Request, routes: Routes) =>
      experimental_sitemapResponse(defaultConfig, request, routes),

    isSitemapUrl: (request: Request) =>
      isSitemapUrl(defaultConfig, request) ||
      (defaultConfig.generateRobotsTxt && isRobotsUrl(request))
  };
};
