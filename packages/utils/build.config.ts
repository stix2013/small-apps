import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig([
  {
    declaration: true,
    clean: true,
    externals: ['@yellow-mobile/const', '@yellow-mobile/types'],
    entries: [
      { input: 'src/index', name: 'index' },
      { input: 'src/colors/index', name: 'colors' },
      { input: 'src/converters/index', name: 'converters' },
      { input: 'src/coverage/index', name: 'coverage' },
      {
        builder: 'copy',
        input: 'src/assets/',
        outDir: 'dist/assets/',
      },
    ],
    rollup: {
      emitCJS: true,
    },
  },
  {
    name: 'minified',
    declaration: true,
    clean: true,
    externals: ['@yellow-mobile/types', '@yellow-mobile/const'],
    outDir: 'dist/minified',
    entries: [
      // test
      'src/index.ts',
    ],
    rollup: {
      emitCJS: true,
      esbuild: {
        minify: true,
      },
    },
  },
]);
