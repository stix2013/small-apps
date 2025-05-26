import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  externals: [
    'dotenv'
  ],
  rollup: {
    emitCJS: true
  }
})
