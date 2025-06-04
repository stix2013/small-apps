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

