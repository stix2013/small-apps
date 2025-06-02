import type { Stats } from 'node:fs'
import { parse } from 'pathe'
import { v4 as uuidV4 } from 'uuid'
import { format } from 'date-fns/format'
import { FORMAT_DATE_CDR } from '@src/consts'
import type { CDRFile } from '@yellow-mobile/types'

export function statsToCdrFile (path: string, stats: Stats): Omit<CDRFile, 'lines'> {
  const fileParse = parse(path)

  return {
    id: uuidV4(),
    filename: fileParse.base, // filename with extension
    fileCreatedAt: format(stats.ctime, FORMAT_DATE_CDR),
    status: 'OK',
    lineCount: 0,
    lineInvalidCount: 0,
    error: null,
    processedAt: null,
    lineIndexBegin: 0
  }
}
