import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  externals: [
    '@yellow-mobile/types',
    'nuxt',
    'consola'
  ],
  entries: [
    'src/index.ts',
    'src/const/index.ts',
    'src/colors/index.ts',
    'src/converters/index.ts',
    'src/coverage/index.ts',
    'src/dates/index.ts'
  ],
  rollup: {
    emitCJS: true
  }
})
