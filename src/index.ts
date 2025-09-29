import type { Config, Routes, EntryContext } from './lib/types';
import { sitemapResponse } from './sitemap';
import { isSitemapUrl, isRobotsUrl } from './utils/validations';
import { getConfig } from './lib/config';
import { robotsResponse } from './robots';
import { AppLoadContext } from '@remix-run/server-runtime';

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
    sitemap: (request: Request, context: EntryContext, appContext: AppLoadContext) => {
      if (isSitemapUrl(defaultConfig, request)) {
        return sitemapResponse(defaultConfig, request, context, appContext);
      }

      if (defaultConfig.generateRobotsTxt && isRobotsUrl(request)) {
        return robotsResponse(defaultConfig);
      }
    },

    robots: () => robotsResponse(defaultConfig),

    experimental_sitemap: (request: Request, routes: Routes, appContext: AppLoadContext) => {
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
      }, appContext);
    },

    isSitemapUrl: (request: Request) =>
      isSitemapUrl(defaultConfig, request) ||
      (defaultConfig.generateRobotsTxt && isRobotsUrl(request))
  };
};
