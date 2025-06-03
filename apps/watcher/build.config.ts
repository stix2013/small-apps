import path from 'pathe';
import { defineBuildConfig } from 'unbuild';
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineBuildConfig({
  declaration: false,
  failOnWarn: false,
  clean: false, // Explicitly set to false
  externals: [
    '@yellow-mobile/types'
  ],
  entries: [
    'src/index',
    {
      builder: 'copy',
      input: 'src/locales',
      outDir: 'dist/locales',
    },
  ],
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
    emitCJS: true,
  },
  alias: {
    '@src': path.resolve(__dirname, 'src'),
  },
  hooks: {
    // 'rollup:options'(_ctx, options) {
    //   options.plugins.push(
    //     visualizer({
    //       filename: 'dist/stats.html',
    //       open: false,
    //       gzipSize: true,
    //       brotliSize: true,
    //       emitFile: true, // Added this based on documentation
    //     })
    //   );
    // },
  },
});
