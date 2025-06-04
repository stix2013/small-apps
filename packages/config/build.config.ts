import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  externals: [
    '@yellow-mobile/types',
    'pathe',
    'dotenv'
  ],
  rollup: {
    emitCJS: true
  }
})
