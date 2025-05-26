import { createRequire } from 'node:module'
import fs from 'node:fs'

import map from 'currency-symbol-map'

const require = createRequire(import.meta.url)
const dataOrigin = require('../src/currency-symbols.json')
// console.log('data origin', dataOrigin)
const symbols = map.currencySymbolMap
// console.log('symbol map', symbols)

const dataNew = dataOrigin.map(item => ({
  ...item,
  symbol: symbols[item.code]
}))

console.log('data new', dataNew)

fs.writeFile('output.json', JSON.stringify(dataNew), 'utf8', (err) => {
  if (err) {
    return console.error(err)
  }

  console.log('file has been saved')
})
