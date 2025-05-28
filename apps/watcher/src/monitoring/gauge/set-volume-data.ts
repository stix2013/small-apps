import type { CDRFileInfo } from '@src/types'
import { gaugeVolumeData } from '@src/monitoring/prometheus'

export const setVolumeDataGauge = (
  cdrFile: CDRFileInfo,
  totalDownload: number,
  totalUpload: number,
  totalInvalidDownload: number,
  totalInvalidUpload: number,
  // offset?: number
) => {
  gaugeVolumeData.labels({
    label: cdrFile.number,
    type: 'download',
    valid: 'true'
  }).inc(totalDownload)

  gaugeVolumeData.labels({
    label: cdrFile.number,
    type: 'upload',
    valid: 'true',
  }).inc(totalUpload)

  gaugeVolumeData.labels({
    label: cdrFile.number,
    type: 'download',
    valid: 'true',
  }).inc(totalUpload)

  gaugeVolumeData.labels({
    label: cdrFile.number,
    type: 'download',
    valid: 'false',
  }).inc(totalInvalidDownload)

  gaugeVolumeData.labels({
    label: cdrFile.number,
    type: 'upload',
    valid: 'false',
  }).inc(totalInvalidUpload)
}
