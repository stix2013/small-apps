# Yellow Mobile

This project is a monorepo for managing Yellow Mobile applications and packages.

## Project Structure

This monorepo is organized into two main directories:

*   `apps/`: Contains the main applications of the project.
*   `packages/`: Contains shared packages and libraries used by the applications.

### Applications

*   **`watcher`**: Watches CDR (Call Detail Record) files and SIMIN servers. It provides an API, file watching capabilities, scheduled tasks, and Prometheus metrics.

### Packages

*   **`@yellow-mobile/const`**: Provides constant values used across the monorepo.
*   **`@yellow-mobile/logger`**: Provides logging functionality using Winston.
*   **`@yellow-mobile/types`**: Defines TypeScript types used throughout the project.
*   **`@yellow-mobile/utils`**: Offers various utility functions.

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (>=16)
*   pnpm (>=7)

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
git clone <repository-url> # Replace <repository-url> with the actual URL
cd yellow-mobile
pnpm install
```

## Available Scripts

The following scripts are available in the root `package.json`:

*   `build:stub`: Builds stub versions of the packages.
*   `cleanup`: Removes `pnpm-lock.yaml`, `dist` directories, `node_modules`, and other build artifacts.
*   `cleanup:dist`: Removes all `dist` directories.
*   `cleanup:modules`: Removes all `node_modules` directories.
*   `deploy:watcher`: Deploys the `watcher` application.
*   `prepack`: Runs the `prepack` script in all packages (typically for building before publishing).
*   `typecheck`: Runs TypeScript to check for type errors in the entire project.
*   `lint`: Lints the codebase using ESLint.
*   `lint:fix`: Lints the codebase and automatically fixes fixable issues.

## Watcher Application

The `watcher` application (located in `apps/watcher`) is a key component of this project.

A **CDR (Call Detail Record) file** is used for data transmission and defines the system's internal CDR transfer format. These files contain CDRs related to services like GPRS, voice, and SMS. The file format is UTF8, with fields separated by "|", and no header or tail record. CDR files follow specific naming rules and are transmitted frequently.

### Features

*   **CDR File Watching**: Monitors specified directories for new or modified Call Detail Record (CDR) files.
*   **SIMIN Server Monitoring**: Includes functionality to monitor SIMIN servers (details would depend on the specific implementation).
*   **API**: Exposes an API (likely using Express) for interaction and status reporting.
*   **Scheduled Tasks**: Uses `node-schedule` for running cron jobs or other scheduled operations.
*   **Prometheus Metrics**: Integrates with `prom-client` to expose metrics for monitoring with Prometheus.

### Scripts (`apps/watcher/package.json`)

*   `build`: Builds the `watcher` application for development.
*   `build:prod`: Builds the `watcher` application for production.
*   `dev`: Starts the `watcher` application in development mode using `tsx`.
*   `start`: Starts the `watcher` application from the compiled `dist` output (typically for production).
*   `inspect`: Runs the application in debug mode.
*   `typecheck`: Type-checks the `watcher` application code.
*   `test`: Runs tests for the `watcher` application using Vitest.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please feel free to fork the repository and submit a pull request.

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.
