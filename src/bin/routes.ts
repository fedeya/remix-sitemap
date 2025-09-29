import path from 'path';
import type { EntryContext } from '../lib/types';

const dir = path.resolve(process.cwd());

type RouteModules = EntryContext['routeModules'];

export async function getRoutesAndModules() {
  const remixRoot = process.env.REMIX_ROOT || dir;

  const buildRoute = path.join(remixRoot, '/build/server/index.js');

  const { routes } = await import(buildRoute);

  const modules: RouteModules = {};

  console.log('🔍 Found routes: ' + Object.keys(routes).join(', '));

  await Promise.all(
    Object.keys(routes).map(async key => {
      if (key === 'root') return;

      const route = routes[key];

      if (route.module) {
        modules[key] = route.module;
        return;
      }
    })
  );

  return {
    routes,
    modules
  };
}
