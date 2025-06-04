import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  externals: [
    // Add any external dependencies here, e.g. '@yellow-mobile/types'
  ],
  rollup: {
    emitCJS: true
  }
})
