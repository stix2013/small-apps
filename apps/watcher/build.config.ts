import path from 'pathe';
import { defineBuildConfig } from 'unbuild';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineBuildConfig({
  declaration: true,
  failOnWarn: false,
  clean: true,
  externals: ['@yellow-mobile/logger', '@yellow-mobile/utils'],
  rollup: {
    resolve: {
      exportConditions: ['production', 'node'],
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
