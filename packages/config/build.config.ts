import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  // failOnWarn: false,
  clean: true,
  entries: [
    'src/index.ts',
    'src/screens.ts'
  ],
  rollup: {
    emitCJS: true
  }
})
