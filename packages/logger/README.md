## @yellow-mobile/logger

### Package Overview
The `@yellow-mobile/logger` package provides a robust logging solution for Node.js applications. It is built on top of the popular Winston library and offers features like daily log rotation, configurable log outputs (console and file), and easy integration.

Its core purpose is to offer a standardized and flexible way to handle application logging, making it easier to debug issues, monitor application behavior, and archive logs efficiently.

### Installation
To install the package, use your preferred package manager. For example, with pnpm:
```bash
pnpm add @yellow-mobile/logger
```

This package has a peer dependency on `dotenv` for managing environment variables. You'll also need to install it in your project:
```bash
pnpm add dotenv
```
The consuming project is responsible for creating and managing the `.env` file at its root.

### Basic Usage
Here's a simple example of how to import and use the `subLogger` function to get a logger instance:

```typescript
import { subLogger } from '@yellow-mobile/logger';

// Get a logger instance with a specific label
const logger = subLogger('MyApplication');

// Use the logger
logger.info('This is an informational message.');
logger.warn('This is a warning message.');
logger.error('This is an error message.');

// Get a logger instance with a custom label and timestamp format
const customLogger = subLogger('MyService', 'YYYY-MM-DD HH:mm:ss.SSS');
customLogger.info('Another message with a custom timestamp.');
```

**Parameters for `subLogger(lblString, fmtTimestamp)`:**
- `lblString` (string): A label for the logger instance. This label will be included in the log messages and can help identify the source of the log (e.g., module name, service name).
- `fmtTimestamp` (string, optional): A moment.js-compatible format string for the timestamp in log messages. If not provided, it defaults to the format specified by the `LOG_TIME_FORMAT` environment variable or 'YYYY-MM-DD HH:mm:ss'.

### Configuration
Configuration for `@yellow-mobile/logger` is managed through environment variables. These variables should typically be defined in a `.env` file at the root of your consuming project. The `dotenv` package (a peer dependency) will load these variables.

Below is a list of environment variables used by the logger. You can refer to `packages/logger/src/load-config.ts` for the most up-to-date list and default values.

- `APP_NAME`: The application name. This is used in log messages and as part of the daily rotated log filenames.
  - Default: 'logger'
- `LOG_DIR`: The directory where log files will be stored. It's recommended to use an absolute path in production environments.
  - Default: `packages/logger/logs` (relative to where the logger is initialized; be mindful of this when deploying).
- `LOG_DAILY_FREQUENCY`: How often to rotate logs. Uses `winston-daily-rotate-file` frequency format (e.g., '24h' for daily, '1h' for hourly, '15m' for every 15 minutes).
  - Default by `load-config.ts`: Not explicitly set, but `winston-daily-rotate-file` might default to '24h'. Check its documentation for specifics.
- `LOG_DAILY_ZIP`: Whether to compress rotated log files into a zip archive. Set to 'yes' or any truthy value to enable.
  - Default: `false` (any value other than 'yes' or a truthy string will be treated as false).
- `LOG_DAILY_PATH`: The path where daily rotated logs will be stored.
  - Default: Same as `LOG_DIR`.
- `LOG_DAILY_FORMAT`: Date pattern for daily rotated log filenames (e.g., 'YYYYMMDD-HH', 'YYYY-MM-DD').
  - Default: 'YYYYMMDD-HH'
- `LOG_TIME_FORMAT`: Timestamp format for log messages (moment.js format string).
  - Default: 'YYYY-MM-DD HH:mm:ss'
- `LOG_FILENAME_INFO`: Filename for info-level logs. Stored inside `LOG_DIR`.
  - Default: `info.log`
- `LOG_FILENAME_COMBINE`: Filename for combined logs (all levels). Stored inside `LOG_DIR`.
  - Default: `combine.log`
- `LOG_FILENAME_ERROR`: Filename for error-level logs. Stored inside `LOG_DIR`.
  - Default: `error.log`
- `LOG_FILENAME_EXCEPTION`: Filename for uncaught exception logs. Stored inside `LOG_DIR`.
  - Default: `exception.log`
- `LOG_MAX_SIZE`: Maximum size of a single log file before it gets rotated (e.g., '20m' for 20 megabytes, '1g' for 1 gigabyte).
  - Default: '20m'
- `LOG_MAX_FILES`: Maximum number of log files to keep. Can be a number of files or a timespan (e.g., '14d' for 14 days, '7' for 7 files).
  - Default: '14d'

**Example `.env` file content:**
```env
APP_NAME=MyAwesomeApp
LOG_DIR=/var/log/myawesomeapp
LOG_DAILY_FREQUENCY=24h
LOG_DAILY_ZIP=yes
LOG_TIME_FORMAT='YYYY-MM-DD HH:mm:ss Z'
LOG_MAX_SIZE=50m
LOG_MAX_FILES=30d
# Add other variables as needed
```

### Log Output
The logger generates several log files by default, each serving a specific purpose. The filenames can be configured using the environment variables mentioned above.

- **`info.log`** (or as per `LOG_FILENAME_INFO`): Contains only `info` level messages. Useful for tracking general application activity.
- **`error.log`** (or as per `LOG_FILENAME_ERROR`): Contains only `error` level messages. Essential for quickly identifying and diagnosing errors.
- **`combine.log`** (or as per `LOG_FILENAME_COMBINE`): Contains all log messages, regardless of their level (info, warn, error, etc.). Provides a complete picture of application events.
- **`<APP_NAME>-<DATE>.log`** (pattern defined by `LOG_DAILY_FILENAME`, `APP_NAME`, and `LOG_DAILY_FORMAT`): These are the daily rotated logs. If `LOG_DAILY_ZIP` is enabled, these will be `<APP_NAME>-<DATE>.log.zip`.
- **`exception.log`** (or as per `LOG_FILENAME_EXCEPTION`): Contains logs for uncaught exceptions. Critical for understanding unexpected crashes.

**Log Format:**
Log messages typically follow this format:
`timestamp [level] [label] message`

Example:
`2023-10-27 10:00:00 [info] [MyApplication] Application started successfully.`
`2023-10-27 10:05:23 [error] [DatabaseService] Failed to connect to database: Connection refused.`

### Scripts
The following scripts are available in the `package.json` of `@yellow-mobile/logger`:

- `pnpm build`: Compiles the TypeScript code to JavaScript. This is typically run before publishing the package or when changes are made to the source code.
- `pnpm test`: Runs the test suite using Vitest. Ensure tests pass before committing changes.
