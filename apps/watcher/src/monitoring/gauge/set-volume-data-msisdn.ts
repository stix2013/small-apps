import type { CDRFileInfo, CDRLine } from '@src/types'
import { gaugeMsisdnVolumeData } from '@src/monitoring/prometheus/cdr'

export const setVolumeDataMsisdnGauge = (
  cdrFile: CDRFileInfo,
  cdrLine: CDRLine
) => {
  gaugeMsisdnVolumeData.labels({
    type: 'download',
    group: cdrFile.group,
    valid: 'true',
    msisdn: cdrLine.msisdn,
    offset: cdrLine.nulli,
    network: cdrLine.codeOperator
  }).set(cdrLine.volumeDownload)

  gaugeMsisdnVolumeData.labels({
    type: 'upload',
    group: cdrFile.group,
    valid: 'true',
    msisdn: cdrLine.msisdn,
    offset: cdrLine.nulli,
    network: cdrLine.codeOperator
  }).set(cdrLine.volumeUpload)
}
