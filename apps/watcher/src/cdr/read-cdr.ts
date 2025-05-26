import fs from 'node:fs'
import { FileError } from '@src/utils/file-error'

const options: {
  encoding: BufferEncoding
} = {
  encoding: 'utf-8'
}

export function readCdr (path: string) {
  try {
    const result: string[][] = []
    const dataIn = fs.readFileSync(path, options)

    dataIn.split(/\r?\n/).forEach((line: string) => {
      if (line && line.length > 0) {
        result.push(line.split('|'))
      }
    })

    return result
  } catch {
    throw new FileError(`Cannot read ${path}`)
  }
}
