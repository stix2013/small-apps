import path from 'pathe'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: false,
  failOnWarn: true,
  clean: true,
  rollup: {
    inlineDependencies: true,
    resolve: {
      exportConditions: ['production', 'node'] as any
    }
  },
  alias: {
    '@src': path.resolve(__dirname, 'src')
  }
})
