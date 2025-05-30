import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    'src/index.ts',
    'src/app/index.ts',
    'src/balance/index.ts',
    'src/form/index.ts',
    'src/generic/index.ts',
    'src/links/index.ts',
    'src/map/index.ts',
    'src/pages/index.ts',
    'src/product/index.ts',
    'src/units/index.ts',
    'src/user/index.ts'
  ],
  rollup: {
    emitCJS: true
  }
})
