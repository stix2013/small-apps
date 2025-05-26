import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  externals: [
    'dotenv'
  ],
  entries: [
    'src/index.ts',
    'src/strategies/index.ts'
  ],
  rollup: {
    emitCJS: true
  }
})
