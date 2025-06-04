import type { Stats } from 'node:fs';
import { stat } from 'node:fs/promises'; // For getting file stats
import * as parcelWatcher from '@parcel/watcher';
import i18n from '@src/i18n';
//
// import { logCdr } from '@src/utils/logger'
import { createLoggers } from '@src/utils';
import config from '@src/config';
import { processFile } from './process-file';
// import { options as optionsWatcher } from './options'; // options might need different handling

export const createCDRWatcher = async () => {
  const logCdr = createLoggers().get('CDR');

  // @parcel/watcher does not have a direct "ready" event like chokidar.
  // It sends all initial files/directories as 'create' events.
  // We'll set config.ready to true immediately and log a similar message.
  logCdr?.info(i18n.t('watcher.waitForNewFiles'));
  config.ready = true; // Set ready state

  const subscription = await parcelWatcher.subscribe(
    config.path,
    async (err, events) => {
      if (err) {
        logCdr?.error('Error watching files:', err);
        return;
      }

      for (const event of events) {
        try {
          if (event.type === 'create') {
            const stats = await stat(event.path);
            if (stats.isFile()) {
              if (config.ready) { // Ensure processing only when ready (though it's set true above)
                process.nextTick(() => {
                  processFile(event.path, stats);
                });
              }
            } else if (stats.isDirectory()) {
              logCdr?.info(i18n.t('watcher.directoryAdded', { path: event.path }));
            }
          } else if (event.type === 'delete') {
            // Parcel watcher doesn't distinguish between file/dir deletion in event.type directly
            // We might need to infer or handle generically. For now, assume it's a file if previously processed.
            // Or, we can try to stat, but it will fail for deleted paths.
            // Chokidar's unlink vs unlinkDir was clearer.
            // For simplicity, logging a generic removal.
            // To distinguish, one might need to check if it was known as a dir or file before.
            logCdr?.info(i18n.t('watcher.removed', { path: event.path }));
            // If we need to distinguish between file and dir removal:
            // We can't stat a deleted path. This requires a more complex state management if distinction is critical.
            // For now, using a generic message. The original code had separate messages.
            // logCdr?.info(i18n.t('watcher.fileRemoved', { path: event.path }));
            // logCdr?.info(i18n.t('watcher.directoryRemoved', { path: event.path }));
          } else if (event.type === 'update') {
            const stats = await stat(event.path);
            if (stats.isFile()) {
              logCdr?.info(
                i18n.t('watcher.fileModified', { path: event.path, accessTime: stats?.atimeMs })
              );
            }
            // @parcel/watcher doesn't typically emit 'update' for directories.
          }
        } catch (statError: unknown) { // Use unknown for better type safety initially
          // If stat fails (e.g. file quickly deleted after create event), log and continue
          const code = (statError as NodeJS.ErrnoException)?.code;
          if (code !== 'ENOENT') { // ENOENT is expected if file is gone
             logCdr?.error(`Error getting stats for ${event.path}:`, statError);
          } else if (event.type !== 'delete') { // Don't log ENOENT for delete events
             logCdr?.warn(`File not found for event ${event.type}: ${event.path}`);
          }
        }
      }
    },
    {
      // Map chokidar options:
      // - usePolling: @parcel/watcher uses native events by default. Not directly mapped.
      // - persistent: Default behavior for subscriptions.
      // - depth: @parcel/watcher is recursive by default. No direct depth option.
      // - ignored: Can be mapped to `ignore`.
      ignore: [/(^|[/\\])\../], // From chokidar options: ignore dotfiles
    }
  );

  // The 'watcher' object returned by chokidar was used to potentially stop watching later.
  // @parcel/watcher's subscribe returns a Subscription object which has an `unsubscribe` method.
  return {
    unsubscribe: async () => {
      await subscription.unsubscribe();
      logCdr?.info('CDR Watcher has been stopped.');
    },
  };
};
