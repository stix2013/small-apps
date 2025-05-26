import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  failOnWarn: true,
  clean: true,
  entries: [
    './src/index',
  ],
  outDir: 'dist',
  rollup: {
    emitCJS: true
  }
})
