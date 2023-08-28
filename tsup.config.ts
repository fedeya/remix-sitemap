import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/bin/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
});
