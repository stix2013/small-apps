import type { CDRFileInfo } from '@src/types'
import { gaugeVolumeData } from '@src/monitoring/prometheus'

export const setVolumeDataGauge = (
  cdrFile: CDRFileInfo,
  totalDownload: number,
  totalUpload: number,
  totalInvalidDownload: number,
  totalInvalidUpload: number,
  offset?: number
) => {
  gaugeVolumeData.labels({
    type: 'download',
    valid: 'true',
    group: cdrFile.group,
    offset
  }).set(totalDownload)

  gaugeVolumeData.labels({
    type: 'upload',
    valid: 'true',
    group: cdrFile.group,
    offset
  }).set(totalUpload)

  gaugeVolumeData.labels({
    type: 'download',
    valid: 'false',
    group: cdrFile.group,
    offset
  }).set(totalInvalidDownload)

  gaugeVolumeData.labels({
    type: 'upload',
    valid: 'false',
    group: cdrFile.group,
    offset
  }).set(totalInvalidUpload)
}
