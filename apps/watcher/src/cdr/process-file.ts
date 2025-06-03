import type { Stats } from 'node:fs'
import i18n from '@src/i18n';
//
import { postData } from '@src/plugins/post-data'
import type { CDRFileInfo, CDRLine } from '@yellow-mobile/types'
import {
  counterProcess,
  histogramPostData,
  histogramProcess,
  setVolumeDataGauge,
  setVolumeDataMsisdnGauge
} from '@src/monitoring'
import { useCdrFileValidation } from '@src/validation/cdr-file'
import { FileError } from '@src/utils/file-error'
import { createLoggers, logCdrFilename } from '@src/utils/logger'
import { statsToCdrFile } from './stats-to-cdr-file'
import { readCdr } from './read-cdr'
import { convertToCDRFields } from './convert-to-cdr-fields'

export const processFile = (path: string, stats: Stats) => {
  const file: CDRFileInfo = {
    group: '',
    name: '',
    number: '',
    birthtime: stats.birthtime,
    lines: {
      total: 0,
      invalid: 0
    }
  }

  //
  const cdrFile = statsToCdrFile(path, stats)

  const lines = [] as CDRLine[]
  const startProcessTime = Date.now()

  try {
    const { prefix, filename } = useCdrFileValidation(path, stats)
    file.group = prefix
    file.name = filename
  } catch (err) {
    counterProcess.labels({ label: 'invalid_cdr' }).inc()

    const processDuration = Date.now() - startProcessTime
    histogramProcess.labels('failed').observe(processDuration)

    if (err instanceof FileError) {
      createLoggers().get('CDR')?.error(i18n.t('processFile.invalidCdr', { fileName: file.name || path }));
      cdrFile.status = 'ERROR'
      postData(cdrFile, lines)
    }
    return
  }

  const data = readCdr(path)

  // const logger = log(`CDR ${file.name}`).logger
  const logger = logCdrFilename(file.name)

  if (!data || data.length === 0) {
    logger.warn(i18n.t('processFile.emptyContent', { fileName: file.name }));
    cdrFile.status = 'EMPTY_CONTENT';      // Set the status
    cdrFile.lineCount = 0;               // Ensure line counts are explicitly zero
    cdrFile.lineInvalidCount = 0;
    postData(cdrFile, []); // Call postData with the updated cdrFile and an empty lines array
    logger.end();
    return;
  }

  //
  file.lines.total = data.length

  let totalUpload = 0
  let totalDownload = 0
  let totalInvalidUpload = 0
  let totalInvalidDownload = 0

  //
  data.forEach((line, index) => {
    const cdrLine = convertToCDRFields(line)

    cdrFile.lineCount++
    if (cdrLine.valid) {
      lines.push(cdrLine)
      totalDownload += (cdrLine.volumeDownload || 0);
      totalUpload += (cdrLine.volumeUpload || 0);
      logger.info(i18n.t('processFile.lineInfo', { lineNumber: index + 1, msisdn: cdrLine.msisdn, download: cdrLine.volumeDownload, upload: cdrLine.volumeUpload, timestamp: cdrLine.eventTimestamp, duration: cdrLine.eventDuration, offset: cdrLine.nulli }));

      setVolumeDataMsisdnGauge(file, cdrLine)
    } else {
      // lines.push(cdrLine); // <--- THIS LINE IS THE BUG, REMOVED
      totalInvalidDownload += (cdrLine.volumeDownload || 0);
      totalInvalidUpload += (cdrLine.volumeUpload || 0);
      logger.error(i18n.t('processFile.lineInvalid', { lineNumber: index + 1 }));
      cdrFile.lineInvalidCount++
    }
  })

  setVolumeDataGauge(file, totalDownload, totalUpload, totalInvalidDownload, totalInvalidUpload)

  counterProcess.labels({ label: 'success' }).inc()

  const processDuration = Date.now() - startProcessTime
  histogramProcess
    .labels('success')
    .observe(processDuration)

  if (lines.length > 0) {
    const startPostData = Date.now()

    postData(cdrFile, lines).then(() => {
      const durationPostData = Date.now() - startPostData
      histogramPostData.labels('success').observe(durationPostData)
    }).catch(() => {
      const durationPostData = Date.now() - startPostData
      histogramPostData.labels('error').observe(durationPostData)
    })
  }

  logger.info(i18n.t('processFile.processed', { duration: processDuration, startTime: startProcessTime }));
  logger.end()
  return lines
}
