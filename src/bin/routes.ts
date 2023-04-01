import { readConfig } from '@remix-run/dev/dist/config';
import path from 'path';
import { createModuleBuilder } from './moduleBuilder';
import requireFromString from 'require-from-string';
import type { EntryContext } from '@remix-run/server-runtime';

const dir = path.resolve(process.cwd());

type RouteModules = EntryContext['routeModules'];

export async function getRoutesAndModules() {
  const config = await readConfig(process.env.REMIX_ROOT || dir);

  const routes = config.routes;

  const modules: RouteModules = {};

  console.log('🔍 Found routes: ' + Object.keys(routes).join(', '));

  const { buildModule } = await createModuleBuilder();

  await Promise.all(
    Object.keys(routes).map(async key => {
      const route = routes[key];

      if (key === 'root') return;

      const file = path.resolve(config.appDirectory, route.file);

      const result = await buildModule(file);

      const module = requireFromString(result.outputFiles[0].text);

      modules[key] = module;
    })
  );

  return {
    routes,
    modules
  };
}
