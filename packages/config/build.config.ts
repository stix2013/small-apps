import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  externals: [
    '@yellow-mobile/types'
  ],
  rollup: {
    emitCJS: true
  }
})
