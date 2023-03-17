import { Plugin, build } from 'esbuild';
import path from 'path';
import fs from 'fs';

const dir = path.resolve(process.cwd());

const cleanStylesPlugin: Plugin = {
  name: 'clean-styles',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, args => ({
      path: args.path,
      namespace: 'clean-styles'
    }));

    build.onLoad({ filter: /.*/, namespace: 'clean-styles' }, args => ({
      contents: '',
      loader: 'js'
    }));
  }
};

export async function createModuleBuilder() {
  const plugins = [cleanStylesPlugin];

  const tsconfig = path.resolve(dir, 'tsconfig.json');

  const isTsProject = fs.existsSync(tsconfig);

  if (isTsProject) {
    const { TsconfigPathsPlugin } = await import(
      '@esbuild-plugins/tsconfig-paths'
    );

    plugins.push(TsconfigPathsPlugin({ tsconfig }));
  }

  return {
    buildModule: (file: string) => buildModule(file, plugins)
  };
}

export function buildModule(file: string, plugins: Plugin[]) {
  return build({
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
    plugins
  });
}
