import { type Plugin, build } from 'esbuild';
import path from 'path';
import fs from 'fs';

const dir = path.resolve(process.cwd());

const cleanAssetsPlugin: Plugin = {
  name: 'clean-assets',
  setup(build) {
    build.onResolve(
      {
        filter:
          /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf|eot|mp4|webm|wav|mp3|m4a|aac|oga|pdf)$/
      },
      args => ({
        path: args.path,
        namespace: 'clean-assets'
      })
    );

    build.onLoad({ filter: /.*/, namespace: 'clean-assets' }, () => ({
      contents: '',
      loader: 'js'
    }));
  }
};

const cleanStylesPlugin: Plugin = {
  name: 'clean-styles',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, args => ({
      path: args.path,
      namespace: 'clean-styles'
    }));

    build.onLoad({ filter: /.*/, namespace: 'clean-styles' }, () => ({
      contents: '',
      loader: 'js'
    }));
  }
};

export async function createModuleBuilder() {
  const plugins = [cleanStylesPlugin, cleanAssetsPlugin];

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
