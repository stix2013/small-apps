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

An **example** of a single CDR record found within such a file is:
`GP|354385210000|||354385210000|274018050000024|20230919172444|3600|0|0|NLDPT||internet|||||||PGWM422420||||2|1438698513`

Based on the structure defined in the sources, we can describe the data from this example record:

1.  **RecordType**: `GP` - This indicates it is a **Native GPRS record (GGSN records)**.
2.  **Number A**: `354385210000` - The MSISDN number of a Roaming Subscriber, starting with country code 354. It is a numeric value.
3.  **Number B**: Empty (` `) - For GPRS records (Record Type RGP or GP), this value is empty.
4.  **Number Dialed**: Empty (` `) - For GPRS records (Record Type RGP or GP), this value is empty.
5.  **MSISDN**: `354385210000` - The Mobile Subscriber ISDN number, starting with country code 354. It is a numeric value.
6.  **IMSI**: `274018050000024` - The unique identification of the chargeable subscriber who used the network. It is a numeric value.
7.  **EventTimestamp**: `20230919172444` - The timestamp indicating the start of the call event in local time (Format: CCYYMMDDHHMMSS).
8.  **Event Duration**: `3600` - The total duration of the call event in seconds. Must be >= 0.
9.  **DownloadVol**: `0` - The number of incoming volume in Bytes. Mandatory for GPRS records. Must be >= 0.
10. **UploadVol**: `0` - The number of outgoing volume in Bytes. Mandatory for GPRS records. Must be >= 0.
11. **Operator Code**: `NLDPT` - A unique identifier for the roaming partner network. For Record Type GP, this value can be empty.
12. **PreratedAmount**: Empty (` `) - Charge for Prepaid service. Not mandatory.
13. **Apn**: `internet` - The Network Identifier part of the Access Point Name (APN). Mandatory within GPRS records.
14. **Nulli** (UTC Time Offset): Empty (` `) - For Record Type GP, this value can be empty.
15. **BroadWorks**: Empty (` `) - Reserved for Siminn. Not mandatory.
16. **TeleServiceCode**: Empty (` `) - Code defining a TeleService. Not mandatory.
17. **BearerServiceCode**: Empty (` `) - Code defining a Bearer Service. Not mandatory.
18. **OverseasCode**: Empty (` `) - Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
19. **VideoIndicator**: Empty (` `) - Identifier for whether a service is a video call. Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
20. **Source**: Empty (` `) - ID of the CDR file/roaming file the CDR originates from. Not mandatory.
21. **ServiceId**: Empty (` `) - Identifier for the service type. Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
22. **Quantity**: Empty (` `) - Identifier for the service Quantity. Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
23. **CustNumber**: Empty (` `) - Not applicable for Yellow, part of a standard Siminn record.
24. **Description**: Empty (` `) - Not applicable for Yellow, part of a standard Siminn record.
25. **CallIdentification**: `1438698513` - The unique record ID from the originating system. It is a numeric value.

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

## Internationalization (i18n)

The `@yellow-mobile/watcher` application now supports internationalization using `i18next`. Translations are managed in JSON files located in `apps/watcher/src/locales`. The default language is English.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please feel free to fork the repository and submit a pull request.

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.
