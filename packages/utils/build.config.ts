import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig([
  {
    declaration: true,
    clean: true,
    externals: ['@yellow-mobile/const', '@yellow-mobile/types'],
    entries: [
      'src/index.ts',
      'src/colors/index.ts',
      'src/converters/index.ts',
      'src/coverage/index.ts',
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
