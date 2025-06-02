import path from 'pathe';
import { defineBuildConfig } from 'unbuild';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineBuildConfig({
  declaration: false,
  failOnWarn: false,
  clean: true,
  externals: ['@yellow-mobile/types'],
  rollup: {
    resolve: {
      dedupe: ['@yellow-mobile/types'],
      mainFields: ['module', 'main'],
      extensions: ['.js', '.ts', '.json'],
      preferBuiltins: true,
    },
    esbuild: {
      minify: true,
    },
  },
  alias: {
    '@src': path.resolve(__dirname, 'src'),
  },
  hooks: {
    'rollup:options'(_ctx, options) {
      options.plugins.push(
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      );
    },
  },
});
