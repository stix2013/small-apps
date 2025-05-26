import type fs from 'node:fs'
import { parse } from 'pathe'
import { FILE_SIZE_MAX } from '@src/consts'
import { PREFIX_FILENAMES } from '@src/consts/prefix-filenames'
import { FileError } from '@src/utils/file-error'

export const useCdrFileValidation = (path: string, stats?: fs.Stats) => {
  const _path = path
  const filename = parse(_path).name

  if (!stats) {
    throw new FileError('File has not information')
  }

  if (!stats.isFile()) {
    throw new FileError('File is NOT FILE', 'FILE_ERROR_100')
  }

  if (stats.size > FILE_SIZE_MAX) {
    throw new FileError('File exceeded max file size', 'FILE_ERROR_110')
  }

  const getFilename = (name: string) => parse(name).name

  const prefix = filename.substring(0, 6).toUpperCase().trim()

  if (PREFIX_FILENAMES && !PREFIX_FILENAMES.includes(prefix)) {
    throw new FileError(`Filename ${filename} is not allowed`, 'FILE_ERROR_200')
  }

  return {
    prefix,
    filename,
    getFilename
  }
}
