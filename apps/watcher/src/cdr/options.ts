import type { WatchOptions } from 'chokidar'

export const options: WatchOptions = {
  usePolling: true,
  persistent: true,
  depth: 4,
  ignored: /(^|[/\\])\../
}
