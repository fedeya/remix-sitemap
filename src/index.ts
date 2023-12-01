import type { Config, Routes, EntryContext } from './lib/types';
import { isSitemapUrl, isRobotsUrl } from './utils/validations';
import { sitemapResponse } from './sitemap';
import { robotsResponse } from './robots';
import { getFlagsRef } from './lib/flags';
import { getConfig } from './lib/config';

export {
  SitemapHandle,
  RemixSitemapConfig,
  Config,
  SitemapFunction,
  SitemapArgs
} from './lib/types';

export type FlagsType = ReturnType<typeof getFlagsRef>;
export const getFlags = () => getFlagsRef() as Readonly<FlagsType>;

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

    experimental_sitemap: (request: Request, routes: Routes) => {
      const routeModules = Object.keys(routes).reduce(
        (acc, route) => ({
          ...acc,
          [route]: routes[route].module
        }),
        {}
      );

      return sitemapResponse(defaultConfig, request, {
        routeModules,
        manifest: {
          routes
        }
      });
    },

    isSitemapUrl: (request: Request) =>
      isSitemapUrl(defaultConfig, request) ||
      (defaultConfig.generateRobotsTxt && isRobotsUrl(request))
  };
};
