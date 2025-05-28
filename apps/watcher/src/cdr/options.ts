import type { ChokidarOptions } from 'chokidar'

export const options: ChokidarOptions = {
  usePolling: true,
  persistent: true,
  depth: 4,
  ignored: /(^|[/\\])\../
}
